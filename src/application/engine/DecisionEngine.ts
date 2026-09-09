import { z } from 'zod';
import { AgentExecutor } from '../../ai/agent';
import { 
  JobAnalysis, 
  ClientAnalysis, 
  CompetitionAnalysis, 
  FitAnalysis, 
  EconomicAnalysis, 
  OpportunityDecision,
  FreelancerProfile 
} from '../../domain/models';
import { TaskType } from '../../ai/router';

export const decisionSchema = z.object({
  score: z.number().min(0).max(100).describe('Final overall score for the opportunity (0-100)'),
  recommendation: z.enum(['APPLY', 'MAYBE', 'SKIP']).describe('Final recommendation'),
  confidence: z.number().min(0).max(1).describe('Confidence in the recommendation (0.0 to 1.0)'),
  summary: z.string().describe('Executive 1-sentence summary of the decision'),
  reason: z.string().describe('Primary headline rationale for the recommendation'),
  reasons: z.array(z.string()).describe('Bullet-point list of key reasons driving this decision'),
  risks: z.array(z.string()).describe('Specific operational, technical, or client risks identified'),
  unknowns: z.array(z.string()).describe('Missing variables that could alter confidence or require discovery questions'),
  positiveEvidence: z.array(z.string()).describe('Strong reasons to apply backed by verified capabilities or scope'),
  negativeEvidence: z.array(z.string()).describe('Concrete reasons for hesitation, mismatch, or disqualification'),
});

export class DecisionEngine {
  constructor(private executor: AgentExecutor) {}

