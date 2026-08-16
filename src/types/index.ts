export interface RevenueRange {
  min: number;
  max: number;
  label: string;
}

export interface EmployeeRange {
  min: number;
  max: number;
  label: string;
}

export interface Mandate {
  id: string;
  title: string;
  status: 'Draft' | 'Approved';
  rawInput: string;
  objective: string;
  geography: string;
  targetIndustry: string;
  targetActivity: string;
  revenueRange: RevenueRange;
  employeeRange: EmployeeRange;
  ownershipPreference: string;
  successionPreference: string;
  industryExclusions: string[];
  otherRequirements: string;
  lastUpdated: string;
}

export type SourceStatus = 'VALIDATED' | 'NEEDS REVIEW' | 'REJECTED';

export interface ResearchSource {
  id: string;
  name: string;
  type: string;
  companiesFound: number;
  status: SourceStatus;
  url?: string;
  qualityScore: number;
  duplicatePercentage: number;
  notes?: string;
  sampleCompanies?: string[];
  rejectedReason?: string;
}

export interface ResearchGap {
  id: string;
  description: string;
  acknowledged: boolean;
}

export interface MarketMappingCategory {
  title: string;
  items: string[];
}

export interface ResearchStrategy {
  mandateId: string;
  status: 'Draft' | 'Approved';
  metrics: {
    researchQuestionsCompleted: number;
    researchQuestionsTotal: number;
    coveragePercentage: number;
    validatedSourcesCount: number;
    openGapsCount: number;
  };
  marketMapping: {
    description: string;
    categories: Record<string, string[]>;
    searchStrategy: string[];
  };
  sources: ResearchSource[];
  gaps: ResearchGap[];
  activities: string[];
}

export type FitLevel = 'HIGH FIT' | 'MEDIUM FIT' | 'LOW FIT';

// ─── Enrichment ───────────────────────────────────────────────────────────────

export type EnrichmentStatus = 'locked' | 'processing' | 'enriched';

export interface EnrichmentData {
  founderName: string;
  founderRole: string;
  managementTeam: string;
  contactPerson: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  bio: string;
  successionNote: string;
  age?: number | string;
  ageProof?: string;
  gender?: string;
  genderProof?: string;
  industryExperience?: string;
  experienceProof?: string;
  ownershipStake?: string;
  ownershipProof?: string;
  priorExits?: string;
  exitsProof?: string;
  education?: string;
  educationProof?: string;
  emailProof?: string;
  phoneProof?: string;
  additionalRequirementMatch?: {
    requirement: string;
    extractedValue: string;
    proofSource: string;
  };
}

export type PipelineStage = 'shortlisted' | 'contacted' | 'discussion' | 'due_diligence' | 'closing';

export interface Company {
  id: string;
  name: string;
  logoText?: string;
  location: string;
  industry: string;
  revenueRange: string;
  employeeRange: string;
  ownership: string;
  founded: number;
  fitLevel: FitLevel;
  fitScore: number;
  confidenceScore: number;
  whyItMatches: string;
  website: string;
  sourceName: string;
  description: string;
  pipelineStage?: PipelineStage;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  businessProfile: {
    keyProducts: string[];
    mainCustomers: string[];
    facilities: string;
  };
  acquisitionFit: {
    alignmentReason: string;
    successionRisk: string;
    financialHealth: string;
  };
  evidence: {
    sourcesUsed: string[];
    verificationStatus: 'VERIFIED' | 'UNVERIFIED';
    lastVerifiedDate: string;
  };
  /** Enrichment status — gated contact data only visible after payment */
  enrichmentStatus: EnrichmentStatus;
  enrichmentData?: EnrichmentData;
}

export interface CompanyFilter {
  search: string;
  industry: string;
  location: string;
  revenue: string;
  employees: string;
  ownership: string;
  fitLevel: string;
  confidence: string;
}

// ─── Outreach ─────────────────────────────────────────────────────────────────

export type OutreachChannel = 'email' | 'linkedin';

export type OutreachScriptType = 'professional' | 'founder' | 'direct';

export interface OutreachScript {
  type: OutreachScriptType;
  label: string;
  subject: string;
  body: string;
}

export interface OutreachSet {
  companyId: string;
  channel: OutreachChannel;
  scripts: OutreachScript[];
  generatedAt: string;
}
