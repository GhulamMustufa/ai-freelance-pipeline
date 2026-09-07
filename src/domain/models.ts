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
export interface OpportunityDecision {
  recommendation: 'APPLY' | 'MAYBE' | 'SKIP';
  reason: string;
  confidence?: number;
  positiveEvidence?: string[];
  negativeEvidence?: string[];
  missingInformation?: string[];
}

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

// -----------------------------------------------------------------------------
// Phase 2: Specialized Agent Output Domain Models
// -----------------------------------------------------------------------------

export interface JobAnalysis {
  actualProblem: string;
  technicalRequirements: string[];
  seniority: 'JUNIOR' | 'MID' | 'SENIOR' | 'EXPERT';
  hiddenRequirements: string[];
  deliverables: string[];
  ambiguity: 'LOW' | 'MEDIUM' | 'HIGH';
  projectMaturity: 'IDEA' | 'MVP' | 'PRODUCTION' | 'LEGACY';
}

export interface ClientAnalysis {
  quality: 'LOW' | 'MEDIUM' | 'HIGH';
  spendingBehavior: string;
  hiringHistory: string;
  feedbackSummary: string;
  riskSignals: string[];
}

export interface CompetitionAnalysis {
  interviewIntensity: 'LOW' | 'MEDIUM' | 'HIGH';
  jobAttractiveness: 'LOW' | 'MEDIUM' | 'HIGH';
  likelyCompetition: string;
  biddingDifficulty: 'EASY' | 'MODERATE' | 'HARD';
}

export interface FitAnalysis {
  matchScore: number; // 0-100
  positiveMatches: string[]; // Evidence-backed matches
  missingRequirements: string[];
  redFlags: string[];
}

export interface EconomicAnalysis {
  expectedValue: number;
  budgetQuality: 'LOW' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  effortRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  opportunityCost: string;
  clientRisk: 'LOW' | 'MEDIUM' | 'HIGH';
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
