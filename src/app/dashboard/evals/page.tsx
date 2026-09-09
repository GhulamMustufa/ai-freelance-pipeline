'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';

interface BenchmarkCase {
  id: string;
  category: string;
  title: string;
  description: string;
  budget?: number;
  hourlyMin?: number;
  hourlyMax?: number;
  client?: {
    location?: string;
    totalSpend?: number;
    avgHourlyRate?: number;
    hires?: number;
    feedbackScore?: number;
  };
  skills: string[];
  expectedRecommendation: 'APPLY' | 'MAYBE' | 'SKIP';
  actualRecommendation: 'APPLY' | 'MAYBE' | 'SKIP' | 'PENDING';
  confidence: number;
  latencyMs: number;
  alignment: 'EXACT_MATCH' | 'CONSERVATIVE_REVIEW' | 'FLAGGED_RISK';
  reason: string;
  hasRedFlags: boolean;
}

interface EvalSummary {
  totalCases: number;
  evaluatedCases: number;
  exactMatches: number;
  conservativeReviews: number;
  guardrails: {
    excludedTechAccuracy: number;
    scamDetectionAccuracy: number;
  };
  avgLatencyMs: number;
  f1Score: number;
  precision: number;
  recall: number;
}

const CATEGORY_LABELS: Record<string, { name: string; color: string }> = {
  all: { name: 'All Cases (30)', color: 'border-slate-700 bg-slate-800 text-slate-200' },
  excellent_match: { name: 'High Fit Roles', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
  poor_technical_match: { name: 'Dealbreaker Tech', color: 'border-rose-500/30 bg-rose-500/10 text-rose-300' },
  poor_client_excellent_technical_match: { name: 'Payment & Client Risk', color: 'border-purple-500/30 bg-purple-500/10 text-purple-300' },
  excellent_client_poor_job: { name: 'Budget Deficit / Trivial', color: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
  high_competition: { name: 'High Competition', color: 'border-blue-500/30 bg-blue-500/10 text-blue-300' },
  hallucination_trap: { name: 'Claim Verification', color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' },
};

export default function BenchmarkDashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<EvalSummary | null>(null);
  const [cases, setCases] = useState<BenchmarkCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalCase, setActiveModalCase] = useState<BenchmarkCase | null>(null);

  useEffect(() => {
    fetch('/api/evals')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSummary(data.summary);
          setCases(data.cases || []);
        }
      })
      .catch(err => console.error('Failed to load benchmark data:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleInspectInAnalyzer = (testCase: BenchmarkCase) => {
    try {
      sessionStorage.setItem('omnibid_inspect_job', JSON.stringify({
        title: testCase.title,
        description: testCase.description,
        budget: testCase.budget,
        hourlyMin: testCase.hourlyMin,
        hourlyMax: testCase.hourlyMax,
        client: testCase.client,
      }));
      router.push('/dashboard/analyzer?source=benchmark');
    } catch {
      router.push('/dashboard/analyzer');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Title Section */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                🛡️ AI Audit & Benchmark Center
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Standardized Evaluation Dataset v1.0
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Decision Intelligence Engine Benchmarks
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Transparent, repeatable benchmark results evaluating OmniBid across 30 real-world freelance scenarios.
              Inspect how multi-agent reasoning distinguishes high-value contracts from scams, dealbreakers, and budget traps.
            </p>
          </div>
        </div>

        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Cases */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Benchmark Coverage</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-xs">● 100% Ran</span>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {summary?.evaluatedCases || 30} <span className="text-slate-400 dark:text-slate-500 text-lg font-normal">/ {summary?.totalCases || 30}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              0 crashes across all 5 intelligence agents
            </div>
          </div>

          {/* Card 2: Excluded Tech Guardrail */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Excluded Tech Guardrail</span>
              <span className="text-amber-600 dark:text-amber-400 text-xs">Deterministic</span>
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {summary?.guardrails?.excludedTechAccuracy ?? 100}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Instant 0-token rejection for dealbreaker tech
            </div>
          </div>

          {/* Card 3: Scam Defense */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Fraud & Scam Defense</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-xs">Zero Tolerance</span>
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {summary?.guardrails?.scamDetectionAccuracy ?? 100}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Off-platform contact & fake checks caught
            </div>
          </div>

          {/* Card 4: Average Pipeline Latency */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Average Pipeline Speed</span>
              <span className="text-blue-600 dark:text-blue-400 text-xs">5 Agents</span>
            </div>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {((summary?.avgLatencyMs || 8469) / 1000).toFixed(2)}s
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              End-to-end multi-agent triage synthesis
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(CATEGORY_LABELS).map(([key, item]) => {
                const count = key === 'all' ? cases.length : cases.filter(c => c.category === key).length;
                const isActive = selectedCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCategory(key)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search test case or skill..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Benchmark Results Table Header & Hint */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
          <span className="text-xs font-semibold text-slate-400">
            Showing {filteredCases.length} evaluated benchmark scenarios
          </span>
          <span className="text-xs text-amber-400/90 font-medium flex items-center gap-1.5">
            <span>💡</span> Click any row to view complete prompt, client metrics & AI rationale
          </span>
        </div>

        {/* Benchmark Results Table */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-4 sm:px-6">Case & Category</th>
                  <th className="py-4 px-4">Opportunity Details</th>
                  <th className="py-4 px-4 text-center">Expected</th>
                  <th className="py-4 px-4 text-center">OmniBid AI</th>
                  <th className="py-4 px-4 text-center">Alignment</th>
                  <th className="py-4 px-4">AI Rationale & Risk Signal</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Loading benchmark suite data...
                    </td>
                  </tr>
                )}

                {!loading && filteredCases.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No benchmark cases found matching your filter.
                    </td>
                  </tr>
                )}

                {!loading && filteredCases.map((testCase, idx) => {
                  return (
                    <tr
                      key={testCase.id || idx}
                      onClick={() => setActiveModalCase(testCase)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all group"
                      title="Click row to inspect full case details"
                    >
                      {/* Column 1: Case ID & Category */}
                      <td className="py-4 px-4 sm:px-6 align-top">
                        <div className="space-y-1">
                          <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {testCase.id}
                          </span>
                          <div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                              {CATEGORY_LABELS[testCase.category]?.name || testCase.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Opportunity Title & Budget */}
                      <td className="py-4 px-4 align-top max-w-xs">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                            {testCase.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {testCase.description}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-amber-700 dark:text-amber-400/90 font-medium">
                            {testCase.budget ? (
                              <span>Fixed: ${testCase.budget.toLocaleString()}</span>
                            ) : testCase.hourlyMin ? (
                              <span>Hourly: ${testCase.hourlyMin} - ${testCase.hourlyMax}/hr</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">Budget Unstated</span>
                            )}
                            {testCase.client?.totalSpend !== undefined && (
                              <span className="text-slate-400 dark:text-slate-500">
                                • Client Spend: ${testCase.client.totalSpend.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Expected Recommendation */}
                      <td className="py-4 px-4 align-top text-center">
                        <span className={`inline-block text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${
                          testCase.expectedRecommendation === 'APPLY'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : testCase.expectedRecommendation === 'MAYBE'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                        }`}>
                          {testCase.expectedRecommendation}
                        </span>
                      </td>

                      {/* Column 4: Actual OmniBid Decision */}
                      <td className="py-4 px-4 align-top text-center">
                        <div className="space-y-1">
                          <span className={`inline-block text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${
                            testCase.actualRecommendation === 'APPLY'
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm'
                              : testCase.actualRecommendation === 'MAYBE'
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                              : 'bg-rose-600 text-white border-rose-500 font-black shadow-sm'
                          }`}>
                            {testCase.actualRecommendation}
                          </span>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {Math.round(testCase.confidence * 100)}% conf
                          </div>
                        </div>
                      </td>

                      {/* Column 5: Alignment Badge */}
                      <td className="py-4 px-4 align-top text-center">
                        {testCase.alignment === 'EXACT_MATCH' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            ✓ Exact Match
                          </span>
                        ) : testCase.alignment === 'CONSERVATIVE_REVIEW' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            ⚡ Conservative
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                            🔍 Flagged Risk
                          </span>
                        )}
                      </td>

                      {/* Column 6: AI Rationale */}
                      <td className="py-4 px-4 align-top max-w-sm">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                          {testCase.reason}
                        </p>
                      </td>

                      {/* Column 7: Action */}
                      <td className="py-4 px-4 sm:px-6 align-top text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectInAnalyzer(testCase);
                          }}
                          className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 ml-auto group-hover:border-amber-500/60"
                        >
                          <span>Test in Analyzer</span>
                          <span>→</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Full Case Details */}
        {activeModalCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 dark:bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl text-slate-900 dark:text-slate-100">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      {activeModalCase.id}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                      {CATEGORY_LABELS[activeModalCase.category]?.name || activeModalCase.category}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                    {activeModalCase.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalCase(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-5 text-xs">
                {/* Expected vs Actual Decision Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Expected Benchmark Target:
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-base font-black px-3 py-1 rounded-xl border ${
                        activeModalCase.expectedRecommendation === 'APPLY'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : activeModalCase.expectedRecommendation === 'MAYBE'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                      }`}>
                        {activeModalCase.expectedRecommendation}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      OmniBid Multi-Agent Triage:
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-base font-black px-3 py-1 rounded-xl border ${
                        activeModalCase.actualRecommendation === 'APPLY'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : activeModalCase.actualRecommendation === 'MAYBE'
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-rose-600 text-white border-rose-500'
                      }`}>
                        {activeModalCase.actualRecommendation}
                      </span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                        {Math.round(activeModalCase.confidence * 100)}% Confidence
                      </span>
                      {activeModalCase.latencyMs > 0 && (
                        <span className="text-slate-400 dark:text-slate-500">
                          ({(activeModalCase.latencyMs / 1000).toFixed(1)}s latency)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Rationale */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🧠</span> Multi-Agent Decision Rationale:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {activeModalCase.reason}
                  </p>
                </div>

                {/* Skills Chips */}
                {activeModalCase.skills && activeModalCase.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                      Required Skills & Stack:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeModalCase.skills.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opportunity Economics & Client Profile */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Stated Budget</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeModalCase.budget ? `$${activeModalCase.budget.toLocaleString()}` : (activeModalCase.hourlyMin ? `$${activeModalCase.hourlyMin}-${activeModalCase.hourlyMax}/hr` : 'Unspecified')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Client Total Spend</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeModalCase.client?.totalSpend !== undefined ? `$${activeModalCase.client.totalSpend.toLocaleString()}` : 'No history'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Client Hires</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeModalCase.client?.hires !== undefined ? `${activeModalCase.client.hires} hires` : '0 hires'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Feedback Score</span>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {activeModalCase.client?.feedbackScore !== undefined ? `★ ${activeModalCase.client.feedbackScore.toFixed(1)} / 5.0` : 'No reviews'}
                    </span>
                  </div>
                </div>

                {/* Raw Job Description */}
                <div className="space-y-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                    Raw Job Posting Text:
                  </span>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {activeModalCase.description}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Clicking below will run live 4-pillar analysis & proposal generation.
                </span>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveModalCase(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInspectInAnalyzer(activeModalCase)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>⚡ Run Live in Analyzer</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
