import { z } from 'zod';
import { AgentExecutor } from '../agent';
import { JobAnalysis, FitAnalysis } from '../../domain/models';
import { TaskType } from '../router';

export const fitSchema = z.object({
  matchScore: z.number().min(0).max(100).describe('Score from 0 to 100 on how well the freelancer fits the role'),
  positiveMatches: z.array(z.string()).describe('Evidence-backed matches between the freelancer portfolio and job requirements'),
  missingRequirements: z.array(z.string()).describe('Required skills or experience that the freelancer lacks'),
  redFlags: z.array(z.string()).describe('Any red flags indicating this is a bad fit'),
});

export class FreelancerFitAgent {
  constructor(private executor: AgentExecutor) {}

  async analyze(jobAnalysis: JobAnalysis): Promise<FitAnalysis> {
    // Hardcoded for now. In Phase 3, this will be dynamically retrieved via RAG.
    const freelancerProfile = `
    Senior Full-Stack Engineer with 8 years of experience.
    Core Stack: TypeScript, React, Next.js, Node.js, Prisma, PostgreSQL.
    AI Experience: Vercel AI SDK, LangChain, OpenAI APIs, Anthropic APIs, RAG architecture.
    Domain Expertise: SaaS platforms, AI integration, Workflow automation.
    Weaknesses: No React Native/Mobile experience. No PHP/WordPress. Limited Go/Rust.
    `;

    const prompt = `
    Analyze the fit between the Freelancer Profile and the Job Analysis.
    
    CRITICAL INSTRUCTION: NEVER INVENT EXPERIENCE. ONLY MATCH AGAINST WHAT IS EXPLICITLY STATED IN THE FREELANCER PROFILE.
    
    Freelancer Profile:
    ${freelancerProfile}
    
    Job Analysis:
    Actual Problem: ${jobAnalysis.actualProblem}
    Technical Requirements: ${jobAnalysis.technicalRequirements.join(', ')}
    Seniority: ${jobAnalysis.seniority}
    Project Maturity: ${jobAnalysis.projectMaturity}
    
    Provide an evidence-backed fit analysis. Calculate a match score (0-100), list positive evidence-backed matches, missing requirements, and any red flags (e.g. asking for mobile when freelancer only does web).
    `;

    const result = await this.executor.executeStructured<z.infer<typeof fitSchema>>({
      agentName: 'FreelancerFit',
      prompt,
      schema: fitSchema,
      schemaName: 'FreelancerFitAnalysis',
      schemaDescription: 'Structured analysis of freelancer fit for a job',
      taskType: TaskType.REASONING,
      complexity: 'HIGH'
    });

    return result as FitAnalysis;
  }
}
