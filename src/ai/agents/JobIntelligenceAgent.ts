import { z } from 'zod';
import { AgentExecutor } from '../agent';
import { JobAnalysis } from '../../domain/models';
import { TaskType } from '../router';

export const jobIntelligenceSchema = z.object({
  actualProblem: z.string().describe('The underlying problem the client is trying to solve'),
  technicalRequirements: z.array(z.string()).describe('Explicit and implicit technical skills required'),
  seniority: z.enum(['JUNIOR', 'MID', 'SENIOR', 'EXPERT']).describe('Expected seniority level based on the tasks and problem'),
  hiddenRequirements: z.array(z.string()).describe('Requirements not explicitly stated but logically necessary'),
  deliverables: z.array(z.string()).describe('Concrete deliverables expected from this job'),
  ambiguity: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('Level of ambiguity in the job description'),
  projectMaturity: z.enum(['IDEA', 'MVP', 'PRODUCTION', 'LEGACY']).describe('Maturity of the project described'),
});

export class JobIntelligenceAgent {
  constructor(private executor: AgentExecutor) {}

  async analyze(title: string, description: string): Promise<JobAnalysis> {
    const prompt = `
    Analyze the following freelance job posting and extract intelligent insights.
    
    Job Title: ${title}
    Job Description:
    ${description}
    
    Extract the actual problem they are trying to solve, required technical skills, expected seniority, hidden requirements, deliverables, ambiguity level, and project maturity.
    Do not invent information. If deliverables are unclear, state that they are unclear.
    `;

    const result = await this.executor.executeStructured<z.infer<typeof jobIntelligenceSchema>>({
      agentName: 'JobIntelligence',
      prompt,
      schema: jobIntelligenceSchema,
      schemaName: 'JobIntelligenceAnalysis',
      schemaDescription: 'Structured analysis of a job posting',
      taskType: TaskType.EXTRACTION,
      complexity: 'LOW'
    });

    return result as JobAnalysis;
  }
}
