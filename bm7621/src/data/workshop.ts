import type { Brand, ActivityKey } from '../types'

// ─── ACCESS CODES ────────────────────────────────────────────
export const WORKSHOP_CODES = {
  ALPHA24: { brand: 'ASOS' as Brand, name: 'Alpha Team' },
  BRAVO24: { brand: 'Ryanair' as Brand, name: 'Bravo Team' },
  CHARLIE24: { brand: 'Starbucks' as Brand, name: 'Charlie Team' },
  DELTA24: { brand: 'Coca-Cola' as Brand, name: 'Delta Team' },
  ECHO24: { brand: 'Samsung' as Brand, name: 'Echo Team' },
  FACILITATOR24: { brand: 'ASOS' as Brand, name: 'Facilitator' },
}

export const BRANDS: Brand[] = ['ASOS', 'Ryanair', 'Starbucks', 'Coca-Cola', 'Samsung']

// ─── DISPLAY NUMBERS (key → display number shown to students) ─
export const ACTIVITY_DISPLAY_NUM: Record<ActivityKey, number> = {
  a1: 1, a2: 2, a3: 3,
  a4: 4, a5: 5,
  a6: 6, a7: 7,
  a9: 8, a8: 9, a10: 10, a10b: 11,
  a11: 12, a12: 13, a12b: 14, a13: 15,
  a14: 16, a15: 17,
  a16: 18, a17: 19, a18: 20,
  sim1: 0, sim2: 0, sim3: 0, sim4: 0, sim5: 0,
}

// ─── ACTIVITY ORDERING ───────────────────────────────────────
export const ACTIVITY_ORDER: ActivityKey[] = [
  'a1', 'a2', 'a3', 'sim1',
  'a4', 'a5',
  'a6', 'a7', 'sim2',
  'a9', 'a8', 'a10', 'a10b',
  'a11', 'a12', 'a12b', 'sim4', 'a13', 'sim3',
  'a14', 'a15', 'sim5',
  'a16', 'a17', 'a18',
]

export const ACTIVITY_LABELS: Record<ActivityKey, string> = {
  a1: 'Human Seed List',
  a2: 'Intent Mapping',
  a3: 'SERP Visibility Challenge',
  sim1: 'Search Lab',
  a4: 'On-Page Mini Ad',
  a5: 'CTR Reality Check',
  a6: 'Technical Friction Hunt',
  a7: 'Technical Prioritisation Matrix',
  sim2: 'Conversion Lab',
  a9: 'E-E-A-T Audit',
  a8: 'Topic Cluster Builder',
  a10: 'Local SEO Challenge',
  a10b: 'Content Makeover Challenge',
  a11: 'Will The Ads Serve?',
  a12: 'Negative Keyword Challenge',
  a12b: 'Writing a Search Ad',
  a13: 'Budget Allocation Challenge',
  sim3: 'ROAS Lab',
  a14: 'Campaign Diagnosis',
  a15: 'Search Console Investigation',
  sim4: 'Analytics Lab 1',
  sim5: 'Analytics Lab 2',
  a16: 'AI Visibility Audit',
  a17: 'AI vs Human Advantage',
  a18: 'Board Decision Challenge',
}

export const BLOCK_STRUCTURE = [
  { id: 1, label: 'SEO Foundations', activities: ['a1', 'a2', 'a3', 'sim1'] as ActivityKey[], color: 'blue' },
  { id: 2, label: 'Understanding Search', activities: ['a4', 'a5'] as ActivityKey[], color: 'teal' },
  { id: 3, label: 'Technical SEO', activities: ['a6', 'a7', 'sim2'] as ActivityKey[], color: 'purple' },
  { id: 4, label: 'Content Optimisation', activities: ['a9', 'a8', 'a10', 'a10b'] as ActivityKey[], color: 'blue' },
  { id: 5, label: 'Google Ads', activities: ['a11', 'a12', 'a12b', 'sim4', 'a13', 'sim3'] as ActivityKey[], color: 'amber' },
  { id: 6, label: 'Measurement', activities: ['a14', 'a15', 'sim5'] as ActivityKey[], color: 'teal' },
  { id: 7, label: 'AI & Strategy', activities: ['a16', 'a17', 'a18'] as ActivityKey[], color: 'purple' },
]

