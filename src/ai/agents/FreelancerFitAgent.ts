import { z } from 'zod';
import { AgentExecutor } from '../agent';
import { JobAnalysis, FitAnalysis, FreelancerProfile } from '../../domain/models';
import { TaskType } from '../router';

export const fitSchema = z.object({
  matchScore: z.number().min(0).max(100).describe('Score from 0 to 100 on how well the freelancer fits the role'),
  positiveMatches: z.array(z.string()).describe('Evidence-backed matches between the freelancer portfolio and job requirements'),
  missingRequirements: z.array(z.string()).describe('Required skills or experience that the freelancer lacks'),
  redFlags: z.array(z.string()).describe('Any red flags indicating this is a bad fit'),
});

export class FreelancerFitAgent {
  constructor(private executor: AgentExecutor) {}

  async analyze(jobAnalysis: JobAnalysis, profile: FreelancerProfile): Promise<FitAnalysis> {
    // 1. DETERMINISTIC RULE: Excluded Technologies are immediate dealbreakers
    if (profile.excludedTechnologies && profile.excludedTechnologies.length > 0) {
      for (const excluded of profile.excludedTechnologies) {
        const clean = excluded.trim().toLowerCase();
        if (!clean) continue;
        
        const inTech = jobAnalysis.technicalRequirements.some(t => t.toLowerCase().includes(clean));
        const inProblem = jobAnalysis.actualProblem.toLowerCase().includes(clean);
        const inHidden = jobAnalysis.hiddenRequirements?.some(h => h.toLowerCase().includes(clean));

        if (inTech || inProblem || inHidden) {
          return {
            matchScore: 0,
            positiveMatches: [],
            missingRequirements: [excluded],
            redFlags: [`Deterministic Constraint: Job requires ${excluded}, which is on your excluded technologies list.`],
            deterministicConstraintViolated: true,
            violationReason: `Job requires excluded technology: ${excluded}`
          };
        }
      }
    }

    // 2. LLM REASONING: Semantic fit analysis
    const profileSummary = `
    Role: ${profile.headline}
    Experience: ${profile.experienceYears} years
    Bio: ${profile.bio}
    Skills: ${profile.skills.join(', ')}
    Preferred Tech: ${profile.preferredTechnologies.join(', ')}
    Excluded Tech: ${profile.excludedTechnologies.join(', ')}
    `;

    const prompt = `
    Analyze the fit between the Freelancer Profile and the Job Analysis.
    
    CRITICAL INSTRUCTION: NEVER INVENT EXPERIENCE. ONLY MATCH AGAINST WHAT IS EXPLICITLY STATED IN THE FREELANCER PROFILE.
    
    Freelancer Profile:
    ${profileSummary}
    
    Job Analysis:
    Actual Problem: ${jobAnalysis.actualProblem}
    Technical Requirements: ${jobAnalysis.technicalRequirements.join(', ')}
    Hidden Requirements: ${jobAnalysis.hiddenRequirements?.join(', ') || 'None'}
    Seniority: ${jobAnalysis.seniority}
    Project Maturity: ${jobAnalysis.projectMaturity}
    Scope Complexity: ${jobAnalysis.scopeComplexity}
    
    Provide an evidence-backed fit analysis. Calculate a match score (0-100), list positive evidence-backed matches, missing requirements, and any red flags (e.g. asking for skills not in the profile).
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
