import { prisma } from '../../../../lib/prisma';
import Link from 'next/link';
import { FeedbackForm } from './FeedbackForm';
import Navigation from '@/components/Navigation';

export default async function TraceDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      jobPosting: true,
      pipelineRuns: { orderBy: { createdAt: 'asc' } },
      agentRuns: { orderBy: { createdAt: 'asc' } },
      decision: true,
      score: true,
      proposal: true,
      outcome: true,
      feedback: true
    }
  });

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Navigation />
        <div className="p-8 max-w-6xl mx-auto text-slate-600 dark:text-slate-400">Trace not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-200">
      <Navigation />
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold">
            ← Back to Dashboard
          </Link>
          <Link href="/dashboard/analyzer" className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-semibold">
            ⚡ Analyze Another Job →
          </Link>
        </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
        <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{opportunity.jobPosting?.title || 'Unknown Job'}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm font-mono">Opportunity ID: {opportunity.id}</p>
        <div className="flex gap-4">
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full text-sm font-semibold">{opportunity.status}</span>
          {opportunity.decision && (
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              opportunity.decision.recommendation === 'APPLY' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
              opportunity.decision.recommendation === 'MAYBE' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' :
              'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
            }`}>
              Decision: {opportunity.decision.recommendation}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Execution Trace */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Pipeline Execution Trace</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
            {opportunity.pipelineRuns.map((run, i) => (
              <div key={run.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                  run.status === 'COMPLETED' ? 'bg-emerald-500' : run.status === 'FAILED' ? 'bg-rose-500' : 'bg-blue-500'
                }`}>
                  <span className="text-white text-xs font-bold">{i+1}</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">{run.stage}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(run.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className={`text-sm ${run.status === 'FAILED' ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                    {run.status} 
                    {run.completedAt && run.startedAt && ` (${new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()}ms)`}
                  </div>
                  {run.error && <p className="text-xs text-rose-600 dark:text-rose-300 mt-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-2 rounded">{run.error}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Telemetry Details */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Agent Telemetry</h2>
          <div className="space-y-4">
            {opportunity.agentRuns.map((agent) => (
              <div key={agent.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-950/70 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{agent.agentName}</h3>
                  <span className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 shadow-sm font-mono">
                    {agent.model}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-500 dark:text-slate-400 block text-xs uppercase">Duration</span><span className="font-mono text-slate-800 dark:text-slate-200">{agent.durationMs}ms</span></div>
                    <div><span className="text-slate-500 dark:text-slate-400 block text-xs uppercase">Tokens</span><span className="font-mono text-slate-800 dark:text-slate-200">{((agent.promptTokens||0) + (agent.completionTokens||0))}</span></div>
                    <div><span className="text-slate-500 dark:text-slate-400 block text-xs uppercase">Schema Version</span><span className="font-mono text-slate-800 dark:text-slate-200">{agent.schemaVersion}</span></div>
                    <div><span className="text-slate-500 dark:text-slate-400 block text-xs uppercase">Retries</span><span className="font-mono text-slate-800 dark:text-slate-200">{agent.retries}</span></div>
                  </div>
                  
                  {agent.error ? (
                    <div className="mt-4">
                      <span className="text-rose-600 dark:text-rose-400 block text-xs uppercase mb-1">Error</span>
                      <pre className="text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 p-2 rounded overflow-x-auto border border-rose-200 dark:border-rose-900">
                        {agent.error}
                      </pre>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase mb-1">Output Payload</span>
                      <pre className="text-xs bg-slate-50 dark:bg-slate-950 p-2 rounded overflow-x-auto text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 max-h-48 font-mono">
                        {agent.outputPayload ? JSON.stringify(JSON.parse(agent.outputPayload), null, 2) : 'null'}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {opportunity.agentRuns.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 italic">No agent runs recorded for this opportunity.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* AI Score & Proposal Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">AI Score Breakdown</h2>
          {opportunity.score ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Skill Match</span><span className="text-sm font-bold text-slate-900 dark:text-white">{opportunity.score.skillMatch}/100</span></div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2"><div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{width: `${opportunity.score.skillMatch}%`}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Portfolio Fit</span><span className="text-sm font-bold text-slate-900 dark:text-white">{opportunity.score.portfolioFit}/100</span></div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2"><div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{width: `${opportunity.score.portfolioFit}%`}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Project Quality</span><span className="text-sm font-bold text-slate-900 dark:text-white">{opportunity.score.projectQuality}/100</span></div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2"><div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{width: `${opportunity.score.projectQuality}%`}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Long Term Potential</span><span className="text-sm font-bold text-slate-900 dark:text-white">{opportunity.score.longTermPotential}/100</span></div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2"><div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{width: `${opportunity.score.longTermPotential}%`}}></div></div>
                </div>
                
                {opportunity.score.redFlags && JSON.parse(opportunity.score.redFlags).length > 0 && (
                  <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900 rounded-xl">
                    <span className="font-bold text-sm block mb-1">Red Flags</span>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {JSON.parse(opportunity.score.redFlags).map((flag: string, i: number) => <li key={i}>{flag}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 italic">No score calculated.</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Generated Proposal</h2>
          {opportunity.proposal ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col">
              <span className={`self-start mb-4 px-2 py-1 text-xs font-bold rounded ${opportunity.proposal.status === 'SUBMITTED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                {opportunity.proposal.status}
              </span>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap flex-grow overflow-y-auto max-h-96">
                {opportunity.proposal.content}
              </div>
              
              {opportunity.proposal.evidenceUsed && JSON.parse(opportunity.proposal.evidenceUsed).length > 0 && (
                <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold">Evidence Cited:</span> {JSON.parse(opportunity.proposal.evidenceUsed).length} items from Knowledge Base
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 italic">No proposal generated.</p>
          )}
        </div>
      </div>

      <FeedbackForm 
        opportunityId={opportunity.id} 
        initialOutcome={opportunity.outcome} 
        initialFeedback={opportunity.feedback} 
      />
      </div>
    </div>
  );
}
