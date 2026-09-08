# ADR-005: Evidence Grounding

**Status:** Accepted  
**Date:** 2026-09-08  

## Context

LLMs have a well-known failure mode in proposal generation: they confidently invent plausible-sounding experience that the freelancer does not actually have. This is catastrophic in a professional context — a client who asks about a "project you listed" that doesn't exist will immediately lose trust.

Options considered:
1. **System prompt constraint only**: "Do not invent experience." Simple, but LLMs are probabilistic. Under pressure to fill a proposal, they will hallucinate.
2. **Hard-coded portfolio string in every prompt**: Better, but verbose, expensive, and cannot be dynamically tailored.
3. **RAG with verification loop**: Retrieve only the relevant evidence for this job, include it in the prompt as context, then verify the output claims against the source evidence.

## Decision

Implement a **RAG pipeline with an anti-hallucination verification loop**:

1. `FreelancerEvidence` table stores verified portfolio items with text embeddings (stored as JSON float arrays in SQLite).
2. `SemanticRetriever` performs in-memory cosine similarity at query time — no vector database required.
3. `EvidenceRankingAgent` re-ranks the top-N results by contextual relevance.
4. `ProposalDraftingAgent` receives evidence as explicit context and cites evidence by ID.
5. `ClaimVerificationAgent` checks every claim in the draft against the cited evidence. If any claim is ungrounded, the draft is rejected.
6. The pipeline retries up to 3 times before throwing an error.

### Why in-memory cosine similarity vs. pgvector?

The knowledge base is small (tens to low hundreds of portfolio items). The overhead of running a separate vector database (or even pgvector on Postgres) is not justified at this scale. In-memory cosine similarity over JSON-embedded float arrays is deterministic, requires zero infrastructure, and performs in milliseconds.

This is the correct engineering judgment: **don't add infrastructure for fashion**.

## Consequences

**Positive:**
- Zero hallucinated claims reach the user — the verification loop makes this a hard guarantee.
- RAG allows the system to scale to hundreds of portfolio items without increasing prompt size.
- The architecture is extensible: replace in-memory retrieval with pgvector if the knowledge base grows to thousands of items.

**Negative:**
- Requires embeddings to be pre-computed for all portfolio items.
- Verification loop adds 1–2 additional LLM calls per proposal generation.
