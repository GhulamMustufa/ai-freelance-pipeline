import { z } from 'zod';
import { AgentExecutor } from '../../ai/agent';
import { JobAnalysis, ClientAnalysis, CompetitionAnalysis, FitAnalysis, EconomicAnalysis, OpportunityDecision } from '../../domain/models';
import { TaskType } from '../../ai/router';

export const decisionSchema = z.object({
  score: z.number().min(0).max(100).describe('Final overall score for the opportunity (0-100)'),
  recommendation: z.enum(['APPLY', 'MAYBE', 'SKIP']).describe('Final recommendation'),
  confidence: z.number().min(0).max(1).describe('Confidence in the recommendation (0.0 to 1.0)'),
  reason: z.string().describe('Concise rationale for the decision'),
  positiveEvidence: z.array(z.string()).describe('Strong reasons to apply'),
  negativeEvidence: z.array(z.string()).describe('Reasons to skip or be cautious'),
  missingInformation: z.array(z.string()).describe('Information missing that would increase confidence'),
});

export class DecisionEngine {
  constructor(private executor: AgentExecutor) {}

  async decide(
    jobAnalysis: JobAnalysis,
    clientAnalysis: ClientAnalysis,
    competitionAnalysis: CompetitionAnalysis,
    fitAnalysis: FitAnalysis,
    economicAnalysis: EconomicAnalysis
  ): Promise<Omit<OpportunityDecision, 'id' | 'opportunityId' | 'createdAt'>> {
    
    // 1. DETERMINISTIC RULES
    const autoRejects: string[] = [];

    // Client Blacklist / Low Quality
    if (clientAnalysis.quality === 'LOW' && clientAnalysis.riskSignals.some(r => r.toLowerCase().includes('scam') || r.toLowerCase().includes('non-payment'))) {
      autoRejects.push('Auto-Reject: Client identified as high-risk or scam.');
    }

    // Completely disjoint skills
    if (fitAnalysis.matchScore < 20) {
      autoRejects.push('Auto-Reject: Freelancer fit score below 20%. Missing core required skills.');
    }

    // Terrible Economics
    if (economicAnalysis.budgetQuality === 'LOW' && economicAnalysis.clientRisk === 'HIGH') {
      autoRejects.push('Auto-Reject: Low budget quality combined with high client risk.');
    }

    if (autoRejects.length > 0) {
      return {
        recommendation: 'SKIP',
        reason: autoRejects.join(' '),
        confidence: 1.0,
        positiveEvidence: [],
        negativeEvidence: autoRejects,
        missingInformation: []
      };
    }

    // 2. LLM SYNTHESIS
    const prompt = `
    Synthesize the following 5 agent reports into a final decision for this freelance opportunity.
    
    Job Analysis:
    - Problem: ${jobAnalysis.actualProblem}
    - Seniority: ${jobAnalysis.seniority}
    
    Client Analysis:
    - Quality: ${clientAnalysis.quality}
    - Risk Signals: ${clientAnalysis.riskSignals.join(', ')}
    
    Competition Analysis:
    - Difficulty: ${competitionAnalysis.biddingDifficulty}
    
    Freelancer Fit Analysis:
    - Match Score: ${fitAnalysis.matchScore}/100
    - Missing: ${fitAnalysis.missingRequirements.join(', ')}
    
    Economic Analysis:
    - Budget Quality: ${economicAnalysis.budgetQuality}
    - Expected Value: $${economicAnalysis.expectedValue}
    - Client Risk: ${economicAnalysis.clientRisk}
    
    Produce a final score, recommendation (APPLY, MAYBE, SKIP), confidence, concise reason, and lists of positive evidence, negative evidence, and missing information.
    `;

    const result = await this.executor.executeStructured<z.infer<typeof decisionSchema>>({
      agentName: 'DecisionEngine',
      prompt,
      schema: decisionSchema,
      schemaName: 'OpportunityDecision',
      schemaDescription: 'Final decision on whether to apply to an opportunity',
      taskType: TaskType.REASONING,
      complexity: 'HIGH'
    });

    return {
      recommendation: result.recommendation as 'APPLY' | 'MAYBE' | 'SKIP',
      reason: result.reason,
      confidence: result.confidence,
      positiveEvidence: result.positiveEvidence,
      negativeEvidence: result.negativeEvidence,
      missingInformation: result.missingInformation,
    };
  }
}
