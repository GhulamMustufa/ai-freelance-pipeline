# ADR-006: Evaluation Architecture

**Status:** Accepted  
**Date:** 2026-09-08  

## Context

AI systems without evaluation are unmeasurable. The question "is the system working?" cannot be answered subjectively. After any prompt change, model upgrade, or routing adjustment, we need a way to quantify the impact.

Options:
1. **No evaluation**: Rely on user experience. Simple, but reveals problems only after they cause damage.
2. **Manual review**: Human reviews each AI decision. Accurate, but not scalable.
3. **Automated benchmark evaluation**: A versioned dataset of labeled cases with expected decisions, run against the live pipeline.

## Decision

Implement an **automated evaluation framework** with three layers:

**Layer 1: Synthetic Benchmark** (`evals/datasets/v1.json`)  
A 30-case dataset covering 6 categories (excellent match, poor technical match, excellent client/poor job, suspicious client, hallucination trap, high competition). Each case has an expected `recommendation`. Run via `npm run evaluate`.

**Layer 2: MetricsEngine**  
Calculates Precision, Recall, F1, False Positive Rate, False Negative Rate. These are the same metrics used in production ML systems — not custom "vibe scores."

**Layer 3: Golden Dataset** (`evals/datasets/golden_v1.json`)  
Generated from real opportunities that have human feedback (`UserFeedback`) and verified outcomes (`OpportunityOutcome`). This transitions the system from synthetic testing to ground-truth evaluation. Generated via `npm run golden-dataset`.

### Why not fine-tuning?

We explicitly avoid fine-tuning as a calibration mechanism until the following simpler mechanisms have been exhausted: threshold tuning, prompt refinement, retrieval improvement, model routing, and deterministic rule adjustment. Fine-tuning is expensive, brittle, and often a band-aid for poor system design.

## Consequences

**Positive:**
- Every prompt or routing change can be validated before it affects the live pipeline.
- The evaluation framework doubles as regression testing for AI behavior.
- Golden dataset grows over time and improves evaluation quality continuously.

**Negative:**
- Synthetic dataset may not fully represent the diversity of real-world jobs.
- Running evaluation requires API calls and incurs token costs.
