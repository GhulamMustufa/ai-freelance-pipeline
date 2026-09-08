# ADR-001: AI Provider Abstraction

**Status:** Accepted  
**Date:** 2026-09-08  

## Context

The system requires LLM inference across multiple agents. At the time of implementation, the primary models under consideration were OpenAI (GPT-4o family) and Google Gemini. Hardcoding API calls to a single provider creates brittle infrastructure — provider outages, pricing changes, or superior models becoming available would require deep refactoring.

## Decision

We implemented a `AIProvider` abstraction layer (`src/ai/provider.ts`) that all agents call via a common interface: `AIProvider.generateStructuredData(config, prompt, schema)`. The concrete implementation resolves the provider at runtime based on the `AIProviderConfig` passed in.

The `ModelRouter` resolves `AIProviderConfig` based on `TaskType` and `complexity`, keeping routing logic entirely separate from both the agents and the provider implementations.

## Consequences

**Positive:**
- Adding a new provider (e.g. Anthropic Claude) requires only a new case in `provider.ts`. No agent code changes.
- The model router can be tuned independently of agent logic.
- Cross-provider fallbacks are trivially implementable.

**Negative:**
- Adds an indirection layer that developers must understand before debugging a failed agent call.
- Structured output formats (e.g. `generateObject` for OpenAI vs `generateContent` for Gemini) must be normalized within the provider abstraction.
