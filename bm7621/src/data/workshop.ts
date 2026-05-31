import type { Brand, ActivityKey } from '../types'

// ─── ACCESS CODES ────────────────────────────────────────────
// These must be seeded in Supabase. Listed here for reference.
export const WORKSHOP_CODES = {
  ALPHA24: { brand: 'ASOS' as Brand, name: 'Alpha Team' },
  BRAVO24: { brand: 'Ryanair' as Brand, name: 'Bravo Team' },
  CHARLIE24: { brand: 'Starbucks' as Brand, name: 'Charlie Team' },
  DELTA24: { brand: 'Coca-Cola' as Brand, name: 'Delta Team' },
  ECHO24: { brand: 'Samsung' as Brand, name: 'Echo Team' },
  // Facilitator
  FACILITATOR24: { brand: 'ASOS' as Brand, name: 'Facilitator' },
}

export const BRANDS: Brand[] = ['ASOS', 'Ryanair', 'Starbucks', 'Coca-Cola', 'Samsung']

// ─── ACTIVITY ORDERING ───────────────────────────────────────
export const ACTIVITY_ORDER: ActivityKey[] = [
  'a1', 'a2', 'a3', 'sim1',
  'a4', 'a5',
  'a6', 'a7', 'sim2',
  'a8', 'a9', 'a10',
  'a11', 'a12', 'a13', 'sim3',
  'a14', 'a15', 'sim4', 'sim5',
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
  a8: 'Topic Cluster Builder',
  a9: 'E-E-A-T Audit',
  a10: 'Local SEO Challenge',
  a11: 'Will The Ads Serve?',
  a12: 'Negative Keyword Challenge',
  a13: 'Budget Allocation Challenge',
  sim3: 'ROAS Lab',
  a14: 'Campaign Diagnosis',
  a15: 'Search Console Investigation',
  sim4: 'Analytics Lab 1',
  sim5: 'Analytics Lab 2',
  a16: 'AI Visibility Audit',
  a17: 'AI vs Human Advantage',
  a18: 'CMO Strategy Challenge',
}

export const BLOCK_STRUCTURE = [
  {
    id: 1, label: 'SEO Foundations',
    activities: ['a1', 'a2', 'a3', 'sim1'] as ActivityKey[],
    color: 'blue',
  },
  {
    id: 2, label: 'Understanding Search',
    activities: ['a4', 'a5'] as ActivityKey[],
    color: 'teal',
  },
  {
    id: 3, label: 'Technical SEO',
    activities: ['a6', 'a7', 'sim2'] as ActivityKey[],
    color: 'purple',
  },
  {
    id: 4, label: 'Content Optimisation',
    activities: ['a8', 'a9', 'a10'] as ActivityKey[],
    color: 'blue',
  },
  {
    id: 5, label: 'Google Ads',
    activities: ['a11', 'a12', 'a13', 'sim3'] as ActivityKey[],
    color: 'amber',
  },
  {
    id: 6, label: 'Measurement',
    activities: ['a14', 'a15', 'sim4', 'sim5'] as ActivityKey[],
    color: 'teal',
  },
  {
    id: 7, label: 'AI & Future Search',
    activities: ['a16', 'a17', 'a18'] as ActivityKey[],
    color: 'purple',
  },
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

// ─── SIMULATOR CONVERSION ────────────────────────────────────
export function simAvgToPoints(avg: number): number {
  if (avg >= 90) return 5
  if (avg >= 80) return 4
  if (avg >= 70) return 3
  if (avg >= 60) return 2
  return 1
}

export const SIMULATOR_LABELS: Record<string, string> = {
  sim1: 'Search Lab',
  sim2: 'Conversion Lab',
  sim3: 'ROAS Lab',
  sim4: 'Analytics Lab 1',
  sim5: 'Analytics Lab 2',
}
