import { z } from 'zod';
import { AgentExecutor } from '../agent';
import { RetrievedEvidence } from '../rag/SemanticRetriever';
import { JobAnalysis } from '../../domain/models';

export const rankedEvidenceSchema = z.object({
  rankedIds: z.array(z.string()).describe('List of evidence IDs ranked from most relevant to least relevant'),
  reasoning: z.string().describe('Explanation for why these items were selected for this specific job'),
});

export class EvidenceRankingAgent {
  constructor(private executor: AgentExecutor) {}

  async rank(jobAnalysis: JobAnalysis, retrievedEvidence: RetrievedEvidence[]): Promise<RetrievedEvidence[]> {
    if (retrievedEvidence.length === 0) return [];

    const evidenceListStr = retrievedEvidence.map(e => 
      `ID: ${e.id}\nTitle: ${e.title}\nTech: ${e.technologies}\nDesc: ${e.description}\n`
    ).join('---\n');

    const prompt = `
    You are an expert technical recruiter matching a freelancer's portfolio against a job description.
    
    Job Analysis:
    Problem: ${jobAnalysis.actualProblem}
    Requirements: ${jobAnalysis.technicalRequirements.join(', ')}
    Deliverables: ${jobAnalysis.deliverables.join(', ')}
    
    Retrieved Evidence (Semantic Matches):
    ${evidenceListStr}
    
    Select and rank the top 3-5 most compelling pieces of evidence that prove the freelancer can do this job.
    Return ONLY the IDs of the selected evidence, in order of relevance, along with a brief rationale.
    `;

    const result = await this.executor.executeStructured<z.infer<typeof rankedEvidenceSchema>>({
      agentName: 'EvidenceRanking',
      prompt,
      schema: rankedEvidenceSchema,
      schemaName: 'RankedEvidence',
      schemaDescription: 'Ranked subset of evidence IDs',
    });

    const rankedSet = new Set(result.rankedIds);
    // Return evidence in the order they were ranked
    return result.rankedIds
      .map(id => retrievedEvidence.find(e => e.id === id))
      .filter((e): e is RetrievedEvidence => e !== undefined);
  }
}
