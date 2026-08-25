import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { jobs } = await req.json();

    const savedJobs = [];
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';

    for (const job of jobs) {
      // Basic deduplication
      const existing = await prisma.job.findUnique({ where: { id: job.id } });
      if (existing) continue;

      // Extract client details
      const clientHistoryStr = job.client ? JSON.stringify(job.client) : null;
      
      const newJob = await prisma.job.create({
        data: {
          id: job.id,
          title: job.title,
          description: (job.snippet || job.description_snippet || job.description || '').replace(/<\/?untrusted_participant_content>/g, '').trim(),
          budget: job.budget ? parseFloat(job.budget) : null,
          hourlyMin: job.hourly_budget?.min ? parseFloat(job.hourly_budget.min) : null,
          hourlyMax: job.hourly_budget?.max ? parseFloat(job.hourly_budget.max) : null,
          skills: job.skills ? job.skills.map((s: any) => s.name || s).join(', ') : '',
          postedAt: new Date(job.created_date || job.created_on || Date.now()),
          clientHistory: clientHistoryStr,
          clientTotalSpend: typeof job.clientTotalSpend === 'string' ? parseFloat(job.clientTotalSpend) : (job.clientTotalSpend || null),
          clientTotalHours: typeof job.clientTotalHours === 'string' ? parseFloat(job.clientTotalHours) : (job.clientTotalHours || null),
          clientAvgHourlyRate: typeof job.clientAvgHourlyRate === 'string' ? parseFloat(job.clientAvgHourlyRate) : (job.clientAvgHourlyRate || null),
          clientTotalContracts: typeof job.clientTotalContracts === 'string' ? parseInt(job.clientTotalContracts) : (job.clientTotalContracts || null),
          clientActiveContracts: typeof job.clientActiveContracts === 'string' ? parseInt(job.clientActiveContracts) : (job.clientActiveContracts || null),
          clientFeedbackScore: typeof job.clientFeedbackScore === 'string' ? parseFloat(job.clientFeedbackScore) : (job.clientFeedbackScore || null),
          clientFeedbackCount: typeof job.clientFeedbackCount === 'string' ? parseInt(job.clientFeedbackCount) : (job.clientFeedbackCount || null),
          clientLocation: job.clientLocation || null,
          jobInvitesSent: typeof job.jobInvitesSent === 'string' ? parseInt(job.jobInvitesSent) : (job.jobInvitesSent || null),
          jobInterviewing: typeof job.jobInterviewing === 'string' ? parseInt(job.jobInterviewing) : (job.jobInterviewing || null),
          jobAvgBid: typeof job.jobAvgBid === 'string' ? parseFloat(job.jobAvgBid) : (job.jobAvgBid || null),
          jobConnectsCost: typeof job.jobConnectsCost === 'string' ? parseInt(job.jobConnectsCost) : (job.jobConnectsCost || null),
        }
      });
      
      savedJobs.push(newJob);

      // Async trigger AI scoring (fire and forget)
      fetch(`${protocol}://${host}/api/ai/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: newJob.id,
          title: newJob.title,
          description: newJob.description,
          budget: newJob.budget || newJob.hourlyMax || 'Unknown',
          clientTotalSpend: newJob.clientTotalSpend,
          clientAvgHourlyRate: newJob.clientAvgHourlyRate,
          clientFeedbackScore: newJob.clientFeedbackScore,
          clientTotalContracts: newJob.clientTotalContracts,
          jobInvitesSent: newJob.jobInvitesSent,
          jobInterviewing: newJob.jobInterviewing,
          jobAvgBid: newJob.jobAvgBid
        })
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, processed: savedJobs.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.stack : String(error) }, { status: 500 });
  }
}
