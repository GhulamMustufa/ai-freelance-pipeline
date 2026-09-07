# Architecture

## Domain Model
We have implemented a strict domain model to represent opportunities, pipeline runs, and AI telemetry, moving away from simple CRUD tables.

```mermaid
erDiagram
    OPPORTUNITY ||--o| JOB_POSTING : contains
    OPPORTUNITY ||--o| CLIENT : belongs_to
    OPPORTUNITY ||--o| OPPORTUNITY_SCORE : scores
    OPPORTUNITY ||--o| OPPORTUNITY_DECISION : decides
    OPPORTUNITY ||--o| PROPOSAL : generates
    CLIENT ||--o| CLIENT_PROFILE : has

    OPPORTUNITY {
        String id
        String platformId
        String platform
        String status
    }
```

## Pipeline Architecture
The system uses a state machine represented by `PipelineRun` to manage background processing.

```mermaid
graph TD
    A[Ingest] --> B[Normalize]
    B --> C[Deduplicate]
    C --> D[Enrich]
    D --> E[Analyze]
    E --> F[Score]
    F --> G[Decide]
    G --> H[Generate Proposal]
```

## AI Architecture
AI requests are abstracted through `AgentExecutor` and `AIProvider` to allow easy swapping of underlying models (Gemini, OpenAI, etc.). All prompts are versioned separately from business logic.

```mermaid
graph TD
    Pipeline(Opportunity Pipeline) -->|Invoke| Agent(Agent Executor)
    Agent -->|Execute| AIProvider(AI Provider)
    AIProvider -->|API Call| LLM(Gemini / OpenAI)
    Agent -->|Log Telemetry| DB[(AgentRuns)]
```
