# AI Evaluation Framework

This repository includes a robust, reproducible evaluation framework (Phase 4) designed to rigorously test the decision-making quality of the AI Freelance Pipeline.

By moving away from subjective "vibes-based" testing, we can quantify the performance of the AI, compare different models (e.g., `gpt-4o` vs `gemini-1.5-pro`), and ensure that future prompt updates do not cause regressions.

## Running the Evaluation

To run the evaluation suite against the benchmark dataset:

```bash
# Ensure you have your API keys set in your environment
export OPENAI_API_KEY="sk-..."

# Run the evaluation script
npm run evaluate
```

## The Benchmark Dataset
The dataset is located at `evals/datasets/v1.json`. It contains 30 diverse, realistic freelance opportunities crafted to test specific edge cases:

1. **Excellent Matches**: High budget, high tech fit, good client history. (Expected: `APPLY`)
2. **Poor Technical Matches**: Jobs requiring tech the freelancer does not know (e.g., Rust/Web3). (Expected: `SKIP`)
3. **Excellent Client / Poor Job**: The client is amazing, but the job is for $5 to fix an HTML typo. Tests the economic boundary. (Expected: `SKIP`)
4. **Poor Client / Excellent Job**: A perfect Node.js backend job, but the client demands upfront free work and has a 0% hire rate. (Expected: `SKIP`)
5. **High Competition**: Standard jobs that already have 50+ invites sent. (Expected: `MAYBE` or `SKIP`)
6. **Hallucination Traps**: Jobs explicitly requesting imaginary frameworks (e.g., "React QuantumQ"). Tests the system's susceptibility to hallucinating experience. (Expected: `SKIP`)

## Metrics Tracked

The `MetricsEngine` (`src/evals/metrics.ts`) calculates the following for every run:

### Decision Quality
- **Precision**: When the AI says "APPLY", how often was it actually a good job? (Crucial for saving proposal tokens).
- **Recall**: Out of all the great jobs, how many did the AI successfully find and say "APPLY"?
- **F1 Score**: The harmonic mean of precision and recall.
- **False Positives**: The AI told us to apply to a terrible job or a scam. (High risk).
- **False Negatives**: The AI missed a perfect opportunity. (Opportunity cost).

### Operational Metrics
- **Avg Latency**: How long does the full multi-agent pipeline take per job?
- **Cost / Tokens**: How many tokens are being burned per decision?

## Model Comparison & Versioning
The `AgentExecutor` (`src/ai/agent.ts`) is designed to accept an `ExecuteOptions` configuration. In `src/evals/runner.ts`, we explicitly inject the model to test:

```typescript
// Example: Testing gpt-4o-mini
const executor = new AgentExecutor({ provider: 'openai', model: 'gpt-4o-mini' });
```

This allows you to easily run `npm run evaluate` with `gpt-4o-mini`, save the results to `evals/results/`, change the config to `gemini-1.5-flash`, run it again, and definitively prove which model performs better for your specific portfolio and pipeline rules.
