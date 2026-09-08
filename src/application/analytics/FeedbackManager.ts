import { prisma } from '../../lib/prisma';

export interface OutcomeUpdate {
  applied?: boolean;
  proposalEdited?: boolean;
  clientViewed?: boolean;
  responseReceived?: boolean;
  interview?: boolean;
  contractWon?: boolean;
  rejected?: boolean;
  reasonLost?: string;
}

export interface FeedbackUpdate {
  decisionCorrect: boolean;
  proposalQuality?: number;
  opportunityValuable: boolean;
  notes?: string;
}

export class FeedbackManager {
  /**
   * Log real-world outcomes for an opportunity
   */
  async logOutcome(opportunityId: string, outcome: OutcomeUpdate) {
    return prisma.opportunityOutcome.upsert({
      where: { opportunityId },
      update: outcome,
      create: {
        opportunityId,
        ...outcome,
      },
    });
  }

  /**
   * Log human-in-the-loop feedback for an opportunity
   */
  async logFeedback(opportunityId: string, feedback: FeedbackUpdate) {
    return prisma.userFeedback.upsert({
      where: { opportunityId },
      update: feedback,
      create: {
        opportunityId,
        ...feedback,
      },
    });
  }

  /**
   * Calculate pipeline systemic metrics (Conversion Rates)
   */
  async getSystemMetrics() {
    const outcomes = await prisma.opportunityOutcome.findMany();

    const totalApplied = outcomes.filter((o: { applied: boolean }) => o.applied).length;
    if (totalApplied === 0) {
      return {
        totalApplied: 0,
        responseRate: 0,
        interviewRate: 0,
        contractRate: 0,
      };
    }

    const totalResponses = outcomes.filter((o: { applied: boolean; responseReceived: boolean }) => o.applied && o.responseReceived).length;
    const totalInterviews = outcomes.filter((o: { applied: boolean; interview: boolean }) => o.applied && o.interview).length;
    const totalContracts = outcomes.filter((o: { applied: boolean; contractWon: boolean }) => o.applied && o.contractWon).length;

    return {
      totalApplied,
      responseRate: (totalResponses / totalApplied) * 100,
      interviewRate: (totalInterviews / totalApplied) * 100,
      contractRate: (totalContracts / totalApplied) * 100,
    };
  }

  /**
   * Calculate Correlation: AI Score vs Actual Outcome
   */
  async getScoreCorrelations() {
    const opportunities = await prisma.opportunity.findMany({
      include: {
        score: true,
      },
      where: {
        score: { isNot: null },
      }
    });

    const outcomes = await prisma.opportunityOutcome.findMany();
    const outcomeMap = new Map(outcomes.map(o => [o.opportunityId, o]));

    const withOutcomes = opportunities.filter(o => outcomeMap.has(o.id) && outcomeMap.get(o.id)?.applied);

    const highScoring = withOutcomes.filter(o => (o.score?.skillMatch || 0) >= 80);
    const lowScoring = withOutcomes.filter(o => (o.score?.skillMatch || 0) < 80);

    const getSuccessRate = (opps: typeof opportunities) => {
      if (opps.length === 0) return 0;
      const successes = opps.filter(o => {
        const outcome = outcomeMap.get(o.id);
        return outcome?.contractWon || outcome?.interview;
      }).length;
      return (successes / opps.length) * 100;
    };

    return {
      highScoreSuccessRate: getSuccessRate(highScoring),
      lowScoreSuccessRate: getSuccessRate(lowScoring),
      highScoreCount: highScoring.length,
      lowScoreCount: lowScoring.length,
    };
  }
}
