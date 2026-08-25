import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { jobId, description, title, budget, clientTotalSpend, clientAvgHourlyRate, clientFeedbackScore, clientTotalContracts, jobInvitesSent, jobInterviewing, jobAvgBid, clientStatus } = await req.json();

    const { object } = await generateObject({
      model: google('gemini-3.6-flash'),
      schema: z.object({
        jobType: z.enum([
          'ai', 'saas', 'fullstack', 'frontend', 'backend', 
          'mobile', 'automation', 'bug_fix', 'landing_page', 'other'
        ]),
        skillMatch: z.number().min(0).max(100),
        portfolioFit: z.number().min(0).max(100),
        projectQuality: z.number().min(0).max(100),
        longTermPotential: z.number().min(0).max(100),
        redFlags: z.array(z.string()),
        missingRequirements: z.array(z.string()),
        recommendation: z.enum(['APPLY', 'MAYBE', 'SKIP']),
        reason: z.string().describe('A 1-2 sentence explanation of why this job is an APPLY, MAYBE, or SKIP based on the requirements and freelancer profile.'),
        recommendedProjects: z.array(
          z.object({
            project: z.string(),
            relevance: z.number().min(0).max(100),
            reason: z.string()
          })
        ),
        draftHook: z.string()
      }),
      prompt: `
You are an expert Upwork opportunity analyst helping a senior
full-stack engineer decide whether a job is worth spending Connects on.

Your priority is NOT to maximize the number of applications.
Your priority is to identify jobs where this freelancer has a
high probability of winning a valuable project.

JOB
Title: ${title}
Budget: ${budget}
Client Total Spend (Historical): ${clientTotalSpend ? `$${clientTotalSpend}` : 'Unknown'}
Client Avg Hourly Rate Paid (Historical): ${clientAvgHourlyRate ? `$${clientAvgHourlyRate.toFixed(2)}/hr` : 'Unknown'}
Client Feedback Score: ${clientFeedbackScore ? `${clientFeedbackScore}/5.0` : 'Unknown'}
Client Total Contracts: ${clientTotalContracts || 'Unknown'}
Job Invites Sent By Client: ${jobInvitesSent ?? 'Unknown'}
Freelancers Currently Interviewing: ${jobInterviewing ?? 'Unknown'}
Average Bid Rate: ${jobAvgBid ? `$${jobAvgBid}/hr` : 'Unknown'}
Description:
${description}

Client Status (Your AI Memory): ${clientStatus || 'NEUTRAL'}
${clientStatus === 'FAVORITE' ? 'IMPORTANT: This is a FAVORITE client of the freelancer. Aggressively boost the opportunity score and recommend APPLY unless the budget is truly zero or the technical stack is entirely unrelated.' : ''}


========================================
FREELANCER PROFILE
========================================

Core capabilities:

Frontend:
- React
- Next.js
- TypeScript
- Tailwind CSS

Mobile:
- React Native

Backend:
- Node.js
- NestJS
- PostgreSQL
- Firebase
- REST APIs

Cloud / Architecture:
- AWS
- SaaS development
- API integration
- Supabase

AI:
- OpenAI API
- AI integration
- RAG
- embeddings
- prompt engineering
- AI automation

========================================
VERIFIED EXPERIENCE
========================================

ONLY use the following evidence.
NEVER invent experience, metrics, clients, technologies,
responsibilities, or results.

1. Udhaar Book
Role: React / React Native Developer
Verified metric:
- 100K+ daily users

2. Lumida Wealth
Role: Full-stack engineer
Verified metric:
- 0 rollbacks across 6 sprints

3. Dastgyr
Role: Full-stack/backend engineer
Verified metric:
- 50% reduction in API latency

========================================
ANALYSIS RULES
========================================

1. Evaluate the COMPLETE job, not individual keywords.
2. Do not give a high score merely because the job contains React, Node.js, AI, or SaaS.
3. Consider:
- technical fit
- seniority fit
- project complexity
- portfolio relevance
- budget attractiveness
- likelihood of winning
- client/project quality when client information is available
- potential for long-term work
- competition when available
- red flags
4. Strong matches should be based on meaningful overlap, not keyword presence.
5. Identify missing requirements explicitly.
6. Be conservative. If evidence is insufficient, reduce confidence rather than guessing.
7. Identify reasons to SKIP. Examples:
- extremely low budget
- unrealistic scope
- major skill mismatch
- suspicious requirements
- poor opportunity economics
- low-quality project
- excessive competition
- unclear scope

========================================
PORTFOLIO MATCHING
========================================

Select ONLY projects that are genuinely relevant.
Do not force a portfolio project into the recommendation.
For each selected project explain WHY it is relevant.

========================================
PROPOSAL HOOK
========================================

Write exactly TWO sentences.

Sentence 1:
Show that you understand the client's specific problem, workflow, or desired outcome.

Sentence 2:
Connect that problem to ONE verified and directly relevant experience from the freelancer profile.

Rules:
- No "I am excited to apply."
- No generic introduction.
- No keyword stuffing.
- No repeating the job description.
- Do not mention irrelevant skills.
- Do not invent metrics.
- Use at most ONE verified metric.
- Sound like an experienced engineer, not an AI-generated template.

The hook should make the client think:
"This person actually understands what we're building."

========================================
IMPORTANT
========================================

Do NOT optimize for getting the freelancer to apply.
Optimize for making the CORRECT decision:

APPLY = strong opportunity and strong fit
MAYBE = potentially good but meaningful uncertainty
SKIP = Connects should be saved

Return only structured data matching the schema.
`
    });

    // Update job in DB (Mapping the advanced schema back to our MVP DB schema)
    await prisma.job.update({
      where: { id: jobId },
      data: {
        score: object.skillMatch,
        reason: object.reason,
        isGolden: object.recommendation === 'APPLY',
      }
    });

    // Create proposal draft
    if (object.recommendation === 'APPLY') {
      await prisma.proposalDraft.upsert({
        where: { jobId },
        update: { content: object.draftHook },
        create: {
          jobId,
          content: object.draftHook,
        }
      });
    }

    return NextResponse.json({ success: true, result: object });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
