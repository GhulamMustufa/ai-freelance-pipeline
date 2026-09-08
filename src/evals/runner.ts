import fs from 'fs';
import path from 'path';
import { AgentExecutor } from '../ai/agent';
import { JobIntelligenceAgent } from '../ai/agents/JobIntelligenceAgent';
import { ClientIntelligenceAgent } from '../ai/agents/ClientIntelligenceAgent';
import { CompetitionAgent } from '../ai/agents/CompetitionAgent';
import { FreelancerFitAgent } from '../ai/agents/FreelancerFitAgent';
import { EconomicAgent } from '../ai/agents/EconomicAgent';
import { DecisionEngine } from '../application/engine/DecisionEngine';
import { EvalCase } from '../../scripts/generate-dataset';
import { EvalResult, MetricsEngine } from './metrics';

async function runEvaluation() {
  console.log('🚀 Starting AI Pipeline Evaluation...');
  
  // Use gpt-4o-mini for fast, cheap evaluations
  const executor = new AgentExecutor({ provider: 'openai', model: 'gpt-4o-mini' });
  
  const jobAgent = new JobIntelligenceAgent(executor);
  const clientAgent = new ClientIntelligenceAgent(executor);
  const compAgent = new CompetitionAgent(executor);
  const fitAgent = new FreelancerFitAgent(executor);
  const ecoAgent = new EconomicAgent(executor);
  const decisionEngine = new DecisionEngine(executor);

  const datasetPath = path.join(__dirname, '../../evals/datasets/v1.json');
  if (!fs.existsSync(datasetPath)) {
    console.error('❌ Dataset not found at', datasetPath);
    process.exit(1);
  }

  const dataset: EvalCase[] = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  console.log(`Loaded ${dataset.length} test cases.`);

  const results: EvalResult[] = [];

  for (let i = 0; i < dataset.length; i++) {
    const testCase = dataset[i];
    console.log(`[${i+1}/${dataset.length}] Evaluating: ${testCase.payload.title}`);
    
    const startTime = Date.now();
    try {
      // 1. Analyze
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

      // 2. Decide
      const decision = await decisionEngine.decide(job, client, comp, fit, eco);
      
      const latencyMs = Date.now() - startTime;
      
      // We don't have token usage exposed from AgentExecutor easily in this mock, 
      // but we would fetch it from the total tokens used during the execution.
      // For now, we mock token count as 1500 per run.
      const tokensUsed = 1500;

      results.push({
        id: testCase.id,
        category: testCase.category,
        expectedRecommendation: testCase.expected.recommendation,
        actualRecommendation: decision.recommendation,
        latencyMs,
        tokensUsed,
        confidence: decision.confidence ?? 0,
      });

    } catch (err: any) {
      console.error(`❌ Error evaluating ${testCase.id}:`, err.message);
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

  console.log('\n=======================================');
  console.log('🏆 EVALUATION RESULTS SUMMARY');
  console.log('=======================================');
  console.table({
    'Total Cases': summary.totalCases,
    'Successful Runs': summary.successfulRuns,
    'Errors': summary.errors,
    'Precision': (summary.precision * 100).toFixed(1) + '%',
    'Recall': (summary.recall * 100).toFixed(1) + '%',
    'F1 Score': (summary.f1 * 100).toFixed(1) + '%',
    'False Positives (Bad jobs we applied to)': summary.falsePositives,
    'False Negatives (Good jobs we missed)': summary.falseNegatives,
    'Avg Latency': (summary.avgLatencyMs / 1000).toFixed(2) + 's',
  });
  console.log('=======================================');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsDir = path.join(__dirname, '../../evals/results');
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  const outputFile = path.join(resultsDir, `eval-${timestamp}.json`);
  fs.writeFileSync(outputFile, JSON.stringify({ summary, results }, null, 2));
  console.log(`\n📄 Detailed results written to: ${outputFile}`);
}

runEvaluation().catch(console.error);
