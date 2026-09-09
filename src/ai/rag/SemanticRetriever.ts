import { AIProvider } from '../provider';
import { prisma } from '../../lib/prisma';
import { cosineSimilarity } from '../../lib/vector';

export interface RetrievedEvidence {
  id: string;
  evidenceId?: string;
  type: string;
  title: string;
  description: string;
  technologies: string;
  url: string | null;
  verification?: string;
  similarity: number;
}

export class SemanticRetriever {
  /**
   * Generates an embedding for a query and returns the top K most similar pieces of evidence.
   * If embeddings are unavailable, falls back gracefully to keyword overlap similarity.
   */
  async retrieve(query: string, topK: number = 5, profileId?: string): Promise<RetrievedEvidence[]> {
    // In-memory RAG: fetch profile evidence or all baseline evidence
    const allEvidence = await prisma.freelancerEvidence.findMany({
      where: profileId ? { OR: [{ profileId }, { profileId: null }] } : undefined,
    });

    if (allEvidence.length === 0) return [];

    let queryEmbedding: number[] | null = null;
    try {
      if (process.env.OPENAI_API_KEY) {
        queryEmbedding = await AIProvider.generateEmbedding(query);
      }
    } catch (e) {
      console.warn('[SemanticRetriever] Embedding generation unavailable, falling back to lexical search:', (e as Error).message);
    }

    const queryTokens = new Set(query.toLowerCase().split(/[\s,.-]+/).filter(t => t.length > 2));

    const scoredEvidence = allEvidence.map(evidence => {
      let similarity = 0;

      if (queryEmbedding && evidence.embedding) {
        try {
          const docEmbedding = JSON.parse(evidence.embedding) as number[];
          similarity = cosineSimilarity(queryEmbedding, docEmbedding);
        } catch {
          similarity = 0;
        }
      } else {
        // Lexical token overlap fallback
        const docText = `${evidence.title} ${evidence.description} ${evidence.technologies}`.toLowerCase();
        let overlap = 0;
        for (const token of queryTokens) {
          if (docText.includes(token)) overlap++;
        }
        similarity = queryTokens.size > 0 ? overlap / queryTokens.size : 0.5;
      }

      return {
        id: evidence.id,
        evidenceId: evidence.evidenceId || `EV-${evidence.id.substring(0, 4).toUpperCase()}`,
        type: evidence.type,
        title: evidence.title,
        description: evidence.description,
        technologies: evidence.technologies,
        url: evidence.url,
        verification: evidence.verification,
        similarity,
      };
    })
    .sort((a, b) => b.similarity - a.similarity);

    return scoredEvidence.slice(0, topK);
  }

  /**
   * Helper utility to seed embeddings for new evidence if missing
   */
  static async seedEmbeddings() {
    const unseeded = await prisma.freelancerEvidence.findMany({
      where: { embedding: null }
    });

    for (const item of unseeded) {
      const textToEmbed = `${item.title}. ${item.description}. Technologies: ${item.technologies}`;
      const embedding = await AIProvider.generateEmbedding(textToEmbed);
      await prisma.freelancerEvidence.update({
        where: { id: item.id },
        data: { embedding: JSON.stringify(embedding) }
      });
    }
  }
}
