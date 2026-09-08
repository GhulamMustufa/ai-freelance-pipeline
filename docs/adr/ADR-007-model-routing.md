# ADR-007: Model Routing

**Status:** Accepted  
**Date:** 2026-09-08  

## Context

Sending every agent call to the same expensive frontier model (e.g. GPT-4o) would cost ~10–25× more per opportunity analyzed than necessary. However, routing all calls to cheap models (e.g. gpt-4o-mini) sacrifices decision quality on complex reasoning tasks.

The principle: **model selection should be a function of task complexity, not convenience.**

## Decision

We implement a `ModelRouter` that maps `TaskType` × `complexity` × `costPreference` to a specific model + cross-provider fallback chain.

Three task types are defined:
- **EXTRACTION**: Parsing structured information from text (job requirements, client history). Low complexity. → `gpt-4o-mini` primary.
- **REASONING**: Multi-variable analysis, risk synthesis, fitness evaluation. High complexity. → `gpt-4o` primary.
- **GENERATION**: Creative, long-form, contextually grounded text. High context window. → `gemini-1.5-pro` primary.

All primary models have **cross-provider** fallbacks (OpenAI → Gemini, or Gemini → OpenAI) to ensure resilience against single-provider outages. Degradation is also defined: if both `gpt-4o` and `gemini-1.5-pro` fail on REASONING, the system falls back to `gpt-4o-mini` rather than halting the pipeline entirely.

Agents declare their routing requirements via `taskType` and `complexity` hints in their `executeStructured` calls — they do not hardcode model names. This decouples agent logic from infrastructure decisions.

## Consequences

**Positive:**
- Estimated 60–70% cost reduction vs. routing everything to `gpt-4o`.
- Provider independence is maintained — no agent has a hard dependency on a specific model.
- Cost per opportunity is tracked in `AgentRun.estimatedCost`, enabling ROI analysis.
- The experiment script (`npm run experiment`) empirically validates the quality/cost tradeoff.

**Negative:**
- Routing logic adds complexity; developers must understand `TaskType` classification.
- Fallback degradation means some complex reasoning tasks may occasionally complete with a less capable model during outages.
