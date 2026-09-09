import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const profile = await prisma.freelancerProfile.findFirst({
      where: { isDefault: true },
      include: {
        evidenceItems: {
          select: {
            id: true,
            evidenceId: true,
            type: true,
            title: true,
            description: true,
            technologies: true,
            url: true,
            verification: true,
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json({
        success: false,
        error: 'No default profile found. Please run seed.',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        headline: profile.headline,
        bio: profile.bio,
        experienceYears: profile.experienceYears,
        skills: profile.skills.split(',').map(s => s.trim()),
        preferredTechnologies: profile.preferredTechnologies.split(',').map(s => s.trim()),
        excludedTechnologies: profile.excludedTechnologies ? profile.excludedTechnologies.split(',').map(s => s.trim()).filter(Boolean) : [],
        targetHourlyRate: profile.targetHourlyRate,
        minProjectBudget: profile.minProjectBudget,
        isDefault: profile.isDefault,
        evidenceItems: profile.evidenceItems,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch profile',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const skillsStr = Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || '');
    const prefStr = Array.isArray(data.preferredTechnologies) ? data.preferredTechnologies.join(', ') : (data.preferredTechnologies || '');
    const exclStr = Array.isArray(data.excludedTechnologies) ? data.excludedTechnologies.join(', ') : (data.excludedTechnologies || '');

    const profile = await prisma.freelancerProfile.upsert({
      where: { id: data.id || 'default-profile' },
      update: {
        name: data.name || 'Senior Full-Stack AI Engineer',
        headline: data.headline || '',
        bio: data.bio || '',
        experienceYears: Number(data.experienceYears) || 5,
        skills: skillsStr,
        preferredTechnologies: prefStr,
        excludedTechnologies: exclStr,
        targetHourlyRate: data.targetHourlyRate ? Number(data.targetHourlyRate) : null,
        minProjectBudget: data.minProjectBudget ? Number(data.minProjectBudget) : null,
        isDefault: true,
      },
      create: {
        id: data.id || 'default-profile',
        name: data.name || 'Senior Full-Stack AI Engineer',
        headline: data.headline || '',
        bio: data.bio || '',
        experienceYears: Number(data.experienceYears) || 5,
        skills: skillsStr,
        preferredTechnologies: prefStr,
        excludedTechnologies: exclStr,
        targetHourlyRate: data.targetHourlyRate ? Number(data.targetHourlyRate) : null,
        minProjectBudget: data.minProjectBudget ? Number(data.minProjectBudget) : null,
        isDefault: true,
      }
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to save profile',
    }, { status: 500 });
  }
}
