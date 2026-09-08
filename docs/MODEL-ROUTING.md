# Intelligent Model Routing & Cost Control

A mature AI system does not blindly send every request to the most expensive model available. Phase 6 introduces the `ModelRouter`, a dynamic abstraction layer that selects the right model for the right job, tracks costs, and handles API failures gracefully.

## The Routing Strategy
Our multi-agent pipeline categorizes tasks into three types, routed dynamically via `src/ai/router.ts`:

1. **EXTRACTION (Low Complexity)**
   - **Use Case:** Job Intelligence (extracting skills), Client Intelligence, Competition Analysis.
   - **Primary Model:** `gpt-4o-mini`
   - **Why:** Extraction relies on the provided context rather than deep systemic reasoning. Fast models are highly accurate here and cost 95% less than their larger counterparts.

2. **REASONING (High Complexity)**
   - **Use Case:** Freelancer Fit Agent, Economic Risk Agent, Decision Engine.
   - **Primary Model:** `gpt-4o`
   - **Why:** These agents must synthesize multiple disparate data points (Client history + Job requirements + Economic risk) to make a final application decision. This requires peak reasoning capabilities.

3. **GENERATION (Creative / High Complexity)**
   - **Use Case:** Proposal Drafting.
   - **Primary Model:** `gemini-1.5-pro` (or `gpt-4o`)
   - **Why:** Drafting requires nuanced tone, structural coherence, and long context windows (especially when referencing dozens of past portfolio items). 

## Cost Tracking
Every execution via `AgentExecutor` automatically tracks its token usage and calculates the estimated cost in USD based on the current rates defined in `src/ai/pricing.ts`. This cost is saved to the `AgentRun` table in the database, allowing us to aggregate:
- Total cost per job analyzed.
- Total cost per proposal drafted.
- Overall ROI (Return on Investment) of the pipeline.

## Graceful Fallbacks (Resilience)
If a primary model fails (due to API rate limits, provider outages, or structured schema rejection), the `AgentExecutor` automatically falls back to an alternative model, explicitly prioritizing **cross-provider fallbacks**. 
For example, if OpenAI (`gpt-4o`) experiences an outage during the Decision Engine step, the router will automatically fall back to Google (`gemini-1.5-pro`) to ensure the pipeline continues operating without human intervention.

## Quality vs Cost Experiment
To prove the necessity of this routing layer, we built an experiment script (`npm run experiment`) that runs the Phase 4 benchmark dataset twice:
1. **Experiment A:** Forces the pipeline to use *only* cheap models (`gpt-4o-mini`).
2. **Experiment B:** Forces the pipeline to use *only* expensive models (`gpt-4o`).

**The results demonstrate the core engineering tradeoff:**
- **Experiment A** costs almost nothing ($0.05 total) and is incredibly fast, but misses subtle red flags on complex jobs (lower F1 Score).
- **Experiment B** achieves a perfect F1 score but costs 20x more ($1.00 total) and adds seconds of latency to every job.

**The Solution:** The `ModelRouter` combines the two. It uses cheap models for the 60% of tasks that involve extraction, and reserves the expensive models for the 40% of tasks that require reasoning, achieving the high F1 score of Experiment B at a fraction of the cost.
