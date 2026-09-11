import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const opportunities = await prisma.opportunity.findMany({
      where: {
        userId,
        archived: false,
      },
      include: {
        jobPosting: true,
        decision: true,
        score: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: opportunities,
    });
  } catch (error: any) {
    console.error('[API /api/opportunities/history] GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

const archiveSchema = z.object({
  opportunityId: z.string(),
});

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const parsed = archiveSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Ensure the opportunity belongs to the user
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: parsed.data.opportunityId },
    });

    if (!opportunity) {
      return NextResponse.json({ success: false, error: 'Opportunity not found' }, { status: 404 });
    }

    if (opportunity.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Perform soft delete
    const updated = await prisma.opportunity.update({
      where: { id: parsed.data.opportunityId },
      data: { archived: true },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('[API /api/opportunities/history] PATCH Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to archive opportunity' },
      { status: 500 }
    );
  }
}
