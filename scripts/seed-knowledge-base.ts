import 'dotenv/config';

import { prisma } from '../src/lib/prisma';
import { AIProvider } from '../src/ai/provider';

async function seed() {
  console.log('🌱 Seeding Knowledge Base and Default Freelancer Profile...');

  // 1. Seed Default Freelancer Profile
  const defaultProfile = await prisma.freelancerProfile.upsert({
    where: { id: 'default-profile' },
    update: {
      name: 'Ghulam Mustafa',
      headline: 'Senior Full-Stack & Mobile Engineer | AI Integration',
      bio: 'Senior Full-Stack Engineer with 5+ years architecting and shipping production SaaS platforms and mobile applications. Proven track record across the entire stack. Currently integrating AI-driven features at Lumida Wealth. Expert across React, Next.js, React Native, Node.js, TypeScript, PostgreSQL, and Firebase.',
      experienceYears: 5,
      skills: 'React.js, Next.js, TypeScript, JavaScript, TailwindCSS, React Native, Node.js, NestJS, Express.js, GraphQL, RESTful APIs, Prisma, Supabase, PostgreSQL, MongoDB, Firebase, AWS, Docker, OpenAI API',
      primarySkills: 'React.js, Next.js, TypeScript, JavaScript, TailwindCSS, React Native, Node.js, NestJS, Express.js, GraphQL, RESTful APIs, Prisma, Supabase, PostgreSQL, MongoDB, Firebase, AWS, Docker, OpenAI API',
      preferredTechnologies: 'React.js, Next.js, React Native, Node.js, TypeScript, PostgreSQL, Firebase, OpenAI API',
      excludedTechnologies: 'PHP, WordPress, Ruby on Rails, Magento, Web3, Smart Contracts',
      targetHourlyRate: 50,
      minProjectBudget: 1000,
      isDefault: true,
    },
    create: {
      id: 'default-profile',
      name: 'Ghulam Mustafa',
      headline: 'Senior Full-Stack & Mobile Engineer | AI Integration',
      bio: 'Senior Full-Stack Engineer with 5+ years architecting and shipping production SaaS platforms and mobile applications. Proven track record across the entire stack. Currently integrating AI-driven features at Lumida Wealth. Expert across React, Next.js, React Native, Node.js, TypeScript, PostgreSQL, and Firebase.',
      experienceYears: 5,
      skills: 'React.js, Next.js, TypeScript, JavaScript, TailwindCSS, React Native, Node.js, NestJS, Express.js, GraphQL, RESTful APIs, Prisma, Supabase, PostgreSQL, MongoDB, Firebase, AWS, Docker, OpenAI API',
      primarySkills: 'React.js, Next.js, TypeScript, JavaScript, TailwindCSS, React Native, Node.js, NestJS, Express.js, GraphQL, RESTful APIs, Prisma, Supabase, PostgreSQL, MongoDB, Firebase, AWS, Docker, OpenAI API',
      preferredTechnologies: 'React.js, Next.js, React Native, Node.js, TypeScript, PostgreSQL, Firebase, OpenAI API',
      excludedTechnologies: 'PHP, WordPress, Ruby on Rails, Magento, Web3, Smart Contracts',
      targetHourlyRate: 50,
      minProjectBudget: 1000,
      isDefault: true,
    }
  });

  console.log(`✅ Default Profile active: ${defaultProfile.name}`);

  // 2. Clean and Seed Evidence Items
  await prisma.freelancerEvidence.deleteMany();
  console.log('Cleared existing evidence.');

  const portfolioItems = [
    {
      evidenceId: 'EV-001',
      type: 'PROJECT',
      title: 'Lumida Wealth - AI-Powered Wealth Management SaaS',
      description: 'Architected and shipped investor-facing features including portfolio tracking, real-time data sync, and OAuth2 authentication across iOS, Android, and Web. Integrated LLM-powered insights and AI-driven data visualizations using OpenAI API.',
      technologies: 'React Native, Node.js, OpenAI API, CI/CD, WCAG 2.1',
      verification: 'Verified via Professional Experience (Aug 2025 – Jun 2026)',
      url: ''
    },
    {
      evidenceId: 'EV-002',
      type: 'PROJECT',
      title: 'Udhaar Book - Pakistan\'s #1 Digital Ledger',
      description: 'Owned end-to-end delivery of core ledger, credit management, and digital payment flows serving 100,000+ SMBs. Cut app load times by 40% through React Native lazy loading, FlatList virtualization, and Hermes engine tuning. Refactored data layer to WatermelonDB.',
      technologies: 'React Native, WatermelonDB, Hermes, Flipper',
      verification: 'Verified via Professional Experience (Jun 2022 – Jul 2025)',
      url: ''
    },
    {
      evidenceId: 'EV-003',
      type: 'PROJECT',
      title: 'Dastgyr - B2B E-Commerce Marketplace',
      description: 'Built the picker app from scratch as sole developer; contributed to retailer and driver app features processing 10,000+ orders per day with sub-200ms UI response times. Optimised Node.js, NestJS and PostgreSQL backend services reducing API response times by 50%.',
      technologies: 'React Native, Node.js, NestJS, PostgreSQL, Crashlytics',
      verification: 'Verified via Professional Experience (Jun 2021 – May 2022)',
      url: ''
    },
    {
      evidenceId: 'EV-004',
      type: 'PROJECT',
      title: 'Unilever Pakistan - Roll B2B Retail Platform',
      description: 'Maintained and scaled Roll, Unilever\'s mission-critical retail ordering app processing thousands of B2B transactions daily. Increased user engagement by 30% through targeted UX redesigns and sustained 99% app uptime via Sentry-based error monitoring.',
      technologies: 'React Native, Sentry, UX Design',
      verification: 'Verified via Client Project (Aug 2022 – Dec 2024)',
      url: ''
    }
  ];

  for (const item of portfolioItems) {
    console.log(`Generating embedding for: [${item.evidenceId}] ${item.title}...`);
    const textToEmbed = `${item.title} ${item.description} ${item.technologies}`;
    let embeddingString = null;
    
    try {
      if (process.env.OPENAI_API_KEY) {
        const embedding = await AIProvider.generateEmbedding(textToEmbed);
        embeddingString = JSON.stringify(embedding);
      } else {
        console.warn('⚠️ OPENAI_API_KEY not found. Storing without vector embedding (lexical fallback will be used).');
      }
    } catch (e) {
      console.warn(`Failed to generate embedding for ${item.title}: ${e}`);
    }

    await prisma.freelancerEvidence.create({
      data: {
        ...item,
        profileId: defaultProfile.id,
        embedding: embeddingString
      }
    });
  }

  console.log(`✅ Successfully seeded ${portfolioItems.length} portfolio items with standard EV IDs.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
