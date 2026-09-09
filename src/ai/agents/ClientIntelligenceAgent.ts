import { z } from 'zod';
import { AgentExecutor } from '../agent';
import { ClientAnalysis } from '../../domain/models';
import { TaskType } from '../router';

export const clientIntelligenceSchema = z.object({
  quality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN']).describe('Overall quality of the client. MUST be UNKNOWN if no historical data is provided'),
  spendingBehavior: z.string().describe('Analysis of how this client spends'),
  hiringHistory: z.string().describe('Analysis of their hire rate and history'),
  feedbackSummary: z.string().describe('Summary of feedback left by other freelancers or lack thereof'),
  riskSignals: z.array(z.string()).describe('Specific red flags, scam indicators, or risks'),
  isVerified: z.boolean().describe('Whether the client has verified payment and spending history'),
});

export class ClientIntelligenceAgent {
  constructor(private executor: AgentExecutor) {}

  async analyze(clientProfile: any | undefined, jobDescription?: string): Promise<ClientAnalysis> {
    // Check if clientProfile actually contains verifiable metrics
    const hasClientData = clientProfile && (
      (clientProfile.totalSpend !== undefined && clientProfile.totalSpend > 0) ||
      (clientProfile.feedbackScore !== undefined && clientProfile.feedbackScore > 0) ||
      (clientProfile.hires !== undefined && clientProfile.hires > 0)
    );

    // If no client profile data is provided, preserve UNKNOWN without false penalties
    if (!hasClientData) {
      // Deterministic check for obvious scam keywords in JD if present
      const riskSignals: string[] = [];
      const text = (jobDescription || '').toLowerCase();
      
      if (text.includes('telegram') || text.includes('whatsapp') || text.includes('contact me outside')) {
        riskSignals.push('Red Flag: Client requests off-platform communication (Telegram/WhatsApp).');
      }
      if (text.includes('cashier check') || text.includes('crypto payment upfront') || text.includes('pay fee')) {
        riskSignals.push('Severe Scam Warning: Job mentions upfront payment fees or check deposits.');
      }
      if (text.includes('free trial') || text.includes('unpaid sample') || text.includes('test task without pay')) {
        riskSignals.push('Exploitative Scope: Client asks for unpaid sample work prior to hiring.');
      }

      return {
        quality: 'UNKNOWN',
        spendingBehavior: 'UNKNOWN — Historical spend data not provided',
        hiringHistory: 'UNKNOWN — Hire rate and review history unavailable',
        feedbackSummary: 'Client historical profile not provided (evaluated from job text)',
        riskSignals,
        isVerified: false,
      };
    }

    const prompt = `
    Analyze the following client profile for a freelance job.
    
    Client Data:
    Total Spend: $${clientProfile.totalSpend ?? 0}
    Total Reviews / Hires: ${clientProfile.hires ?? clientProfile.totalReviews ?? 0}
    Average Rating: ${clientProfile.feedbackScore ?? clientProfile.averageRating ?? 0} / 5
    Location: ${clientProfile.location ?? 'Unknown'}
    ${jobDescription ? `Job Context:\n${jobDescription.substring(0, 500)}` : ''}
    
    CRITICAL RULE: If data is missing or zero without negative context, classify quality as UNKNOWN or FAIR.
    Only classify as LOW if there is active evidence of non-payment, abuse, or scam behavior.
    Identify spending behavior, hiring history, summarize feedback, and identify true risk signals.
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
