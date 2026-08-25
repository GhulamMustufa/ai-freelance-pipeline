import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { jobId, description, title, clientStatus } = await req.json();

    const { text } = await generateText({
      model: google('gemini-3.6-flash'),
      prompt: `
You are an expert Upwork proposal writer for a senior full-stack engineer.
Write a highly converting, professional, and concise cover letter for the following job.

JOB DETAILS:
Title: ${title}
Description:
${description}

CLIENT STATUS (Your Memory): ${clientStatus || 'NEUTRAL'}
${clientStatus === 'FAVORITE' ? 'IMPORTANT: This is a FAVORITE client. Adopt a highly enthusiastic and accommodating tone.' : ''}

========================================
FREELANCER PROFILE & INSTRUCTIONS
========================================
- Core skills: React, Next.js, React Native, Node.js, NestJS, AI Integration, SaaS architecture.
- Tone: Confident, direct, and senior. Do NOT sound like an entry-level freelancer begging for a job.
- Structure:
  1. A strong opening hook that proves you read the description (no "Hi, I am excited to apply").
  2. A brief mention of your relevant experience (e.g. Udhaar Book, Lumida Wealth, or Dastgyr) with a concrete metric.
  3. A technical suggestion, question, or clear next step to start a conversation.
- Length: Max 3-4 short paragraphs. Busy clients don't read long essays.
- Do not invent experience or metrics.

Generate ONLY the exact text of the cover letter that the user will copy-paste into Upwork. Do not include quotes, markdown blocks, or filler like "Here is your cover letter".
`
    });

    const finalProposal = text.trim();

    // Save to database
    await prisma.proposalDraft.upsert({
      where: { jobId },
      update: { content: finalProposal, status: 'draft' },
      create: {
        jobId,
        content: finalProposal,
        status: 'draft'
      }
    });

    return NextResponse.json({ success: true, proposal: finalProposal });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
