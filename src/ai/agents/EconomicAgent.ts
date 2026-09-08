import { z } from 'zod';
import { AgentExecutor } from '../agent';
import { ClientAnalysis, CompetitionAnalysis, EconomicAnalysis } from '../../domain/models';
import { TaskType } from '../router';

export const economicSchema = z.object({
  expectedValue: z.number().describe('Estimated monetary value of winning this job'),
  budgetQuality: z.enum(['LOW', 'FAIR', 'GOOD', 'EXCELLENT']).describe('Quality of the budget relative to market rates'),
  effortRisk: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('Risk of the project requiring more effort than compensated'),
  opportunityCost: z.string().describe('Analysis of the opportunity cost of taking this job versus others'),
  clientRisk: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('Risk of non-payment or unreasonable scope creep based on client profile'),
});

export class EconomicAgent {
  constructor(private executor: AgentExecutor) {}

  async analyze(budget: number | undefined, hourlyMin: number | undefined, hourlyMax: number | undefined, clientAnalysis: ClientAnalysis, competitionAnalysis: CompetitionAnalysis): Promise<EconomicAnalysis> {
    const prompt = `
    Perform an economic and risk analysis on this freelance opportunity.
    
    Financials:
    Budget: ${budget ? '$' + budget : 'Hourly: $' + (hourlyMin ?? '0') + ' - $' + (hourlyMax ?? 'Unknown')}
    
    Client Context:
    Client Quality: ${clientAnalysis.quality}
    Spending Behavior: ${clientAnalysis.spendingBehavior}
    Risk Signals: ${clientAnalysis.riskSignals.join(', ')}
    
    Competition Context:
    Bidding Difficulty: ${competitionAnalysis.biddingDifficulty}
    
    Calculate the expected value, assess budget quality, estimate the effort risk, explain the opportunity cost, and determine the client risk.
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
