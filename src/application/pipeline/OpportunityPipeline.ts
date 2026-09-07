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
import { JobIntelligenceAgent } from '../../ai/agents/JobIntelligenceAgent';
import { ClientIntelligenceAgent } from '../../ai/agents/ClientIntelligenceAgent';
import { CompetitionAgent } from '../../ai/agents/CompetitionAgent';
import { FreelancerFitAgent } from '../../ai/agents/FreelancerFitAgent';
import { EconomicAgent } from '../../ai/agents/EconomicAgent';
import { DecisionEngine } from '../engine/DecisionEngine';
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
  private executor: AgentExecutor;
  
  private jobAgent: JobIntelligenceAgent;
  private clientAgent: ClientIntelligenceAgent;
  private competitionAgent: CompetitionAgent;
  private fitAgent: FreelancerFitAgent;
  private economicAgent: EconomicAgent;
  private decisionEngine: DecisionEngine;
  private mcpClient: UpworkMCPClient;

  constructor() {
    this.executor = new AgentExecutor();
    
    this.jobAgent = new JobIntelligenceAgent(this.executor);
    this.clientAgent = new ClientIntelligenceAgent(this.executor);
    this.competitionAgent = new CompetitionAgent(this.executor);
    this.fitAgent = new FreelancerFitAgent(this.executor);
    this.economicAgent = new EconomicAgent(this.executor);
    this.decisionEngine = new DecisionEngine(this.executor);
    this.mcpClient = new UpworkMCPClient();
  }

  async processJob(payload: RawOpportunityPayload) {
    let opp = await this.ingest(payload);

    try {
      const enrichedData = await this.enrich(opp.id, payload);
      await this.analyzeAndScore(opp.id);
      
      const decision = await prisma.opportunityDecision.findFirst({ where: { opportunityId: opp.id } });

      if (decision?.recommendation === 'APPLY') {
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
      await this.analyzeAndScore(opportunityId);
    } catch (error) {
      console.error(`Pipeline failed to resume for ${opportunityId}:`, error);
      await this.logRun(opportunityId, PipelineStage.ENRICH, PipelineStatus.FAILED, String(error));
    }
  }

  private async ingest(payload: RawOpportunityPayload) {
    let opp = await prisma.opportunity.findUnique({
      where: { platformId: payload.platformId }
    });

    if (opp) {
      console.log(`[Pipeline] Opportunity ${payload.platformId} already exists. Deduplicating.`);
      return opp;
    }

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
    
    const clientData = await this.mcpClient.getClientMetrics(payload.platformId);
    
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

  async analyzeAndScore(id: string): Promise<void> {
    const opp = await prisma.opportunity.findUnique({
      where: { id },
      include: { client: true, jobPosting: true, pipelineRun: true }
    });

    if (!opp || !opp.jobPosting) return;

    await this.logRun(id, PipelineStage.SCORE, PipelineStatus.PROCESSING);

    try {
      const [jobAnalysis, clientAnalysis, competitionAnalysis] = await Promise.all([
        this.jobAgent.analyze(opp.jobPosting.title, opp.jobPosting.description),
        this.clientAgent.analyze(opp.client ? opp.client : undefined),
        this.competitionAgent.analyze(null, opp.jobPosting.budget ?? undefined, opp.jobPosting.hourlyMax ?? undefined)
      ]);

      const [fitAnalysis, economicAnalysis] = await Promise.all([
        this.fitAgent.analyze(jobAnalysis),
        this.economicAgent.analyze(
          opp.jobPosting.budget ?? undefined, 
          opp.jobPosting.hourlyMin ?? undefined, 
          opp.jobPosting.hourlyMax ?? undefined, 
          clientAnalysis, 
          competitionAnalysis
        )
      ]);

      await this.logRun(id, PipelineStage.SCORE, PipelineStatus.COMPLETED);

      const decision = await this.decisionEngine.decide(
        jobAnalysis,
        clientAnalysis,
        competitionAnalysis,
        fitAnalysis,
        economicAnalysis
      );

      await prisma.opportunityScore.create({
        data: {
          opportunityId: id,
          skillMatch: fitAnalysis.matchScore,
          portfolioFit: 0,
          projectQuality: 0,
          longTermPotential: 0,
          redFlags: "",
          missingRequirements: ""
        }
      });

      await prisma.opportunityDecision.create({
        data: {
          opportunityId: id,
          recommendation: decision.recommendation,
          reason: decision.reason,
          confidence: decision.confidence,
          positiveEvidence: decision.positiveEvidence ? JSON.stringify(decision.positiveEvidence) : null,
          negativeEvidence: decision.negativeEvidence ? JSON.stringify(decision.negativeEvidence) : null,
          missingInformation: decision.missingInformation ? JSON.stringify(decision.missingInformation) : null,
        }
      });

      await this.logRun(id, PipelineStage.DECIDE, PipelineStatus.COMPLETED);
      await prisma.opportunity.update({
        where: { id },
        data: { status: 'DECIDED' }
      });
      
    } catch (error: any) {
      console.error(`Error analyzing opportunity ${id}:`, error);
      await this.logRun(id, PipelineStage.SCORE, PipelineStatus.FAILED, error.message);
    }
  }

  private async generateProposal(opportunityId: string, job: EnrichedOpportunityData) {
    await this.logRun(opportunityId, PipelineStage.PROPOSAL, PipelineStatus.PROCESSING);
    
    const result = await this.executor.executeStructured<z.infer<typeof draftingSchema>>({
      agentName: 'DraftingAgent',
      prompt: `Write a compelling proposal draft hook for the following job description:\n${job.description}`,
      schema: draftingSchema,
      schemaName: 'ProposalDraft',
      schemaDescription: 'Draft proposal hook'
    });

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