// ─── INTENT MAPPING ANSWER KEYS ──────────────────────────────
export const INTENT_KEYS: Record<Brand, Array<{ kw: string; intent: string }>> = {
  ASOS: [
    { kw: 'asos', intent: 'Navigational' },
    { kw: "women's dresses online", intent: 'Commercial' },
    { kw: 'how to style a blazer', intent: 'Informational' },
    { kw: 'buy jeans online uk', intent: 'Transactional' },
  ],
  Ryanair: [
    { kw: 'ryanair', intent: 'Navigational' },
    { kw: 'cheap flights europe', intent: 'Commercial' },
    { kw: 'how to check in online ryanair', intent: 'Informational' },
    { kw: 'book flight london berlin', intent: 'Transactional' },
  ],
  Starbucks: [
    { kw: 'starbucks', intent: 'Navigational' },
    { kw: 'best coffee drinks', intent: 'Commercial' },
    { kw: 'how many calories in a latte', intent: 'Informational' },
    { kw: 'order starbucks online uk', intent: 'Transactional' },
  ],
  'Coca-Cola': [
    { kw: 'coca-cola', intent: 'Navigational' },
    { kw: 'best cola brands', intent: 'Commercial' },
    { kw: 'coca-cola history', intent: 'Informational' },
    { kw: 'buy coca-cola bulk', intent: 'Transactional' },
  ],
  Samsung: [
    { kw: 'samsung', intent: 'Navigational' },
    { kw: 'best samsung phone 2025', intent: 'Commercial' },
    { kw: 'how to transfer data to new samsung', intent: 'Informational' },
    { kw: 'buy samsung galaxy s25', intent: 'Transactional' },
  ],
}

// ─── EXAMPLE ANSWERS BY BRAND ────────────────────────────────
export const EXAMPLE_SEEDS: Record<Brand, { short: string[]; long: string[] }> = {
  ASOS: {
    short: ['women\'s fashion', 'men\'s clothing'],
    long: ['affordable summer dresses free delivery uk', 'best men\'s trainers for everyday wear'],
  },
  Ryanair: {
    short: ['cheap flights', 'budget airline'],
    long: ['cheapest flights from london to barcelona', 'how to get cheap last minute flights europe'],
  },
  Starbucks: {
    short: ['coffee shop', 'takeaway coffee'],
    long: ['starbucks seasonal drinks autumn 2025', 'best coffee drinks for people who hate bitter coffee'],
  },
  'Coca-Cola': {
    short: ['cola drink', 'soft drink'],
    long: ['coca-cola zero sugar vs diet coke difference', 'where to buy coca-cola in bulk uk'],
  },
  Samsung: {
    short: ['samsung phone', 'android smartphone'],
    long: ['best samsung galaxy phone for photography 2025', 'how to transfer photos from old samsung to new'],
  },
}

// ─── ANSWER KEYS ─────────────────────────────────────────────
export const CTR_ANSWERS = { p1: 3500, p8: 300, p2: 50 }

export const A11_ANSWERS = { a: 'Unlikely', b: 'Serve', c: 'Serve' }

export const NEG_KW_CORRECT = new Set(['free', 'jobs', 'repair'])
export const NEG_KW_ALL = ['free', 'premium', 'jobs', 'buy now', 'repair', 'review', 'sale', 'near me']

export const A17_AI_CORRECT = ['Definitions', 'Rewritten Content', 'Commodity Listicles']
export const A17_HUMAN_CORRECT = ['Original Research', 'Personal Experience', 'Case Studies', 'Expert Insight']
export const A17_ALL_ITEMS = [
  'Definitions', 'Rewritten Content', 'Commodity Listicles',
  'Original Research', 'Personal Experience', 'Case Studies', 'Expert Insight',
]

export const TECH_MATRIX_CORRECT = {
  now: ['Broken Mobile UX', 'Indexing Blocked'],
  next: ['Slow Category Pages', 'CLS Issues'],
  monitor: ['Metadata Issues', 'Redirect Cleanup'],
}

export const SEARCH_CONSOLE_DATA = [
  { kw: 'brand name', impressions: 42000, clicks: 18900, ctr: 45, position: 1.2 },
  { kw: 'category keyword', impressions: 85000, clicks: 850, ctr: 1, position: 8.4 },
  { kw: 'product keyword', impressions: 12000, clicks: 1080, ctr: 9, position: 3.1 },
  { kw: 'informational query', impressions: 31000, clicks: 620, ctr: 2, position: 6.7 },
  { kw: 'long tail keyword', impressions: 4200, clicks: 840, ctr: 20, position: 2.3 },
]

