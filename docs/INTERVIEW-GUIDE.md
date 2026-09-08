# Interview Guide: AI Freelance Intelligence Pipeline

This guide prepares for technical interview questions a hiring manager or AI engineer might ask about this project.

---

## Architecture Questions

### "Why use 8 agents instead of one comprehensive prompt?"

**Short answer**: Testability, cost control, and independent optimization.

Each agent has a single responsibility and a defined output schema. This means: (1) we can benchmark each agent independently, (2) cheap models can handle extraction while expensive models handle reasoning, (3) a prompt failure in one domain doesn't corrupt another.

A monolithic prompt that "does everything" is impossible to tune without risking regression in unrelated areas. The decomposition cost is extra code; the benefit is an auditable, cost-controllable, and independently testable reasoning pipeline.

### "How do you prevent hallucination in the proposals?"

**Short answer**: We don't rely on instructions — we verify and reject.

The system uses a verification loop: `ProposalDraftingAgent` drafts a proposal citing evidence by ID. `ClaimVerificationAgent` then checks every claim in the draft against the *actual evidence objects* that were provided as context. If any claim is ungrounded, the draft is rejected and regenerated (up to 3 attempts). This converts a probabilistic instruction into a deterministic rejection mechanism.

### "Why SQLite and not Postgres/Neon?"

**Short answer**: This is a single-machine tool. Infrastructure overhead is not justified at this scale.

The system runs as a background worker on one machine. SQLite gives sub-millisecond local reads, zero setup, and a single file for backup. If this were deployed as a multi-server SaaS, we'd migrate — and Prisma makes that a connection string change. Choosing Postgres for a local personal tool is premature optimization.

### "How does the model router work?"

**Short answer**: Agents declare their task type; the router resolves the model.

Agents call `executeStructured` with a `TaskType` (EXTRACTION, REASONING, GENERATION) hint. The `ModelRouter` maps this to a primary model + fallback chain. Agents never hardcode model names. This decouples agent logic from infrastructure decisions and enables cross-provider fallbacks without any agent changes.

---

## AI Engineering Questions

### "What is MCP and why did you use it here?"

**Short answer**: Model Context Protocol — a standard for AI agents to interact with external services, like a "USB-C for AI tools."

Upwork provides an official MCP server. Instead of implementing OAuth + custom REST endpoints, we use the MCP client to call well-defined tool names (`upwork__find_jobs`). This fetches client metrics the email alert doesn't include. It also demonstrates integration with the broader AI tooling ecosystem rather than a one-off HTTP call.

### "How does your evaluation framework work?"

**Short answer**: Precision/Recall/F1 on a labeled benchmark dataset, with a path to ground-truth golden datasets.

The `MetricsEngine` treats the decision problem as binary classification (APPLY vs not-APPLY). The 30-case benchmark dataset covers hallucination traps, poor clients, technical mismatches, and high competition. Any change to the system can be validated against this benchmark before deployment.

The more valuable long-term mechanism is the `golden dataset generator` — it queries real opportunities with human feedback and verified outcomes (did the interview happen? did we win the contract?) and exports them as an evaluation dataset. This makes evaluation evidence-based rather than synthetic.

### "What does your observability system track?"

**Short answer**: Every agent run is logged with model, provider, token counts, latency, cost, input/output payloads, and error state.

Specifically: the `AgentRun` table stores a complete execution record for every LLM call. The dashboard surfaces a per-opportunity timeline. The CLI `trace` command formats this into a human-readable sequence. This means we can answer "what exactly happened when the AI rejected this job?" from the database — without relying on logs.

### "How do you handle model provider failures?"

**Short answer**: Cross-provider fallback chains, automatically triggered by the `AgentExecutor`.

The executor iterates through a `configsToTry` list: primary model → fallback model → degradation model. On any exception (API error, schema validation failure, timeout), it logs a warning and tries the next config. The fallbacks deliberately cross provider boundaries: an OpenAI primary fails over to a Gemini fallback and vice versa. This prevents a single-provider outage from halting the pipeline.

---

## System Design Questions

### "How would you scale this to handle 500 jobs per day?"

1. Move from SQLite to Postgres (connection string change in Prisma)
2. Replace the single IMAP worker with a message queue (SQS, Redis Streams) to fan out pipeline runs
3. Pool MCP connections rather than spawning per-call
4. Add a Redis-based rate limiter for LLM calls
5. Deploy the pipeline workers as a separate service from the Next.js dashboard

The current architecture was designed to make this migration non-breaking — the pipeline is already separated from the UI, and domain types are shared interfaces.

### "What would you add if you had 2 more weeks?"

Honest priority order:
1. **A feedback UI in the dashboard**: Currently outcome logging requires direct DB access. A simple form on the opportunity detail page would accelerate golden dataset population.
2. **Prompt versioning**: Tie prompt versions to agent runs so we can A/B test prompt changes against evaluation baselines.
3. **Caching layer for MCP calls**: Cache client metrics by `platformId` for 24 hours to reduce MCP latency and avoid redundant calls for clients who post multiple jobs.
4. **Real-world benchmark results**: After 30 days of production usage, the golden dataset will have enough entries to measure actual conversion rate improvements vs. manual application decisions.

### "How do you know the AI is making good decisions?"

**Short answer**: We don't assume it is — we measure it.

The evaluation framework produces Precision, Recall, and F1 against labeled ground truth. The feedback loop captures real-world outcomes (Apply → Interview → Contract rates). The `FeedbackManager` correlates AI scores against actual outcomes to detect calibration drift. If a 90-scored opportunity converts to contracts at the same rate as a 70-scored one, the scoring is miscalibrated and we investigate threshold tuning or prompt changes before touching fine-tuning.

---

## Behavioral Questions

### "Tell me about a key engineering tradeoff you made."

The most interesting one: **in-memory cosine similarity vs. pgvector for the RAG system**.

When implementing evidence retrieval, the "impressive" choice would have been to deploy a vector database (Pinecone, pgvector, Weaviate). The correct choice was in-memory cosine similarity over JSON-stored embeddings in SQLite.

Reasoning: The knowledge base has ~50–200 items. In-memory cosine similarity runs in milliseconds and requires zero infrastructure. A vector database adds operational complexity, a network round-trip, and cost — all of which are negative returns at this scale. The architecture is designed so that if the knowledge base grows to 100,000 items, only the `SemanticRetriever` implementation needs to change, not the agents or the pipeline.

This is the kind of judgment that separates "AI engineers" from "people who add AI to things."
