import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default async function DashboardOverview() {
  const opportunities = await prisma.opportunity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      jobPosting: true,
      decision: true,
      score: true,
      proposal: true,
      pipelineRuns: {
        where: { stage: 'PROPOSAL' }
      }
    }
  });

  const totalCount = opportunities.length;
  const applyCount = opportunities.filter(o => o.decision?.recommendation === 'APPLY').length;
  const proposalsGenerated = opportunities.filter(o => !!o.proposal).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />

      <main className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header with Stats & Call to Action */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Autonomous Opportunities Pipeline
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Multi-agent reasoning, real-time client intelligence, and evidence-grounded proposals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/analyzer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm shadow-sm transition-all"
            >
              <span>⚡</span>
              <span>Analyze New Job</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Evaluated</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
            <div className="text-xs text-slate-500 mt-1">Opportunities ingested & reasoned</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">High-Fit (APPLY)</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{applyCount}</div>
            <div className="text-xs text-slate-500 mt-1">Met threshold for bid deployment</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">Proposals Verified</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">{proposalsGenerated}</div>
            <div className="text-xs text-slate-500 mt-1">Anti-hallucination verified drafts</div>
          </div>
        </div>

        {/* Opportunities Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Opportunities</h2>
            <span className="text-xs text-slate-500">Showing latest {opportunities.length} jobs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Decision</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Skill Match</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Proposal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {opportunities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-3">
                        <p className="text-base font-medium text-slate-800">No opportunities evaluated yet</p>
                        <p className="text-xs text-slate-500">
                          Use the Manual Job Analyzer to paste any job description and run the multi-agent AI pipeline.
                        </p>
                        <Link
                          href="/dashboard/analyzer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs shadow-sm hover:bg-amber-400 transition"
                        >
                          <span>⚡</span> Try Manual Job Analyzer
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  opportunities.map((opp) => {
                    const isManual = opp.platform === 'MANUAL' || opp.platformId.startsWith('manual-');
                    const hasProposal = !!opp.proposal;

                    return (
                      <tr key={opp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-900 truncate max-w-xs md:max-w-md">
                            {opp.jobPosting?.title || 'Untitled Opportunity'}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {new Date(opp.createdAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full border ${
                              isManual
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : opp.platform === 'LINKEDIN'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {isManual ? 'MANUAL' : opp.platform}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${
                              opp.status === 'DECIDED'
                                ? 'bg-slate-100 text-slate-800'
                                : 'bg-yellow-50 text-yellow-800'
                            }`}
                          >
                            {opp.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {opp.decision ? (
                            <span
                              className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                opp.decision.recommendation === 'APPLY'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : opp.decision.recommendation === 'MAYBE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {opp.decision.recommendation}
                              {opp.decision.confidence ? ` (${Math.round(opp.decision.confidence * 100)}%)` : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Pending</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {opp.score?.skillMatch !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${Math.min(100, Math.max(0, opp.score.skillMatch))}%` }}
                                />
                              </div>
                              <span className="font-semibold text-xs">{opp.score.skillMatch}%</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          {hasProposal ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              ✓ Ready
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/dashboard/traces/${opp.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Trace <span aria-hidden="true">&rarr;</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
