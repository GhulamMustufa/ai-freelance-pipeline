import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import HistoryClient from './HistoryClient';

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) {
    return <div>Unauthorized</div>;
  }

  const opportunities = await prisma.opportunity.findMany({
    where: {
      userId,
      archived: false,
    },
    include: {
      jobPosting: true,
      decision: true,
      score: true,
      proposal: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return <HistoryClient initialData={opportunities as any} />;
}
