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
          clientAvgPay: null, // Could parse this from history later
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
          budget: newJob.budget || newJob.hourlyMax || 'Unknown'
        })
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, processed: savedJobs.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.stack : String(error) }, { status: 500 });
  }
}
