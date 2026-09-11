import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    // If authenticated, look for their profile. Otherwise, fallback to the default global profile.
    const profileQuery = userId 
      ? { userId } 
      : { isDefault: true };

    const profile = await prisma.freelancerProfile.findFirst({
      where: profileQuery,
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
      if (userId) {
        // If a user has no profile, we can return null to signify they need to create one.
        return NextResponse.json({
          success: true,
          profile: null,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'No default profile found. Please run seed or create one.',
        }, { status: 404 });
      }
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Check if the user already has a profile
    const existing = await prisma.freelancerProfile.findFirst({
      where: { userId }
    });
    
    const targetId = existing?.id || data.id || undefined;

    const nextVersion = existing ? (existing.version || 1) + 1 : 1;

    const skillsStr = Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || '');
    const primarySkillsStr = Array.isArray(data.primarySkills) ? data.primarySkills.join(', ') : (data.primarySkills || '');
    const prefStr = Array.isArray(data.preferredTechnologies) ? data.preferredTechnologies.join(', ') : (data.preferredTechnologies || '');
    const exclStr = Array.isArray(data.excludedTechnologies) ? data.excludedTechnologies.join(', ') : (data.excludedTechnologies || '');
    const projectTypesStr = Array.isArray(data.preferredProjectTypes) ? data.preferredProjectTypes.join(', ') : (data.preferredProjectTypes || '');
    const industriesStr = Array.isArray(data.preferredIndustries) ? data.preferredIndustries.join(', ') : (data.preferredIndustries || '');

    const profileData = {
      name: data.name || 'Senior Freelancer',
      headline: data.headline || '',
      bio: data.bio || '',
      experienceYears: Number(data.experienceYears) || 5,
      skills: skillsStr,
      primarySkills: primarySkillsStr,
      preferredTechnologies: prefStr,
      excludedTechnologies: exclStr,
      preferredProjectTypes: projectTypesStr,
      preferredIndustries: industriesStr,
      location: data.location || '',
      availability: data.availability || '',
      targetHourlyRate: data.targetHourlyRate ? Number(data.targetHourlyRate) : null,
      minProjectBudget: data.minProjectBudget ? Number(data.minProjectBudget) : null,
      version: nextVersion,
      userId: userId,
      isDefault: false
    };

    let profile;
    if (targetId) {
      profile = await prisma.freelancerProfile.update({
        where: { id: targetId },
        data: profileData
      });
    } else {
      profile = await prisma.freelancerProfile.create({
        data: profileData
      });
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
