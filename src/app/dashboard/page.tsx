import { prisma } from '../../lib/prisma';
import Link from 'next/link';

export default async function DashboardOverview() {
  const opportunities = await prisma.opportunity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      jobPosting: true,
      decision: true,
      pipelineRuns: {
        where: { stage: 'PROPOSAL' }
      }
    }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AI Pipeline Dashboard</h1>
      
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decision</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {opportunities.map((opp) => (
              <tr key={opp.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-md">
                    {opp.jobPosting?.title || 'Unknown Job'}
                  </div>
                  <div className="text-sm text-gray-500">{opp.platform} • {new Date(opp.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${opp.status === 'DECIDED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {opp.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {opp.decision ? (
                    <span className={`font-bold ${opp.decision.recommendation === 'APPLY' ? 'text-green-600' : opp.decision.recommendation === 'MAYBE' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {opp.decision.recommendation}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {opp.decision?.confidence ? `${Math.round(opp.decision.confidence * 100)}%` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/dashboard/traces/${opp.id}`} className="text-blue-600 hover:text-blue-900">
                    View Trace →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
