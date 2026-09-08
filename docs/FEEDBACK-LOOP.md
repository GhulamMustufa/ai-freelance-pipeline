# The AI Feedback Loop

The AI Freelance Pipeline is designed as a closed-loop system. We do not assume that an AI score of 85 automatically implies success. Instead, the system continually calibrates itself by measuring its decisions against reality. 

## The Closed-Loop Architecture

The narrative of our system is as follows:
**AI makes decisions → Real outcomes are captured → Outcomes become evaluation data → The system is continuously improved.**

### 1. Capturing Outcomes
When the Decision Engine evaluates an opportunity, it generates a theoretical score. But the pipeline doesn't stop there. We track the downstream `OpportunityOutcome`:
- Did we actually apply?
- Did the client view the proposal?
- Did we receive a response?
- Did it result in an interview?
- Did it result in a won contract?

By tracking these, the `FeedbackManager` can calculate objective systemic metrics, such as the `Apply → Interview Rate`.

### 2. Human Calibration (User Feedback)
In addition to hard outcomes, the human-in-the-loop (you) can review the AI's behavior via the `UserFeedback` model. You can grade:
- **Decision Correctness:** Did the AI hallucinate a fit? Did it skip a perfect job?
- **Proposal Quality:** Was the draft (1-5) compelling and accurately grounded in evidence?
- **Opportunity Value:** Regardless of what the AI thought, was this actually a good job?

### 3. Analytics & Score Correlation
The system cross-references AI scores with reality. For example, the `FeedbackManager` calculates:
- Does an opportunity scored 90+ actually convert to an interview more frequently than one scored 75?
- If the correlation breaks down, it is a signal that our scoring heuristics or prompt thresholds are incorrect.

### 4. The Golden Dataset
Real-world, human-calibrated outcomes are far more valuable than synthetic benchmarks. 
Using `npm run generate-golden-dataset`, the system automatically queries the database for all jobs with verified feedback and outcomes. It exports these into `evals/datasets/golden_v1.json`. 
This becomes our ground-truth evaluation dataset.

### 5. Continuous Improvement Strategy
When systemic metrics indicate a drop in performance, we follow an evidence-based improvement ladder—**the simplest mechanism first:**
1. **Threshold Tuning:** Adjust the cutoff score (e.g., from 70 to 75) to reduce false positives.
2. **Prompt Refinement:** Add specific edge-cases discovered via feedback to the system prompts.
3. **Retrieval Improvement:** Enhance the evidence RAG (e.g., better metadata matching) if proposals are lacking proof.
4. **Model Routing:** If cheap models are failing, route specific edge-cases to expensive models.
5. **Rule Adjustment:** Hardcode new exclusionary rules (e.g., "Always reject clients with 0% hire rate").

*We explicitly do NOT jump immediately to fine-tuning.* Fine-tuning is brittle, expensive, and often a band-aid for poor logic. The methods above address 99% of calibration issues dynamically.
