import { prisma } from '../src/lib/prisma';
import { OpportunityPipeline } from '../src/application/pipeline/OpportunityPipeline';
import { RawOpportunityPayload, Platform } from '../src/domain/models';

async function replay(opportunityId: string) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: { jobPosting: true, client: true }
  });

  if (!opportunity || !opportunity.jobPosting) {
    console.error(`Opportunity ${opportunityId} not found or missing job posting.`);
    process.exit(1);
  }

  console.log(`🧹 Clearing previous runs and decisions for ${opportunityId}...`);
  await prisma.pipelineRun.deleteMany({ where: { opportunityId } });
  await prisma.agentRun.deleteMany({ where: { opportunityId } });
  await prisma.opportunityScore.deleteMany({ where: { opportunityId } });
  await prisma.opportunityDecision.deleteMany({ where: { opportunityId } });
  await prisma.proposal.deleteMany({ where: { opportunityId } });
  
  await prisma.opportunity.update({
    where: { id: opportunityId },
    status: 'PENDING'
  });

  const payload: RawOpportunityPayload = {
    platform: opportunity.platform as Platform,
    platformId: opportunity.platformId,
    title: opportunity.jobPosting.title,
    description: opportunity.jobPosting.description,
    postedAt: opportunity.jobPosting.postedAt,
    skills: opportunity.jobPosting.skills.split(','),
    budget: opportunity.jobPosting.budget ?? undefined,
    hourlyMin: opportunity.jobPosting.hourlyMin ?? undefined,
    hourlyMax: opportunity.jobPosting.hourlyMax ?? undefined,
    client: opportunity.client ? {
      platformId: opportunity.client.platformId,
      name: opportunity.client.name ?? undefined
    } : undefined
  };

  console.log(`🚀 Replaying Pipeline for ${opportunity.jobPosting.title}...`);
  const pipeline = new OpportunityPipeline();
  await pipeline.resumeJob(opportunityId, payload);
  
  console.log(`✅ Replay complete! Run 'npx tsx scripts/trace.ts ${opportunityId}' to see the new trace.`);
}

const id = process.argv[2];
if (!id) {
  console.log('Usage: npx tsx scripts/replay.ts <opportunityId>');
  process.exit(1);
}

replay(id).catch(console.error);
