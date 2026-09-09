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
    Candidate Profile (CANDIDATE FACTS ONLY - DO NOT INVENT EXTENSIONS):
    Headline: ${profile.headline}
    Experience: ${profile.experienceYears} years
    Primary Skills: ${(profile.primarySkills && profile.primarySkills.length > 0 ? profile.primarySkills : profile.skills).join(', ')}
    All Verified Skills: ${profile.skills.join(', ')}
    Preferred Tech: ${profile.preferredTechnologies.join(', ')}
    Excluded Tech: ${profile.excludedTechnologies.join(', ')}
    Preferred Project Types: ${(profile.preferredProjectTypes || []).join(', ') || 'General software engineering'}
    Preferred Industries: ${(profile.preferredIndustries || []).join(', ') || 'General software'}
    `;

    const prompt = `
    Analyze the technical and domain fit between the Candidate Profile and the Job Requirements.
    
    CRITICAL ANTI-HALLUCINATION POLICY:
    1. The candidate profile above defines the STRICT CEILING of the freelancer's capabilities.
    2. NEVER invent, infer, or assume skills, technologies, years of experience, certifications, or past achievements not explicitly listed above.
    3. If the job requires a skill NOT in Verified Skills, it MUST be classified under 'missingRequirements', NOT positiveMatches.
    4. Provide honest, conservative match scoring.
    
    Freelancer Profile:
    ${profileSummary}
    
    Job Analysis:
    Actual Problem: ${jobAnalysis.actualProblem}
    Technical Requirements: ${jobAnalysis.technicalRequirements.join(', ')}
    Hidden Requirements: ${jobAnalysis.hiddenRequirements?.join(', ') || 'None'}
    Seniority: ${jobAnalysis.seniority}
    Project Maturity: ${jobAnalysis.projectMaturity}
    Scope Complexity: ${jobAnalysis.scopeComplexity}
    
    Provide an evidence-backed fit analysis. Calculate a match score (0-100), list positive evidence-backed matches, missing requirements, and any red flags.
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
