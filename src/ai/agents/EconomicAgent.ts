import { z } from 'zod';
import { AgentExecutor } from '../agent';
import { ClientAnalysis, CompetitionAnalysis, EconomicAnalysis, FreelancerProfile, JobAnalysis } from '../../domain/models';
import { TaskType } from '../router';

export const economicSchema = z.object({
  status: z.enum(['OBSERVED', 'ESTIMATED', 'UNKNOWN']).describe('OBSERVED if budget/rate is explicit; ESTIMATED if calculated from scope; UNKNOWN if vague'),
  expectedValue: z.number().describe('Estimated monetary value in USD of winning this job'),
  effectiveHourlyRate: z.number().nullable().describe('Effective hourly rate based on expected effort, or null if not calculable'),
  budgetQuality: z.enum(['LOW', 'FAIR', 'GOOD', 'EXCELLENT', 'UNKNOWN']).describe('Quality of the budget relative to market rates and target expectations'),
  effortRisk: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('Risk of the project requiring more effort than compensated'),
  opportunityCost: z.string().describe('Analysis of the opportunity cost of taking this job versus others'),
  clientRisk: z.enum(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN']).describe('Risk of non-payment or unreasonable scope creep based on client profile'),
  rationale: z.string().describe('Clear rationale explaining the economic assessment'),
});

export class EconomicAgent {
  constructor(private executor: AgentExecutor) {}

  async analyze(
    budget: number | undefined, 
    hourlyMin: number | undefined, 
    hourlyMax: number | undefined, 
    clientAnalysis: ClientAnalysis, 
    competitionAnalysis: CompetitionAnalysis,
    jobAnalysis?: JobAnalysis,
    profile?: FreelancerProfile
  ): Promise<EconomicAnalysis> {
    const hasExplicitBudget = budget !== undefined && budget > 0;
    const hasExplicitHourly = (hourlyMin !== undefined && hourlyMin > 0) || (hourlyMax !== undefined && hourlyMax > 0);
    const initialStatus = (hasExplicitBudget || hasExplicitHourly) ? 'OBSERVED' : (jobAnalysis ? 'ESTIMATED' : 'UNKNOWN');

    const prompt = `
    Perform an economic, rate, and risk analysis on this freelance opportunity.
    
    Financial Data Provided:
    Fixed Budget: ${budget ? '$' + budget : 'Not specified'}
    Hourly Range: ${hasExplicitHourly ? '$' + (hourlyMin ?? 0) + ' - $' + (hourlyMax ?? 'open') : 'Not specified'}
    Data State: ${initialStatus}
    
    Freelancer Target Standards:
    Target Hourly Rate: $${profile?.targetHourlyRate ?? 75}/hr
    Minimum Project Budget Floor: $${profile?.minProjectBudget ?? 1000}
    
    Project Scope:
    Deliverables: ${jobAnalysis?.deliverables.join(', ') || 'Not analyzed'}
    Ambiguity: ${jobAnalysis?.ambiguity || 'MEDIUM'}
    Scope Complexity: ${jobAnalysis?.scopeComplexity || 'MEDIUM'}
    
    Client Risk Signals:
    Quality: ${clientAnalysis.quality}
    Risk Signals: ${clientAnalysis.riskSignals.length > 0 ? clientAnalysis.riskSignals.join(', ') : 'None'}
    
    INSTRUCTIONS:
    1. If budget is explicit, calculate effective hourly rate and compare with target ($${profile?.targetHourlyRate ?? 75}/hr).
    2. If budget is unstated, estimate expected value based on deliverables and mark status = ESTIMATED or UNKNOWN.
    3. If client quality is UNKNOWN, set clientRisk to UNKNOWN or LOW unless active scam signals were found.
    4. Provide clear rationale.
    `;

    const result = await this.executor.executeStructured<z.infer<typeof economicSchema>>({
      agentName: 'Economic',
      prompt,
      schema: economicSchema,
      schemaName: 'EconomicAnalysis',
      schemaDescription: 'Structured analysis of economic viability',
      taskType: TaskType.REASONING,
      complexity: 'LOW'
    });

    return result as EconomicAnalysis;
  }
}
