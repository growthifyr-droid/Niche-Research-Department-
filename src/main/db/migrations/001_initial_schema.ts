/**
 * Migration 001: Complete Initial Schema for Niche Research Department
 * 
 * FREEZES THE COMPLETE SQLite DATABASE SCHEMA FOR ALL 35 AGENTS ON DAY 1.
 * 
 * Strict Golden Rules Enforced:
 * 1. DATA ISOLATION: Every research data table contains nicheId.
 * 2. COUNTRY ISOLATION: Per-country research attaches to NicheCountry (nicheId + countryCode).
 * 3. FULL SCHEMA DAY 1: All 32 tables created now.
 * 4. Prepared-statement compatible, foreign keys enabled, indices on all relational joins.
 * 5. CreatedAt and UpdatedAt timestamps on every table.
 */

export const MIGRATION_001_VERSION = 1;
export const MIGRATION_001_NAME = '001_initial_schema';

export const MIGRATION_001_SQL = `
-- ============================================================================
-- 1. MIGRATION TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  appliedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 2. SYSTEM SETTINGS
-- Key-value configuration: API keys, themes, white-label credentials, defaults.
-- ============================================================================
CREATE TABLE IF NOT EXISTS Setting (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_setting_key ON Setting(key);

-- ============================================================================
-- 3. GLOBAL COUNTRY INTELLIGENCE (Seeded)
-- Bedrock data for the Country Potential Intelligence Agent (Agent #5).
-- ============================================================================
CREATE TABLE IF NOT EXISTS Country (
  countryCode TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  flag TEXT,
  internetUsers INTEGER,
  ecommerceSpendUSD REAL,
  rpmRangeLow REAL,
  rpmRangeHigh REAL,
  affiliateStrength REAL,
  languageFit TEXT,
  potentialScore REAL,
  tier TEXT CHECK (tier IN ('tier1', 'high-potential', 'emerging')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_country_tier ON Country(tier);
CREATE INDEX IF NOT EXISTS idx_country_potential ON Country(potentialScore DESC);

-- ============================================================================
-- 4. RESEARCH RUNS
-- Orchestrates autonomous department runs across discovery, own_niche, and own_domain.
-- ============================================================================
CREATE TABLE IF NOT EXISTS ResearchRun (
  id TEXT PRIMARY KEY,
  inputMode TEXT NOT NULL CHECK (inputMode IN ('discovery', 'own_niche', 'own_domain')),
  businessModes TEXT NOT NULL, -- JSON array of selected business models
  requestedQuantity INTEGER NOT NULL, -- 1, 10, 50, 100
  userNiche TEXT,
  userDomain TEXT,
  selectedCountries TEXT, -- JSON array of countryCodes or NULL for auto
  competitionLevel TEXT DEFAULT 'any' CHECK (competitionLevel IN ('low', 'medium', 'high', 'any')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'planning', 'discovery', 'awaiting_approval', 'deep_research', 'intelligence', 'reporting', 'completed', 'failed')),
  currentPhase TEXT,
  errorLog TEXT, -- JSON error details
  startedAt TEXT,
  completedAt TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_research_run_status ON ResearchRun(status);
CREATE INDEX IF NOT EXISTS idx_research_run_created_at ON ResearchRun(createdAt DESC);

-- ============================================================================
-- 5. ACTIVITY LOG
-- Live telemetry streaming event log for all 35 agents.
-- ============================================================================
CREATE TABLE IF NOT EXISTS ActivityLog (
  id TEXT PRIMARY KEY,
  runId TEXT,
  agentName TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT, -- JSON payload
  status TEXT NOT NULL CHECK (status IN ('started', 'success', 'failed', 'retry')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (runId) REFERENCES ResearchRun(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_log_run_id ON ActivityLog(runId);
CREATE INDEX IF NOT EXISTS idx_activity_log_agent_name ON ActivityLog(agentName);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON ActivityLog(createdAt DESC);

-- ============================================================================
-- 6. NICHE (Core Isolation Anchor)
-- Discovered or imported market opportunities.
-- ============================================================================
CREATE TABLE IF NOT EXISTS Niche (
  id TEXT PRIMARY KEY,
  runId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  businessModelFit TEXT, -- JSON
  whyRelevant TEXT,
  status TEXT NOT NULL CHECK (status IN ('discovered', 'screened', 'approved', 'rejected', 'in_research', 'completed')),
  rejectionReason TEXT,
  discoverySource TEXT NOT NULL CHECK (discoverySource IN ('discovery', 'own_niche', 'domain_fit')),
  domainFitReason TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (runId) REFERENCES ResearchRun(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_niche_run_id ON Niche(runId);
CREATE INDEX IF NOT EXISTS idx_niche_status ON Niche(status);
CREATE INDEX IF NOT EXISTS idx_niche_created_at ON Niche(createdAt DESC);

-- ============================================================================
-- 7. NICHE COUNTRY (Regional Isolation Anchor)
-- Isolates every country's research per niche.
-- ============================================================================
CREATE TABLE IF NOT EXISTS NicheCountry (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  countryCode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  potentialScore REAL,
  competitionLevel TEXT CHECK (competitionLevel IN ('low', 'medium', 'high')),
  competitionReason TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(nicheId, countryCode),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (countryCode) REFERENCES Country(countryCode) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_niche_country_niche_id ON NicheCountry(nicheId);
CREATE INDEX IF NOT EXISTS idx_niche_country_country_code ON NicheCountry(countryCode);

-- ============================================================================
-- 8. KEYWORDS (Deep Research Agent #6)
-- Seed, long-tail, and question keywords categorized by search intent.
-- ============================================================================
CREATE TABLE IF NOT EXISTS Keyword (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  keyword TEXT NOT NULL,
  type TEXT CHECK (type IN ('seed', 'long_tail', 'question')),
  intent TEXT CHECK (intent IN ('informational', 'commercial', 'transactional')),
  volumeEstimate INTEGER,
  difficulty REAL, -- 0 to 100
  cluster TEXT,
  localTerm TEXT, -- Country slang/variant
  serpStatus TEXT NOT NULL DEFAULT 'pending' CHECK (serpStatus IN ('pending', 'analyzed', 'failed')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_keyword_niche_id ON Keyword(nicheId);
CREATE INDEX IF NOT EXISTS idx_keyword_niche_country_id ON Keyword(nicheCountryId);
CREATE INDEX IF NOT EXISTS idx_keyword_intent ON Keyword(intent);
CREATE INDEX IF NOT EXISTS idx_keyword_cluster ON Keyword(cluster);

-- ============================================================================
-- 9. SERP RESULTS (Deep Research Agent #7)
-- Organic ranking pages and domain strength for target keywords.
-- ============================================================================
CREATE TABLE IF NOT EXISTS SerpResult (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  keywordId TEXT NOT NULL,
  position INTEGER NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  contentType TEXT,
  domainStrength REAL,
  screenshotPath TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (keywordId) REFERENCES Keyword(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_serp_result_niche_id ON SerpResult(nicheId);
CREATE INDEX IF NOT EXISTS idx_serp_result_keyword_id ON SerpResult(keywordId);

-- ============================================================================
-- 10. COMPETITORS (Deep Research Agent #8)
-- Full domain teardowns with monetization, content strategies, and SEO gaps.
-- ============================================================================
CREATE TABLE IF NOT EXISTS Competitor (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  domain TEXT NOT NULL,
  url TEXT,
  wordCountAvg INTEGER,
  headingStructure TEXT, -- JSON
  affiliateNetworks TEXT, -- JSON array
  adNetworks TEXT, -- JSON array
  socialProfiles TEXT, -- JSON
  postingFrequency TEXT,
  contentFormats TEXT, -- JSON
  emailCapture INTEGER DEFAULT 0, -- BOOLEAN
  opportunityScore REAL, -- 0-10
  teardown TEXT, -- JSON (9-field Gemini teardown)
  screenshotPath TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_competitor_niche_id ON Competitor(nicheId);
CREATE INDEX IF NOT EXISTS idx_competitor_niche_country_id ON Competitor(nicheCountryId);
CREATE INDEX IF NOT EXISTS idx_competitor_domain ON Competitor(domain);

-- ============================================================================
-- 11. COMPETITOR PAGES (Deep Research Agent #9)
-- Individual page analyses for top performing competitor URLs.
-- ============================================================================
CREATE TABLE IF NOT EXISTS CompetitorPage (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  competitorId TEXT NOT NULL,
  pageUrl TEXT NOT NULL,
  pageType TEXT CHECK (pageType IN ('serp_page', 'homepage', 'internal')),
  wordCount INTEGER,
  headings TEXT, -- JSON
  screenshotPath TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (competitorId) REFERENCES Competitor(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_competitor_page_niche_id ON CompetitorPage(nicheId);
CREATE INDEX IF NOT EXISTS idx_competitor_page_competitor_id ON CompetitorPage(competitorId);

-- ============================================================================
-- 12. CONTENT GAPS (Deep Research Agent #10)
-- Unanswered queries and missing topics across top competitors.
-- ============================================================================
CREATE TABLE IF NOT EXISTS ContentGap (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  keywordId TEXT,
  gapDescription TEXT NOT NULL,
  whatCompetitorsCover TEXT,
  whatIsMissing TEXT,
  howToTarget TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE,
  FOREIGN KEY (keywordId) REFERENCES Keyword(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_content_gap_niche_id ON ContentGap(nicheId);
CREATE INDEX IF NOT EXISTS idx_content_gap_niche_country_id ON ContentGap(nicheCountryId);

-- ============================================================================
-- 13. UNMET INTENTS (Deep Research Agent #11)
-- Frustrations and unanswered needs from Reddit, Quora, and Forums.
-- ============================================================================
CREATE TABLE IF NOT EXISTS UnmetIntent (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  intentDescription TEXT NOT NULL,
  source TEXT CHECK (source IN ('people_also_ask', 'related_searches', 'reddit', 'quora', 'forum')),
  sourceUrl TEXT,
  demandSignal TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_unmet_intent_niche_id ON UnmetIntent(nicheId);
CREATE INDEX IF NOT EXISTS idx_unmet_intent_niche_country_id ON UnmetIntent(nicheCountryId);

-- ============================================================================
-- 14. SOCIAL PROFILES (Deep Research Agent #12)
-- Social media presence and audience engagement across platforms.
-- ============================================================================
CREATE TABLE IF NOT EXISTS SocialProfile (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'facebook', 'pinterest')),
  accountName TEXT,
  url TEXT,
  followers INTEGER,
  engagementLevel TEXT,
  contentStyle TEXT,
  gapNotes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_social_profile_niche_id ON SocialProfile(nicheId);
CREATE INDEX IF NOT EXISTS idx_social_profile_niche_country_id ON SocialProfile(nicheCountryId);

-- ============================================================================
-- 15. PAID AD SIGNALS (Deep Research Agent #13)
-- Commercial viability indicators from Meta and Google Ad Libraries.
-- ============================================================================
CREATE TABLE IF NOT EXISTS PaidAdSignal (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'google')),
  advertiserName TEXT,
  adAngle TEXT,
  cpcSignal TEXT,
  adLibraryUrl TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_paid_ad_signal_niche_id ON PaidAdSignal(nicheId);
CREATE INDEX IF NOT EXISTS idx_paid_ad_signal_niche_country_id ON PaidAdSignal(nicheCountryId);

-- ============================================================================
-- 16. DIGITAL PRODUCTS (Deep Research Agent #14)
-- Market research on digital downloads, courses, templates, and ebooks.
-- ============================================================================
CREATE TABLE IF NOT EXISTS DigitalProduct (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('gumroad', 'etsy_digital', 'udemy', 'other')),
  productName TEXT NOT NULL,
  url TEXT,
  price REAL,
  demandSignal TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_digital_product_niche_id ON DigitalProduct(nicheId);
CREATE INDEX IF NOT EXISTS idx_digital_product_niche_country_id ON DigitalProduct(nicheCountryId);

-- ============================================================================
-- 17. PHYSICAL PRODUCTS (Deep Research Agent #15)
-- Market research on physical goods across Amazon, Daraz, AliExpress, and Etsy.
-- ============================================================================
CREATE TABLE IF NOT EXISTS PhysicalProduct (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('amazon', 'daraz', 'aliexpress', 'etsy', 'other')),
  productName TEXT NOT NULL,
  url TEXT,
  priceRange TEXT,
  demandSignal TEXT,
  competitionNotes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_physical_product_niche_id ON PhysicalProduct(nicheId);
CREATE INDEX IF NOT EXISTS idx_physical_product_niche_country_id ON PhysicalProduct(nicheCountryId);

-- ============================================================================
-- 18. PRODUCT LIST ITEMS (Deep Research Agent #16)
-- Prioritized roadmap of products to launch with research-backed sequencing.
-- ============================================================================
CREATE TABLE IF NOT EXISTS ProductListItem (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  productType TEXT NOT NULL CHECK (productType IN ('digital', 'physical')),
  productName TEXT NOT NULL,
  description TEXT,
  launchOrder INTEGER NOT NULL,
  launchReason TEXT NOT NULL,
  researchBasis TEXT, -- JSON supporting data
  batchNumber INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_list_item_niche_id ON ProductListItem(nicheId);
CREATE INDEX IF NOT EXISTS idx_product_list_item_niche_country_id ON ProductListItem(nicheCountryId);
CREATE INDEX IF NOT EXISTS idx_product_list_item_launch_order ON ProductListItem(launchOrder ASC);

-- ============================================================================
-- 19. AFFILIATE PROGRAMS (Deep Research Agent #17)
-- Affiliate networks, commission models, and payout rates for monetization.
-- ============================================================================
CREATE TABLE IF NOT EXISTS AffiliateProgram (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  programName TEXT NOT NULL,
  network TEXT CHECK (network IN ('amazon_associates', 'clickbank', 'shareasale', 'cj', 'impact', 'niche_specific')),
  commissionRate TEXT,
  cookieDuration TEXT,
  payoutModel TEXT,
  url TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_affiliate_program_niche_id ON AffiliateProgram(nicheId);
CREATE INDEX IF NOT EXISTS idx_affiliate_program_niche_country_id ON AffiliateProgram(nicheCountryId);

-- ============================================================================
-- 20. AD REVENUE DATA (Deep Research Agent #18)
-- Display advertising CPM/RPM estimations and network compatibility.
-- ============================================================================
CREATE TABLE IF NOT EXISTS AdRevenueData (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  estimatedRpmLow REAL,
  estimatedRpmHigh REAL,
  adSenseFit TEXT,
  mediavineRaptiveFit TEXT,
  countryRpmNotes TEXT,
  incomeEstimateNotes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ad_revenue_data_niche_id ON AdRevenueData(nicheId);
CREATE INDEX IF NOT EXISTS idx_ad_revenue_data_niche_country_id ON AdRevenueData(nicheCountryId);

-- ============================================================================
-- 21. PERSONAS (Deep Research Agent #19)
-- Deep psychological buyer profiles, pain points, desires, and hangouts.
-- ============================================================================
CREATE TABLE IF NOT EXISTS Persona (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  demographics TEXT, -- JSON
  painPoints TEXT, -- JSON
  desires TEXT, -- JSON
  buyingBehavior TEXT,
  onlineHangouts TEXT, -- JSON
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_persona_niche_id ON Persona(nicheId);
CREATE INDEX IF NOT EXISTS idx_persona_niche_country_id ON Persona(nicheCountryId);

-- ============================================================================
-- 22. GEO DATA (Deep Research Agent #20)
-- Country-specific nuances, languages, currencies, and search behaviors.
-- ============================================================================
CREATE TABLE IF NOT EXISTS GeoData (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  localLanguage TEXT,
  currency TEXT,
  localPlatforms TEXT, -- JSON
  localCompetitors TEXT, -- JSON
  culturalNotes TEXT,
  localSearchBehavior TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_geo_data_niche_id ON GeoData(nicheId);
CREATE INDEX IF NOT EXISTS idx_geo_data_niche_country_id ON GeoData(nicheCountryId);

-- ============================================================================
-- 23. DOMAIN SUGGESTIONS (Deep Research Agent #21)
-- Brandable domain names and social handle availability.
-- ============================================================================
CREATE TABLE IF NOT EXISTS DomainSuggestion (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  domainName TEXT NOT NULL,
  isAvailable INTEGER DEFAULT NULL, -- NULL until verified, 0 or 1
  registrarChecked TEXT,
  brandNameSuggestion TEXT,
  socialHandles TEXT, -- JSON
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_domain_suggestion_niche_id ON DomainSuggestion(nicheId);

-- ============================================================================
-- 24. COUNTRY BENCHMARK (Intelligence Agent #22)
-- Competition × Potential matrix across target regions.
-- ============================================================================
CREATE TABLE IF NOT EXISTS CountryBenchmark (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  countryCode TEXT NOT NULL,
  competitionLevel TEXT CHECK (competitionLevel IN ('low', 'medium', 'high')),
  potentialScore REAL,
  verdictReason TEXT,
  serpStrength REAL,
  competitorQuality REAL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (countryCode) REFERENCES Country(countryCode) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_country_benchmark_niche_id ON CountryBenchmark(nicheId);
CREATE INDEX IF NOT EXISTS idx_country_benchmark_country_code ON CountryBenchmark(countryCode);

-- ============================================================================
-- 25. OPPORTUNITY SCORE (Intelligence Agent #23)
-- Multi-dimensional composite algorithm scoring market viability (0-100).
-- ============================================================================
CREATE TABLE IF NOT EXISTS OpportunityScore (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  nicheCountryId TEXT NOT NULL,
  totalScore REAL NOT NULL,
  demandScore REAL,
  trendScore REAL,
  competitionScore REAL,
  monetizationScore REAL,
  contentGapScore REAL,
  weightingProfile TEXT, -- JSON
  breakdown TEXT, -- JSON
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE,
  FOREIGN KEY (nicheCountryId) REFERENCES NicheCountry(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_opportunity_score_niche_id ON OpportunityScore(nicheId);
CREATE INDEX IF NOT EXISTS idx_opportunity_score_niche_country_id ON OpportunityScore(nicheCountryId);

-- ============================================================================
-- 26. FINAL VERDICT (Intelligence Agent #24)
-- Objective go/no-go decisions with target/avoid country recommendations.
-- ============================================================================
CREATE TABLE IF NOT EXISTS FinalVerdict (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  verdictText TEXT NOT NULL,
  targetCountries TEXT, -- JSON array
  avoidCountries TEXT, -- JSON array
  honestNotes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_final_verdict_niche_id ON FinalVerdict(nicheId);

-- ============================================================================
-- 27. RISK FLAGS (Intelligence Agent #25)
-- YMYL, E-E-A-T, affiliate, and ad compliance risk audit flags.
-- ============================================================================
CREATE TABLE IF NOT EXISTS RiskFlag (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  flagType TEXT NOT NULL CHECK (flagType IN ('ymyl', 'eeat', 'ad_restriction', 'affiliate_restriction', 'platform_policy')),
  severity TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  description TEXT NOT NULL,
  recommendation TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_risk_flag_niche_id ON RiskFlag(nicheId);
CREATE INDEX IF NOT EXISTS idx_risk_flag_severity ON RiskFlag(severity);

-- ============================================================================
-- 28. REPORTS (Reporting & Handoff Agent #26)
-- Comprehensive 15-page dossier outputs rendered in English or Urdu.
-- ============================================================================
CREATE TABLE IF NOT EXISTS Report (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  title TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('english', 'urdu')),
  sections TEXT, -- JSON containing all 15 sections
  renderedHtmlPath TEXT,
  pdfPath TEXT,
  brandingConfig TEXT, -- JSON white-label branding
  status TEXT NOT NULL CHECK (status IN ('generating', 'completed', 'failed')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_report_niche_id ON Report(nicheId);
CREATE INDEX IF NOT EXISTS idx_report_status ON Report(status);

-- ============================================================================
-- 29. SEO HANDOFF PACKAGE (Reporting & Handoff Agent #27)
-- Machine-readable export bundle ready for immediate content pipeline execution.
-- ============================================================================
CREATE TABLE IF NOT EXISTS SeoHandoffPackage (
  id TEXT PRIMARY KEY,
  nicheId TEXT NOT NULL,
  packageData TEXT NOT NULL, -- JSON machine readable data
  status TEXT NOT NULL CHECK (status IN ('ready', 'exported')),
  exportedAt TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nicheId) REFERENCES Niche(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_seo_handoff_package_niche_id ON SeoHandoffPackage(nicheId);

-- ============================================================================
-- 30. CHAT MESSAGES (Consultant Chat Agent #28)
-- Dedicated AI consultant interaction logs with Department Head escalation.
-- ============================================================================
CREATE TABLE IF NOT EXISTS ChatMessage (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'consultant', 'system')),
  message TEXT NOT NULL,
  relatedNicheId TEXT,
  relatedRunId TEXT,
  forwardedToDepartmentHead INTEGER DEFAULT 0, -- BOOLEAN
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (relatedNicheId) REFERENCES Niche(id) ON DELETE SET NULL,
  FOREIGN KEY (relatedRunId) REFERENCES ResearchRun(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_message_niche_id ON ChatMessage(relatedNicheId);
CREATE INDEX IF NOT EXISTS idx_chat_message_run_id ON ChatMessage(relatedRunId);
CREATE INDEX IF NOT EXISTS idx_chat_message_created_at ON ChatMessage(createdAt ASC);

-- ============================================================================
-- 31. SCHEDULES (Autonomous Scheduler Agent #29)
-- Automated recurrent research runs.
-- ============================================================================
CREATE TABLE IF NOT EXISTS Schedule (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  criteria TEXT NOT NULL, -- JSON criteria
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  nextRunAt TEXT,
  lastRunAt TEXT,
  isActive INTEGER DEFAULT 1, -- BOOLEAN
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_schedule_is_active ON Schedule(isActive);
CREATE INDEX IF NOT EXISTS idx_schedule_next_run_at ON Schedule(nextRunAt ASC);

-- ============================================================================
-- 32. JARVIS REQUESTS (External API Gateway Agent #30)
-- Inbound API query log for remote programmatic department control.
-- ============================================================================
CREATE TABLE IF NOT EXISTS JarvisRequest (
  id TEXT PRIMARY KEY,
  apiKey TEXT,
  requestText TEXT NOT NULL,
  routedToDepartmentHead INTEGER DEFAULT 0, -- BOOLEAN
  responseText TEXT,
  status TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_jarvis_request_created_at ON JarvisRequest(createdAt DESC);
`;
