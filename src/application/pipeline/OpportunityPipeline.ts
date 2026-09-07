import { prisma } from '../../lib/prisma';
import { 
  OpportunityStatus, 
  PipelineStage, 
  PipelineStatus,
  DecisionRecommendation,
  RawOpportunityPayload,
  EnrichedOpportunityData
} from '../../domain/models';
import { AgentExecutor } from '../../ai/agent';
import { buildScoringPrompt, buildDraftingPrompt } from '../../ai/prompts/scoringPrompt';
import { z } from 'zod';
import { UpworkMCPClient } from '../../integrations/upwork/mcpClient';

const scoringSchema = z.object({
  jobType: z.string(),
  skillMatch: z.number(),
  portfolioFit: z.number(),
  projectQuality: z.number(),
  longTermPotential: z.number(),
  redFlags: z.array(z.string()),
  missingRequirements: z.array(z.string()),
  recommendation: z.enum(['APPLY', 'MAYBE', 'SKIP']),
  reason: z.string()
});

const draftingSchema = z.object({
  draftHook: z.string()
});

export class OpportunityPipeline {
  private agent: AgentExecutor;
  private mcpClient: UpworkMCPClient;

  constructor() {
    this.agent = new AgentExecutor({ provider: 'gemini', model: 'gemini-3.6-flash' });
    this.mcpClient = new UpworkMCPClient();
  }

  async processJob(payload: RawOpportunityPayload) {
    let opp = await this.ingest(payload);

    try {
      const enrichedData = await this.enrich(opp.id, payload);
      const scoreData = await this.analyzeAndScore(opp.id, enrichedData);
      const decision = await this.decide(opp.id, scoreData);

      if (decision === DecisionRecommendation.APPLY) {
        await this.generateProposal(opp.id, enrichedData);
      }
    } catch (error) {
      console.error(`Pipeline failed for ${opp.id}:`, error);
      await this.logRun(opp.id, PipelineStage.INGEST, PipelineStatus.FAILED, String(error));
    }
  }

  async resumeJob(opportunityId: string, payload: RawOpportunityPayload) {
    try {
      const enrichedData = await this.enrich(opportunityId, payload);
      const scoreData = await this.analyzeAndScore(opportunityId, enrichedData);
      const decision = await this.decide(opportunityId, scoreData);

      if (decision === DecisionRecommendation.APPLY) {
        await this.generateProposal(opportunityId, enrichedData);
      }
    } catch (error) {
      console.error(`Pipeline failed to resume for ${opportunityId}:`, error);
      await this.logRun(opportunityId, PipelineStage.ENRICH, PipelineStatus.FAILED, String(error));
    }
  }

  private async ingest(payload: RawOpportunityPayload) {
    // DEDUPLICATE implicitly through upsert
    let opp = await prisma.opportunity.findUnique({
      where: { platformId: payload.platformId }
    });

    if (opp) {
      console.log(`[Pipeline] Opportunity ${payload.platformId} already exists. Deduplicating.`);
      return opp;
    }

    // INGEST
    opp = await prisma.opportunity.create({
      data: {
        platformId: payload.platformId,
        platform: payload.platform,
        status: OpportunityStatus.PENDING,
        jobPosting: {
          create: {
            title: payload.title,
            description: payload.description,
            skills: payload.skills.join(','),
            budget: payload.budget,
            hourlyMin: payload.hourlyMin,
            hourlyMax: payload.hourlyMax,
            postedAt: payload.postedAt,
            jobInvitesSent: payload.rawMetrics?.invites_sent,
            jobInterviewing: payload.rawMetrics?.interviewing,
            jobAvgBid: payload.rawMetrics?.avg_bid,
          }
        }
      }
    });

    await this.logRun(opp.id, PipelineStage.INGEST, PipelineStatus.COMPLETED);
    return opp;
  }

