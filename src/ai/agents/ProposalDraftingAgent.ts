import { z } from 'zod';
import { AgentExecutor } from '../agent';
import { ProposalDraft } from '../../domain/models';
import { TaskType } from '../router';
import { RetrievedEvidence } from '../rag/SemanticRetriever';

export const proposalDraftSchema = z.object({
  draftContent: z.string().describe('The generated proposal content'),
  evidenceUsed: z.array(z.string()).describe('List of evidence IDs that were actually cited in the proposal'),
});

export class ProposalDraftingAgent {
  constructor(private executor: AgentExecutor) {}

  async draft(jobDescription: string, evidence: RetrievedEvidence[], opportunityId: string): Promise<{ content: string, evidenceUsed: string[] }> {
    const evidenceStr = evidence.map(e => 
      `[Evidence ID: ${e.id}]\nTitle: ${e.title}\nDescription: ${e.description}\nTech: ${e.technologies}`
    ).join('\n\n');

    const prompt = `
    You are an expert freelance proposal writer.
    Write a compelling, concise proposal for the following job description.
    
    CRITICAL ANTI-HALLUCINATION RULES:
    1. You MUST ONLY use the provided Evidence to back up your claims.
    2. NEVER invent experience, metrics, projects, or technologies.
    3. If the job requires a skill not present in the evidence, do not claim to have it.
    4. You MUST cite your claims using the [Evidence ID] inline. (e.g., "I built a similar system using React [Evidence ID: 123-abc]").
    
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
