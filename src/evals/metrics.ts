export interface EvalResult {
  id: string;
  category: string;
  title?: string;
  expectedRecommendation: 'APPLY' | 'MAYBE' | 'SKIP';
  acceptableDecisions?: ('APPLY' | 'MAYBE' | 'SKIP')[];
  actualRecommendation: 'APPLY' | 'MAYBE' | 'SKIP' | 'ERROR';
  isCorrect?: boolean;
  latencyMs: number;
  tokensUsed: number;
  costUsd?: number;
  confidence: number;
  evidenceSufficiency?: string;
  unknowns?: string[];
  reason?: string;
  summary?: string;
  isAdversarial?: boolean;
  promptInjectionResisted?: boolean;
  unknownPreserved?: boolean;
  error?: string;
}

export interface CalibrationBucket {
  range: string;
  minConf: number;
  maxConf: number;
  count: number;
  avgConfidence: number;
  accuracy: number;
  calibrationGap: number; // |accuracy - avgConfidence|
}

export interface MetricsSummary {
  totalCases: number;
  successfulRuns: number;
  errors: number;
  accuracy: number;
  
  // Backward compatibility aliases
  f1: number;
  precision: number;
  recall: number;

  // APPLY metrics
  applyPrecision: number;
  applyRecall: number;
  applyF1: number;
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  
  // SKIP metrics
  skipPrecision: number;
  skipRecall: number;
  skipF1: number;

  // Distribution
  distribution: {
    apply: number;
    maybe: number;
    skip: number;
    applyPct: number;
    maybePct: number;
    skipPct: number;
  };

  // Domain & Security Special Metrics
  unknownPreservationRate: number; // % of JD-only cases with UNKNOWN client preserved
  adversarialResistanceRate: number; // % of prompt injection attacks resisted
  
  // Calibration
  brierScore: number; // Lower is better (0.0 = perfect calibration)
  ece: number; // Expected Calibration Error (0.0 to 1.0)
  calibrationBuckets: CalibrationBucket[];

  // Telemetry
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  avgTokens: number;
  totalTokens: number;
  avgCostUsd: number;
  totalCostUsd: number;
}

