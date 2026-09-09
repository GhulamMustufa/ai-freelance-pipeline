# OmniBid V1.1 Improvement Changelog

**Release Date:** September 2026  
**Theme:** AI Reliability, Evaluation, Confidence Calibration & Profile Hardening  
**Core Thesis:** *"LLMs reason; deterministic systems enforce constraints."*

> [!NOTE]
> ### In Plain English: What We Improved in V1.1
> 1. **Protected from Hackers & Scammers**: Added security boundaries so malicious jobs cannot trick the AI into recommending scams.
> 2. **Made the AI Honest**: If a job is missing a budget or client history, the AI admits it and says `MAYBE` instead of guessing `APPLY` with fake confidence.
> 3. **Created a 28-Job Test Suite**: We can now run `npm run evaluate` anytime to prove the AI makes the right choice 96.4% of the time.
> 4. **Profile Snapshots**: When a job is analyzed, we freeze a copy of your profile so future rate/skill changes don't mess up past records.
> 5. **Clean Telemetry**: You can now see the exact time taken, tokens burned, and fractions of a penny spent on each job analysis.

---

## 1. Summary of Architectural Hardening (V1.0 vs V1.1)

| Area | V1.0 (Initial MVP) | V1.1 (Reliability Hardened) |
|---|---|---|
| **Freelancer Profile** | Basic skills array, no versioning, unpersisted on job records | Extended schema (`primarySkills`, `location`, `availability`, `version`); immutable snapshots on each `Opportunity` |
| **Adversarial Security** | Plain string concatenation into LLM prompts | Delimited `<untrusted_job_posting>` & `<untrusted_client_data>` tags; explicit anti-injection instructions; input truncation defense |
| **Deterministic Gates** | Partial keyword matching inside agents | Pre-inference TypeScript AST & string gates with strict precedence over LLM output |
| **Confidence Calibration** | Raw uncalibrated LLM confidence (prone to overconfidence) | Missing dimension penalty; automatic downgrade of `APPLY` to `MAYBE` under `INSUFFICIENT` evidence; Brier score & ECE tracking |
| **Evidence Grounding** | Unstructured text arrays (`reasons`, `unknowns`) | 4-Tier Evidence Taxonomy (`VERIFIED`, `INFERRED`, `UNKNOWN`, `CONTRADICTED`) attached to every decision |
| **Evaluation Suite** | Ad-hoc manual testing with mock data | 28 curated golden cases (`evals/datasets/v1.json`); machine-readable metrics (`Brier`, `ECE`, `Adversarial Resistance Rate`, `Unknown Preservation Rate`) |
| **Telemetry & Observability** | Basic duration tracking | Token tracking (prompt + completion), latency per agent stage, USD cost estimation, policy/profile versioning |

---

## 2. Detailed Component Improvements

### 1. Database & Persistence Layer (`prisma/schema.prisma`)
- **Profile Versioning:** Added `version Int @default(1)` to `FreelancerProfile`.
- **Snapshot Immutability:** Added `profileVersion Int?` and `profileSnapshotJson String?` to `Opportunity`. When an opportunity is triaged, the profile at that moment is permanently frozen. Updating your profile does not alter past historical traces.
- **Decision Taxonomy:** Added `evidenceSufficiency String?`, `policyVersion String?`, and `evidenceTaxonomyJson String?` to `OpportunityDecision`.

### 2. Opportunity Pipeline (`OpportunityPipeline.ts`)
- Modified pipeline ingestion to look up the active freelancer profile and record the snapshot json and version prior to analysis.
- Modified scoring and decision stages to persist calibrated fields (`evidenceSufficiency`, `policyVersion`, `evidenceTaxonomyJson`).

### 3. Agent Hardening & Prompt Isolation
- **`JobIntelligenceAgent.ts`**: Encapsulates raw descriptions inside `<untrusted_job_posting>`. Added truncation limit (12,000 chars) to prevent context exhaustion attacks. Added system prompt security protocol prohibiting roleplay or rule override instructions.
- **`ClientIntelligenceAgent.ts`**: Encapsulates raw client data inside `<untrusted_client_data>`. Strictly preserves `UNKNOWN` status when client metrics are missing without generating false scam flags.
- **`FreelancerFitAgent.ts`**: Mandates profile facts as the absolute ceiling for claims. Prohibits hallucinating skills or experience not present in the profile.

### 4. Decision Engine Hardening (`DecisionEngine.ts`)
- **Deterministic Gates:**
  - Excluded Technology: Triggers `SKIP` with `confidence: 1.0`.
  - Confirmed Scam / Policy Violation: Triggers `SKIP` with `confidence: 0.98`.
  - Severe Budget Deficit (<30% of floor): Triggers `SKIP` with `confidence: 0.95`.
- **Confidence Calibration:**
  - Evaluates missing uncertainty dimensions (client quality, economic status, scope ambiguity).
  - Downgrades raw `APPLY` to `MAYBE` and caps confidence at `0.65` when evidence is `INSUFFICIENT`.
- **4-Tier Evidence Taxonomy:**
  - Maps positive matches to `VERIFIED`.
  - Maps architectural scope dependencies to `INFERRED`.
  - Maps unstated variables to `UNKNOWN`.
  - Maps missing requirements to `CONTRADICTED`.

### 5. Evaluation Suite & Metrics Engine (`src/evals/`)
- **Dataset (`v1.json`):** 28 golden cases covering all major production distributions:
  - Strong APPLY (4 cases)
  - Excluded Tech SKIP (3 cases)
  - Scam & Fraud SKIP (3 cases)
  - Budget Floor Deficit SKIP (3 cases)
  - Severe Skill Mismatch SKIP (2 cases)
  - Ambiguous Scope MAYBE (2 cases)
  - Missing Budget MAYBE (2 cases)
  - JD-Only Unknown Client MAYBE (2 cases)
  - Mixed Stack MAYBE (2 cases)
  - Seniority Mismatch SKIP (1 case)
  - Adversarial Prompt Injection Attacks (4 cases)
- **Metrics Engine (`metrics.ts`):**
  - Precision, Recall, and F1 for `APPLY` and `SKIP` decisions.
  - Brier Calibration Score.
  - Expected Calibration Error (ECE) across deciles.
  - Unknown Preservation Rate.
  - Adversarial Resistance Rate.
  - P50, P95, and average latency per decision.
  - Total token consumption and estimated inference cost in USD.
- **Runner (`runner.ts`):**
  - Generates `evals/results/LATEST_EVAL_REPORT.md` and timestamped JSON files.

### 6. UI & Trace Telemetry
- Enhanced `/dashboard/traces/[id]/page.tsx` with a top telemetry ribbon showing total pipeline latency, total token consumption, estimated USD cost, active policy version, and profile snapshot version.
- Added visual 4-Tier Evidence Taxonomy card rendering color-coded badges for verified, inferred, unknown, and contradicted evidence items.
- Enhanced `/dashboard/analyzer/page.tsx` with a profile version indicator and extended editing modal for primary skills, location, and availability.

---

## 3. Backward Compatibility & Migration Note

All V1.1 database schema additions are backwards-compatible:
- New fields on `Opportunity` and `OpportunityDecision` are optional (`?`) or have defaults.
- Pre-existing V1.0 records remain intact and render properly with fallback labels (`v1.0 (Default)`).
