import * as dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../src/lib/prisma';
import { AIProvider } from '../src/ai/provider';

async function seed() {
  console.log('🌱 Seeding Knowledge Base and Default Freelancer Profile...');

  // 1. Seed Default Freelancer Profile
  const defaultProfile = await prisma.freelancerProfile.upsert({
    where: { id: 'default-profile' },
    update: {
      name: 'Senior Full-Stack AI Engineer',
      headline: 'Senior Full-Stack & AI Systems Engineer (Next.js, TypeScript, LLMs)',
      bio: 'Senior Engineer with 8 years of experience building scalable SaaS applications, real-time web platforms, and multi-agent AI workflows. Specializes in Next.js App Router, TypeScript, Prisma/SQL, and anti-hallucination RAG pipelines.',
      experienceYears: 8,
      skills: 'Next.js, React, TypeScript, Node.js, PostgreSQL, Prisma, OpenAI, DeepSeek, Multi-Agent Systems, RAG, TailwindCSS, Docker, AWS',
      preferredTechnologies: 'Next.js, TypeScript, PostgreSQL, Prisma, OpenAI, DeepSeek, Node.js',
      excludedTechnologies: 'PHP, WordPress, Ruby on Rails, Magento, Web3, Smart Contracts',
      targetHourlyRate: 75,
      minProjectBudget: 1000,
      isDefault: true,
    },
    create: {
      id: 'default-profile',
      name: 'Senior Full-Stack AI Engineer',
      headline: 'Senior Full-Stack & AI Systems Engineer (Next.js, TypeScript, LLMs)',
      bio: 'Senior Engineer with 8 years of experience building scalable SaaS applications, real-time web platforms, and multi-agent AI workflows. Specializes in Next.js App Router, TypeScript, Prisma/SQL, and anti-hallucination RAG pipelines.',
      experienceYears: 8,
      skills: 'Next.js, React, TypeScript, Node.js, PostgreSQL, Prisma, OpenAI, DeepSeek, Multi-Agent Systems, RAG, TailwindCSS, Docker, AWS',
      preferredTechnologies: 'Next.js, TypeScript, PostgreSQL, Prisma, OpenAI, DeepSeek, Node.js',
      excludedTechnologies: 'PHP, WordPress, Ruby on Rails, Magento, Web3, Smart Contracts',
      targetHourlyRate: 75,
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
      title: 'Autonomous Multi-Agent AI Pipeline & Decision Engine',
      description: 'Architected and built an autonomous multi-agent pipeline using Next.js, TypeScript, DeepSeek, and OpenAI. Features automated opportunity evaluation, RAG semantic search, anti-hallucination claim verification, and SQLite/Prisma persistence.',
      technologies: 'Next.js, TypeScript, DeepSeek, OpenAI, Prisma, SQLite, RAG, Multi-Agent Systems',
      verification: 'Verified via GitHub Repository & Production Deployment',
      url: 'https://github.com/GhulamMustufa/ai-freelance-pipeline'
    },
    {
      evidenceId: 'EV-002',
      type: 'PROJECT',
      title: 'Real-time Analytics Dashboard for E-Commerce',
      description: 'Built a highly scalable real-time analytics dashboard that processes millions of events daily. Implemented using React on the frontend and Node.js/Express on the backend, with PostgreSQL for persistence and Redis for caching and pub/sub. Reduced data query latency by 40%.',
      technologies: 'React, Node.js, TypeScript, PostgreSQL, Redis, Docker, AWS',
      verification: 'Verified via GitHub commit history',
      url: 'https://github.com/example/analytics-dashboard'
    },
    {
      evidenceId: 'EV-003',
      type: 'PROJECT',
      title: 'Healthcare Patient Management System',
      description: 'Developed a HIPAA-compliant patient management system for a mid-sized clinic. The application features role-based access control, secure messaging, and appointment scheduling. Built a custom scheduling algorithm that reduced double-bookings to zero.',
      technologies: 'Next.js, TypeScript, Prisma, PostgreSQL, TailwindCSS',
      verification: 'Verified via Upwork Contract (Client rated 5/5)',
      url: 'https://upwork.com/example-contract'
    },
    {
      evidenceId: 'EV-004',
      type: 'TECHNOLOGY',
      title: 'Senior TypeScript & Node.js Developer',
      description: '8+ years of production experience building REST APIs, microservices, and GraphQL endpoints with Node.js and TypeScript. Deep understanding of event loop mechanics, memory profiling, and asynchronous programming patterns.',
      technologies: 'Node.js, TypeScript, Express, NestJS, Prisma',
      verification: 'Verified via 15+ completed client contracts'
    },
    {
      evidenceId: 'EV-005',
      type: 'ACHIEVEMENT',
      title: 'Cloud Infrastructure Optimization',
      description: 'Led a cloud infrastructure migration from Heroku to AWS (ECS + RDS). Implemented IaC using Terraform and set up complete CI/CD pipelines using GitHub Actions. Reduced monthly hosting costs by 65% while improving uptime.',
      technologies: 'AWS, Terraform, Docker, GitHub Actions, PostgreSQL',
      verification: 'Verified via Client Testimonial'
    },
    {
      evidenceId: 'EV-006',
      type: 'PROJECT',
      title: 'AI Customer Support Copilot & RAG Retrieval',
      description: 'Developed an intelligent support copilot using vector similarity search, streaming LLM completions, and automated escalation triggers. Integrated into Zendesk and Slack, resolving 42% of customer queries without human intervention.',
      technologies: 'Next.js, OpenAI API, Vector Embeddings, LangChain, TailwindCSS',
      verification: 'Verified via Live Production SaaS'
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
