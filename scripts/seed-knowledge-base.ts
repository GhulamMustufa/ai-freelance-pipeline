import * as dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../src/lib/prisma';
import { AIProvider } from '../src/ai/provider';

async function seed() {
  console.log('🌱 Seeding Knowledge Base...');
  
  await prisma.freelancerEvidence.deleteMany();
  console.log('Cleared existing evidence.');

  const portfolioItems = [
    {
      type: 'PROJECT',
      title: 'Real-time Analytics Dashboard for E-Commerce',
      description: 'Built a highly scalable real-time analytics dashboard that processes millions of events daily. Implemented using React on the frontend and Node.js/Express on the backend, with PostgreSQL for persistence and Redis for caching and pub/sub. Reduced data query latency by 40%.',
      technologies: 'React, Node.js, TypeScript, PostgreSQL, Redis, Docker, AWS',
      verification: 'Verified via GitHub commit history',
      url: 'https://github.com/example/analytics-dashboard'
    },
    {
      type: 'PROJECT',
      title: 'Healthcare Patient Management System',
      description: 'Developed a HIPAA-compliant patient management system for a mid-sized clinic. The application features role-based access control, secure messaging, and appointment scheduling. Built a custom scheduling algorithm that reduced double-bookings to zero.',
      technologies: 'Next.js, TypeScript, Prisma, PostgreSQL, TailwindCSS',
      verification: 'Verified via Upwork Contract (Client rated 5/5)',
      url: 'https://upwork.com/example-contract'
    },
    {
      type: 'PROJECT',
      title: 'Cross-platform Mobile App for Logistics Delivery',
      description: 'Built a React Native mobile application for delivery drivers. The app includes real-time GPS tracking, barcode scanning, and offline-first capabilities using SQLite for local storage. Successfully deployed to both iOS App Store and Google Play Store.',
      technologies: 'React Native, TypeScript, SQLite, Google Maps API',
      verification: 'Verified via App Store presence',
      url: 'https://apps.apple.com/app/example'
    },
    {
      type: 'TECHNOLOGY',
      title: 'Senior TypeScript & Node.js Developer',
      description: '5+ years of production experience building REST APIs, microservices, and GraphQL endpoints with Node.js and TypeScript. Deep understanding of event loop mechanics, memory profiling, and asynchronous programming patterns.',
      technologies: 'Node.js, TypeScript, Express, NestJS',
      verification: 'Verified via 10+ completed projects'
    },
    {
      type: 'ACHIEVEMENT',
      title: 'Cloud Infrastructure Optimization',
      description: 'Led a cloud infrastructure migration from Heroku to AWS (ECS + RDS). Implemented IaC using Terraform and set up complete CI/CD pipelines using GitHub Actions. Reduced monthly hosting costs by 65% while improving uptime.',
      technologies: 'AWS, Terraform, Docker, GitHub Actions',
      verification: 'Verified via Client Testimonial'
    },
    {
      type: 'PROJECT',
      title: 'Autonomous Multi-Agent AI Pipeline & Decision Engine',
      description: 'Architected and built an autonomous multi-agent pipeline using Next.js, TypeScript, DeepSeek, and OpenAI. Features automated opportunity evaluation, RAG semantic search, anti-hallucination claim verification, and SQLite/Prisma persistence.',
      technologies: 'Next.js, TypeScript, DeepSeek, OpenAI, Prisma, SQLite, RAG, Multi-Agent Systems',
      verification: 'Verified via GitHub Repository & Production Deployment',
      url: 'https://github.com/GhulamMustufa/ai-freelance-pipeline'
    }
  ];

  for (const item of portfolioItems) {
    console.log(`Generating embedding for: ${item.title}...`);
    // Combine fields to generate a rich embedding
    const textToEmbed = `${item.title} ${item.description} ${item.technologies}`;
    let embeddingString = null;
    
    try {
      if (process.env.OPENAI_API_KEY) {
        const embedding = await AIProvider.generateEmbedding(textToEmbed);
        embeddingString = JSON.stringify(embedding);
      } else {
        console.warn('⚠️ OPENAI_API_KEY not found. Skipping embedding generation. RAG will not work effectively.');
      }
    } catch (e) {
      console.warn(`Failed to generate embedding for ${item.title}: ${e}`);
    }

    await prisma.freelancerEvidence.create({
      data: {
        ...item,
        embedding: embeddingString
      }
    });
  }

  console.log(`✅ Successfully seeded ${portfolioItems.length} portfolio items.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
