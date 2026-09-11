import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const { userId } = await auth();

  let initialProfile = null;

  if (userId) {
    initialProfile = await prisma.freelancerProfile.findFirst({
      where: { userId },
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
  }

  if (!initialProfile) {
    initialProfile = await prisma.freelancerProfile.findFirst({
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
  }

  const isFallback = initialProfile?.isDefault || false;

  return <ProfileClient initialProfile={initialProfile as any} isFallback={isFallback} />;
}
