import { z } from 'zod';
import { AgentExecutor } from '../agent';
import { CompetitionAnalysis } from '../../domain/models';

export const competitionSchema = z.object({
  interviewIntensity: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('Intensity of the interview process based on current invites/interviews'),
  jobAttractiveness: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('How attractive this job is to the general market'),
  likelyCompetition: z.string().describe('Analysis of who else is likely bidding on this job'),
  biddingDifficulty: z.enum(['EASY', 'MODERATE', 'HARD']).describe('How difficult it will be to win this bid'),
});

export class CompetitionAgent {
  constructor(private executor: AgentExecutor) {}

  async analyze(rawMetrics: any | undefined, budget?: number, hourlyMax?: number): Promise<CompetitionAnalysis> {
    if (!rawMetrics) {
      return {
        interviewIntensity: 'LOW',
        jobAttractiveness: 'MEDIUM',
        likelyCompetition: 'Unknown - No metrics provided',
        biddingDifficulty: 'MODERATE',
      };
    }

    const prompt = `
    Analyze the competition and bidding difficulty for this freelance job.
    
    Metrics:
    Proposals: ${rawMetrics.proposals ?? 'Unknown'}
    Interviewing: ${rawMetrics.interviewing ?? 0}
    Invites Sent: ${rawMetrics.invites_sent ?? 0}
    Unanswered Invites: ${rawMetrics.unanswered_invites ?? 0}
    
    Budget: ${budget ? '$' + budget : 'Hourly up to $' + (hourlyMax || 'Unknown')}
    
    Provide an assessment of the interview intensity, job attractiveness, likely competition, and overall bidding difficulty.
    `;

    const result = await this.executor.executeStructured<z.infer<typeof competitionSchema>>({
      agentName: 'Competition',
      prompt,
      schema: competitionSchema,
      schemaName: 'CompetitionAnalysis',
      schemaDescription: 'Structured analysis of job competition',
    });

    return result as CompetitionAnalysis;
  }
}
