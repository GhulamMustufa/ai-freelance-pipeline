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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navigation />

      <main className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header with Stats & Call to Action */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Autonomous Opportunities Pipeline
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-agent reasoning, real-time client intelligence, and evidence-grounded proposals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/analyzer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-warning hover:bg-warning text-slate-950 font-semibold text-sm shadow-sm transition-all"
            >
              <span>⚡</span>
              <span>Analyze New Job</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Evaluated</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Opportunities ingested & reasoned</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-success">High-Fit (APPLY)</div>
            <div className="text-2xl font-extrabold text-success mt-1">{applyCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Met threshold for bid deployment</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Proposals Verified</div>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{proposalsGenerated}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Anti-hallucination verified drafts</div>
          </div>
        </div>

        {/* Opportunities Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Opportunities</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Showing latest {opportunities.length} jobs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/70">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Decision</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Skill Match</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Proposal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/60">
                {opportunities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="max-w-sm mx-auto space-y-3">
                        <p className="text-base font-medium text-slate-800 dark:text-slate-200">No opportunities evaluated yet</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Use the Manual Job Analyzer to paste any job description and run the multi-agent AI pipeline.
                        </p>
                        <Link
                          href="/analyzer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-warning text-slate-950 font-semibold text-xs shadow-sm hover:bg-warning transition"
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
                      <tr key={opp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs md:max-w-md">
                            {opp.jobPosting?.title || 'Untitled Opportunity'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : opp.platform === 'LINKEDIN'
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {isManual ? 'MANUAL' : opp.platform}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${
                              opp.status === 'DECIDED'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                : 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300'
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
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                  : opp.decision.recommendation === 'MAYBE'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                              }`}
                            >
                              {opp.decision.recommendation}
                              {opp.decision.confidence ? ` (${Math.round(opp.decision.confidence * 100)}%)` : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs">Pending</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {opp.score?.skillMatch !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(100, Math.max(0, opp.score.skillMatch))}%` }}
                                />
                              </div>
                              <span className="font-semibold text-xs text-slate-900 dark:text-slate-200">{opp.score.skillMatch}%</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          {hasProposal ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                              ✓ Ready
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic">None</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/dashboard/traces/${opp.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
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