// ─── BOARD DECISION OPTIONS ───────────────────────────────────
export const BOARD_OPTIONS = {
  seo: [
    { id: 'content', label: 'Content Expansion', desc: 'Build topic clusters targeting high-volume informational keywords' },
    { id: 'technical', label: 'Technical Fixes', desc: 'Address Core Web Vitals, indexing issues and mobile UX' },
    { id: 'links', label: 'Link Building', desc: 'Acquire high-authority backlinks to improve domain authority' },
    { id: 'local', label: 'Local SEO', desc: 'Optimise Google Business Profile and local citations' },
  ],
  ppc: [
    { id: 'budget', label: 'Budget Increase', desc: 'Scale spend in top-performing campaigns with proven ROAS' },
    { id: 'negatives', label: 'Negative Keywords', desc: 'Cut wasted spend on irrelevant queries to improve efficiency' },
    { id: 'adcopy', label: 'Ad Copy Improvement', desc: 'Test RSAs and dynamic ads to improve CTR and Quality Score' },
    { id: 'landing', label: 'Landing Page Optimisation', desc: 'Dedicated pages per campaign to lift conversion rate' },
  ],
  ai: [
    { id: 'geo', label: 'GEO Strategy', desc: 'Optimise content for Generative Engine Optimisation and AI citations' },
    { id: 'authority', label: 'Content Authority', desc: 'Build original research and expert-led content for AI credibility' },
    { id: 'structured', label: 'Structured Content', desc: 'Add schema markup and FAQ sections for AI snippet eligibility' },
    { id: 'research', label: 'Original Research', desc: 'Commission proprietary data and reports AI models will cite' },
  ],
  goal: [
    { id: 'traffic', label: 'Traffic Growth', desc: 'Maximise organic and paid reach across all channels' },
    { id: 'leads', label: 'Lead Generation', desc: 'Drive qualified enquiries and sign-ups at target CPL' },
    { id: 'revenue', label: 'Revenue', desc: 'Focus every channel on direct commercial return and ROAS' },
    { id: 'brand', label: 'Brand Visibility', desc: 'Build awareness and Share of Voice in key search categories' },
  ],
}

// SCORING: which combinations score well together
export const BOARD_SCORING: Record<string, Record<string, number>> = {
  // seo priority aligns with goal
  content: { traffic: 3, leads: 2, revenue: 2, brand: 3 },
  technical: { traffic: 2, leads: 3, revenue: 3, brand: 1 },
  links: { traffic: 2, leads: 2, revenue: 2, brand: 3 },
  local: { traffic: 2, leads: 3, revenue: 2, brand: 2 },
  // ppc priority aligns with goal
  budget: { traffic: 2, leads: 2, revenue: 3, brand: 2 },
  negatives: { traffic: 1, leads: 3, revenue: 3, brand: 1 },
  adcopy: { traffic: 2, leads: 3, revenue: 2, brand: 2 },
  landing: { traffic: 1, leads: 3, revenue: 3, brand: 1 },
  // ai priority aligns with goal
  geo: { traffic: 3, leads: 2, revenue: 2, brand: 3 },
  authority: { traffic: 2, leads: 2, revenue: 2, brand: 3 },
  structured: { traffic: 2, leads: 3, revenue: 2, brand: 2 },
  research: { traffic: 2, leads: 2, revenue: 2, brand: 3 },
}

// ─── QUALITY KEYWORD BANKS ───────────────────────────────────
export const QUALITY_KEYWORDS: Record<string, string[]> = {
  content_makeover: ['expertise', 'authority', 'trust', 'readability', 'heading', 'structure', 'relevance', 'e-e-a-t', 'evidence', 'credib'],
  search_ad: ['keyword', 'benefit', 'cta', 'click', 'offer', 'unique', 'relevance', 'headline', 'description', 'conversion'],
  budget: ['roi', 'conversion', 'retarget', 'brand', 'intent', 'return', 'cost', 'efficient', 'allocat', 'performance'],
  campaign_diagnosis: ['conversion rate', 'traffic quality', 'attribution', 'intent', 'landing page', 'bounce', 'session', 'funnel', 'tracking'],
  ai_visibility: ['authority', 'citation', 'original', 'expertise', 'structured', 'schema', 'research', 'evidence', 'trust'],
  board_rationale: ['seo', 'technical', 'ppc', 'ai', 'revenue', 'conversion', 'growth', 'return', 'commercial', 'roi', 'impact', 'brand', 'data'],
}

export function simAvgToPoints(avg: number): number {
  if (avg >= 90) return 5
  if (avg >= 80) return 4
  if (avg >= 70) return 3
  if (avg >= 60) return 2
  return 1
}

export function calcQualityPts(text: string, bank: string[]): number {
  if (!text || text.length < 20) return 0
  const lower = text.toLowerCase()
  const hits = bank.filter(k => lower.includes(k)).length
  if (hits >= 4) return 3
  if (hits >= 2) return 2
  if (hits >= 1) return 1
  return 0
}

export function calcCompletionPts(fields: string[], minLen = 20): number {
  const filled = fields.filter(f => f && f.trim().length >= minLen).length
  const ratio = filled / fields.length
  if (ratio >= 1) return 2
  if (ratio >= 0.5) return 1
  return 0
}
