import { AIProvider } from '../provider';
import { prisma } from '../../lib/prisma';
import { cosineSimilarity } from '../../lib/vector';

export interface RetrievedEvidence {
  id: string;
  type: string;
  title: string;
  description: string;
  technologies: string;
  url: string | null;
  similarity: number;
}

export class SemanticRetriever {
  /**
   * Generates an embedding for a query and returns the top K most similar pieces of evidence
   */
  async retrieve(query: string, topK: number = 10): Promise<RetrievedEvidence[]> {
    const queryEmbedding = await AIProvider.generateEmbedding(query);
    
    // In-memory RAG: fetch all evidence
    const allEvidence = await prisma.freelancerEvidence.findMany();
    
    const scoredEvidence = allEvidence
      .filter(evidence => evidence.embedding) // Ensure it has an embedding
      .map(evidence => {
        const docEmbedding = JSON.parse(evidence.embedding!) as number[];
        const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
        return {
          id: evidence.id,
          type: evidence.type,
          title: evidence.title,
          description: evidence.description,
          technologies: evidence.technologies,
          url: evidence.url,
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
