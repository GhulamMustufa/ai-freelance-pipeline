import fs from 'fs';
import path from 'path';
import { RawOpportunityPayload } from '../src/domain/models';

export interface EvalCase {
  id: string;
  category: string;
  payload: RawOpportunityPayload;
  expected: {
    recommendation: 'APPLY' | 'MAYBE' | 'SKIP';
    hasRedFlags?: boolean;
    isHallucinationTrap?: boolean;
  };
}

const templates = [
  // Excellent match
  {
    category: 'excellent_match',
    expected: { recommendation: 'APPLY' as const, hasRedFlags: false },
    payload: {
      platform: 'upwork',
      title: 'Senior Node.js / React Backend Developer Needed',
      description: 'We need an experienced developer to build a scalable Node.js backend with Express and PostgreSQL. High budget, long term.',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'React'],
      budget: 10000,
      hourlyMin: 60,
      hourlyMax: 100,
      client: { totalSpend: 50000, avgHourlyRate: 70, hires: 15, feedbackScore: 4.9 }
    }
  },
  // Poor technical match
  {
    category: 'poor_technical_match',
    expected: { recommendation: 'SKIP' as const, hasRedFlags: false },
    payload: {
      platform: 'upwork',
      title: 'Rust Web3 Developer',
      description: 'Need an expert in Rust, Solana smart contracts, and Web3.',
      skills: ['Rust', 'Solana', 'Web3'],
      budget: 10000,
      hourlyMin: 80,
      hourlyMax: 150,
      client: { totalSpend: 50000, avgHourlyRate: 70, hires: 15, feedbackScore: 4.9 }
    }
  },
  // Excellent client / poor job
  {
    category: 'excellent_client_poor_job',
    expected: { recommendation: 'SKIP' as const, hasRedFlags: true },
    payload: {
      platform: 'upwork',
      title: 'Fix a typo on my HTML site',
      description: 'Just need someone to change a color and fix a typo. Will pay $5.',
      skills: ['HTML'],
      budget: 5,
      hourlyMin: 3,
      hourlyMax: 5,
      client: { totalSpend: 500000, avgHourlyRate: 80, hires: 150, feedbackScore: 5.0 }
    }
  },
  // Poor client / excellent technical match
  {
    category: 'poor_client_excellent_technical_match',
    expected: { recommendation: 'SKIP' as const, hasRedFlags: true },
    payload: {
      platform: 'upwork',
      title: 'Build a Node.js Backend immediately',
      description: 'Need a full Node.js express backend built right now. Do not bid if you want upfront payment. You will get paid after 1 month of testing.',
      skills: ['Node.js', 'Express', 'PostgreSQL'],
      budget: 5000,
      hourlyMin: 50,
      hourlyMax: 80,
      client: { totalSpend: 0, avgHourlyRate: 0, hires: 0, feedbackScore: 0 }
    }
  },
  // High competition
  {
    category: 'high_competition',
    expected: { recommendation: 'MAYBE' as const, hasRedFlags: false },
    payload: {
      platform: 'upwork',
      title: 'React Dashboard',
      description: 'Standard react dashboard. Many people applying.',
      skills: ['React', 'TypeScript'],
      budget: 1000,
      hourlyMin: 30,
      hourlyMax: 50,
      rawMetrics: { invites_sent: 50, interviewing: 10, avg_bid: 25 },
      client: { totalSpend: 5000, avgHourlyRate: 30, hires: 5, feedbackScore: 4.5 }
    }
  },
  // Hallucination Trap
  {
    category: 'hallucination_trap',
    expected: { recommendation: 'SKIP' as const, isHallucinationTrap: true },
    payload: {
      platform: 'upwork',
      title: 'Quantum Computing React Framework Developer',
      description: 'Must have 5 years of experience using the React QuantumQ framework for teleportation states.',
      skills: ['React QuantumQ', 'Teleportation API'],
      budget: 15000,
      hourlyMin: 100,
      hourlyMax: 200,
      client: { totalSpend: 50000, avgHourlyRate: 150, hires: 5, feedbackScore: 5.0 }
    }
  }
];

const dataset: EvalCase[] = [];

// Generate 30 cases by iterating and slightly modifying the base templates
for (let i = 0; i < 30; i++) {
  const template = templates[i % templates.length];
  
  // Deep clone
  const payload = JSON.parse(JSON.stringify(template.payload));
  payload.platformId = `eval-${i.toString().padStart(3, '0')}`;
  
  // Add slight variations so they aren't identical to the AI
  if (i >= templates.length) {
    payload.title = `${payload.title} (Variant ${i})`;
    if (payload.budget) payload.budget += (i * 100);
    if (payload.hourlyMin) payload.hourlyMin += (i % 5);
    if (payload.hourlyMax) payload.hourlyMax += (i % 5);
  }
  
  // Set required date
  payload.postedAt = new Date();

  dataset.push({
    id: payload.platformId,
    category: template.category,
    payload,
    expected: template.expected
  });
}

const dir = path.join(__dirname, '../evals/datasets');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(
  path.join(dir, 'v1.json'),
  JSON.stringify(dataset, null, 2)
);

console.log(`Generated ${dataset.length} evaluation cases at evals/datasets/v1.json`);
