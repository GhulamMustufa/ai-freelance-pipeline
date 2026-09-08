import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';
import { EvalCase } from './generate-dataset';

/**
 * generate-golden-dataset.ts
 * 
 * This script exports opportunities that have verified human feedback 
 * or definitive real-world outcomes into a versioned "golden" dataset.
 * This dataset becomes the ground truth for evaluating future prompt 
 * and model routing changes via `npm run evaluate`.
 */
async function generateGoldenDataset() {
  console.log('Fetching opportunities with verified human feedback...');

  // Get opportunities that have UserFeedback attached
  const opportunitiesWithFeedback = await prisma.opportunity.findMany({
    where: {
      feedback: {
        isNot: null,
      },
    },
    include: {
      jobPosting: true,
      client: {
        include: {
          profile: true,
        }
      },
      decision: true,
      feedback: true,
      outcome: true,
    },
  });

  console.log(`Found ${opportunitiesWithFeedback.length} calibrated opportunities.`);

  const dataset: EvalCase[] = [];

  for (const opp of opportunitiesWithFeedback) {
    if (!opp.jobPosting) continue;

    // Determine the Ground Truth recommendation based on feedback
    // If the human said the AI decision was correct, use the AI's decision.
    // If incorrect, invert the decision (simplistic approach for MVP).
    let expectedRecommendation = opp.decision?.recommendation as 'APPLY' | 'MAYBE' | 'SKIP' || 'SKIP';
    
    if (opp.feedback && !opp.feedback.decisionCorrect) {
      // If AI said APPLY but was wrong, Ground Truth is SKIP.
      // If AI said SKIP but was wrong, Ground Truth is APPLY.
      expectedRecommendation = expectedRecommendation === 'APPLY' ? 'SKIP' : 'APPLY';
    }

    // Determine category based on outcomes
    let category = 'human_calibrated';
    if (opp.outcome?.contractWon) {
      category = 'successful_contract';
    } else if (opp.outcome?.interview) {
      category = 'successful_interview';
    } else if (opp.feedback && opp.feedback.proposalQuality && opp.feedback.proposalQuality < 3) {
      category = 'poor_proposal_quality';
    }

    dataset.push({
      id: opp.platformId,
      category,
      expected: {
        recommendation: expectedRecommendation,
      },
      payload: {
        platform: opp.platform,
        title: opp.jobPosting.title,
        description: opp.jobPosting.description,
        skills: opp.jobPosting.skills.split(','),
        budget: opp.jobPosting.budget ?? undefined,
        hourlyMin: opp.jobPosting.hourlyMin ?? undefined,
        hourlyMax: opp.jobPosting.hourlyMax ?? undefined,
        client: {
          totalSpend: opp.client?.profile?.totalSpend ?? 0,
          avgHourlyRate: opp.client?.profile?.avgHourlyRate ?? 0,
          hires: opp.client?.profile?.totalContracts ?? 0,
          feedbackScore: opp.client?.profile?.feedbackScore ?? 0,
        }
      }
    });
  }

  if (dataset.length === 0) {
    console.log('No golden data to export. Try adding some UserFeedback entries to the database first.');
    return;
  }

  const dir = path.join(__dirname, '../evals/datasets');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, 'golden_v1.json');
  fs.writeFileSync(filePath, JSON.stringify(dataset, null, 2));

  console.log(`✅ Successfully generated Golden Dataset with ${dataset.length} cases.`);
  console.log(`Saved to: ${filePath}`);
}

generateGoldenDataset()
  .catch(e => {
    console.error('Error generating golden dataset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
