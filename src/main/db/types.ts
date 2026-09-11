/**
 * Niche Research Department - SQLite Database Types
 * Complete TypeScript interfaces matching the Day 1 frozen database schema.
 */

export interface SchemaVersionRecord {
  version: number;
  name: string;
  appliedAt: string;
}

export interface SettingRecord {
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export type CountryTier = 'tier1' | 'high-potential' | 'emerging';

export interface CountryRecord {
  countryCode: string; // e.g. 'US', 'PK', 'DE'
  name: string;
  flag: string;
  internetUsers: number;
  ecommerceSpendUSD: number;
  rpmRangeLow: number;
  rpmRangeHigh: number;
  affiliateStrength: number; // 0-10
  languageFit: string;
  potentialScore: number; // 0-100
  tier: CountryTier;
  createdAt: string;
  updatedAt: string;
}

export type ResearchInputMode = 'discovery' | 'own_niche' | 'own_domain';
export type BusinessMode = 'blogging' | 'affiliate' | 'ecommerce' | 'digital_products';
export type CompetitionFilter = 'low' | 'medium' | 'high' | 'any';
export type ResearchRunStatus =
  | 'pending'
  | 'planning'
  | 'discovery'
  | 'awaiting_approval'
  | 'deep_research'
  | 'intelligence'
  | 'reporting'
  | 'completed'
  | 'failed';

export interface ResearchRunRecord {
  id: string;
  inputMode: ResearchInputMode;
  businessModes: string; // JSON array: BusinessMode[]
  requestedQuantity: number; // 1, 10, 50, 100
  userNiche?: string | null;
  userDomain?: string | null;
  selectedCountries?: string | null; // JSON array of countryCodes or null
  competitionLevel?: CompetitionFilter | null;
  status: ResearchRunStatus;
  currentPhase?: string | null;
  errorLog?: string | null; // JSON
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ActivityLogStatus = 'started' | 'success' | 'failed' | 'retry';

export interface ActivityLogRecord {
  id: string;
  runId?: string | null;
  agentName: string;
  action: string;
  details?: string | null; // JSON
  status: ActivityLogStatus;
  createdAt: string;
  updatedAt: string;
}

export type NicheStatus =
  | 'discovered'
  | 'screened'
  | 'approved'
  | 'rejected'
  | 'in_research'
  | 'completed';

export type DiscoverySource = 'discovery' | 'own_niche' | 'domain_fit';

export interface NicheRecord {
  id: string;
  runId: string;
  name: string;
  description?: string | null;
  businessModelFit?: string | null; // JSON
  whyRelevant?: string | null;
  status: NicheStatus;
  rejectionReason?: string | null;
  discoverySource: DiscoverySource;
  domainFitReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NicheCountryRecord {
  id: string;
  nicheId: string;
  countryCode: string;
  status: string;
  potentialScore?: number | null;
  competitionLevel?: 'low' | 'medium' | 'high' | null;
  competitionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KeywordRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  keyword: string;
  type: 'seed' | 'long_tail' | 'question' | string;
  intent: 'informational' | 'commercial' | 'transactional' | string;
  volumeEstimate?: number | null;
  difficulty?: number | null; // 0-100
  cluster?: string | null;
  localTerm?: string | null;
  serpStatus: 'pending' | 'analyzed' | 'failed' | string;
  createdAt: string;
  updatedAt: string;
}

export interface SerpResultRecord {
  id: string;
  nicheId: string;
  keywordId: string;
  position: number;
  url: string;
  title?: string | null;
  contentType?: string | null;
  domainStrength?: number | null;
  screenshotPath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  domain: string;
  url?: string | null;
  wordCountAvg?: number | null;
  headingStructure?: string | null; // JSON
  affiliateNetworks?: string | null; // JSON array
  adNetworks?: string | null; // JSON array
  socialProfiles?: string | null; // JSON
  postingFrequency?: string | null;
  contentFormats?: string | null; // JSON
  emailCapture?: number | null; // 0 or 1
  opportunityScore?: number | null;
  teardown?: string | null; // JSON
  screenshotPath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorPageRecord {
  id: string;
  nicheId: string;
  competitorId: string;
  pageUrl: string;
  pageType: 'serp_page' | 'homepage' | 'internal' | string;
  wordCount?: number | null;
  headings?: string | null; // JSON
  screenshotPath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentGapRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  keywordId?: string | null;
  gapDescription: string;
  whatCompetitorsCover?: string | null;
  whatIsMissing?: string | null;
  howToTarget?: string | null;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export interface UnmetIntentRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  intentDescription: string;
  source?: 'people_also_ask' | 'related_searches' | 'reddit' | 'quora' | 'forum' | string | null;
  sourceUrl?: string | null;
  demandSignal?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialProfileRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'pinterest' | string;
  accountName?: string | null;
  url?: string | null;
  followers?: number | null;
  engagementLevel?: string | null;
  contentStyle?: string | null;
  gapNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaidAdSignalRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  platform: 'facebook' | 'google' | string;
  advertiserName?: string | null;
  adAngle?: string | null;
  cpcSignal?: string | null;
  adLibraryUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DigitalProductRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  platform: 'gumroad' | 'etsy_digital' | 'udemy' | 'other' | string;
  productName: string;
  url?: string | null;
  price?: number | null;
  demandSignal?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PhysicalProductRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  platform: 'amazon' | 'daraz' | 'aliexpress' | 'etsy' | 'other' | string;
  productName: string;
  url?: string | null;
  priceRange?: string | null;
  demandSignal?: string | null;
  competitionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItemRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  productType: 'digital' | 'physical' | string;
  productName: string;
  description?: string | null;
  launchOrder: number;
  launchReason: string;
  researchBasis?: string | null; // JSON
  batchNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateProgramRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  programName: string;
  network?: string | null;
  commissionRate?: string | null;
  cookieDuration?: string | null;
  payoutModel?: string | null;
  url?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdRevenueDataRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  estimatedRpmLow?: number | null;
  estimatedRpmHigh?: number | null;
  adSenseFit?: string | null;
  mediavineRaptiveFit?: string | null;
  countryRpmNotes?: string | null;
  incomeEstimateNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  demographics?: string | null; // JSON
  painPoints?: string | null; // JSON
  desires?: string | null; // JSON
  buyingBehavior?: string | null;
  onlineHangouts?: string | null; // JSON
  createdAt: string;
  updatedAt: string;
}

export interface GeoDataRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  localLanguage?: string | null;
  currency?: string | null;
  localPlatforms?: string | null; // JSON
  localCompetitors?: string | null; // JSON
  culturalNotes?: string | null;
  localSearchBehavior?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DomainSuggestionRecord {
  id: string;
  nicheId: string;
  domainName: string;
  isAvailable?: number | null; // 0, 1, or null
  registrarChecked?: string | null;
  brandNameSuggestion?: string | null;
  socialHandles?: string | null; // JSON
  createdAt: string;
  updatedAt: string;
}

export interface CountryBenchmarkRecord {
  id: string;
  nicheId: string;
  countryCode: string;
  competitionLevel?: 'low' | 'medium' | 'high' | string | null;
  potentialScore?: number | null;
  verdictReason?: string | null;
  serpStrength?: number | null;
  competitorQuality?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityScoreRecord {
  id: string;
  nicheId: string;
  nicheCountryId: string;
  totalScore: number; // 0-100
  demandScore?: number | null;
  trendScore?: number | null;
  competitionScore?: number | null;
  monetizationScore?: number | null;
  contentGapScore?: number | null;
  weightingProfile?: string | null; // JSON
  breakdown?: string | null; // JSON
  createdAt: string;
  updatedAt: string;
}

export interface FinalVerdictRecord {
  id: string;
  nicheId: string;
  verdictText: string;
  targetCountries?: string | null; // JSON
  avoidCountries?: string | null; // JSON
  honestNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RiskFlagRecord {
  id: string;
  nicheId: string;
  flagType: 'ymyl' | 'eeat' | 'ad_restriction' | 'affiliate_restriction' | 'platform_policy' | string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRecord {
  id: string;
  nicheId: string;
  title: string;
  language: 'english' | 'urdu';
  sections?: string | null; // JSON (15 pages' content)
  renderedHtmlPath?: string | null;
  pdfPath?: string | null;
  brandingConfig?: string | null; // JSON
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface SeoHandoffPackageRecord {
  id: string;
  nicheId: string;
  packageData: string; // JSON
  status: 'ready' | 'exported';
  exportedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageRecord {
  id: string;
  role: 'user' | 'consultant' | 'system';
  message: string;
  relatedNicheId?: string | null;
  relatedRunId?: string | null;
  forwardedToDepartmentHead?: number | null; // 0 or 1
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleRecord {
  id: string;
  name: string;
  criteria: string; // JSON
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRunAt?: string | null;
  lastRunAt?: string | null;
  isActive: number; // 0 or 1
  createdAt: string;
  updatedAt: string;
}

export interface JarvisRequestRecord {
  id: string;
  apiKey?: string | null;
  requestText: string;
  routedToDepartmentHead?: number | null; // 0 or 1
  responseText?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
