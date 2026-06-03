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
  a9: 8, a8: 9, a10b: 10,
  a11: 11, a12: 12, a12b: 13, a13: 14,
  a15: 15,
  a16: 16, a17: 17, a18: 18,
  sim1: 0, sim2: 0, sim3: 0, sim4: 0, sim5: 0,
}

// ─── ACTIVITY ORDERING ───────────────────────────────────────
export const ACTIVITY_ORDER: ActivityKey[] = [
  'a1', 'a2', 'a3',
  'a4', 'a5',
  'a6', 'a7',
  'a9', 'a8', 'a10b', 'sim1',
  'a11', 'a12', 'a12b', 'a13', 'sim3',
  'sim4', 'a15', 'sim5',
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
  a10b: 'Content Makeover Challenge',
  a11: 'Will The Ads Serve?',
  a12: 'Negative Keyword Challenge',
  a12b: 'Writing a Search Ad',
  a13: 'Budget Allocation Challenge',
  sim3: 'Paid Media Lab',
  a15: 'Search Console Investigation',
  sim4: 'Analytics Lab 1',
  sim5: 'Analytics Lab 2',
  a16: 'AI Visibility Audit',
  a17: 'AI vs Human Advantage',
  a18: 'Search Masters Challenge',
}

export const BLOCK_STRUCTURE = [
  { id: 1, label: 'SEO Foundations', activities: ['a1', 'a2', 'a3'] as ActivityKey[], color: 'blue' },
  { id: 2, label: 'Understanding Search', activities: ['a4', 'a5'] as ActivityKey[], color: 'teal' },
  { id: 3, label: 'Technical SEO', activities: ['a6', 'a7'] as ActivityKey[], color: 'purple' },
  { id: 4, label: 'Content Optimisation', activities: ['a9', 'a8', 'a10b', 'sim1'] as ActivityKey[], color: 'blue' },
  { id: 5, label: 'Google Ads', activities: ['a11', 'a12', 'a12b', 'a13', 'sim3'] as ActivityKey[], color: 'amber' },
  { id: 6, label: 'Measurement', activities: ['sim4', 'a15', 'sim5'] as ActivityKey[], color: 'teal' },
  { id: 7, label: 'AI & Future Search', activities: ['a16', 'a17', 'a18'] as ActivityKey[], color: 'purple' },
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

// ─── PER-BRAND EXAMPLES ──────────────────────────────────────
export const BRAND_EXAMPLES: Record<Brand, {
  serpObservation: string
  titleExample: string
  metaExample: string
  cwvIssue: string
  eeatExample: string
  topicCluster: string
  searchAdExample: string
}> = {
  ASOS: {
    serpObservation: 'ASOS dominates the SERP with Paid Ads at position 1, a Featured Snippet for styling queries, Shopping results for product searches, and People Also Ask capturing how-to intent. AI Overviews appear for fashion advice queries, reducing organic CTR on informational content.',
    titleExample: 'ASOS | Women\'s & Men\'s Fashion | Free Delivery & Returns',
    metaExample: 'Shop thousands of styles at ASOS. Free next-day delivery and free returns on every order. New arrivals daily across clothing, shoes, accessories and beauty.',
    cwvIssue: 'LCP is the biggest issue for ASOS — high-resolution product imagery across category pages is the largest contentful element. Slow LCP directly impacts conversion rate; every 100ms delay reduces conversions by ~1%. With thousands of product images, optimising image delivery is the highest priority CWV fix.',
    eeatExample: 'ASOS Experience: 4/5 — User-generated content, customer photos and verified purchase reviews demonstrate real experience. Expertise: 4/5 — Detailed size guides, style advice content and brand partnerships show category knowledge. Authority: 5/5 — Major press coverage, FTSE listing, millions of social followers. Trust: 4/5 — Clear returns policy, Trustpilot rating, secure checkout badge.',
    topicCluster: 'Pillar: "The Complete ASOS Style Guide" · Supporting: "How to Find Your Perfect Fit Using the ASOS Size Guide", "ASOS New Arrivals: What\'s Trending This Season", "ASOS Sale Guide: How to Get the Best Deals" · Questions: "Does ASOS have free returns?", "What sizes does ASOS stock?", "How long does ASOS delivery take?"',
    searchAdExample: 'H1: "ASOS | Official Store" | H2: "Free Delivery & Returns" | H3: "New Arrivals Daily" · D1: "Shop thousands of styles at ASOS. Free next-day delivery on orders. Easy free returns on every order, every time." · D2: "Women\'s, men\'s and everything in between. New drops daily across fashion, beauty and lifestyle. Shop now." · CTA: Shop Now',
  },
  Ryanair: {
    serpObservation: 'Ryanair SERPs show heavy Paid Ad presence from competitors (easyJet, Wizz Air) alongside Ryanair\'s own brand ads. Flight comparison tools (Skyscanner, Kayak) dominate organic results for generic flight queries. People Also Ask captures policy questions. Ryanair\'s brand name queries return direct site links and Knowledge Panel.',
    titleExample: 'Ryanair | Cheap Flights Across Europe | Book Now',
    metaExample: 'Book cheap flights with Ryanair. Hundreds of routes across Europe from just £9.99. Fast online check-in, flexible fares and exclusive app deals available daily.',
    cwvIssue: 'CLS is the biggest issue for Ryanair — the booking engine loads progressively with dynamic pricing elements shifting the layout as availability data loads. For a transactional site where conversion is everything, layout shifts during the booking flow cause user abandonment and directly lose revenue.',
    eeatExample: 'Ryanair Experience: 5/5 — Millions of verified passenger reviews and flight data demonstrate scale of real experience. Expertise: 4/5 — Route guides, travel tips and destination content show aviation knowledge. Authority: 5/5 — Europe\'s largest airline by passenger volume, major press coverage, regulatory recognition. Trust: 3/5 — Mixed reviews on price transparency; opportunity to improve through clearer pricing communication.',
    topicCluster: 'Pillar: "The Complete Guide to Flying Ryanair" · Supporting: "How to Avoid Ryanair Baggage Fees", "Ryanair Check-In Guide: Online, App and Airport", "Best Ryanair Routes From the UK" · Questions: "How early should I check in with Ryanair?", "What is Ryanair\'s baggage allowance?", "Can I change my Ryanair flight?"',
    searchAdExample: 'H1: "Cheap Flights | Ryanair" | H2: "From £9.99 One Way" | H3: "Book Direct & Save" · D1: "Europe\'s favourite low-cost airline. Book direct for the cheapest fares. Hundreds of routes, daily departures, exclusive app deals." · D2: "Compare our routes and fares. Free check-in app, priority boarding available. Book now for your next European adventure." · CTA: Search Flights',
  },
  Starbucks: {
    serpObservation: 'Starbucks SERPs show strong Local Pack presence with store locator results dominating local queries. Brand searches return Knowledge Panel with menu highlights. People Also Ask captures calorie and ingredient questions. AI Overviews appear for "how to make" queries. Competitor coffee brands bid on generic terms like "coffee near me".',
    titleExample: 'Starbucks | Coffee, Drinks & More | Find Your Store',
    metaExample: 'Discover the Starbucks menu — from handcrafted espresso drinks and Frappuccinos to teas, food and seasonal favourites. Order ahead on the app or find your nearest store.',
    cwvIssue: 'LCP is the biggest issue for Starbucks — the store locator and seasonal product hero images are the largest contentful elements. During seasonal launches (Pumpkin Spice, Christmas), traffic spikes dramatically. Slow LCP at these peaks directly impacts mobile conversion and app downloads.',
    eeatExample: 'Starbucks Experience: 5/5 — 35,000+ stores worldwide, billions of customer orders, and a rewards programme with 32M+ members demonstrate unmatched real-world experience. Expertise: 5/5 — Coffee sourcing content, barista training materials, and ethical sourcing reports demonstrate deep expertise. Authority: 5/5 — Global brand recognition, Fortune 500, major media coverage. Trust: 4/5 — Clear allergen information, ethical sourcing commitments, Trustpilot presence.',
    topicCluster: 'Pillar: "The Complete Starbucks Drinks Guide" · Supporting: "Starbucks Secret Menu: Hidden Drinks Worth Ordering", "Starbucks Calories Guide: Every Drink Explained", "How to Order on the Starbucks App and Earn Stars" · Questions: "What is in a Starbucks Pumpkin Spice Latte?", "How many calories are in a Starbucks latte?", "Can I customise my Starbucks order?"',
    searchAdExample: 'H1: "Starbucks | Order Your Way" | H2: "Earn Stars on Every Visit" | H3: "Seasonal Drinks Available Now" · D1: "Skip the queue — order ahead on the Starbucks app and collect your drink ready-made. Earn Stars towards free drinks with every purchase." · D2: "Handcrafted drinks made your way. Hot, iced or blended. Find your nearest store or order on the Starbucks app today." · CTA: Order Now',
  },
  'Coca-Cola': {
    serpObservation: 'Coca-Cola brand SERPs are dominated by the Knowledge Panel, brand history content and official product pages. Generic queries like "cola drink" or "best cola" show competitor brands and comparison content. Shopping results appear for bulk purchase queries. AI Overviews capture health and ingredient questions, often showing independent sources over brand content.',
    titleExample: 'Coca-Cola | The Original Taste | Explore Our Range',
    metaExample: 'Discover the world of Coca-Cola. From the original Classic to Zero Sugar and the full Coke family. Find recipes, brand history and where to buy near you.',
    cwvIssue: 'CLS is the biggest issue for Coca-Cola — the brand\'s content-heavy campaign pages load rich media assets progressively, causing significant layout shifts. As a brand whose digital presence is driven by campaign landing pages and storytelling content, CLS directly impacts engagement and time on site.',
    eeatExample: 'Coca-Cola Experience: 5/5 — 130+ years of product history, global consumer data and brand heritage provide unmatched real-world experience signals. Expertise: 4/5 — Recipe content, brand history and sustainability reports demonstrate knowledge depth. Authority: 5/5 — One of the world\'s most recognised brands, Fortune 500, Wikipedia presence, global press coverage. Trust: 4/5 — Allergen and nutritional transparency, sustainability commitments, Clear ingredients labelling.',
    topicCluster: 'Pillar: "The Complete Guide to Coca-Cola" · Supporting: "Coca-Cola vs Pepsi: The Full Taste Comparison", "Coca-Cola Zero Sugar vs Diet Coke: What\'s the Difference?", "Best Cocktails and Mixers Using Coca-Cola" · Questions: "How much sugar is in a can of Coke?", "Is Coca-Cola Zero Sugar really sugar free?", "What is the secret Coca-Cola recipe?"',
    searchAdExample: 'H1: "Coca-Cola | Find Near You" | H2: "The Original Since 1886" | H3: "Zero Sugar Now Available" · D1: "Find Coca-Cola Classic, Zero Sugar and the full family in stores near you. Use our store locator or buy online in bulk for events and parties." · D2: "Taste the original. Explore the full Coca-Cola range including Classic, Zero Sugar, Diet and seasonal editions. Order online today." · CTA: Find a Store',
  },
  Samsung: {
    serpObservation: 'Samsung SERPs show strong Shopping results for product queries, with comparison sites (Which?, TechRadar) dominating organic positions for "best Samsung phone" queries. Paid Ads from Samsung and retailers (Currys, Amazon) appear for transactional terms. People Also Ask captures spec comparison and how-to questions. AI Overviews appear for technical queries, often citing third-party review sites over Samsung.com.',
    titleExample: 'Samsung UK | Galaxy Phones, TVs & More | Shop Now',
    metaExample: 'Discover the latest Samsung Galaxy smartphones, QLED TVs, tablets and home appliances. Free delivery, trade-in offers and 0% finance available at Samsung.com.',
    cwvIssue: 'LCP is the biggest issue for Samsung — product detail pages feature large, high-resolution product renders and 360-degree images. With customers comparing multiple high-value devices before purchase, slow LCP increases bounce rate at the most critical conversion point in the funnel.',
    eeatExample: 'Samsung Experience: 5/5 — Real user reviews across millions of products, extensive community forums and verified purchase data demonstrate genuine experience at scale. Expertise: 5/5 — Technical spec sheets, developer documentation and innovation labs demonstrate deep technical expertise. Authority: 5/5 — Fortune Global 500, global press coverage, CES innovation awards, Wikipedia presence. Trust: 4/5 — Samsung Care warranty programme, clear returns policy, authorised service centres UK-wide.',
    topicCluster: 'Pillar: "The Complete Samsung Galaxy Buying Guide" · Supporting: "Samsung Galaxy S vs A Series: Which Should You Buy?", "How to Transfer Data to a New Samsung Phone", "Samsung Trade-In Programme: Is It Worth It?" · Questions: "Which Samsung phone has the best camera?", "How do I back up my Samsung Galaxy?", "What is Samsung DeX and how does it work?"',
    searchAdExample: 'H1: "Samsung Galaxy | Official UK" | H2: "Trade In & Save Up To £400" | H3: "Free Next-Day Delivery" · D1: "Shop the latest Samsung Galaxy smartphones direct from Samsung UK. Exclusive trade-in deals, 0% finance and free next-day delivery on every order." · D2: "Galaxy S25, Z Fold, tablets, wearables and more. Discover the full Samsung ecosystem and save with official bundle deals. Shop now." · CTA: Shop Galaxy',
  },
}
