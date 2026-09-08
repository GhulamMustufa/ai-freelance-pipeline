# Observability & Debuggability

In AI Engineering, a system that cannot be debugged is fundamentally broken. When an AI pipeline makes a decision—especially one regarding real-world money or client interactions—we must be able to trace exactly *why* it made that decision. 

Phase 5 introduces comprehensive observability into the AI Freelance Pipeline without polluting the underlying business logic.

## 1. Developer Dashboard
We provide a built-in Next.js dashboard to visualize the pipeline in action.
- Navigate to `http://localhost:3000/dashboard` to see all processed jobs and their decisions.
- Click **View Trace** to dive into a specific job.

The Trace Detail page separates the logical steps (e.g., `INGEST`, `ENRICH`, `SCORE`) from the underlying AI execution telemetry (e.g., tokens, model version, raw JSON schemas).

## 2. Execution Tracing (CLI)
You can quickly trace an opportunity in the terminal:
```bash
npm run trace <opportunityId>
```
**Example Output:**
```
[12:01:03] INGEST           - Completed (15ms)
[12:01:04] ENRICHMENT       - Completed (150ms)
[12:01:07] JOB_INTELLIGENCE - Agent: gpt-4o-mini | 1200ms | Tokens: 450 | Success
```
This is essential for identifying bottlenecks in multi-agent orchestration.

## 3. Replay Functionality
If an agent fails, hallucinates, or makes a bad decision, you can fix your prompts and immediately replay the exact job to see if your fix worked:
```bash
npm run replay <opportunityId>
```
The replay script clears all previous state for that job (Agent Runs, Pipeline Runs, Scores, Decisions, Proposals) and pushes the original payload back into the pipeline, giving you a fresh trace.

## 4. Telemetry Architecture
The system tracks two distinct types of operations:
- **PipelineRuns**: Represents the semantic stage of the pipeline (e.g., "We are currently drafting a proposal").
- **AgentRuns**: Represents the exact interaction with the LLM (e.g., "We sent this exact JSON prompt to `gpt-4o-mini` and it returned this exact structured output in 2 seconds using 400 tokens").

We do **not** persist free-form "Chain of Thought" text. All outputs are highly structured via Zod schemas, keeping the database footprint small and predictable.
