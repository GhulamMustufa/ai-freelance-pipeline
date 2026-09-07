import { prisma } from '../lib/prisma';
import { OpportunityPipeline } from '../application/pipeline/OpportunityPipeline';
import { OpportunityStatus, Platform } from '../domain/models';

const pipeline = new OpportunityPipeline();

// Helper to delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log("🤖 Pipeline Processor Loop Started. Waiting for pending opportunities...");

  while (true) {
    try {
      // Find opportunities that are in PENDING status
      const pendingOpportunities = await prisma.opportunity.findMany({
        where: { status: OpportunityStatus.PENDING },
        include: { jobPosting: true }
      });

      if (pendingOpportunities.length > 0) {
        console.log(`\n🔍 Found ${pendingOpportunities.length} pending opportunit(y/ies). Processing...`);

        for (const opp of pendingOpportunities) {
          console.log(`📡 Processing opportunity: ${opp.platformId}`);
          
          if (!opp.jobPosting) {
            console.error(`❌ Opportunity ${opp.id} missing job posting details`);
            continue;
          }

          // We don't call pipeline.ingest here, we just run the rest of the steps by re-constructing the payload 
          // or we can adjust pipeline.processJob to accept existing opps.
          // Wait, processJob currently calls ingest. We should decouple `processJob` to resume from PENDING.
          // Let's call the internal methods directly or update pipeline.ts.
          // For simplicity, we just pass the payload back to processJob, it handles deduplication.

          await pipeline.resumeJob(opp.id, {
            platform: opp.platform as Platform,
            platformId: opp.platformId,
            title: opp.jobPosting.title,
            description: opp.jobPosting.description,
            postedAt: opp.jobPosting.postedAt,
            skills: opp.jobPosting.skills.split(','),
            budget: opp.jobPosting.budget ?? undefined,
            hourlyMin: opp.jobPosting.hourlyMin ?? undefined,
            hourlyMax: opp.jobPosting.hourlyMax ?? undefined,
          }).catch(e => console.error(`Error in resumeJob for ${opp.platformId}`, e));
        }
      }
    } catch (err) {
      console.error("❌ Pipeline Processor Error:", err);
    }

    // Wait 15 seconds before checking again
    await sleep(15000);
  }
}

if (require.main === module) {
  main();
}
