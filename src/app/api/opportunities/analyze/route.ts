import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OpportunityPipeline } from '@/application/pipeline/OpportunityPipeline';
import { Platform, NormalizedOpportunity, FreelancerProfile } from '@/domain/models';

const requestSchema = z.object({
  title: z.string().optional(),
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
  profile: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    headline: z.string().optional(),
    bio: z.string().optional(),
    experienceYears: z.number().optional(),
    skills: z.array(z.string()).optional(),
    preferredTechnologies: z.array(z.string()).optional(),
    excludedTechnologies: z.array(z.string()).optional(),
    targetHourlyRate: z.number().optional(),
    minProjectBudget: z.number().optional(),
  }).optional(),
  forceProposal: z.boolean().default(false),
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

    // 1. Derive title if only description is provided
    let title = data.title?.trim();
    if (!title) {
      const firstLine = data.description.split('\n')[0].replace(/^[#*\-•\s]+/, '').trim();
      title = firstLine.length > 5 && firstLine.length < 80 
        ? firstLine 
        : `Job Opportunity (${data.platform || 'MANUAL'})`;
    }

    // 2. Parse skills
    let skillsList: string[] = [];
    if (Array.isArray(data.skills)) {
      skillsList = data.skills.map(s => s.trim()).filter(Boolean);
    } else if (typeof data.skills === 'string') {
      skillsList = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    const platformId = `man-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const payload: NormalizedOpportunity = {
      platform: data.platform as Platform,
      platformId,
      title,
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

    let customProfile: FreelancerProfile | undefined = undefined;
    if (data.profile) {
      customProfile = {
        id: data.profile.id || 'custom-profile',
        name: data.profile.name || 'Custom Profile',
        headline: data.profile.headline || 'Software Engineer',
        bio: data.profile.bio || '',
        experienceYears: data.profile.experienceYears ?? 5,
        skills: data.profile.skills || [],
        preferredTechnologies: data.profile.preferredTechnologies || [],
        excludedTechnologies: data.profile.excludedTechnologies || [],
        targetHourlyRate: data.profile.targetHourlyRate ?? 75,
        minProjectBudget: data.profile.minProjectBudget ?? 1000,
      };
    }

    const pipeline = new OpportunityPipeline();
    const result = await pipeline.processJob(payload, { 
      profile: customProfile,
      forceProposal: data.forceProposal 
    });

    // Parse structured JSON fields for clean client consumption
    let parsedScores = null;
    let parsedEconomics = null;
    let parsedUnknowns: string[] = [];
    let parsedRisks: string[] = [];
    let parsedPositive: string[] = [];
    let parsedNegative: string[] = [];

    if (result?.decision) {
      try { parsedScores = result.decision.scoresJson ? JSON.parse(result.decision.scoresJson) : null; } catch {}
      try { parsedEconomics = result.decision.economicDetails ? JSON.parse(result.decision.economicDetails) : null; } catch {}
      try { parsedUnknowns = result.decision.unknowns ? JSON.parse(result.decision.unknowns) : []; } catch {}
      try { parsedRisks = result.decision.risks ? JSON.parse(result.decision.risks) : []; } catch {}
      try { parsedPositive = result.decision.positiveEvidence ? JSON.parse(result.decision.positiveEvidence) : []; } catch {}
      try { parsedNegative = result.decision.negativeEvidence ? JSON.parse(result.decision.negativeEvidence) : []; } catch {}
    }

    return NextResponse.json({
      success: true,
      opportunityId: result?.id,
      recommendation: result?.decision?.recommendation,
      confidence: result?.decision?.confidence,
      summary: result?.decision?.summary || result?.decision?.reason,
      reason: result?.decision?.reason,
      scores: parsedScores,
      economics: parsedEconomics,
      unknowns: parsedUnknowns,
      risks: parsedRisks,
      positiveEvidence: parsedPositive,
      negativeEvidence: parsedNegative,
      proposal: result?.proposal,
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
