import { z } from 'zod';
import { AgentExecutor } from '../agent';
import { ClientAnalysis } from '../../domain/models';
import { TaskType } from '../router';

export const clientIntelligenceSchema = z.object({
  quality: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('Overall quality of the client based on history'),
  spendingBehavior: z.string().describe('Analysis of how this client spends (e.g., cheap, generous, variable)'),
  hiringHistory: z.string().describe('Analysis of their hire rate and history'),
  feedbackSummary: z.string().describe('Summary of feedback left by other freelancers'),
  riskSignals: z.array(z.string()).describe('Any red flags or risks associated with this client'),
});

export class ClientIntelligenceAgent {
  constructor(private executor: AgentExecutor) {}

  async analyze(clientProfile: any | undefined): Promise<ClientAnalysis> {
    if (!clientProfile) {
      return {
        quality: 'LOW',
        spendingBehavior: 'Unknown - No profile data',
        hiringHistory: 'Unknown - No profile data',
        feedbackSummary: 'No feedback available',
        riskSignals: ['Missing client profile data'],
      };
    }

    const prompt = `
    Analyze the following client profile for a freelance job platform.
    
    Client Data:
    Total Spend: $${clientProfile.totalSpend ?? 0}
    Total Reviews: ${clientProfile.totalReviews ?? 0}
    Average Rating: ${clientProfile.averageRating ?? 0} / 5
    Location: ${clientProfile.location ?? 'Unknown'}
    
    Provide an intelligence assessment of this client. Identify their spending behavior, hiring history quality, summarize their feedback profile, and flag any risks.
    `;

    const result = await this.executor.executeStructured<z.infer<typeof clientIntelligenceSchema>>({
      agentName: 'ClientIntelligence',
      prompt,
      schema: clientIntelligenceSchema,
      schemaName: 'ClientIntelligenceAnalysis',
      schemaDescription: 'Structured analysis of a client profile',
      taskType: TaskType.EXTRACTION,
      complexity: 'LOW'
    });

    return result as ClientAnalysis;
  }
}
