import { z } from 'zod';
import { AgentExecutor } from '../agent';
import { RetrievedEvidence } from '../rag/SemanticRetriever';
import { TaskType } from '../router';

export const verificationSchema = z.object({
  isGrounded: z.boolean().describe('True if all claims are backed by evidence, False if any hallucination exists'),
  unsupportedClaims: z.array(z.string()).describe('List of claims in the draft that lack evidence'),
  reasoning: z.string().describe('Explanation of the verification assessment'),
});

export class ClaimVerificationAgent {
  constructor(private executor: AgentExecutor) {}

  async verify(draftContent: string, allowedEvidence: RetrievedEvidence[]): Promise<{ isGrounded: boolean, feedback: string }> {
    const evidenceStr = allowedEvidence.map(e => 
      `[ID: ${e.id}] ${e.title}: ${e.description}`
    ).join('\n\n');

    const prompt = `
    You are a strict Claim Verification Auditor.
    Your job is to read a draft proposal and verify that EVERY claim about experience, skills, metrics, and projects is backed by the Allowed Evidence.
    
    If the draft invents ANY experience, metric, or project not present in the Allowed Evidence, you MUST mark isGrounded = false.
    
    Allowed Evidence:
    ${evidenceStr}
    
    Draft Proposal:
    ${draftContent}
    `;

    const result = await this.executor.executeStructured<z.infer<typeof verificationSchema>>({
      agentName: 'ClaimVerification',
      prompt,
      schema: verificationSchema,
      schemaName: 'ProposalVerification',
      schemaDescription: 'Verification of proposal claims against evidence',
      taskType: TaskType.REASONING,
      complexity: 'HIGH'
    });

    let feedback = result.reasoning;
    if (!result.isGrounded && result.unsupportedClaims.length > 0) {
      feedback += '\nUnsupported Claims: ' + result.unsupportedClaims.join('; ');
    }

    return {
      isGrounded: result.isGrounded,
      feedback,
    };
  }
}
