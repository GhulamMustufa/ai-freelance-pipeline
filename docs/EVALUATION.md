# OmniBid AI Evaluation Framework (V1.1)

**Evaluation Dataset Version:** `freelance-eval@v1.1`  
**Dataset Location:** `evals/datasets/v1.json` (`src/evals/dataset.ts`)  
**Results Directory:** `evals/results/`

> [!NOTE]
> ### In Plain English: How We Test the AI
> Instead of just hoping the AI works well, we created a **28-question "final exam"** made of real freelance situations:
> - Dream jobs with great pay and verified clients -> Does it say **`APPLY`**?
> - Forbidden stacks (PHP, WordPress) or scams (Telegram) -> Does it say **`SKIP`**?
> - Insulting budgets ($30 for an Uber clone) -> Does it say **`SKIP`**?
> - Vague jobs with missing budgets -> Does it say **`MAYBE`** instead of bluffing?
> - Sneaky hacker injection attempts -> Does it successfully block them?
> 
> Running `npm run evaluate` grades the exam. In our latest test, the system achieved **96.4% accuracy** and blocked **100% of scams and attacks**!

---

## 1. Evaluation Philosophy

In production AI systems, "vibes-based" manual spot-checking is unacceptable. A single uncontrolled prompt tweak can degrade precision, introduce hallucinations, or break deterministic constraints.

OmniBid implements a rigorous, automated evaluation framework that measures:
1. **Decision Correctness:** Accuracy, Precision, Recall, and F1 across `APPLY` and `SKIP` decisions.
2. **Confidence Calibration:** Brier Score and Expected Calibration Error (ECE), measuring whether a 90% confidence score actually corresponds to 90% true certainty.
3. **Information Integrity:** Unknown Preservation Rate (ensuring missing client metadata does not trigger false scam alarms).
4. **Adversarial Resilience:** Adversarial Resistance Rate against prompt injection attacks.
5. **Economic Telemetry:** Latency (P50, P95) and token/monetary cost per triage decision.

---

## 2. Golden Evaluation Dataset (28 Cases)

The benchmark dataset comprises 28 curated cases spanning 11 categories representative of real-world freelance distributions:

| Category | Count | Expected | Focus & Test Objective |
|---|---|---|---|
| **Strong APPLY** | 4 | `APPLY` | Verified Next.js, AI systems, TypeScript, RAG, excellent budget, verified clients. |
| **Excluded Technology** | 3 | `SKIP` | PHP/WordPress, Ruby on Rails, Solana/Web3. Tests deterministic Gate A trigger. |
| **Scam Detection** | 3 | `SKIP` | Off-platform Telegram, fake paper check, free unpaid test project. Tests Gate B trigger. |
| **Budget Floor Deficit** | 3 | `SKIP` | $30 Uber clone, $100 HIPAA medical portal, $15 logo fix. Tests Gate C trigger. |
| **Severe Skill Mismatch** | 2 | `SKIP` | C++ Kernel Driver, Enterprise Java Spring Boot & Oracle. Tests skills ceiling constraint. |
| **Ambiguous Scope** | 2 | `MAYBE` | "Make app faster and explore ideas", open-ended advisory. Tests ambiguity scoring. |
| **Missing Budget** | 2 | `MAYBE` | Verified Next.js stack but budget completely unstated. Tests confidence calibration. |
| **JD-Only Unknown Client** | 2 | `MAYBE` | Raw text paste with zero client info. Tests `UNKNOWN` preservation without false flags. |
| **Mixed Tech Stack** | 2 | `MAYBE` | Next.js frontend + unfamiliar Go microservice or Django backend. Tests partial match handling. |
| **Seniority Mismatch** | 1 | `SKIP` | Entry-level HTML/CSS student intern task ($12/hr). Tests seniority divergence. |
| **Adversarial Attacks** | 4 | `SKIP` | System override prompt injection, leetspeak filter evasion, prompt leakage, $0 budget bypass. |

---

## 3. Metrics Definitions & Mathematical Formulations

### 3.1 Accuracy, Precision, Recall & F1
- **`APPLY` Precision:** $\frac{\text{True APPLY}}{\text{True APPLY} + \text{False APPLY}}$. Measures protection against wasting bidding tokens and time on suboptimal opportunities.
- **`APPLY` Recall:** $\frac{\text{True APPLY}}{\text{True APPLY} + \text{False NEGATIVE}}$. Measures capture rate of lucrative opportunities.
- **`SKIP` Precision & Recall:** Measures accuracy in filtering out dealbreaker technologies, scams, and exploitative postings.

### 3.2 Brier Calibration Score
Measures the mean squared error between predicted confidence probabilities $f_i$ and true binary outcomes $o_i \in \{0, 1\}$:

$$\text{Brier Score} = \frac{1}{N} \sum_{i=1}^N (f_i - o_i)^2$$

- **Lower is better:** A score of `0.0` represents perfect calibration.
- **Target:** $\le 0.15$. Uncalibrated LLMs typically score $0.25 - 0.40$.

### 3.3 Expected Calibration Error (ECE)
Calculates the weighted average difference between accuracy and confidence across 10 decile confidence bins:

$$\text{ECE} = \sum_{m=1}^M \frac{|B_m|}{N} \left| \text{acc}(B_m) - \text{conf}(B_m) \right|$$

- **Target:** $\le 0.12$.

### 3.4 Unknown Preservation Rate
Calculates the proportion of cases where missing client data was correctly preserved as `UNKNOWN` rather than hallucinated or falsely flagged as a scam:

$$\text{Unknown Preservation Rate} = \frac{\text{Cases with Client Quality correctly flagged UNKNOWN}}{\text{Total cases with unstated client metadata}}$$

- **Target:** `100%`.

### 3.5 Adversarial Resistance Rate
Calculates resilience against prompt injection payloads:

$$\text{Adversarial Resistance Rate} = \frac{\text{Adversarial cases correctly rejected as SKIP}}{\text{Total adversarial injection test cases}}$$

- **Target:** `100%`.

---

## 4. Running Evaluations

### Command
```bash
npm run evaluate
```

### Execution Flow
1. Loads benchmark dataset (`evals/datasets/v1.json`).
2. Iterates sequentially through all 28 cases using the configured provider and model (`gpt-4o-mini`).
3. Evaluates deterministic gates first, followed by multi-agent reasoning where applicable.
4. Records duration, token count, predicted recommendation, and confidence.
5. Computes all calibration, accuracy, and operational metrics.
6. Writes results to:
   - `evals/results/LATEST_EVAL_REPORT.md` (Human-readable Markdown)
   - `evals/results/eval-report-<timestamp>.json` (Machine-readable JSON)

---

## 5. CI/CD & Regression Tracking

Evaluation reports are committed to git or stored in CI/CD artifacts to allow direct diffing across model versions (e.g. comparing `gpt-4o` vs `gpt-4o-mini` vs `gemini-1.5-flash`) or before deploying new prompt templates.
