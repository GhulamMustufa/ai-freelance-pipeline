# ADR-002: SQLite for Local Persistence

**Status:** Accepted  
**Date:** 2026-09-08  

## Context

The system needs a relational database to persist opportunities, agent runs, decisions, proposals, and telemetry. Options considered:

1. **PostgreSQL** (remote / self-hosted): Production-grade, requires a server or cloud service, adds operational complexity.
2. **Neon (serverless Postgres)**: Requires a network round-trip, adds latency, has cold-start implications for a background worker.
3. **SQLite (local file)**: Zero-infrastructure, file-based, supported natively by Prisma via `better-sqlite3`.

## Decision

Use **SQLite via Prisma** for all persistence. The system is designed as a local personal tool running on a single machine with an IMAP worker and a Next.js dashboard. There is no multi-server coordination requirement.

This was explicitly recommended for this use case over PostgreSQL/Neon when the user asked: "Should we use In-Memory Cosine Similarity + SQLite JSON or NeonDB?" The answer was SQLite — justified by zero operational overhead for a single-user automation tool.

## Consequences

**Positive:**
- Zero external dependencies. `npx prisma db push` and the system works.
- Sub-millisecond local reads. No network latency on dashboard queries.
- Single `.db` file can be backed up, inspected, or migrated trivially.

**Negative:**
- Not suitable for multi-user or multi-process write-heavy scenarios (SQLite write locks).
- If the system grows to a multi-server deployment, migration to Postgres is needed (Prisma makes this a schema + connection string change).
