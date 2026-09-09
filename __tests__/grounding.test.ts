import { test } from 'node:test';
import assert from 'node:assert';
import { ClaimVerificationAgent } from '../src/ai/agents/ClaimVerificationAgent';
import { AgentExecutor } from '../src/ai/agent';
import { RetrievedEvidence } from '../src/ai/rag/SemanticRetriever';

test('Anti-Hallucination Pipeline', async (t) => {
  // We use the real executor (which will hit Gemini/OpenAI if configured, but let's mock the network or just skip it if no API key is set)
  // Actually, we can just test the Prompt structures or use a small mock. For the sake of the project, we'll write the test structure.
  
  const executor = new AgentExecutor();
  const verifier = new ClaimVerificationAgent(executor);

  const evidence: RetrievedEvidence[] = [
    {
      id: 'ev-1',
      type: 'PROJECT',
      title: 'E-commerce Backend',
      description: 'Built a scalable Node.js backend using Express and PostgreSQL.',
      technologies: 'Node.js, Express, PostgreSQL',
      url: null,
      similarity: 0.9,
    }
  ];

  await t.test('ClaimVerifier should flag hallucinated experience', async () => {
    const hallucinatedDraft = "I can definitely build this for you. I have 5 years of experience with Rust and Web3 smart contracts, which perfectly matches your needs.";
    
    // In a real environment with API keys, this would run the LLM.
    // We will bypass the actual LLM call here to avoid failing in CI without keys.
    // To demonstrate the test, we mock the executor for this specific test case.
    const originalExecute = executor.executeStructured;
    
    (executor as any).executeStructured = async (args: any) => {
      if (args.agentName === 'ClaimVerification') {
        return {
          isGrounded: false,
          unsupportedClaims: ['5 years of experience with Rust', 'Web3 smart contracts'],
          reasoning: 'The draft claims Rust and Web3 experience, but the allowed evidence only mentions Node.js, Express, and PostgreSQL.'
        };
      }
      return {};
    };

    const result = await verifier.verify(hallucinatedDraft, evidence);
    
    assert.strictEqual(result.isGrounded, false);
    assert.match(result.feedback, /Rust/i);
    
    executor.executeStructured = originalExecute;
  });

  await t.test('ClaimVerifier should pass grounded experience', async () => {
    const groundedDraft = "I can build your backend. In a previous project [ID: ev-1], I built a scalable Node.js backend using PostgreSQL.";
    
    const originalExecute = executor.executeStructured;
    
    (executor as any).executeStructured = async (args: any) => {
      if (args.agentName === 'ClaimVerification') {
        return {
          isGrounded: true,
          unsupportedClaims: [],
          reasoning: 'All claims are perfectly aligned with evidence ev-1.'
        };
      }
      return {};
    };

    const result = await verifier.verify(groundedDraft, evidence);
    
    assert.strictEqual(result.isGrounded, true);
    
    // Restore
    executor.executeStructured = originalExecute;
  });
});
