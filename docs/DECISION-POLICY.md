# OmniBid Decision Policy Specification (v1.1)

**Specification Identifier:** `decision-policy@v1.1`  
**Prompt Set Identifier:** `omni-prompts@v1.1`  
**Retriever Identifier:** `evidence-retriever@v1.1`  
**Evaluation Benchmark:** `freelance-eval@v1.1`

> [!NOTE]
> ### In Plain English: What This Document Means
> This document explains the exact rules OmniBid uses to decide whether a freelance job is worth your time:
> - **`APPLY`** = Great job. Matches your skills, has a fair budget, and the client looks legitimate.
> - **`MAYBE`** = Promising job, but important details (like the budget or client history) are missing, so you should ask questions first.
> - **`SKIP`** = Dealbreaker. The job is a scam, pays insulting rates (like $30 for a whole app), or uses technologies you hate (like PHP or WordPress).
> - **Golden Rule**: If a job breaks a dealbreaker rule, our code rejects it instantly — the AI is not allowed to overrule it.

---

## 1. Executive Summary

OmniBid helps senior freelance engineers avoid wasting time on bad jobs, low-paying clients, and scams. It turns job postings into honest, reliable decisions.

---

## 2. Decision Taxonomy

The engine classifies every opportunity into one of three discrete decisions:

### 1. `APPLY`
- **Definition:** High-conviction opportunity worthy of crafting a tailored, evidence-grounded proposal.
- **Criteria:**
  - Technical requirements align strongly with freelancer's core skills (`matchScore >= 80`).
  - Expected economics meet or exceed freelancer's target hourly rate and project minimum.
  - Client has verified payment history or shows credible spending behavior.
  - Scope deliverables are well-specified (`ambiguity: 'LOW'` or `'MEDIUM'`).
  - No deterministic hard constraints are violated.
  - Evidence sufficiency is `SUFFICIENT`.

### 2. `MAYBE`
- **Definition:** Plausible opportunity requiring manual inspection or clarifying questions during proposal submission.
- **Criteria:**
  - Technical fit is solid, but critical variables (budget, client track record, or scope) are missing (`evidenceSufficiency: 'PARTIAL'` or `'INSUFFICIENT'`).
  - The opportunity involves a mixed stack where the freelancer knows the primary stack but not a secondary utility.
  - High competition (e.g. 50+ proposals already submitted) makes conversion uncertain.
  - **Calibration Guarantee:** Any raw `APPLY` decision with `INSUFFICIENT` evidence is automatically downgraded to `MAYBE` with confidence capped at `<= 0.65`.

### 3. `SKIP`
- **Definition:** High-conviction rejection. The freelancer should spend zero time pursuing this job.
- **Criteria:**
  - Excluded technology detected (e.g., PHP, WordPress, Ruby, Web3).
  - Scam, off-platform solicitation, or unpaid test project detected.
  - Stated fixed budget is < 30% of the freelancer's minimum project budget.
  - Required core skills are missing from the freelancer's profile.
  - Target seniority level is fundamentally mismatched (e.g., Junior role for a Senior engineer).

---

## 3. Deterministic Hard Constraint Gates (Pre-LLM)

Deterministic gates evaluate before or in strict precedence over model inference:

```
[Incoming Job Posting & Profile]
             │
             ▼
   ┌──────────────────────────────────────────────┐
   │ Gate A: Excluded Technology Check            │──► [VIOLATION] ──► SKIP (Confidence: 1.0)
   └──────────────────────────────────────────────┘
             │ [PASS]
             ▼
   ┌──────────────────────────────────────────────┐
   │ Gate B: Scam & Policy Violation Check        │──► [VIOLATION] ──► SKIP (Confidence: 0.98)
   └──────────────────────────────────────────────┘
             │ [PASS]
             ▼
   ┌──────────────────────────────────────────────┐
   │ Gate C: Severe Budget Deficit Check          │──► [VIOLATION] ──► SKIP (Confidence: 0.95)
   │ (Stated Budget < 30% of Minimum Floor)       │
   └──────────────────────────────────────────────┘
             │ [PASS]
             ▼
   ┌──────────────────────────────────────────────┐
   │ Multi-Agent Reasoning & Claim Verification    │
   └──────────────────────────────────────────────┘
             │
             ▼
   ┌──────────────────────────────────────────────┐
   │ Post-Inference Calibration & Taxonomy Mapping│
   └──────────────────────────────────────────────┘
             │
             ▼
      [Final Decision]
```

