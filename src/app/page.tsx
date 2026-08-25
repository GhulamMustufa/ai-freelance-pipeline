import { prisma } from '@/lib/prisma';
import Dashboard from '@/components/Dashboard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const jobs = await prisma.job.findMany({
    orderBy: { postedAt: 'desc' },
    include: { proposalDraft: true, client: true }
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      <Dashboard initialJobs={jobs} />
    </main>
  );
}
