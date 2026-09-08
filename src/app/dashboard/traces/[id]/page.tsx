import { prisma } from '../../../../lib/prisma';
import Link from 'next/link';
import { FeedbackForm } from './FeedbackForm';

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

  if (!opportunity) return <div>Trace not found.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h1 className="text-2xl font-bold mb-2">{opportunity.jobPosting?.title || 'Unknown Job'}</h1>
        <p className="text-gray-600 mb-4 text-sm">Opportunity ID: {opportunity.id}</p>
        <div className="flex gap-4">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold">{opportunity.status}</span>
          {opportunity.decision && (
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              opportunity.decision.recommendation === 'APPLY' ? 'bg-green-100 text-green-800' :
              opportunity.decision.recommendation === 'MAYBE' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Decision: {opportunity.decision.recommendation}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Execution Trace */}
        <div>
          <h2 className="text-xl font-bold mb-4">Pipeline Execution Trace</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {opportunity.pipelineRuns.map((run, i) => (
              <div key={run.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                  run.status === 'COMPLETED' ? 'bg-green-500' : run.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  <span className="text-white text-xs">{i+1}</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-gray-200 shadow-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-gray-800">{run.stage}</span>
                    <span className="text-xs text-gray-500">{new Date(run.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className={`text-sm ${run.status === 'FAILED' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                    {run.status} 
                    {run.completedAt && run.startedAt && ` (${new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()}ms)`}
                  </div>
                  {run.error && <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded">{run.error}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Telemetry Details */}
        <div>
          <h2 className="text-xl font-bold mb-4">Agent Telemetry</h2>
          <div className="space-y-4">
            {opportunity.agentRuns.map((agent) => (
              <div key={agent.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-800">{agent.agentName}</h3>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                    {agent.model}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500 block text-xs uppercase">Duration</span><span className="font-mono">{agent.durationMs}ms</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase">Tokens</span><span className="font-mono">{((agent.promptTokens||0) + (agent.completionTokens||0))}</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase">Schema Version</span><span className="font-mono">{agent.schemaVersion}</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase">Retries</span><span className="font-mono">{agent.retries}</span></div>
                  </div>
                  
                  {agent.error ? (
                    <div className="mt-4">
                      <span className="text-red-500 block text-xs uppercase mb-1">Error</span>
                      <pre className="text-xs bg-red-50 text-red-700 p-2 rounded overflow-x-auto">
                        {agent.error}
                      </pre>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <span className="text-gray-500 block text-xs uppercase mb-1">Output Payload</span>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto text-gray-700 max-h-48">
                        {agent.outputPayload ? JSON.stringify(JSON.parse(agent.outputPayload), null, 2) : 'null'}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {opportunity.agentRuns.length === 0 && (
              <p className="text-gray-500 italic">No agent runs recorded for this opportunity.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* AI Score & Proposal Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className="text-xl font-bold mb-4">AI Score Breakdown</h2>
          {opportunity.score ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm font-medium">Skill Match</span><span className="text-sm font-bold">{opportunity.score.skillMatch}/100</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{width: `${opportunity.score.skillMatch}%`}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm font-medium">Portfolio Fit</span><span className="text-sm font-bold">{opportunity.score.portfolioFit}/100</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{width: `${opportunity.score.portfolioFit}%`}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm font-medium">Project Quality</span><span className="text-sm font-bold">{opportunity.score.projectQuality}/100</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{width: `${opportunity.score.projectQuality}%`}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-sm font-medium">Long Term Potential</span><span className="text-sm font-bold">{opportunity.score.longTermPotential}/100</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{width: `${opportunity.score.longTermPotential}%`}}></div></div>
                </div>
                
                {opportunity.score.redFlags && JSON.parse(opportunity.score.redFlags).length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 text-red-800 rounded">
                    <span className="font-bold text-sm block mb-1">Red Flags</span>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {JSON.parse(opportunity.score.redFlags).map((flag: string, i: number) => <li key={i}>{flag}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No score calculated.</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Generated Proposal</h2>
          {opportunity.proposal ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
              <span className={`self-start mb-4 px-2 py-1 text-xs font-bold rounded ${opportunity.proposal.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {opportunity.proposal.status}
              </span>
              <div className="bg-gray-50 p-4 rounded text-sm text-gray-800 whitespace-pre-wrap flex-grow overflow-y-auto max-h-96">
                {opportunity.proposal.content}
              </div>
              
              {opportunity.proposal.evidenceUsed && JSON.parse(opportunity.proposal.evidenceUsed).length > 0 && (
                <div className="mt-4 text-xs text-gray-500">
                  <span className="font-bold">Evidence Cited:</span> {JSON.parse(opportunity.proposal.evidenceUsed).length} items from Knowledge Base
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No proposal generated.</p>
          )}
        </div>
      </div>

      <FeedbackForm 
        opportunityId={opportunity.id} 
        initialOutcome={opportunity.outcome} 
        initialFeedback={opportunity.feedback} 
      />
    </div>
  );
}
