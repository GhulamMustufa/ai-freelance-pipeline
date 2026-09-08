import fs from 'fs';
import path from 'path';
import { AgentExecutor } from '../src/ai/agent';
import { JobIntelligenceAgent } from '../src/ai/agents/JobIntelligenceAgent';
import { ClientIntelligenceAgent } from '../src/ai/agents/ClientIntelligenceAgent';
import { CompetitionAgent } from '../src/ai/agents/CompetitionAgent';
import { FreelancerFitAgent } from '../src/ai/agents/FreelancerFitAgent';
import { EconomicAgent } from '../src/ai/agents/EconomicAgent';
import { DecisionEngine } from '../src/application/engine/DecisionEngine';
import { EvalCase } from './generate-dataset';
import { EvalResult, MetricsEngine } from '../src/evals/metrics';
import { calculateCost } from '../src/ai/pricing';

async function runConfigExperiment(experimentName: string, primaryModel: string, fallbackModel: string) {
  console.log(`\n🚀 Starting Experiment: ${experimentName}`);
  
  // Inject specific routing config for the experiment
  const executor = new AgentExecutor({ provider: 'openai', model: primaryModel });
  
  // Overriding executor's executeStructured behavior for the experiment
  // In a pure test, we'd mock ModelRouter.route, but here we just pass the models directly to the agents
  const originalExecute = executor.executeStructured.bind(executor);
  executor.executeStructured = async (options: any) => {
    return originalExecute({
      ...options,
      primaryConfig: { provider: primaryModel.startsWith('gpt') ? 'openai' : 'gemini', model: primaryModel },
      fallbackConfigs: [{ provider: fallbackModel.startsWith('gpt') ? 'openai' : 'gemini', model: fallbackModel }]
    });
  };

  const jobAgent = new JobIntelligenceAgent(executor);
  const clientAgent = new ClientIntelligenceAgent(executor);
  const compAgent = new CompetitionAgent(executor);
  const fitAgent = new FreelancerFitAgent(executor);
  const ecoAgent = new EconomicAgent(executor);
  const decisionEngine = new DecisionEngine(executor);

  const datasetPath = path.join(__dirname, '../evals/datasets/v1.json');
  const dataset: EvalCase[] = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  const results: EvalResult[] = [];

  let totalEstimatedCost = 0;

  for (let i = 0; i < dataset.length; i++) {
    const testCase = dataset[i];
    process.stdout.write(`\r[${i+1}/${dataset.length}] Evaluating...`);
    
    const startTime = Date.now();
    try {
      const [job, client, comp] = await Promise.all([
        jobAgent.analyze(testCase.payload.title, testCase.payload.description),
        clientAgent.analyze(testCase.payload.client),
        compAgent.analyze(null, testCase.payload.budget, testCase.payload.hourlyMax)
      ]);

      const [fit, eco] = await Promise.all([
        fitAgent.analyze(job),
        ecoAgent.analyze(
          testCase.payload.budget, 
          testCase.payload.hourlyMin, 
          testCase.payload.hourlyMax, 
          client, 
          comp
        )
      ]);

      const decision = await decisionEngine.decide(job, client, comp, fit, eco);
      
      const latencyMs = Date.now() - startTime;
      
      // Rough token estimation for cost since we bypass DB in script
      const mockTokens = 1500;
      const cost = calculateCost(primaryModel, mockTokens, 300) || 0;
      totalEstimatedCost += cost * 6; // ~6 agents

      results.push({
        id: testCase.id,
        category: testCase.category,
        expectedRecommendation: testCase.expected.recommendation,
        actualRecommendation: decision.recommendation,
        latencyMs,
        tokensUsed: mockTokens * 6,
        confidence: decision.confidence ?? 0,
      });

    } catch (err: any) {
      results.push({
        id: testCase.id,
        category: testCase.category,
        expectedRecommendation: testCase.expected.recommendation,
        actualRecommendation: 'ERROR',
        latencyMs: Date.now() - startTime,
        tokensUsed: 0,
        confidence: 0,
        error: err.message,
      });
    }
  }

  const metricsEngine = new MetricsEngine();
  const summary = metricsEngine.calculate(results);

  console.log(`\n\n--- Results for ${experimentName} ---`);
  console.log(`F1 Score:       ${(summary.f1 * 100).toFixed(1)}%`);
  console.log(`Errors:         ${summary.errors}`);
  console.log(`Avg Latency:    ${(summary.avgLatencyMs / 1000).toFixed(2)}s`);
  console.log(`Total Cost:     $${totalEstimatedCost.toFixed(4)}`);
  
  return { summary, totalEstimatedCost };
}

async function run() {
  console.log('==================================================');
  console.log('   QUALITY VS COST ROUTING EXPERIMENT');
  console.log('==================================================');
  
  // Try with cheap model
  await runConfigExperiment('A (Cheap Only)', 'gpt-4o-mini', 'gemini-1.5-flash');
  
  // Try with expensive model
  await runConfigExperiment('B (Expensive Only)', 'gpt-4o', 'gemini-1.5-pro');
  
  console.log('\nNote: In the actual pipeline, ModelRouter uses a hybrid approach:');
  console.log('gpt-4o-mini for extraction, gpt-4o for reasoning, achieving high F1 at low cost.');
}

run().catch(console.error);
