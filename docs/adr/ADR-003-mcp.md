# ADR-003: Why MCP (Model Context Protocol)

**Status:** Accepted  
**Date:** 2026-09-08  

## Context

A core problem of the system is data asymmetry: Upwork email alerts include job title, description, and budget — but not the data that actually predicts job quality (client spending history, average hourly rate paid, active freelancers currently interviewing). This information is available via Upwork's API but requires authenticated access.

Options for bridging this gap:
1. **Direct Upwork REST API calls**: Requires OAuth 2.0 setup, managing access tokens, implementing specific endpoints.
2. **Scraping**: Fragile, violates ToS.
3. **Upwork MCP Server**: Upwork provides an official MCP server (`https://mcp.upwork.com/mcp`) through the Model Context Protocol standard.

## Decision

Use the **official Upwork MCP Server** via the `@modelcontextprotocol/sdk` client. The `UpworkMCPClient` spawns an MCP connection via `mcp-remote` and calls the `upwork__find_jobs` tool to fetch deep client metrics for a given job ID.

This is the architecturally correct choice because:
- It uses an official, supported integration point.
- MCP is becoming the standard protocol for AI agents to interact with external services (like USB-C for AI tools).
- It demonstrates integration with the broader AI tooling ecosystem, which is directly relevant for AI engineering roles.

## Consequences

**Positive:**
- No OAuth token management — authentication is handled by the MCP server.
- Future MCP tools (e.g. `upwork__list_contracts`, `upwork__send_message`) can be added without new integration code.
- Demonstrates understanding of the MCP ecosystem in a portfolio context.

**Negative:**
- Connection latency: each MCP call spawns a subprocess (`npx mcp-remote`). In production, connection pooling would be required.
- MCP server availability is a runtime dependency outside our control.
- A 10-second timeout is enforced to prevent pipeline stalls on MCP failures.