  async decide(
    jobAnalysis: JobAnalysis,
    clientAnalysis: ClientAnalysis,
    competitionAnalysis: CompetitionAnalysis,
    fitAnalysis: FitAnalysis,
    economicAnalysis: EconomicAnalysis,
    profile?: FreelancerProfile,
    budget?: number
  ): Promise<OpportunityDecision> {
    
    // -------------------------------------------------------------------------
    // 1. DETERMINISTIC CONSTRAINTS (Deterministic code enforces hard constraints)
    // -------------------------------------------------------------------------
    const deterministicUnknowns: string[] = [];

    // Track explicit unknowns deterministically
    if (clientAnalysis.quality === 'UNKNOWN') {
      deterministicUnknowns.push('Client hiring history and reviews unavailable (evaluated from job text).');
    }
    if (economicAnalysis.status !== 'OBSERVED') {
      deterministicUnknowns.push(`Job budget unstated (economic value estimated at ~$${economicAnalysis.expectedValue}).`);
    }
    if (competitionAnalysis.biddingDifficulty === 'UNKNOWN' || competitionAnalysis.interviewIntensity === 'UNKNOWN') {
      deterministicUnknowns.push('Real-time competing proposal count and interview intensity unavailable.');
    }

    // A. Excluded Technology Gate
    if (fitAnalysis.deterministicConstraintViolated) {
      return {
        recommendation: 'SKIP',
        confidence: 1.0,
        summary: `Auto-Reject: ${fitAnalysis.violationReason || 'Job requires an excluded technology.'}`,
        reason: `Deterministic Constraint: Job requires a technology on your excluded list.`,
        reasons: [
          `Excluded Technology Dealbreaker: ${fitAnalysis.redFlags.join(', ')}`,
          'Freelancer profile explicitly filters out this technical stack.',
          'Pursuing this opportunity would conflict with your targeted engineering focus.'
        ],
        positiveEvidence: [],
        negativeEvidence: fitAnalysis.redFlags,
        risks: ['Severe technology mismatch against profile standards.'],
        unknowns: deterministicUnknowns,
        scores: {
          technicalFit: 0,
          economicQuality: economicAnalysis.status === 'OBSERVED' ? 50 : 20,
          clientRisk: clientAnalysis.quality === 'UNKNOWN' ? 'UNKNOWN' : (clientAnalysis.quality === 'LOW' ? 'HIGH' : 'LOW'),
          scopeClarity: jobAnalysis.ambiguity === 'HIGH' ? 'LOW' : (jobAnalysis.ambiguity === 'LOW' ? 'HIGH' : 'MEDIUM'),
        },
        economics: {
          status: economicAnalysis.status,
          effectiveHourlyRate: economicAnalysis.effectiveHourlyRate,
          rationale: economicAnalysis.rationale,
        }
      };
    }

    // B. Confirmed Scam / Policy Violation Gate
    const hasScamWarning = clientAnalysis.riskSignals.some(r => 
      r.toLowerCase().includes('scam') || 
      r.toLowerCase().includes('off-platform') || 
      r.toLowerCase().includes('unpaid')
    );

    if (hasScamWarning) {
      return {
        recommendation: 'SKIP',
        confidence: 0.98,
        summary: 'Auto-Reject: Job description contains verified risk or platform violation signals.',
        reason: clientAnalysis.riskSignals[0] || 'High risk of payment default or scam.',
        reasons: clientAnalysis.riskSignals,
        positiveEvidence: [],
        negativeEvidence: clientAnalysis.riskSignals,
        risks: clientAnalysis.riskSignals,
        unknowns: deterministicUnknowns,
        scores: {
          technicalFit: fitAnalysis.matchScore,
          economicQuality: 0,
          clientRisk: 'HIGH',
          scopeClarity: 'LOW',
        },
        economics: {
          status: economicAnalysis.status,
          effectiveHourlyRate: 0,
          rationale: 'Rejected due to scam / policy violation flags.',
        }
      };
    }

    // C. Severe Budget Mismatch Gate (Fixed budget < 30% of minimum threshold)
    if (budget !== undefined && budget > 0 && profile?.minProjectBudget && budget < (profile.minProjectBudget * 0.3)) {
      return {
        recommendation: 'SKIP',
        confidence: 0.95,
        summary: `Auto-Reject: Stated budget of $${budget} is far below your minimum project floor ($${profile.minProjectBudget}).`,
        reason: `Budget Mismatch: Client offers $${budget}, which is >70% below your $${profile.minProjectBudget} minimum.`,
        reasons: [
          `Stated budget ($${budget}) fails to meet minimum compensation thresholds.`,
          `Estimated scope exceeds compensation by an order of magnitude.`,
          'High risk of scope creep and negative hourly return.'
        ],
        positiveEvidence: fitAnalysis.positiveMatches,
        negativeEvidence: [`Budget $${budget} is below $${profile.minProjectBudget} minimum.`],
        risks: ['Severe compensation deficit.'],
        unknowns: deterministicUnknowns,
        scores: {
          technicalFit: fitAnalysis.matchScore,
          economicQuality: 10,
          clientRisk: clientAnalysis.quality === 'UNKNOWN' ? 'UNKNOWN' : 'MEDIUM',
          scopeClarity: 'MEDIUM',
        },
        economics: {
          status: 'OBSERVED',
          effectiveHourlyRate: budget / 20,
          rationale: `Budget $${budget} significantly below minimum threshold of $${profile.minProjectBudget}.`,
        }
      };
    }

    // -------------------------------------------------------------------------
    // 2. LLM SYNTHESIS (Synthesizes multiple reasoning signals)
    // -------------------------------------------------------------------------
    const prompt = `
    You are OmniBid's Senior Decision Engine.
    Synthesize the following 5 agent reports into a conclusive, evidence-grounded recommendation for a freelancer.

    Options:
    - APPLY: High fit, fair economics, clear problem, actionable opportunity.
    - MAYBE: Moderate fit, unstated budget requiring clarification, or minor scope ambiguities.
    - SKIP: Low fit, unrealistic demands, poor economics, or excessive risk.
    
    IMPORTANT RULES:
    1. Do NOT penalize or reject simply because client information is UNKNOWN. Label missing information in 'unknowns'.
    2. Be comfortable recommending SKIP if the job is poor value or high risk.
    3. Calculate score (0-100) and confidence (0.0 to 1.0).

    Job Analysis:
    - Problem: ${jobAnalysis.actualProblem}
    - Requirements: ${jobAnalysis.technicalRequirements.join(', ')}
    - Hidden Requirements: ${jobAnalysis.hiddenRequirements.join(', ') || 'None'}
    - Ambiguity: ${jobAnalysis.ambiguity}
    - Scope Complexity: ${jobAnalysis.scopeComplexity}
    
    Freelancer Fit Analysis:
    - Match Score: ${fitAnalysis.matchScore} / 100
    - Positive Matches: ${fitAnalysis.positiveMatches.join('; ')}
    - Missing Requirements: ${fitAnalysis.missingRequirements.join('; ') || 'None'}
    
    Economic Analysis:
    - Status: ${economicAnalysis.status}
    - Budget Quality: ${economicAnalysis.budgetQuality}
    - Expected Value: $${economicAnalysis.expectedValue}
    - Effort Risk: ${economicAnalysis.effortRisk}
    - Rationale: ${economicAnalysis.rationale}
    
    Client & Risk Analysis:
    - Quality: ${clientAnalysis.quality}
    - Risk Signals: ${clientAnalysis.riskSignals.length > 0 ? clientAnalysis.riskSignals.join('; ') : 'None'}
    
    Deterministic Unknowns to incorporate:
    ${deterministicUnknowns.map(u => `• ${u}`).join('\n')}

    Synthesize into structured decision.
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

    // Merge deterministic unknowns
    const allUnknowns = Array.from(new Set([...deterministicUnknowns, ...(result.unknowns || [])]));

    // Map scores
    const technicalFit = fitAnalysis.matchScore;
    const economicQuality = economicAnalysis.budgetQuality === 'EXCELLENT' ? 95 :
                            economicAnalysis.budgetQuality === 'GOOD' ? 80 :
                            economicAnalysis.budgetQuality === 'FAIR' ? 60 :
                            economicAnalysis.budgetQuality === 'LOW' ? 25 : 50;

    const scopeClarity = jobAnalysis.ambiguity === 'LOW' ? 'HIGH' :
                         jobAnalysis.ambiguity === 'MEDIUM' ? 'MEDIUM' : 'LOW';

    return {
      recommendation: result.recommendation as 'APPLY' | 'MAYBE' | 'SKIP',
      confidence: result.confidence,
      summary: result.summary,
      reason: result.reason,
      reasons: result.reasons || [result.reason],
      positiveEvidence: result.positiveEvidence || fitAnalysis.positiveMatches,
      negativeEvidence: result.negativeEvidence || fitAnalysis.missingRequirements,
      risks: result.risks || [],
      unknowns: allUnknowns,
      scores: {
        technicalFit,
        economicQuality,
        clientRisk: clientAnalysis.quality,
        scopeClarity,
      },
      economics: {
        status: economicAnalysis.status,
        effectiveHourlyRate: economicAnalysis.effectiveHourlyRate,
        estimatedEffort: economicAnalysis.effortRisk === 'LOW' ? '< 20 hrs' : (economicAnalysis.effortRisk === 'MEDIUM' ? '20-60 hrs' : '60+ hrs'),
        rationale: economicAnalysis.rationale,
      }
    };
  }
}
