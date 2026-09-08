import { prisma } from '../src/lib/prisma';
import crypto from 'crypto';

async function seedDashboard() {
  console.log('📊 Seeding Dashboard with demo opportunities...');
  
  // Clean up old demo data
  await prisma.opportunity.deleteMany();
  
  // Create Demo Client
  const client = await prisma.client.create({
    data: {
      platformId: 'demo-client-123',
      name: 'Acme Corp Tech',
      status: 'NEUTRAL',
      profile: {
        create: {
          totalSpend: 150000,
          avgHourlyRate: 85,
          feedbackScore: 4.9,
          totalContracts: 45,
          activeContracts: 3,
          location: 'United States'
        }
      }
    }
  });

  const opportunities = [
    {
      platformId: 'opp-' + crypto.randomUUID(),
      title: 'Senior Full Stack Next.js & Node Developer Needed',
      desc: 'We are looking for a senior developer to build our new B2B SaaS dashboard. Must have deep experience with Next.js App Router, Prisma, and PostgreSQL.',
      status: 'EVALUATING',
      rec: 'APPLY',
      confidence: 0.92,
      score: {
        skillMatch: 95,
        portfolioFit: 90,
        projectQuality: 85,
        longTermPotential: 80,
        redFlags: '[]',
        missingRequirements: '[]'
      },
      proposal: 'Hi there,\n\nI have over 5 years of experience building scalable B2B SaaS dashboards using Next.js App Router and Prisma. In my recent project "Real-time Analytics Dashboard", I used the exact same stack to reduce query latency by 40%.\n\nI am available to start immediately and would love to jump on a call to discuss your requirements.',
      proposalStatus: 'SUBMITTED',
      runs: ['INGEST', 'NORMALIZE', 'ENRICH', 'ANALYZE', 'SCORE', 'DECIDE', 'PROPOSAL']
    },
    {
      platformId: 'opp-' + crypto.randomUUID(),
      title: 'Need someone to fix my wordpress site ASAP',
      desc: 'Site is down, need someone to fix a plugin issue. Budget is $15 total.',
      status: 'DECIDED',
      rec: 'SKIP',
      confidence: 0.98,
      score: {
        skillMatch: 20,
        portfolioFit: 10,
        projectQuality: 10,
        longTermPotential: 5,
        redFlags: '["Extremely low budget ($15 total)", "Urgent/frantic tone", "Technology mismatch (Wordpress)"]',
        missingRequirements: '["Wordpress", "PHP"]'
      },
      proposal: null,
      proposalStatus: 'DRAFT',
      runs: ['INGEST', 'NORMALIZE', 'ENRICH', 'ANALYZE', 'SCORE', 'DECIDE']
    },
    {
      platformId: 'opp-' + crypto.randomUUID(),
      title: 'React Native Expert for Delivery App',
      desc: 'Looking for a React Native developer to add barcode scanning and offline support to our existing logistics app.',
      status: 'EVALUATING',
      rec: 'MAYBE',
      confidence: 0.75,
      score: {
        skillMatch: 85,
        portfolioFit: 95,
        projectQuality: 60,
        longTermPotential: 70,
        redFlags: '["Client has 0 total spend", "No client feedback history"]',
        missingRequirements: '["Specific barcode scanner SDK experience not explicitly mentioned"]'
      },
      proposal: 'Hi,\n\nI noticed you need offline support and barcode scanning for a React Native app. I actually built a "Cross-platform Mobile App for Logistics Delivery" that featured exactly this using SQLite for offline-first capabilities.\n\nI do have some questions about the specific scanner SDK you intend to use. Let me know if you want to chat!',
      proposalStatus: 'DRAFT',
      runs: ['INGEST', 'NORMALIZE', 'ENRICH', 'ANALYZE', 'SCORE', 'DECIDE', 'PROPOSAL']
    }
  ];

  for (const opp of opportunities) {
    const dbOpp = await prisma.opportunity.create({
      data: {
        platformId: opp.platformId,
        platform: 'UPWORK',
        status: opp.status,
        clientId: client.id,
        jobPosting: {
          create: {
            title: opp.title,
            description: opp.desc,
            skills: 'React, Node.js, Next.js',
            postedAt: new Date(),
            budget: 5000,
            hourlyMin: 50,
            hourlyMax: 100
          }
        },
        score: {
          create: opp.score
        },
        decision: {
          create: {
            recommendation: opp.rec,
            reason: opp.rec === 'APPLY' ? 'Perfect match for portfolio and great client history.' : opp.rec === 'SKIP' ? 'Low budget and technology mismatch.' : 'Good technical fit but client risk is high.',
            confidence: opp.confidence
          }
        }
      }
    });

    if (opp.proposal) {
      await prisma.proposal.create({
        data: {
          opportunityId: dbOpp.id,
          content: opp.proposal,
          status: opp.proposalStatus,
          // dummy evidence array
          evidenceUsed: '[]'
        }
      });
    }

    // Add pipeline runs
    for (const stage of opp.runs) {
      await prisma.pipelineRun.create({
        data: {
          opportunityId: dbOpp.id,
          stage: stage,
          status: 'COMPLETED',
          startedAt: new Date(Date.now() - 10000),
          completedAt: new Date()
        }
      });
    }

    // Add agent runs
    const agents = ['JobAnalysis', 'ClientAnalysis', 'FitMatch', 'Economic', 'DecisionEngine'];
    for (const agent of agents) {
      await prisma.agentRun.create({
        data: {
          opportunityId: dbOpp.id,
          agentName: agent,
          provider: 'openai',
          model: 'gpt-4o-mini',
          promptTokens: 1500,
          completionTokens: 250,
          durationMs: 1200,
          estimatedCost: 0.0005,
          inputPayload: '{"prompt": "dummy"}',
          outputPayload: '{"result": "dummy"}'
        }
      });
    }
  }

  console.log('✅ Added 3 demo opportunities to the dashboard.');
}

seedDashboard()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
