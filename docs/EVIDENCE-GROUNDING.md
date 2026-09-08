# Evidence-Grounded Freelancer Knowledge System

This document outlines the architecture and mechanisms implemented in Phase 3 to ensure the AI NEVER invents experience, metrics, or technologies when generating proposals.

## Architecture Decision: In-Memory RAG vs. Vector Database
For this portfolio project, we opted **not** to implement a dedicated vector database (like `pgvector`, Pinecone, or Weaviate). 
**Why?** A typical freelancer's entire knowledge base (projects, case studies, specific technologies) spans fewer than a few hundred records. This easily fits into system memory. We store raw embeddings as JSON strings in SQLite, fetch them into memory during execution, and perform a lightning-fast cosine similarity calculation in JavaScript (`src/lib/vector.ts`). This achieves the exact same semantic retrieval capability as a vector database without the immense infrastructure overhead.

## The Proposal Pipeline

The traditional LLM wrapper approach is:
`Job Description -> LLM -> Proposal`

Our upgraded, evidence-grounded approach is:

1. **Requirement Extraction**: `JobIntelligenceAgent` extracts the true problem and technical needs from the raw job description.
2. **Evidence Retrieval**: `SemanticRetriever` compares the embedded job requirements against the Freelancer Evidence database, returning the top K semantic matches.
3. **Evidence Ranking**: `EvidenceRankingAgent` evaluates the semantic matches and strictly curates the top 3-5 most compelling pieces of evidence for the specific job.
4. **Proposal Drafting**: `ProposalDraftingAgent` drafts the proposal, with strict system prompts to *only* use the provided evidence and explicitly cite sources using `[ID]`.
5. **Claim Verification (Anti-Hallucination)**: The `ClaimVerificationAgent` acts as an independent auditor. It compares the generated draft against the allowed evidence set. If it detects *any* unsupported claims (e.g., claiming 5 years of Rust experience when the evidence only mentions Node.js), it flags the draft.
6. **Revision Loop**: If flagged, the pipeline rejects the draft and retries. If it fails 3 times, the pipeline explicitly throws an error rather than sending a hallucinated proposal.

## The Knowledge Model

We created a structured `FreelancerEvidence` model in Prisma containing:
- `type`: Category (PROJECT, TECHNOLOGY, ACHIEVEMENT)
- `title` & `description`: The core content.
- `technologies`: Searchable keywords.
- `url`: A verifiable source link (e.g., GitHub, live site, Upwork contract).
- `verification`: Context on how this evidence is verified.

## Traceability
When a proposal is successfully generated and passes the `ClaimVerificationAgent`, the exact IDs of the `FreelancerEvidence` used are saved to the `Proposal.evidenceUsed` field in the database. This guarantees end-to-end provenance: A recruiter reading the generated proposal can trace exactly which verified portfolio piece generated each claim.
