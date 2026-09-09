export enum Platform {
  MANUAL = 'MANUAL',
  UPWORK = 'UPWORK',
  LINKEDIN = 'LINKEDIN',
  BATCH = 'BATCH'
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

// -----------------------------------------------------------------------------
// MVP DOMAIN MODELS: Normalized Opportunity & Freelancer Profile
// -----------------------------------------------------------------------------

export interface NormalizedOpportunity {
  id?: string;
  title: string;
  description: string;
  skills: string[];
  platform?: Platform | string;
  platformId?: string;
  postedAt?: Date;
  budget?: number;
  hourlyMin?: number;
  hourlyMax?: number;
  client?: {
    platformId?: string;
    location?: string;
    name?: string;
    totalSpend?: number;
    avgHourlyRate?: number;
    hires?: number;
    feedbackScore?: number;
  };
  rawMetrics?: Record<string, any>;
  sourceUrl?: string;
}

export interface FreelancerProfile {
  id: string;
  name: string;
  headline: string;
  bio: string;
  experienceYears: number;
  skills: string[];
  primarySkills?: string[];
  preferredTechnologies: string[];
  excludedTechnologies: string[];
  preferredProjectTypes?: string[];
  preferredIndustries?: string[];
  location?: string;
  availability?: string;
  targetHourlyRate?: number;
  minProjectBudget?: number;
  version?: number;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type EvidenceState = 'VERIFIED' | 'INFERRED' | 'UNKNOWN' | 'CONTRADICTED';
export type EvidenceSufficiency = 'SUFFICIENT' | 'PARTIAL' | 'INSUFFICIENT';

export interface StructuredEvidenceItem {
  claim: string;
  state: EvidenceState;
  evidenceId?: string;
  source?: string;
  notes?: string;
}

// Backward-compatible alias
export type RawOpportunityPayload = NormalizedOpportunity;

// -----------------------------------------------------------------------------
// MVP Agent Output Domain Models
// -----------------------------------------------------------------------------

export interface JobAnalysis {
  actualProblem: string;
  technicalRequirements: string[];
  seniority: 'JUNIOR' | 'MID' | 'SENIOR' | 'EXPERT';
  hiddenRequirements: string[];
  deliverables: string[];
  ambiguity: 'LOW' | 'MEDIUM' | 'HIGH';
  projectMaturity: 'IDEA' | 'MVP' | 'PRODUCTION' | 'LEGACY';
  scopeComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ClientAnalysis {
  quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  spendingBehavior: string;
  hiringHistory: string;
  feedbackSummary: string;
  riskSignals: string[];
  isVerified: boolean;
}

export interface CompetitionAnalysis {
  interviewIntensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  jobAttractiveness: 'LOW' | 'MEDIUM' | 'HIGH';
  likelyCompetition: string;
  biddingDifficulty: 'EASY' | 'MODERATE' | 'HARD' | 'UNKNOWN';
}

export interface FitAnalysis {
  matchScore: number; // 0-100
  positiveMatches: string[]; // Evidence-backed matches
  missingRequirements: string[];
  redFlags: string[];
  deterministicConstraintViolated?: boolean;
  violationReason?: string;
}

export interface EconomicAnalysis {
  status: 'OBSERVED' | 'ESTIMATED' | 'UNKNOWN';
  expectedValue: number;
  budgetQuality: 'LOW' | 'FAIR' | 'GOOD' | 'EXCELLENT' | 'UNKNOWN';
  effectiveHourlyRate?: number;
  effortRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  opportunityCost: string;
  clientRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  rationale: string;
}

export interface OpportunityDecision {
  recommendation: 'APPLY' | 'MAYBE' | 'SKIP';
  reason: string;
  reasons?: string[];
  confidence?: number;
  summary?: string;
  positiveEvidence?: string[];
  negativeEvidence?: string[];
  missingInformation?: string[];
  unknowns?: string[];
  risks?: string[];
  scores?: {
    technicalFit: number;
    economicQuality: number;
    clientRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
    scopeClarity: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  economics?: {
    status: 'OBSERVED' | 'ESTIMATED' | 'UNKNOWN';
    effectiveHourlyRate?: number;
    estimatedEffort?: string;
    rationale: string;
  };
  evidenceSufficiency?: EvidenceSufficiency;
  evidenceTaxonomy?: StructuredEvidenceItem[];
  policyVersion?: string;
  profileVersion?: number;
}

export type TriageResult = OpportunityDecision;

export interface EnrichedOpportunityData extends NormalizedOpportunity {
  clientProfile?: {
    totalSpend: number;
    avgHourlyRate: number;
    feedbackScore: number;
    totalContracts: number;
    activeContracts: number;
  };
}
