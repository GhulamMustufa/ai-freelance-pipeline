'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateClientStatus(clientId: string, status: 'NEUTRAL' | 'FAVORITE' | 'BLACKLISTED', notes: string) {
  await prisma.client.update({
    where: { id: clientId },
    data: { status, notes }
  });
  
  revalidatePath('/');
}

export async function updateProposalDraft(jobId: string, content: string, status: string) {
  await prisma.proposalDraft.upsert({
    where: { jobId },
    update: { content, status },
    create: { jobId, content, status }
  });
  
  revalidatePath('/');
}
