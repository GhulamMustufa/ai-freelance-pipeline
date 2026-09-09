import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OpportunityPipeline } from '@/application/pipeline/OpportunityPipeline';
import { Platform, RawOpportunityPayload } from '@/domain/models';

const requestSchema = z.object({
  title: z.string().min(3, 'Title is required (at least 3 characters)'),
  description: z.string().min(10, 'Job description must be at least 10 characters'),
  platform: z.enum(['UPWORK', 'LINKEDIN', 'MANUAL']).default('MANUAL'),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  budget: z.number().nullable().optional(),
  hourlyMin: z.number().nullable().optional(),
  hourlyMax: z.number().nullable().optional(),
  client: z.object({
    name: z.string().optional(),
    location: z.string().optional(),
    totalSpend: z.number().optional(),
    avgHourlyRate: z.number().optional(),
    hires: z.number().optional(),
    feedbackScore: z.number().optional(),
  }).optional(),
  forceProposal: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: parsed.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Parse skills into array
    let skillsList: string[] = [];
    if (Array.isArray(data.skills)) {
      skillsList = data.skills.map(s => s.trim()).filter(Boolean);
    } else if (typeof data.skills === 'string') {
      skillsList = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (skillsList.length === 0) {
      skillsList = ['Software Engineering', 'Full Stack'];
    }

    const platformId = `manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const payload: RawOpportunityPayload = {
      platform: data.platform as Platform,
      platformId,
      title: data.title,
      description: data.description,
      postedAt: new Date(),
      skills: skillsList,
      budget: data.budget ?? undefined,
      hourlyMin: data.hourlyMin ?? undefined,
      hourlyMax: data.hourlyMax ?? undefined,
      client: data.client ? {
        platformId: `client-${platformId}`,
        name: data.client.name,
        location: data.client.location,
        totalSpend: data.client.totalSpend,
        avgHourlyRate: data.client.avgHourlyRate,
        hires: data.client.hires,
        feedbackScore: data.client.feedbackScore,
      } : undefined,
    };

    const pipeline = new OpportunityPipeline();
    const result = await pipeline.processJob(payload, { forceProposal: data.forceProposal });

    return NextResponse.json({
      success: true,
      opportunityId: result?.id,
      opportunity: result,
    });
  } catch (error: any) {
    console.error('[API /api/opportunities/analyze] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while processing the opportunity',
      },
      { status: 500 }
    );
  }
}
