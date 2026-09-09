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
        error: 'No default profile found. Please run seed or create one.',
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
        skills: profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        primarySkills: profile.primarySkills ? profile.primarySkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        preferredTechnologies: profile.preferredTechnologies ? profile.preferredTechnologies.split(',').map(s => s.trim()).filter(Boolean) : [],
        excludedTechnologies: profile.excludedTechnologies ? profile.excludedTechnologies.split(',').map(s => s.trim()).filter(Boolean) : [],
        preferredProjectTypes: profile.preferredProjectTypes ? profile.preferredProjectTypes.split(',').map(s => s.trim()).filter(Boolean) : [],
        preferredIndustries: profile.preferredIndustries ? profile.preferredIndustries.split(',').map(s => s.trim()).filter(Boolean) : [],
        location: profile.location || '',
        availability: profile.availability || 'Immediate / Full-time',
        targetHourlyRate: profile.targetHourlyRate,
        minProjectBudget: profile.minProjectBudget,
        version: profile.version || 1,
        isDefault: profile.isDefault,
        evidenceItems: profile.evidenceItems,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
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
  return handleSaveProfile(req);
}

export async function PUT(req: NextRequest) {
  return handleSaveProfile(req);
}

async function handleSaveProfile(req: NextRequest) {
  try {
    const data = await req.json();

    const targetId = data.id || 'default-profile';
    const existing = await prisma.freelancerProfile.findUnique({
      where: { id: targetId }
    });

    const nextVersion = existing ? (existing.version || 1) + 1 : 1;

    const skillsStr = Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || '');
    const primarySkillsStr = Array.isArray(data.primarySkills) ? data.primarySkills.join(', ') : (data.primarySkills || '');
    const prefStr = Array.isArray(data.preferredTechnologies) ? data.preferredTechnologies.join(', ') : (data.preferredTechnologies || '');
    const exclStr = Array.isArray(data.excludedTechnologies) ? data.excludedTechnologies.join(', ') : (data.excludedTechnologies || '');
    const projectTypesStr = Array.isArray(data.preferredProjectTypes) ? data.preferredProjectTypes.join(', ') : (data.preferredProjectTypes || '');
    const industriesStr = Array.isArray(data.preferredIndustries) ? data.preferredIndustries.join(', ') : (data.preferredIndustries || '');

    const profile = await prisma.freelancerProfile.upsert({
      where: { id: targetId },
      update: {
        name: data.name || 'Senior Full-Stack AI Engineer',
        headline: data.headline || '',
        bio: data.bio || '',
        experienceYears: Number(data.experienceYears) || 5,
        skills: skillsStr,
        primarySkills: primarySkillsStr,
        preferredTechnologies: prefStr,
        excludedTechnologies: exclStr,
        preferredProjectTypes: projectTypesStr,
        preferredIndustries: industriesStr,
        location: data.location || null,
        availability: data.availability || null,
        targetHourlyRate: data.targetHourlyRate ? Number(data.targetHourlyRate) : null,
        minProjectBudget: data.minProjectBudget ? Number(data.minProjectBudget) : null,
        version: nextVersion,
        isDefault: true,
      },
      create: {
        id: targetId,
        name: data.name || 'Senior Full-Stack AI Engineer',
        headline: data.headline || '',
        bio: data.bio || '',
        experienceYears: Number(data.experienceYears) || 5,
        skills: skillsStr,
        primarySkills: primarySkillsStr,
        preferredTechnologies: prefStr,
        excludedTechnologies: exclStr,
        preferredProjectTypes: projectTypesStr,
        preferredIndustries: industriesStr,
        location: data.location || null,
        availability: data.availability || null,
        targetHourlyRate: data.targetHourlyRate ? Number(data.targetHourlyRate) : null,
        minProjectBudget: data.minProjectBudget ? Number(data.minProjectBudget) : null,
        version: 1,
        isDefault: true,
      }
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        headline: profile.headline,
        bio: profile.bio,
        experienceYears: profile.experienceYears,
        skills: profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        primarySkills: profile.primarySkills ? profile.primarySkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        preferredTechnologies: profile.preferredTechnologies ? profile.preferredTechnologies.split(',').map(s => s.trim()).filter(Boolean) : [],
        excludedTechnologies: profile.excludedTechnologies ? profile.excludedTechnologies.split(',').map(s => s.trim()).filter(Boolean) : [],
        preferredProjectTypes: profile.preferredProjectTypes ? profile.preferredProjectTypes.split(',').map(s => s.trim()).filter(Boolean) : [],
        preferredIndustries: profile.preferredIndustries ? profile.preferredIndustries.split(',').map(s => s.trim()).filter(Boolean) : [],
        location: profile.location || '',
        availability: profile.availability || '',
        targetHourlyRate: profile.targetHourlyRate,
        minProjectBudget: profile.minProjectBudget,
        version: profile.version,
        isDefault: profile.isDefault,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to save profile',
    }, { status: 500 });
  }
}