### Gate Definitions

| Gate | Condition | Action | Rationale |
|---|---|---|---|
| **Gate A: Excluded Tech** | Any item in `profile.excludedTechnologies` present in job requirements | Immediate `SKIP` (Conf: 1.0) | Freelancers have non-negotiable tech exclusions to protect their market positioning and sanity. |
| **Gate B: Scam / Violation** | Off-platform contact (`@telegram`, `WhatsApp`, paper check, free test projects) | Immediate `SKIP` (Conf: 0.98) | Upwork Terms of Service prohibit off-platform communication before contract. High fraud risk. |
| **Gate C: Severe Budget Deficit** | `budget > 0` and `budget < (profile.minProjectBudget * 0.3)` | Immediate `SKIP` (Conf: 0.95) | A job offering $30 for a full mobile app or SaaS platform is economically negative return. |

---

## 4. Evidence Taxonomy (4 Tiers)

Every decision includes a structured claim verification breakdown (`evidenceTaxonomyJson`):

1. **`VERIFIED`**:
   - Claims directly confirmed against the freelancer's active profile and project portfolio.
   - Example: *"Strong Next.js App Router and TypeScript experience confirmed in Profile."*
2. **`INFERRED`**:
   - Architecture and stack dependencies derived logically from the stated scope.
   - Example: *"Relational database schema and background worker queue inferred from job scope."*
3. **`UNKNOWN`**:
   - Variables that the client omitted from the job posting.
   - Example: *"Client payment history and feedback unstated (RAW JD)."*
   - Example: *"Fixed budget or hourly rate unstated."*
4. **`CONTRADICTED`**:
   - Required skills or qualifications that the freelancer explicitly does not possess.
   - Example: *"Candidate profile lacks Go/Rust systems programming experience."*

---

## 5. Confidence Calibration & Insufficient Evidence Handling

Raw LLM confidence scores are notoriously overconfident (frequently predicting 0.95+ on ambiguous prompts). OmniBid implements deterministic calibration:

### Missing Dimension Metric
The system evaluates three uncertainty dimensions:
1. `clientAnalysis.quality === 'UNKNOWN'` (1 point)
2. `economicAnalysis.status !== 'OBSERVED'` (1 point)
3. `jobAnalysis.ambiguity === 'HIGH'` (1 point)

### Evidence Sufficiency State
- **`SUFFICIENT`**: 0 missing dimensions. Model confidence retained.
- **`PARTIAL`**: 1 missing dimension.
- **`INSUFFICIENT`**: 2 or more missing dimensions.

### Calibration Rules
1. If `evidenceSufficiency === 'INSUFFICIENT'` and raw decision is `APPLY`:
   - Decision is **downgraded to `MAYBE`**.
   - Confidence is **capped at `0.65`**.
   - Summary explicitly documents missing variables.
2. If `evidenceSufficiency === 'PARTIAL'` and raw decision is `APPLY`:
   - Confidence is **capped at `0.80`**.

### Calibration Metrics
- **Brier Calibration Score:** Mean squared error between predicted confidence and binary truth ($Brier = \frac{1}{N} \sum (f_i - o_i)^2$). Benchmark target: `< 0.15`.
- **Expected Calibration Error (ECE):** Grouped decile calibration error. Benchmark target: `< 0.12`.

---

## 6. Profile & Policy Versioning

To ensure reproducible audits and evaluation traceability:
- Every change to the decision policy increments `policyVersion` (`decision-policy@v1.1`).
- Every update to freelancer settings increments `profile.version` (`v1 -> v2`).
- When an opportunity is triaged, the exact profile state is snapshotted into `opportunity.profileSnapshotJson` and tagged with `opportunity.profileVersion`.
- Editing your profile today will never corrupt or invalidate past opportunity decisions.
