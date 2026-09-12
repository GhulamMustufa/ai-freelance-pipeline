import { prisma } from '../../../../lib/prisma';
import Link from 'next/link';
import { FeedbackForm } from './FeedbackForm';
import Navigation from '@/components/Navigation';
import { auth } from '@clerk/nextjs/server';

export default async function TraceDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  if (id !== 'demo') {
    await auth.protect();
  }

  let opportunity: any = null;

  if (id === 'demo') {
    opportunity = {
      id: 'demo',
      status: 'PROPOSAL_DRAFTED',
      jobPosting: {
        title: 'Senior Next.js & AI Systems Engineer for SaaS Platform',
        description: 'We are looking for a Senior Next.js developer to build an AI platform...',
        budget: 15000,
        url: 'https://upwork.com/jobs/demo',
        clientHistory: { totalSpend: 50000, feedbackScore: 4.9 }
      },
      pipelineRuns: [
        { id: 'run-1', stage: 'JOB_INGESTION', status: 'COMPLETED', createdAt: new Date(Date.now() - 10000), startedAt: new Date(Date.now() - 10000), completedAt: new Date(Date.now() - 9000) },
        { id: 'run-2', stage: 'EVALUATION', status: 'COMPLETED', createdAt: new Date(Date.now() - 9000), startedAt: new Date(Date.now() - 9000), completedAt: new Date(Date.now() - 5000) },
        { id: 'run-3', stage: 'PROPOSAL_DRAFTING', status: 'COMPLETED', createdAt: new Date(Date.now() - 5000), startedAt: new Date(Date.now() - 5000), completedAt: new Date(Date.now() - 1000) }
      ],
      agentRuns: [
        {
          id: 'ar-1',
          agentName: 'IngestionAgent',
          model: 'gpt-4o-mini',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 10000),
          startedAt: new Date(Date.now() - 10000),
          completedAt: new Date(Date.now() - 9000),
          durationMs: 1000,
          schemaVersion: '1.0',
          retries: 0,
          promptTokens: 500,
          completionTokens: 50,
          inputPayload: JSON.stringify({ jobUrl: 'https://upwork.com/jobs/demo' }),
          outputPayload: JSON.stringify({ extractedSkills: ['Next.js', 'AI', 'TypeScript'] }),
          errorMessage: null,
        },
        {
          id: 'ar-2',
          agentName: 'DecisionAgent',
          model: 'gpt-4o-mini',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 9000),
          startedAt: new Date(Date.now() - 9000),
          completedAt: new Date(Date.now() - 5000),
          durationMs: 4000,
          schemaVersion: '1.0',
          retries: 0,
          promptTokens: 800,
          completionTokens: 200,
          inputPayload: JSON.stringify({ skills: ['Next.js', 'AI'] }),
          outputPayload: JSON.stringify({ recommendation: 'APPLY', confidence: 0.95 }),
          errorMessage: null,
        },
        {
          id: 'ar-3',
          agentName: 'DraftingAgent',
          model: 'gpt-4o-mini',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 5000),
          startedAt: new Date(Date.now() - 5000),
          completedAt: new Date(Date.now() - 1000),
          durationMs: 4000,
          schemaVersion: '1.0',
          retries: 0,
          promptTokens: 1200,
          completionTokens: 350,
          inputPayload: JSON.stringify({ decision: 'APPLY' }),
          outputPayload: JSON.stringify({ proposal: 'Hi there, I noticed you are looking for an AI & Full-Stack Engineer...' }),
          errorMessage: null,
        }
      ],
      decision: {
        recommendation: 'APPLY',
        confidence: 0.95,
        reason: 'This is a perfect match for your AI and Full-Stack background. The client has an excellent history and a realistic budget. It requires the exact stack you are an expert in (Next.js, TypeScript, AI APIs).',
        flags: []
      },
      score: {
        totalScore: 85,
        skillMatchScore: 90,
        clientQualityScore: 80,
        budgetScore: 85,
        competitionScore: 70
      },
      proposal: {
        id: 'prop-1',
        content: `Hi there,\n\nI noticed you're looking for an AI & Full-Stack Engineer to architect an autonomous agent workflow using Next.js and DeepSeek. This is exactly what I specialize in.\n\nRecently, I built a multi-agent orchestration pipeline using the Next.js App Router and Prisma, integrating OpenAI and DeepSeek to handle complex reasoning tasks and background verification loops. I understand the specific challenges around vector search, anti-hallucination guardrails, and managing streaming API states.\n\nGiven your requirements, I'd propose starting with a lightweight MVP to validate the multi-agent routing logic before scaling out the full feature set.\n\nI'd love to jump on a quick 15-minute call to discuss your specific architecture and see if I'm the right fit to bring this pipeline to life.\n\nBest,\nJane Doe`,
        strategy: 'Focus on your specific experience with Next.js App Router and DeepSeek. Mention anti-hallucination loops explicitly since they asked for it. End with a soft call-to-action for a technical chat.',
        status: 'DRAFT'
      },
      outcome: null,
      feedback: null
    };
  } else {
    opportunity = await prisma.opportunity.findUnique({
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
  }

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
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold">
            &larr; Back to Dashboard
          </Link>
          <Link href="/analyzer" className="text-warning hover:underline text-sm font-semibold">
            ⚡ Analyze Another Job →
          </Link>
        </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center flex-wrap gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{opportunity.jobPosting?.title || 'Unknown Job'}</h1>
              {opportunity.id === 'demo' && (
                <span className="px-2.5 py-0.5 bg-blue-500/20 border border-blue-500/50 text-blue-600 dark:text-blue-400 font-bold text-[10px] tracking-wider uppercase rounded-md shadow-sm">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-mono mt-1">Opportunity ID: {opportunity.id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full text-xs font-semibold">{opportunity.status}</span>
            {opportunity.decision && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                opportunity.decision.recommendation === 'APPLY' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                opportunity.decision.recommendation === 'MAYBE' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
              }`}>
                {opportunity.decision.recommendation} ({Math.round((opportunity.decision.confidence || 0) * 100)}% Conf)
              </span>
            )}
            {opportunity.decision?.evidenceSufficiency && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                opportunity.decision.evidenceSufficiency === 'SUFFICIENT' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900' :
                opportunity.decision.evidenceSufficiency === 'PARTIAL' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900' :
                'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
              }`}>
                Evidence: {opportunity.decision.evidenceSufficiency}
              </span>
            )}
          </div>
        </div>

        {/* Telemetry Overview Ribbon */}
        {(() => {
          const totalDuration = opportunity.agentRuns.reduce((acc, r) => acc + (r.durationMs || 0), 0);
          const totalTokens = opportunity.agentRuns.reduce((acc, r) => acc + (r.promptTokens || 0) + (r.completionTokens || 0), 0);
          const totalCost = opportunity.agentRuns.reduce((acc, r) => acc + (r.estimatedCost || 0), 0);
          
          return (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block uppercase font-medium">Policy Engine</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{opportunity.decision?.policyVersion || 'decision-policy@v1.1'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block uppercase font-medium">Profile Snapshot</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {opportunity.profileVersion ? `v${opportunity.profileVersion}` : 'v1.0 (Default)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block uppercase font-medium">Total Latency</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{totalDuration > 0 ? `${(totalDuration / 1000).toFixed(2)}s` : 'Deterministic Gate (<5ms)'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block uppercase font-medium">Total Tokens</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{totalTokens.toLocaleString()} tokens</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block uppercase font-medium">Estimated Cost</span>
                <span className="font-mono font-semibold text-success">${totalCost.toFixed(4)} USD</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Structured Evidence & 4-Tier Taxonomy Card */}
      {opportunity.decision?.evidenceTaxonomyJson && (() => {
        try {
          const items = JSON.parse(opportunity.decision.evidenceTaxonomyJson);
          if (Array.isArray(items) && items.length > 0) {
            return (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
                <h2 className="text-lg font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🔬</span> 4-Tier Evidence Taxonomy & Claim Verification
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((item: any, idx: number) => {
                    const badgeColor = 
                      item.state === 'VERIFIED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                      item.state === 'INFERRED' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' :
                      item.state === 'UNKNOWN' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                      'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';

                    return (
                      <div key={idx} className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${badgeColor}`}>
                        <div>
                          <div className="font-semibold">{item.claim}</div>
                          {item.notes && <div className="text-[11px] opacity-80 mt-1">{item.notes}</div>}
                          {item.source && <div className="text-[10px] opacity-70 mt-0.5">Source: {item.source}</div>}
                        </div>
                        <span className="font-mono font-bold uppercase tracking-wider text-[10px] shrink-0 px-1.5 py-0.5 rounded bg-white/60 dark:bg-slate-900/60">
                          {item.state}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
        } catch {
          return null;
        }
        return null;
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Execution Trace */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Pipeline Execution Trace</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
            {opportunity.pipelineRuns.map((run, i) => (
              <div key={run.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                  run.status === 'COMPLETED' ? 'bg-success' : run.status === 'FAILED' ? 'bg-danger' : 'bg-blue-500'
                }`}>
                  <span className="text-white text-xs font-bold">{i+1}</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">{run.stage}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(run.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className={`text-sm ${run.status === 'FAILED' ? 'text-danger font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                    {run.status} 
                    {run.completedAt && run.startedAt && ` (${new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()}ms)`}
                  </div>
                  {run.error && <p className="text-xs text-danger dark:text-rose-300 mt-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-2 rounded">{run.error}</p>}
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
                      <span className="text-danger block text-xs uppercase mb-1">Error</span>
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
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2"><div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{width: `${Math.min(100, Math.max(0, opportunity.score.skillMatch))}%`}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Portfolio Fit</span><span className="text-sm font-bold text-slate-900 dark:text-white">{opportunity.score.portfolioFit}/100</span></div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2"><div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{width: `${Math.min(100, Math.max(0, opportunity.score.portfolioFit))}%`}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Project Quality</span><span className="text-sm font-bold text-slate-900 dark:text-white">{opportunity.score.projectQuality}/100</span></div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2"><div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{width: `${Math.min(100, Math.max(0, opportunity.score.projectQuality))}%`}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm font-medium text-slate-700 dark:text-slate-300">Long Term Potential</span><span className="text-sm font-bold text-slate-900 dark:text-white">{opportunity.score.longTermPotential}/100</span></div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2"><div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{width: `${Math.min(100, Math.max(0, opportunity.score.longTermPotential))}%`}}></div></div>
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