  private async enrich(opportunityId: string, payload: RawOpportunityPayload): Promise<EnrichedOpportunityData> {
    await this.logRun(opportunityId, PipelineStage.ENRICH, PipelineStatus.PROCESSING);
    
    // Abstracted MCP call
    const clientData = await this.mcpClient.getClientMetrics(payload.platformId);
    
    // NORMALIZE
    let clientId = payload.client?.platformId || clientData?.id;
    if (!clientId) {
      clientId = Buffer.from(`${payload.platformId}-fallback`).toString('base64');
    }

    const client = await prisma.client.upsert({
      where: { platformId: String(clientId) },
      update: {
        profile: {
          upsert: {
            create: {
              totalSpend: clientData?.total_spent || 0,
              avgHourlyRate: clientData?.avg_hourly_rate || 0,
              feedbackScore: clientData?.feedback_score || 0,
              totalContracts: clientData?.hires || 0,
              location: clientData?.location?.country
            },
            update: {
              totalSpend: clientData?.total_spent || 0,
              avgHourlyRate: clientData?.avg_hourly_rate || 0,
              feedbackScore: clientData?.feedback_score || 0,
              totalContracts: clientData?.hires || 0,
            }
          }
        }
      },
      create: {
        platformId: String(clientId),
        platform: payload.platform,
        profile: {
          create: {
            totalSpend: clientData?.total_spent || 0,
            avgHourlyRate: clientData?.avg_hourly_rate || 0,
            feedbackScore: clientData?.feedback_score || 0,
            totalContracts: clientData?.hires || 0,
            location: clientData?.location?.country
          }
        }
      },
      include: { profile: true }
    });

    await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { clientId: client.id }
    });

    await this.logRun(opportunityId, PipelineStage.ENRICH, PipelineStatus.COMPLETED);

    return {
      ...payload,
      clientProfile: client.profile ? {
        totalSpend: client.profile.totalSpend || 0,
        avgHourlyRate: client.profile.avgHourlyRate || 0,
        feedbackScore: client.profile.feedbackScore || 0,
        totalContracts: client.profile.totalContracts || 0,
        activeContracts: client.profile.activeContracts || 0
      } : undefined
    };
  }

  private async analyzeAndScore(opportunityId: string, job: EnrichedOpportunityData) {
    await this.logRun(opportunityId, PipelineStage.SCORE, PipelineStatus.PROCESSING);
    
    const client = await prisma.client.findFirst({
      where: { platformId: job.client?.platformId }
    });
    
    const prompt = buildScoringPrompt(job, client?.status || 'NEUTRAL');
    const result = await this.agent.executeStructured(
      'AnalyzerAgent',
      opportunityId,
      prompt,
      scoringSchema
    );

    await prisma.opportunityScore.create({
      data: {
        opportunityId,
        skillMatch: result.skillMatch,
        portfolioFit: result.portfolioFit,
        projectQuality: result.projectQuality,
        longTermPotential: result.longTermPotential,
        redFlags: JSON.stringify(result.redFlags),
        missingRequirements: JSON.stringify(result.missingRequirements)
      }
    });

    await this.logRun(opportunityId, PipelineStage.SCORE, PipelineStatus.COMPLETED);
    return result;
  }

  private async decide(opportunityId: string, scoreData: any) {
    await this.logRun(opportunityId, PipelineStage.DECIDE, PipelineStatus.PROCESSING);

    await prisma.opportunityDecision.create({
      data: {
        opportunityId,
        recommendation: scoreData.recommendation,
        reason: scoreData.reason
      }
    });

    const status = scoreData.recommendation === 'APPLY' ? OpportunityStatus.EVALUATING : OpportunityStatus.REJECTED;
    
    await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status }
    });

    await this.logRun(opportunityId, PipelineStage.DECIDE, PipelineStatus.COMPLETED);
    return scoreData.recommendation;
  }

  private async generateProposal(opportunityId: string, job: EnrichedOpportunityData) {
    await this.logRun(opportunityId, PipelineStage.PROPOSAL, PipelineStatus.PROCESSING);
    
    const prompt = buildDraftingPrompt();
    const result = await this.agent.executeStructured(
      'DraftingAgent',
      opportunityId,
      `Job Description:\n${job.description}\n\n${prompt}`,
      draftingSchema
    );

    await prisma.proposal.create({
      data: {
        opportunityId,
        content: result.draftHook
      }
    });

    await this.logRun(opportunityId, PipelineStage.PROPOSAL, PipelineStatus.COMPLETED);
  }

  private async logRun(opportunityId: string, stage: PipelineStage, status: PipelineStatus, error?: string) {
    await prisma.pipelineRun.create({
      data: { opportunityId, stage, status, error }
    });
  }
}
