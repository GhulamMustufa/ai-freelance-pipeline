'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface Preset {
  label: string;
  badge: string;
  badgeColor: string;
  data: {
    title: string;
    description: string;
    platform: 'UPWORK' | 'LINKEDIN' | 'MANUAL';
    skills: string;
    budget?: number;
    hourlyMin?: number;
    hourlyMax?: number;
    client: {
      location: string;
      totalSpend: number;
      feedbackScore: number;
      hires: number;
    };
  };
}

const PRESETS: Preset[] = [
  {
    label: 'AI & Next.js Agent Engineer',
    badge: 'High Fit (APPLY)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    data: {
      title: 'Full-Stack AI Engineer — Next.js, Multi-Agent Systems & DeepSeek',
      description: `We are looking for a Senior AI & Full-Stack Engineer to architect an autonomous agent workflow. 
Requirements:
- Strong hands-on experience with Next.js App Router, TypeScript, and modern UI.
- Direct experience integrating LLM APIs (OpenAI, DeepSeek) and multi-agent routing.
- Knowledge of RAG pipelines, vector search, and anti-hallucination verification loops.
- Clean code architecture, database persistence (Prisma / SQL), and background worker orchestration.

Please provide examples of production AI systems or pipelines you have built.`,
      platform: 'UPWORK',
      skills: 'Next.js, TypeScript, OpenAI, DeepSeek, Multi-Agent Systems, RAG, Prisma',
      budget: 4500,
      hourlyMin: 60,
      hourlyMax: 85,
      client: {
        location: 'United States',
        totalSpend: 62000,
        feedbackScore: 4.95,
        hires: 24
      }
    }
  },
  {
    label: 'React & Webhook Integration',
    badge: 'Mid Tier (MAYBE)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    data: {
      title: 'React Developer to connect webhook endpoints and real-time dashboard',
      description: `Need a frontend developer to connect our webhook endpoints to a responsive React dashboard. 
The backend is already running on Node.js. Your job is to format tables, handle optimistic updates, and display real-time status notifications.
Budget is fixed at $800.`,
      platform: 'UPWORK',
      skills: 'React, TypeScript, TailwindCSS, REST API',
      budget: 800,
      hourlyMin: undefined,
      hourlyMax: undefined,
      client: {
        location: 'United Kingdom',
        totalSpend: 4200,
        feedbackScore: 4.6,
        hires: 4
      }
    }
  },
  {
    label: 'Unrealistic $30 Scope Task',
    badge: 'Low Quality (SKIP)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    data: {
      title: 'Need complete AI platform clone built in 24 hours cheap',
      description: `Clone complete freelance platform with full AI agents, payment gateway, mobile app, and backend. 
Total budget is $30. Must be finished by tomorrow morning. Do not bid higher or you will be reported.`,
      platform: 'UPWORK',
      skills: 'Python, AI, Mobile App, Everything',
      budget: 30,
      hourlyMin: undefined,
      hourlyMax: undefined,
      client: {
        location: 'Unknown',
        totalSpend: 0,
        feedbackScore: 2.1,
        hires: 0
      }
    }
  }
];

