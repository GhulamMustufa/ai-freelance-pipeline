export interface EvalResult {
  id: string;
  category: string;
  expectedRecommendation: 'APPLY' | 'MAYBE' | 'SKIP';
  actualRecommendation: 'APPLY' | 'MAYBE' | 'SKIP' | 'ERROR';
  latencyMs: number;
  tokensUsed: number;
  confidence: number;
  reason?: string;
  summary?: string;
  error?: string;
}

export class MetricsEngine {
  calculate(results: EvalResult[]) {
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let trueNegatives = 0;
    
    let totalLatency = 0;
    let totalTokens = 0;
    let errors = 0;

    for (const r of results) {
      if (r.actualRecommendation === 'ERROR') {
        errors++;
        continue;
      }

      totalLatency += r.latencyMs;
      totalTokens += r.tokensUsed;

      const expectedIsPositive = r.expectedRecommendation === 'APPLY';
      const actualIsPositive = r.actualRecommendation === 'APPLY';

      if (expectedIsPositive && actualIsPositive) truePositives++;
      if (!expectedIsPositive && actualIsPositive) falsePositives++;
      if (expectedIsPositive && !actualIsPositive) falseNegatives++;
      if (!expectedIsPositive && !actualIsPositive) trueNegatives++;
    }

    const successfulRuns = results.length - errors;
    const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 0;
    const recall = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 0;
    const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

    return {
      totalCases: results.length,
      successfulRuns,
      errors,
      precision,
      recall,
      f1,
      falsePositives,
      falseNegatives,
      avgLatencyMs: successfulRuns > 0 ? totalLatency / successfulRuns : 0,
      avgTokens: successfulRuns > 0 ? totalTokens / successfulRuns : 0,
    };
  }
}
