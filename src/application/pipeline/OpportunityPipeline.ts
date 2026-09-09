import { prisma } from '../../lib/prisma';
import { 
  OpportunityStatus, 
  PipelineStage, 
  PipelineStatus,
  Platform,
  NormalizedOpportunity,
  FreelancerProfile,
  JobAnalysis
} from '../../domain/models';
import { AgentExecutor } from '../../ai/agent';
import { JobIntelligenceAgent } from '../../ai/agents/JobIntelligenceAgent';
import { ClientIntelligenceAgent } from '../../ai/agents/ClientIntelligenceAgent';
import { CompetitionAgent } from '../../ai/agents/CompetitionAgent';
import { FreelancerFitAgent } from '../../ai/agents/FreelancerFitAgent';
import { EconomicAgent } from '../../ai/agents/EconomicAgent';
import { DecisionEngine } from '../engine/DecisionEngine';
import { SemanticRetriever } from '../../ai/rag/SemanticRetriever';
import { EvidenceRankingAgent } from '../../ai/agents/EvidenceRankingAgent';
import { ProposalDraftingAgent } from '../../ai/agents/ProposalDraftingAgent';
import { ClaimVerificationAgent } from '../../ai/agents/ClaimVerificationAgent';

export class OpportunityPipeline {
  private executor: AgentExecutor;
  
  private jobAgent: JobIntelligenceAgent;
  private clientAgent: ClientIntelligenceAgent;
  private competitionAgent: CompetitionAgent;
  private fitAgent: FreelancerFitAgent;
  private economicAgent: EconomicAgent;
  private decisionEngine: DecisionEngine;
  private semanticRetriever: SemanticRetriever;
  private evidenceRanker: EvidenceRankingAgent;
  private proposalDrafter: ProposalDraftingAgent;
  private claimVerifier: ClaimVerificationAgent;

  constructor() {
    this.executor = new AgentExecutor();
    
    this.jobAgent = new JobIntelligenceAgent(this.executor);
    this.clientAgent = new ClientIntelligenceAgent(this.executor);
    this.competitionAgent = new CompetitionAgent(this.executor);
    this.fitAgent = new FreelancerFitAgent(this.executor);
    this.economicAgent = new EconomicAgent(this.executor);
    this.decisionEngine = new DecisionEngine(this.executor);
    this.semanticRetriever = new SemanticRetriever();
    this.evidenceRanker = new EvidenceRankingAgent(this.executor);
    this.proposalDrafter = new ProposalDraftingAgent(this.executor);
    this.claimVerifier = new ClaimVerificationAgent(this.executor);
  }

