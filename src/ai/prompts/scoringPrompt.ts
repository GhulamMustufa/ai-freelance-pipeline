import { EnrichedOpportunityData } from '../../domain/models';

export const buildScoringPrompt = (job: EnrichedOpportunityData, clientStatus: string) => {
  return `
You are an expert opportunity analyst helping a senior
full-stack engineer decide whether a job is worth spending Connects on.

Your priority is NOT to maximize the number of applications.
Your priority is to identify jobs where this freelancer has a
high probability of winning a valuable project.

JOB
Title: ${job.title}
Budget: ${job.budget ? `$${job.budget}` : 'Unknown'}
Client Total Spend (Historical): ${job.clientProfile?.totalSpend ? `$${job.clientProfile.totalSpend}` : 'Unknown'}
Client Avg Hourly Rate Paid (Historical): ${job.clientProfile?.avgHourlyRate ? `$${job.clientProfile.avgHourlyRate.toFixed(2)}/hr` : 'Unknown'}
Client Feedback Score: ${job.clientProfile?.feedbackScore ? `${job.clientProfile.feedbackScore}/5.0` : 'Unknown'}
Client Total Contracts: ${job.clientProfile?.totalContracts || 'Unknown'}
Job Invites Sent By Client: ${job.rawMetrics?.invites_sent ?? 'Unknown'}
Freelancers Currently Interviewing: ${job.rawMetrics?.interviewing ?? 'Unknown'}
Average Bid Rate: ${job.rawMetrics?.avg_bid ? `$${job.rawMetrics.avg_bid}/hr` : 'Unknown'}
Description:
${job.description}

Client Status (Your AI Memory): ${clientStatus || 'NEUTRAL'}
${clientStatus === 'FAVORITE' ? 'IMPORTANT: This is a FAVORITE client of the freelancer. Aggressively boost the opportunity score and recommend APPLY unless the budget is truly zero or the technical stack is entirely unrelated.' : ''}

========================================
FREELANCER PROFILE
========================================
Core capabilities:
- Frontend: React, Next.js, TypeScript, Tailwind CSS
- Mobile: React Native
- Backend: Node.js, NestJS, PostgreSQL, Firebase, REST APIs
- Cloud: AWS, Supabase, API integration
- AI: OpenAI API, RAG, embeddings, prompt engineering

========================================
VERIFIED EXPERIENCE (USE ONLY THIS)
========================================
1. Udhaar Book
Role: React / React Native Developer
Verified metric: 100K+ daily users

2. Lumida Wealth
Role: Full-stack engineer
Verified metric: 0 rollbacks across 6 sprints

3. Dastgyr
Role: Full-stack/backend engineer
Verified metric: 50% reduction in API latency

========================================
ANALYSIS RULES
========================================
1. Evaluate the COMPLETE job, not individual keywords.
2. Be conservative. Identify reasons to SKIP (low budget, scope mismatch, etc.).
3. Consider technical fit, portfolio relevance, economics, and long-term potential.
`;
};

export const buildDraftingPrompt = () => {
  return `
========================================
PROPOSAL HOOK DRAFTING
========================================
Write exactly TWO sentences.
Sentence 1: Show that you understand the client's specific problem, workflow, or desired outcome.
Sentence 2: Connect that problem to ONE verified and directly relevant experience from the freelancer profile.

Rules:
- No "I am excited to apply."
- No generic introduction.
- Use at most ONE verified metric.
- Sound like an experienced engineer.
`;
}
