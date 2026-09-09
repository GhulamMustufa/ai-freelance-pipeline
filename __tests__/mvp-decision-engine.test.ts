import test from 'node:test';
import assert from 'node:assert/strict';
import { FreelancerFitAgent } from '../src/ai/agents/FreelancerFitAgent';
import { ClientIntelligenceAgent } from '../src/ai/agents/ClientIntelligenceAgent';
import { DecisionEngine } from '../src/application/engine/DecisionEngine';
import { AgentExecutor } from '../src/ai/agent';
import { FreelancerProfile, JobAnalysis, ClientAnalysis, CompetitionAnalysis, EconomicAnalysis } from '../src/domain/models';

test('MVP Decision Engine & Deterministic Gates', async (t) => {
  const executor = new AgentExecutor();
  const fitAgent = new FreelancerFitAgent(executor);
  const clientAgent = new ClientIntelligenceAgent(executor);
  const decisionEngine = new DecisionEngine(executor);

  const profile: FreelancerProfile = {
    id: 'test-profile',
    name: 'Senior Full-Stack AI Engineer',
    headline: 'Senior Full-Stack Engineer',
    bio: 'Experienced full stack dev',
    experienceYears: 8,
    skills: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
    preferredTechnologies: ['Next.js', 'TypeScript'],
    excludedTechnologies: ['PHP', 'WordPress', 'Ruby'],
    targetHourlyRate: 75,
    minProjectBudget: 1000,
  };

  await t.test('1. Deterministic Excluded Technology Gate triggers SKIP immediately', async () => {
    const jobAnalysis: JobAnalysis = {
      actualProblem: 'Need a custom WordPress plugin built with PHP',
      technicalRequirements: ['PHP', 'WordPress', 'MySQL'],
      hiddenRequirements: [],
      deliverables: ['Custom plugin'],
      seniority: 'MID',
      projectMaturity: 'PRODUCTION',
      ambiguity: 'LOW',
      scopeComplexity: 'MEDIUM',
    };

    const fit = await fitAgent.analyze(jobAnalysis, profile);
    assert.equal(fit.deterministicConstraintViolated, true);
    assert.equal(fit.matchScore, 0);

    const clientAnalysis: ClientAnalysis = {
      quality: 'HIGH',
      spendingBehavior: 'Generous',
      hiringHistory: 'Good',
      feedbackSummary: 'Great client',
      riskSignals: [],
      isVerified: true,
    };

    const competitionAnalysis: CompetitionAnalysis = {
      interviewIntensity: 'LOW',
      jobAttractiveness: 'HIGH',
      likelyCompetition: 'Low',
      biddingDifficulty: 'EASY',
    };

    const economicAnalysis: EconomicAnalysis = {
      status: 'OBSERVED',
      expectedValue: 2000,
      budgetQuality: 'GOOD',
      effortRisk: 'LOW',
      opportunityCost: 'Low',
      clientRisk: 'LOW',
      rationale: 'Fair budget',
    };

    const decision = await decisionEngine.decide(
      jobAnalysis,
      clientAnalysis,
      competitionAnalysis,
      fit,
      economicAnalysis,
      profile,
      2000
    );

    assert.equal(decision.recommendation, 'SKIP');
    assert.equal(decision.confidence, 1.0);
    assert.ok(decision.reason.includes('excluded list'));
  });

  await t.test('2. Missing client data preserves UNKNOWN without false scam flags', async () => {
    const client = await clientAgent.analyze(undefined, 'Build a standard dashboard with React');
    assert.equal(client.quality, 'UNKNOWN');
    assert.equal(client.riskSignals.length, 0);
  });

  await t.test('3. Scam detection flags off-platform telegram requests', async () => {
    const client = await clientAgent.analyze(undefined, 'Contact me on telegram @scamuser for details and payment');
    assert.equal(client.quality, 'UNKNOWN');
    assert.ok(client.riskSignals.some(r => r.includes('Telegram/WhatsApp')));
  });

  await t.test('4. Budget far below profile minimum triggers deterministic SKIP', async () => {
    const jobAnalysis: JobAnalysis = {
      actualProblem: 'Build complete e-commerce website with payment and mobile app',
      technicalRequirements: ['Next.js', 'TypeScript', 'Node.js'],
      hiddenRequirements: [],
      deliverables: ['Entire SaaS platform'],
      seniority: 'EXPERT',
      projectMaturity: 'MVP',
      ambiguity: 'LOW',
      scopeComplexity: 'HIGH',
    };

    const fit = {
      matchScore: 90,
      positiveMatches: ['Next.js', 'TypeScript'],
      missingRequirements: [],
      redFlags: [],
    };

    const clientAnalysis: ClientAnalysis = {
      quality: 'UNKNOWN',
      spendingBehavior: 'UNKNOWN',
      hiringHistory: 'UNKNOWN',
      feedbackSummary: 'No history',
      riskSignals: [],
      isVerified: false,
    };

    const competitionAnalysis: CompetitionAnalysis = {
      interviewIntensity: 'UNKNOWN',
      jobAttractiveness: 'LOW',
      likelyCompetition: 'Unknown',
      biddingDifficulty: 'UNKNOWN',
    };

    const economicAnalysis: EconomicAnalysis = {
      status: 'OBSERVED',
      expectedValue: 30,
      budgetQuality: 'LOW',
      effortRisk: 'HIGH',
      opportunityCost: 'Terrible',
      clientRisk: 'UNKNOWN',
      rationale: '$30 is completely unreasonable for a full SaaS platform',
    };

    // Budget is $30, profile min is $1,000
    const decision = await decisionEngine.decide(
      jobAnalysis,
      clientAnalysis,
      competitionAnalysis,
      fit,
      economicAnalysis,
      profile,
      30
    );

    assert.equal(decision.recommendation, 'SKIP');
    assert.ok((decision.confidence ?? 0) >= 0.9);
    assert.ok(decision.unknowns?.some(u => u.includes('Client hiring history and reviews unavailable')));
  });
});
