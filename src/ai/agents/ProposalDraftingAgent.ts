import { z } from 'zod';
import { AgentExecutor } from '../agent';
import { TaskType } from '../router';
import { RetrievedEvidence } from '../rag/SemanticRetriever';

export const proposalDraftSchema = z.object({
  draftContent: z.string().describe('The generated proposal content'),
  evidenceUsed: z.array(z.string()).describe('List of evidence IDs that were actually cited in the proposal'),
});

export class ProposalDraftingAgent {
  constructor(private executor: AgentExecutor) {}

  async draft(jobDescription: string, evidence: RetrievedEvidence[], opportunityId: string, feedback?: string): Promise<{ content: string, evidenceUsed: string[] }> {
    const evidenceStr = evidence.map(e => 
      `[Evidence ID: ${e.id}]\nTitle: ${e.title}\nDescription: ${e.description}\nTech: ${e.technologies}`
    ).join('\n\n');

    const feedbackStr = feedback ? `
    PREVIOUS DRAFT REJECTION FEEDBACK (MUST FIX IN THIS REVISION):
    ${feedback}
    ` : '';

    const prompt = `
    You are an expert freelance proposal writer.
    Write a compelling, concise proposal for the following job description.
    ${feedbackStr}
    CRITICAL ANTI-HALLUCINATION RULES:
    1. You MUST ONLY use the provided Evidence to back up claims of your past work and experience.
    2. NEVER invent experience, metrics, projects, or technologies not in the Allowed Evidence.
    3. If the job requires a skill not present in the evidence, do not claim past experience in it; explain how your verified core strengths transfer.
    4. You MUST cite your claims using the [Evidence ID] inline. (e.g., "I built an autonomous multi-agent pipeline with Next.js and DeepSeek [Evidence ID: abc]").
    
    Job Description:
    ${jobDescription}
    
    Verified Freelancer Evidence:
    ${evidenceStr}
    `;

    const result = await this.executor.executeStructured<z.infer<typeof proposalDraftSchema>>({
      agentName: 'ProposalDrafting',
      opportunityId,
      prompt,
      schema: proposalDraftSchema,
      schemaName: 'ProposalDraft',
      schemaDescription: 'Drafted proposal citing evidence',
      taskType: TaskType.GENERATION,
      complexity: 'HIGH'
    });

    return {
      content: result.draftContent,
      evidenceUsed: result.evidenceUsed,
    };
  }
}
