export enum Platform {
  UPWORK = 'UPWORK',
  LINKEDIN = 'LINKEDIN'
}

export enum OpportunityStatus {
  PENDING = 'PENDING',
  EVALUATING = 'EVALUATING',
  APPLIED = 'APPLIED',
  REJECTED = 'REJECTED'
}

export enum PipelineStage {
  INGEST = 'INGEST',
  NORMALIZE = 'NORMALIZE',
  DEDUPLICATE = 'DEDUPLICATE',
  ENRICH = 'ENRICH',
  ANALYZE = 'ANALYZE',
  SCORE = 'SCORE',
  DECIDE = 'DECIDE',
  PROPOSAL = 'PROPOSAL'
}

export enum PipelineStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum ClientStatus {
  NEUTRAL = 'NEUTRAL',
  FAVORITE = 'FAVORITE',
  BLACKLISTED = 'BLACKLISTED'
}

export enum DecisionRecommendation {
  APPLY = 'APPLY',
  MAYBE = 'MAYBE',
  SKIP = 'SKIP'
}

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED'
}

// Basic types for passing data through pipeline
export interface RawOpportunityPayload {
  platform: Platform;
  platformId: string;
  title: string;
  description: string;
  postedAt: Date;
  skills: string[];
  budget?: number;
  hourlyMin?: number;
  hourlyMax?: number;
  rawMetrics?: Record<string, any>;
  client?: {
    platformId?: string;
    location?: string;
    name?: string;
  };
}

export interface EnrichedOpportunityData extends RawOpportunityPayload {
  clientProfile?: {
    totalSpend: number;
    avgHourlyRate: number;
    feedbackScore: number;
    totalContracts: number;
    activeContracts: number;
  };
}
