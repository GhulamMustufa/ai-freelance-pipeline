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
  // Existing placeholder
  await prisma.proposal.update({
    where: { opportunityId: jobId },
    data: { content, status }
  });
  revalidatePath('/');
}

import { FeedbackManager, OutcomeUpdate, FeedbackUpdate } from '@/application/analytics/FeedbackManager';

const feedbackManager = new FeedbackManager();

export async function logOpportunityFeedback(
  opportunityId: string, 
  outcome: OutcomeUpdate, 
  feedback: FeedbackUpdate
) {
  await feedbackManager.logOutcome(opportunityId, outcome);
  await feedbackManager.logFeedback(opportunityId, feedback);
  revalidatePath('/');
}