export class MetricsEngine {
  calculate(results: EvalResult[]): MetricsSummary {
    let truePositives = 0;
    let trueNegatives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let skipTruePositives = 0;
    let skipFalsePositives = 0;
    let skipFalseNegatives = 0;

    let correctCount = 0;
    let totalLatency = 0;
    let totalTokens = 0;
    let totalCostUsd = 0;
    let errors = 0;

    const latencies: number[] = [];
    let brierSum = 0;

    let jdOnlyCases = 0;
    let jdOnlyPreserved = 0;

    let adversarialCases = 0;
    let adversarialResisted = 0;

    let countApply = 0;
    let countMaybe = 0;
    let countSkip = 0;

    // Calibration decile buckets: 0.0-0.5, 0.5-0.7, 0.7-0.9, 0.9-1.0
    const bucketsConfig = [
      { range: '0.00 - 0.50', minConf: 0.0, maxConf: 0.50 },
      { range: '0.50 - 0.70', minConf: 0.50, maxConf: 0.70 },
      { range: '0.70 - 0.90', minConf: 0.70, maxConf: 0.90 },
      { range: '0.90 - 1.00', minConf: 0.90, maxConf: 1.01 },
    ];

    const bucketData = bucketsConfig.map(b => ({
      ...b,
      count: 0,
      confSum: 0,
      correctSum: 0,
    }));

    for (const r of results) {
      if (r.actualRecommendation === 'ERROR') {
        errors++;
        continue;
      }

      totalLatency += r.latencyMs;
      latencies.push(r.latencyMs);
      totalTokens += r.tokensUsed;
      totalCostUsd += (r.costUsd || 0);

      // Distribution
      if (r.actualRecommendation === 'APPLY') countApply++;
      else if (r.actualRecommendation === 'MAYBE') countMaybe++;
      else if (r.actualRecommendation === 'SKIP') countSkip++;

      // Correctness check (either exact expected or within acceptable set)
      const isAccepted = r.acceptableDecisions && r.acceptableDecisions.length > 0
        ? r.acceptableDecisions.includes(r.actualRecommendation as any)
        : r.actualRecommendation === r.expectedRecommendation;

      if (isAccepted) {
        correctCount++;
      }

      // APPLY binary evaluation
      const expectedIsApply = r.expectedRecommendation === 'APPLY';
      const actualIsApply = r.actualRecommendation === 'APPLY';

      if (expectedIsApply && actualIsApply) truePositives++;
      if (!expectedIsApply && actualIsApply) falsePositives++;
      if (expectedIsApply && !actualIsApply) falseNegatives++;
      if (!expectedIsApply && !actualIsApply) trueNegatives++;

      // SKIP binary evaluation
      const expectedIsSkip = r.expectedRecommendation === 'SKIP';
      const actualIsSkip = r.actualRecommendation === 'SKIP';

      if (expectedIsSkip && actualIsSkip) skipTruePositives++;
      if (!expectedIsSkip && actualIsSkip) skipFalsePositives++;
      if (expectedIsSkip && !actualIsSkip) skipFalseNegatives++;

      // Calibration: Brier score calculation (binary target: isAccepted)
      const binaryTarget = isAccepted ? 1.0 : 0.0;
      brierSum += Math.pow((r.confidence ?? 0.5) - binaryTarget, 2);

      // Bucket assignment for ECE
      const conf = Math.max(0, Math.min(1, r.confidence ?? 0.5));
      for (const b of bucketData) {
        if (conf >= b.minConf && conf < b.maxConf) {
          b.count++;
          b.confSum += conf;
          b.correctSum += isAccepted ? 1 : 0;
          break;
        }
      }

      // Domain-specific checks
      if (r.category === 'jd_only_unknown_client' || r.category === 'missing_budget') {
        jdOnlyCases++;
        if (r.unknownPreserved) jdOnlyPreserved++;
      }

      if (r.isAdversarial) {
        adversarialCases++;
        if (r.promptInjectionResisted) adversarialResisted++;
      }
    }

    const successfulRuns = results.length - errors;
    latencies.sort((a, b) => a - b);

    const accuracy = successfulRuns > 0 ? correctCount / successfulRuns : 0;
    
    // APPLY Precision, Recall, F1
    const applyPrecision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 0;
    const applyRecall = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 0;
    const applyF1 = applyPrecision + applyRecall > 0 ? 2 * (applyPrecision * applyRecall) / (applyPrecision + applyRecall) : 0;

    // SKIP Precision, Recall, F1
    const skipPrecision = skipTruePositives + skipFalsePositives > 0 ? skipTruePositives / (skipTruePositives + skipFalsePositives) : 0;
    const skipRecall = skipTruePositives + skipFalseNegatives > 0 ? skipTruePositives / (skipTruePositives + skipFalseNegatives) : 0;
    const skipF1 = skipPrecision + skipRecall > 0 ? 2 * (skipPrecision * skipRecall) / (skipPrecision + skipRecall) : 0;

    // Calibration: Expected Calibration Error (ECE)
    let eceWeightedSum = 0;
    const calibrationBuckets: CalibrationBucket[] = bucketData.map(b => {
      const avgConfidence = b.count > 0 ? b.confSum / b.count : (b.minConf + b.maxConf) / 2;
      const bucketAccuracy = b.count > 0 ? b.correctSum / b.count : 0;
      const calibrationGap = Math.abs(bucketAccuracy - avgConfidence);

      if (successfulRuns > 0 && b.count > 0) {
        eceWeightedSum += (b.count / successfulRuns) * calibrationGap;
      }

      return {
        range: b.range,
        minConf: b.minConf,
        maxConf: b.maxConf,
        count: b.count,
        avgConfidence: Number(avgConfidence.toFixed(3)),
        accuracy: Number(bucketAccuracy.toFixed(3)),
        calibrationGap: Number(calibrationGap.toFixed(3)),
      };
    });

    const brierScore = successfulRuns > 0 ? brierSum / successfulRuns : 0;

    // Latencies
    const p50LatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.5)] : 0;
    const p95LatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0;

    return {
      totalCases: results.length,
      successfulRuns,
      errors,
      accuracy: Number(accuracy.toFixed(4)),

      // Aliases
      f1: Number(applyF1.toFixed(4)),
      precision: Number(applyPrecision.toFixed(4)),
      recall: Number(applyRecall.toFixed(4)),
      
      applyPrecision: Number(applyPrecision.toFixed(4)),
      applyRecall: Number(applyRecall.toFixed(4)),
      applyF1: Number(applyF1.toFixed(4)),
      truePositives,
      trueNegatives,
      falsePositives,
      falseNegatives,

      skipPrecision: Number(skipPrecision.toFixed(4)),
      skipRecall: Number(skipRecall.toFixed(4)),
      skipF1: Number(skipF1.toFixed(4)),

      distribution: {
        apply: countApply,
        maybe: countMaybe,
        skip: countSkip,
        applyPct: successfulRuns > 0 ? Number(((countApply / successfulRuns) * 100).toFixed(1)) : 0,
        maybePct: successfulRuns > 0 ? Number(((countMaybe / successfulRuns) * 100).toFixed(1)) : 0,
        skipPct: successfulRuns > 0 ? Number(((countSkip / successfulRuns) * 100).toFixed(1)) : 0,
      },

      unknownPreservationRate: jdOnlyCases > 0 ? Number((jdOnlyPreserved / jdOnlyCases).toFixed(4)) : 1.0,
      adversarialResistanceRate: adversarialCases > 0 ? Number((adversarialResisted / adversarialCases).toFixed(4)) : 1.0,

      brierScore: Number(brierScore.toFixed(4)),
      ece: Number(eceWeightedSum.toFixed(4)),
      calibrationBuckets,

      avgLatencyMs: successfulRuns > 0 ? Math.round(totalLatency / successfulRuns) : 0,
      p50LatencyMs,
      p95LatencyMs,
      avgTokens: successfulRuns > 0 ? Math.round(totalTokens / successfulRuns) : 0,
      totalTokens,
      avgCostUsd: successfulRuns > 0 ? Number((totalCostUsd / successfulRuns).toFixed(5)) : 0,
      totalCostUsd: Number(totalCostUsd.toFixed(4)),
    };
  }
}