  async processJob(
    payload: NormalizedOpportunity, 
    options?: { profile?: FreelancerProfile; forceProposal?: boolean }
  ) {
    // 1. Resolve Profile
    let activeProfile = options?.profile;
    if (!activeProfile) {
      const dbProfile = await prisma.freelancerProfile.findFirst({
        where: { isDefault: true }
      });
      if (dbProfile) {
        activeProfile = {
          id: dbProfile.id,
          name: dbProfile.name,
          headline: dbProfile.headline,
          bio: dbProfile.bio,
          experienceYears: dbProfile.experienceYears,
          skills: dbProfile.skills.split(',').map(s => s.trim()),
          preferredTechnologies: dbProfile.preferredTechnologies.split(',').map(s => s.trim()),
          excludedTechnologies: dbProfile.excludedTechnologies ? dbProfile.excludedTechnologies.split(',').map(s => s.trim()).filter(Boolean) : [],
          targetHourlyRate: dbProfile.targetHourlyRate ?? 75,
          minProjectBudget: dbProfile.minProjectBudget ?? 1000,
        };
      } else {
        // Fallback default
        activeProfile = {
          id: 'default-profile',
          name: 'Senior Full-Stack AI Engineer',
          headline: 'Senior Full-Stack & AI Systems Engineer (Next.js, TypeScript, LLMs)',
          bio: 'Senior Engineer with 8 years of experience building web platforms and multi-agent AI pipelines.',
          experienceYears: 8,
          skills: ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'OpenAI', 'DeepSeek', 'Multi-Agent Systems', 'RAG'],
          preferredTechnologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'OpenAI', 'DeepSeek'],
          excludedTechnologies: ['PHP', 'WordPress', 'Ruby', 'Web3'],
          targetHourlyRate: 75,
          minProjectBudget: 1000,
        };
      }
    }

    // 2. Ingest
    const opp = await this.ingest(payload, activeProfile.id);

    try {
      // 3. Enrich Client if data present
      await this.enrich(opp.id, payload);

      // 4. Multi-Agent Reasoning & Decision
      const { jobAnalysis, decision } = await this.analyzeAndScore(opp.id, activeProfile);
      
      // 5. Downstream Proposal Generation (for APPLY or forced)
      if (decision?.recommendation === 'APPLY' || options?.forceProposal) {
        await this.generateProposal(opp.id, payload, jobAnalysis, activeProfile);
      }

      // 6. Return Completed Opportunity
      const completedOpp = await prisma.opportunity.findUnique({
        where: { id: opp.id },
        include: {
          jobPosting: true,
          decision: true,
          score: true,
          proposal: true,
          client: { include: { profile: true } },
          pipelineRuns: { orderBy: { createdAt: 'asc' } },
          agentRuns: { orderBy: { createdAt: 'asc' } },
        }
      });

      return completedOpp;
    } catch (error) {
      console.error(`Pipeline failed for ${opp.id}:`, error);
      await this.logRun(opp.id, PipelineStage.INGEST, PipelineStatus.FAILED, String(error));
      throw error;
    }
  }

  async resumeJob(opportunityId: string, payload: NormalizedOpportunity) {
    try {
      await this.enrich(opportunityId, payload);
      const dbProfile = await prisma.freelancerProfile.findFirst({ where: { isDefault: true } });
      const fallbackProfile: FreelancerProfile = {
        id: dbProfile?.id || 'default-profile',
        name: dbProfile?.name || 'Senior Full-Stack AI Engineer',
        headline: dbProfile?.headline || '',
        bio: dbProfile?.bio || '',
        experienceYears: dbProfile?.experienceYears || 8,
        skills: dbProfile ? dbProfile.skills.split(',') : ['TypeScript', 'Next.js'],
        preferredTechnologies: ['TypeScript', 'Next.js'],
        excludedTechnologies: [],
        targetHourlyRate: dbProfile?.targetHourlyRate ?? 75,
        minProjectBudget: dbProfile?.minProjectBudget ?? 1000,
      };
      await this.analyzeAndScore(opportunityId, fallbackProfile);
    } catch (error) {
      console.error(`Pipeline failed to resume for ${opportunityId}:`, error);
      await this.logRun(opportunityId, PipelineStage.ENRICH, PipelineStatus.FAILED, String(error));
    }
  }

  private async ingest(payload: NormalizedOpportunity, profileId?: string) {
    const platformId = payload.platformId || `man-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const platform = (payload.platform as Platform) || Platform.MANUAL;

    let opp = await prisma.opportunity.findUnique({
      where: { platformId }
    });

    if (opp) {
      return opp;
    }

    opp = await prisma.opportunity.create({
      data: {
        platformId,
        platform,
        profileId,
        status: OpportunityStatus.PENDING,
        jobPosting: {
          create: {
            title: payload.title,
            description: payload.description,
            skills: payload.skills.join(','),
            budget: payload.budget,
            hourlyMin: payload.hourlyMin,
            hourlyMax: payload.hourlyMax,
            postedAt: payload.postedAt || new Date(),
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

  private async enrich(opportunityId: string, payload: NormalizedOpportunity) {
    await this.logRun(opportunityId, PipelineStage.ENRICH, PipelineStatus.PROCESSING);
    
    // In MVP, integrations are optional. Only save client profile if provided in payload.
    if (payload.client && (payload.client.name || payload.client.location || payload.client.totalSpend !== undefined)) {
      const clientId = payload.client.platformId || `client-${opportunityId}`;
      const totalSpend = payload.client.totalSpend ?? 0;
      const avgHourlyRate = payload.client.avgHourlyRate ?? 0;
      const feedbackScore = payload.client.feedbackScore ?? 0;
      const totalContracts = payload.client.hires ?? 0;
      const location = payload.client.location;

      const client = await prisma.client.upsert({
        where: { platformId: clientId },
        update: {
          profile: {
            upsert: {
              create: { totalSpend, avgHourlyRate, feedbackScore, totalContracts, location },
              update: { totalSpend, avgHourlyRate, feedbackScore, totalContracts, location }
            }
          }
        },
        create: {
          platformId: clientId,
          name: payload.client.name,
          platform: payload.platform || Platform.MANUAL,
          profile: {
            create: { totalSpend, avgHourlyRate, feedbackScore, totalContracts, location }
          }
        },
        include: { profile: true }
      });

      await prisma.opportunity.update({
        where: { id: opportunityId },
        data: { clientId: client.id }
      });
    }

    await this.logRun(opportunityId, PipelineStage.ENRICH, PipelineStatus.COMPLETED);
  }

  async analyzeAndScore(id: string, profile: FreelancerProfile): Promise<{ jobAnalysis: JobAnalysis, decision: any }> {
    const opp = await prisma.opportunity.findUnique({
      where: { id },
      include: { client: { include: { profile: true } }, jobPosting: true, pipelineRuns: true }
    });

    if (!opp || !opp.jobPosting) {
      throw new Error(`Opportunity ${id} or JobPosting not found`);
    }

    await this.logRun(id, PipelineStage.SCORE, PipelineStatus.PROCESSING);

    try {
      // 1. Parallel Independent Intelligence Agents
      const [jobAnalysis, clientAnalysis, competitionAnalysis] = await Promise.all([
        this.jobAgent.analyze(opp.jobPosting.title, opp.jobPosting.description),
        this.clientAgent.analyze(opp.client?.profile, opp.jobPosting.description),
        this.competitionAgent.analyze(
          opp.jobPosting.jobInvitesSent ? { invites_sent: opp.jobPosting.jobInvitesSent, interviewing: opp.jobPosting.jobInterviewing } : undefined,
          opp.jobPosting.budget ?? undefined, 
          opp.jobPosting.hourlyMax ?? undefined
        )
      ]);

      // 2. Parallel Dependent Agents (Fit & Economics with Profile targets)
      const [fitAnalysis, economicAnalysis] = await Promise.all([
        this.fitAgent.analyze(jobAnalysis, profile),
        this.economicAgent.analyze(
          opp.jobPosting.budget ?? undefined, 
          opp.jobPosting.hourlyMin ?? undefined, 
          opp.jobPosting.hourlyMax ?? undefined, 
          clientAnalysis, 
          competitionAnalysis,
          jobAnalysis,
          profile
        )
      ]);

      await this.logRun(id, PipelineStage.SCORE, PipelineStatus.COMPLETED);

      // 3. Decision Engine Synthesis (Deterministic gates + LLM reasoning)
      const decision = await this.decisionEngine.decide(
        jobAnalysis,
        clientAnalysis,
        competitionAnalysis,
        fitAnalysis,
        economicAnalysis,
        profile,
        opp.jobPosting.budget ?? undefined
      );

      // 4. Save Score & Decision with enriched details
      await prisma.opportunityScore.upsert({
        where: { opportunityId: id },
        update: {
          skillMatch: fitAnalysis.matchScore,
          portfolioFit: fitAnalysis.positiveMatches.length * 20,
          projectQuality: economicAnalysis.budgetQuality === 'GOOD' || economicAnalysis.budgetQuality === 'EXCELLENT' ? 85 : 50,
          longTermPotential: jobAnalysis.projectMaturity === 'PRODUCTION' || jobAnalysis.projectMaturity === 'MVP' ? 75 : 40,
          redFlags: JSON.stringify(fitAnalysis.redFlags),
          missingRequirements: JSON.stringify(fitAnalysis.missingRequirements)
        },
        create: {
          opportunityId: id,
          skillMatch: fitAnalysis.matchScore,
          portfolioFit: fitAnalysis.positiveMatches.length * 20,
          projectQuality: economicAnalysis.budgetQuality === 'GOOD' || economicAnalysis.budgetQuality === 'EXCELLENT' ? 85 : 50,
          longTermPotential: jobAnalysis.projectMaturity === 'PRODUCTION' || jobAnalysis.projectMaturity === 'MVP' ? 75 : 40,
          redFlags: JSON.stringify(fitAnalysis.redFlags),
          missingRequirements: JSON.stringify(fitAnalysis.missingRequirements)
        }
      });

      await prisma.opportunityDecision.upsert({
        where: { opportunityId: id },
        update: {
          recommendation: decision.recommendation,
          reason: decision.reason,
          confidence: decision.confidence,
          summary: decision.summary,
          positiveEvidence: decision.positiveEvidence ? JSON.stringify(decision.positiveEvidence) : null,
          negativeEvidence: decision.negativeEvidence ? JSON.stringify(decision.negativeEvidence) : null,
          missingInformation: decision.unknowns ? JSON.stringify(decision.unknowns) : null,
          unknowns: decision.unknowns ? JSON.stringify(decision.unknowns) : null,
          risks: decision.risks ? JSON.stringify(decision.risks) : null,
          scoresJson: decision.scores ? JSON.stringify(decision.scores) : null,
          economicDetails: decision.economics ? JSON.stringify(decision.economics) : null,
        },
        create: {
          opportunityId: id,
          recommendation: decision.recommendation,
          reason: decision.reason,
          confidence: decision.confidence,
          summary: decision.summary,
          positiveEvidence: decision.positiveEvidence ? JSON.stringify(decision.positiveEvidence) : null,
          negativeEvidence: decision.negativeEvidence ? JSON.stringify(decision.negativeEvidence) : null,
          missingInformation: decision.unknowns ? JSON.stringify(decision.unknowns) : null,
          unknowns: decision.unknowns ? JSON.stringify(decision.unknowns) : null,
          risks: decision.risks ? JSON.stringify(decision.risks) : null,
          scoresJson: decision.scores ? JSON.stringify(decision.scores) : null,
          economicDetails: decision.economics ? JSON.stringify(decision.economics) : null,
        }
      });

      await this.logRun(id, PipelineStage.DECIDE, PipelineStatus.COMPLETED, undefined, { 
        recommendation: decision.recommendation, 
        confidence: decision.confidence 
      });

      await prisma.opportunity.update({
        where: { id },
        data: { status: 'DECIDED' }
      });

      return { jobAnalysis, decision };
    } catch (error: any) {
      console.error(`Error analyzing opportunity ${id}:`, error);
      await this.logRun(id, PipelineStage.SCORE, PipelineStatus.FAILED, error.message, { stack: error.stack });
      throw error;
    }
  }

  private async generateProposal(
    opportunityId: string, 
    job: NormalizedOpportunity, 
    jobAnalysis: JobAnalysis,
    profile: FreelancerProfile
  ) {
    await this.logRun(opportunityId, PipelineStage.PROPOSAL, PipelineStatus.PROCESSING);
    
    try {
      // 1. Evidence Retrieval (scoped to profile)
      const query = `Problem: ${jobAnalysis.actualProblem}. Tech: ${jobAnalysis.technicalRequirements.join(', ')}`;
      const retrieved = await this.semanticRetriever.retrieve(query, 5, profile.id);

      // 2. Evidence Ranking
      const rankedEvidence = await this.evidenceRanker.rank(jobAnalysis, retrieved);

      // 3. Draft -> Verify Loop (Anti-Hallucination, max 3 attempts)
      let finalContent = '';
      let usedEvidence: string[] = [];
      let attempts = 0;
      let isGrounded = false;
      let lastFeedback: string | undefined = undefined;

      while (!isGrounded && attempts < 3) {
        attempts++;
        const draft = await this.proposalDrafter.draft(job.description, rankedEvidence, opportunityId, lastFeedback);
        const verification = await this.claimVerifier.verify(draft.content, rankedEvidence);
        
        if (verification.isGrounded) {
          isGrounded = true;
          finalContent = draft.content;
          usedEvidence = draft.evidenceUsed;
        } else {
          lastFeedback = verification.feedback;
          console.warn(`[Pipeline] Hallucination detected on attempt ${attempts}:`, verification.feedback);
          if (attempts === 3) {
            // Keep the best draft but note the verification status
            finalContent = draft.content;
            usedEvidence = draft.evidenceUsed;
          }
        }
      }

      await prisma.proposal.upsert({
        where: { opportunityId },
        update: {
          content: finalContent,
          evidenceUsed: JSON.stringify(usedEvidence),
        },
        create: {
          opportunityId,
          content: finalContent,
          evidenceUsed: JSON.stringify(usedEvidence),
        }
      });

      await this.logRun(opportunityId, PipelineStage.PROPOSAL, PipelineStatus.COMPLETED, undefined, { attempts, isGrounded });
    } catch (error: any) {
      console.error(`Error generating proposal for ${opportunityId}:`, error);
      await this.logRun(opportunityId, PipelineStage.PROPOSAL, PipelineStatus.FAILED, error.message, { stack: error.stack });
    }
  }

  private async logRun(opportunityId: string, stage: PipelineStage, status: PipelineStatus, error?: string, metadata?: Record<string, any>) {
    await prisma.pipelineRun.create({
      data: { 
        opportunityId, 
        stage, 
        status, 
        error,
        metadata: metadata ? JSON.stringify(metadata) : null,
        startedAt: status === PipelineStatus.PROCESSING || status === PipelineStatus.PENDING ? new Date() : undefined,
        completedAt: status === PipelineStatus.COMPLETED || status === PipelineStatus.FAILED ? new Date() : undefined,
      }
    });
  }
}
