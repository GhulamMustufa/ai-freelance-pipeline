# ADR-004: Agent Boundaries

**Status:** Accepted  
**Date:** 2026-09-08  

## Context

A naive approach to AI opportunity evaluation is a single monolithic prompt: "Given this job, this client, and my background, should I apply?" This fails at scale because:
- A single prompt that must handle all reasoning is extremely sensitive to instruction ordering and context window management.
- There is no isolation — a hallucination in one reasoning domain corrupts others.
- Individual sub-problems cannot be tested or optimized independently.
- Cost cannot be controlled — the entire prompt always runs at the same cost tier.

The alternative (and the choice made here) is **agent decomposition**: splitting reasoning into agents with single, well-defined responsibilities.

## Decision

We define **8 agents**, each with:
- A single well-bounded responsibility
- A Zod-validated output schema
- A declared `TaskType` (EXTRACTION, REASONING, or GENERATION)
- No awareness of other agents' internal state — only typed outputs

The agents are organized in two parallel tiers:
1. **Parallel tier**: JobIntelligence, ClientIntelligence, and Competition agents run concurrently
2. **Sequential tier**: FreelancerFit and Economic agents consume outputs of tier 1; DecisionEngine consumes tier 2

The rule for introducing a new agent: the reasoning domain must be separable, testable independently, and benefit from a different model routing profile.

## Why Not More Agents?

We explicitly rejected adding agents for: location analysis, timezone compatibility, project longevity, etc. These can be captured as fields within existing agent outputs. The goal was not "maximum agent count" but "minimal sufficient decomposition."

## Consequences

**Positive:**
- Each agent's prompt can be tuned independently without risk of regression in unrelated areas.
- EXTRACTION tasks run on cheap models; REASONING tasks on capable models — this is only possible because they are separated.
- Agent outputs are individually traceable in the telemetry system.

**Negative:**
- Parallel execution requires aggregating outputs before the Decision Engine can run.
- More code to maintain than a single monolithic prompt.
