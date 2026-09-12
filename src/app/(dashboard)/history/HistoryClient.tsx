'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

interface Opportunity {
  id: string;
  platform: string;
  createdAt: string;
  jobPosting?: {
    title: string;
    budget?: number;
    hourlyMin?: number;
    hourlyMax?: number;
  };
  decision?: {
    recommendation: string;
    confidence: number;
    reason: string;
  };
  score?: {
    skillMatch: number;
  };
  proposal?: {
    content: string;
  };
}

export default function HistoryClient({ initialData }: { initialData: Opportunity[] }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState<string | null>(null);



  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsArchiving(id);
      const res = await fetch('/api/opportunities/history', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to archive');
      
      // Remove from state
      setOpportunities((prev) => prev.filter((opp) => opp.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsArchiving(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-warning selection:text-slate-950 transition-colors duration-200">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl backdrop-blur-md">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Opportunity History
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Track your triage pipeline and review past analyses.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300">
              Total Analyzed: {opportunities.length}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-200 dark:border-red-500/20">
            ⚠️ {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-24 animate-pulse"></div>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <span className="text-4xl mb-4 grayscale opacity-50">📂</span>
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">No History Yet</h3>
            <p className="text-slate-500 dark:text-slate-500 max-w-sm text-sm">
              Jobs you analyze will appear here so you can track them over time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp) => {
              const rec = opp.decision?.recommendation || 'PENDING';
              const isExpanded = expandedId === opp.id;
              
              return (
                <div 
                  key={opp.id}
                  onClick={() => setExpandedId(isExpanded ? null : opp.id)}
                  className={`bg-white dark:bg-slate-900 border ${isExpanded ? 'border-warning/50 shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'} rounded-2xl overflow-hidden cursor-pointer transition-all duration-200`}
                >
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border ${
                        rec === 'APPLY' ? 'bg-success/10 text-success border-success/20' :
                        rec === 'MAYBE' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-danger/10 text-danger border-danger/20'
                      }`}>
                        {rec}
                      </div>
                      <div className="truncate">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {opp.jobPosting?.title || 'Unknown Title'}
                        </h3>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1">
                          <span>{new Date(opp.createdAt).toLocaleDateString()}</span>
                          {opp.score && <span>Match: {Math.round(opp.score.skillMatch)}%</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:ml-auto">
                      <button
                        onClick={(e) => handleArchive(opp.id, e)}
                        disabled={isArchiving === opp.id}
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-danger bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isArchiving === opp.id ? 'Archiving...' : 'Archive'}
                      </button>
                      <div className="text-slate-400 w-6 flex justify-center">
                        {isExpanded ? '▴' : '▾'}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Rationale</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                            {opp.decision?.reason || 'No reasoning available.'}
                          </p>
                        </div>
                        {opp.decision?.confidence && (
                          <div className="text-xs text-slate-500">
                            Agent Confidence: {Math.round(opp.decision.confidence * 100)}%
                          </div>
                        )}
                        {opp.proposal?.content ? (
                          <div className="pt-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generated Proposal</span>
                            <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-pre-wrap font-mono">
                              {opp.proposal.content}
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2">
                            <span className="text-xs text-slate-400 italic">No proposal generated for this opportunity.</span>
                          </div>
                        )}
                        <div className="pt-4 pb-2">
                          <Link 
                            href={`/dashboard/traces/${opp.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            View Full Trace Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