export default function ManualJobAnalyzerPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<'UPWORK' | 'LINKEDIN' | 'MANUAL'>('UPWORK');
  const [skills, setSkills] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [hourlyMin, setHourlyMin] = useState<string>('');
  const [hourlyMax, setHourlyMax] = useState<string>('');
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [clientLocation, setClientLocation] = useState('United States');
  const [clientTotalSpend, setClientTotalSpend] = useState('15000');
  const [clientFeedbackScore, setClientFeedbackScore] = useState('4.9');
  const [clientHires, setClientHires] = useState('8');
  const [forceProposal, setForceProposal] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const applyPreset = (preset: Preset) => {
    setTitle(preset.data.title);
    setDescription(preset.data.description);
    setPlatform(preset.data.platform);
    setSkills(preset.data.skills);
    setBudget(preset.data.budget ? String(preset.data.budget) : '');
    setHourlyMin(preset.data.hourlyMin ? String(preset.data.hourlyMin) : '');
    setHourlyMax(preset.data.hourlyMax ? String(preset.data.hourlyMax) : '');
    setClientLocation(preset.data.client.location);
    setClientTotalSpend(String(preset.data.client.totalSpend));
    setClientFeedbackScore(String(preset.data.client.feedbackScore));
    setClientHires(String(preset.data.client.hires));
    setShowClientDetails(true);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both a Job Title and Description.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentStage('Ingesting job details & initializing multi-agent pipeline...');

    // Progress simulation while server processes
    const stages = [
      'Normalizing job specifications & extracting technical ambiguity...',
      'Client Intelligence Agent analyzing client spend & hiring reputation...',
      'Freelancer Fit & Economic Agents calculating profit margins & match...',
      'Decision Engine weighing competitive signals & deciding viability...',
      'Retrieving verified knowledge base proof points & drafting proposal...',
      'Claim Verification Agent running anti-hallucination check...'
    ];

    let stageIdx = 0;
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setCurrentStage(stages[stageIdx]);
      }
    }, 2800);

    try {
      const res = await fetch('/api/opportunities/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          platform,
          skills,
          budget: budget ? parseFloat(budget) : undefined,
          hourlyMin: hourlyMin ? parseFloat(hourlyMin) : undefined,
          hourlyMax: hourlyMax ? parseFloat(hourlyMax) : undefined,
          client: showClientDetails ? {
            location: clientLocation,
            totalSpend: clientTotalSpend ? parseFloat(clientTotalSpend) : 0,
            feedbackScore: clientFeedbackScore ? parseFloat(clientFeedbackScore) : 0,
            hires: clientHires ? parseInt(clientHires, 10) : 0,
          } : undefined,
          forceProposal,
        }),
      });

      clearInterval(interval);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze opportunity');
      }

      setResult(data.opportunity);
      setCurrentStage('');
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setError(err.message || 'An unexpected error occurred during execution.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyProposal = () => {
    if (result?.proposal?.content) {
      navigator.clipboard.writeText(result.proposal.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <span>⚡ Interactive Sandbox</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Manual Job Analyzer
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Test the multi-agent decision engine against any job posting. Evaluate skill match, economic viability, red flags, and review an evidence-grounded proposal draft.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Load Sample Scenarios
            </span>
            <span className="text-xs text-slate-400">Click any card to pre-fill test data</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-left p-3.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {p.label}
                </div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {p.data.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Job Input Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Next.js & AI Agent Engineer"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            {/* Platform */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Platform Source
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition"
              >
                <option value="UPWORK">Upwork</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="MANUAL">Direct / Custom</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Job Description <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{description.length} characters</span>
            </div>
            <textarea
              required
              rows={7}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the full job posting text here..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono transition"
            />
          </div>

          {/* Skills & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Skills (Comma Separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Next.js, TypeScript, OpenAI"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fixed Budget ($)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 3500"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hourly Range ($/hr)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={hourlyMin}
                  onChange={(e) => setHourlyMin(e.target.value)}
                  placeholder="Min (e.g. 50)"
                  className="w-1/2 px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  min="0"
                  value={hourlyMax}
                  onChange={(e) => setHourlyMax(e.target.value)}
                  placeholder="Max (e.g. 80)"
                  className="w-1/2 px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Optional Client Intelligence Accordion */}
          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setShowClientDetails(!showClientDetails)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition"
            >
              <span>{showClientDetails ? '▼' : '▶'}</span>
              <span>Client Intelligence & Reputation Signals (Optional)</span>
            </button>

            {showClientDetails && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Client Country</label>
                  <input
                    type="text"
                    value={clientLocation}
                    onChange={(e) => setClientLocation(e.target.value)}
                    placeholder="United States"
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Total Spend ($)</label>
                  <input
                    type="number"
                    value={clientTotalSpend}
                    onChange={(e) => setClientTotalSpend(e.target.value)}
                    placeholder="25000"
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Feedback Rating (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={clientFeedbackScore}
                    onChange={(e) => setClientFeedbackScore(e.target.value)}
                    placeholder="4.9"
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Past Hires</label>
                  <input
                    type="number"
                    value={clientHires}
                    onChange={(e) => setClientHires(e.target.value)}
                    placeholder="12"
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Options & Action Button */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={forceProposal}
                onChange={(e) => setForceProposal(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <span>Generate & verify proposal even if decision is MAYBE or SKIP</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Processing Multi-Agent Pipeline...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Run Multi-Agent Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading Banner */}
        {isLoading && (
          <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md space-y-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <span className="text-sm font-bold tracking-wide text-amber-400 uppercase">
                Active Reasoning Pipeline
              </span>
            </div>
            <p className="text-sm font-mono text-slate-300">
              {currentStage || 'Executing agents...'}
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm space-y-1">
            <div className="font-bold">Execution Failed</div>
            <div>{error}</div>
          </div>
        )}

        {/* Results Showcase */}
        {result && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">Analysis Results & Synthesis</h2>
              <Link
                href={`/dashboard/traces/${result.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Inspect Telemetry Trace →
              </Link>
            </div>

            {/* Decision Hero Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg font-black px-4 py-1.5 rounded-full border ${
                      result.decision?.recommendation === 'APPLY'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : result.decision?.recommendation === 'MAYBE'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {result.decision?.recommendation || 'UNKNOWN'}
                  </span>
                  <div>
                    <div className="text-xs uppercase font-bold text-slate-400">Recommendation</div>
                    <div className="text-sm font-bold text-slate-800">
                      Confidence: {result.decision?.confidence ? `${Math.round(result.decision.confidence * 100)}%` : 'N/A'}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/dashboard/traces/${result.id}`}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  View Trace #{result.id.slice(0, 8)}
                </Link>
              </div>

              {result.decision?.reason && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900">Reasoning: </span>
                  {result.decision.reason}
                </div>
              )}
            </div>

            {/* Scores & Red Flags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Gauges */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Viability Scores</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Skill Match</span>
                      <span className="text-blue-600">{result.score?.skillMatch || 0}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.score?.skillMatch || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Portfolio Fit</span>
                      <span className="text-indigo-600">{result.score?.portfolioFit || 0}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.score?.portfolioFit || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Project Quality</span>
                      <span className="text-emerald-600">{result.score?.projectQuality || 0}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.score?.projectQuality || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Long-Term Potential</span>
                      <span className="text-purple-600">{result.score?.longTermPotential || 0}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.score?.longTermPotential || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Signals & Evidence */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Intelligence Signals</h3>
                  
                  {result.decision?.positiveEvidence && JSON.parse(result.decision.positiveEvidence)?.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-bold text-emerald-700 block mb-1">Positive Drivers:</span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                        {JSON.parse(result.decision.positiveEvidence).map((e: string, i: number) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.decision?.negativeEvidence && JSON.parse(result.decision.negativeEvidence)?.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-bold text-rose-700 block mb-1">Risk Signals / Negative Evidence:</span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                        {JSON.parse(result.decision.negativeEvidence).map((e: string, i: number) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(!result.decision?.positiveEvidence || JSON.parse(result.decision.positiveEvidence).length === 0) &&
                   (!result.decision?.negativeEvidence || JSON.parse(result.decision.negativeEvidence).length === 0) && (
                    <p className="text-xs text-slate-400 italic">No significant risk flags detected.</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                  <span>Multi-Agent Stages Completed:</span>
                  <span className="font-bold text-slate-800">{result.pipelineRuns?.length || 0} Runs</span>
                </div>
              </div>
            </div>

            {/* Proposal Section */}
            {result.proposal ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">
                        Evidence-Grounded Proposal Draft
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Synthesized from knowledge base proof points and verified against hallucinations.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyProposal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-slate-50 text-slate-700 text-xs font-bold transition"
                  >
                    {copied ? (
                      <>
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span className="text-emerald-600">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <span>📋</span>
                        <span>Copy Proposal</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {result.proposal.content}
                </div>

                {result.proposal.evidenceUsed && JSON.parse(result.proposal.evidenceUsed)?.length > 0 && (
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3.5 text-xs text-amber-900">
                    <span className="font-bold">Referenced Evidence Proof Points:</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-amber-800">
                      {JSON.parse(result.proposal.evidenceUsed).map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
                No proposal was generated for this opportunity (decision recommendation was {result.decision?.recommendation || 'SKIP'}).
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
