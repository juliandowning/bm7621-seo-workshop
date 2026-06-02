export type QuestionType = 'mcq' | 'single' | 'calculation' | 'scenario'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'veryhard'

export interface SMQuestion {
  id: string
  round: number
  roundLabel: string
  number: number          // 1–20
  type: QuestionType
  difficulty: Difficulty
  points: number
  question: string
  options?: string[]      // MCQ options
  correct: string         // correct answer (matches option or typed value)
  explanation: string
  keyLearning: string
}

export const POINTS_MAP: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  veryhard: 10,  // final question
}

export const ROUND_LABELS: Record<number, string> = {
  1: 'SEO Foundations',
  2: 'Content & E-E-A-T',
  3: 'Technical SEO',
  4: 'Google Ads',
  5: 'Analytics & Measurement',
  6: 'AI & Future Search',
}

export const QUESTIONS: SMQuestion[] = [
  // ─── ROUND 1: SEO Foundations (4 questions) ──────────────────
  {
    id: 'r1q1', round: 1, roundLabel: 'SEO Foundations', number: 1,
    type: 'mcq', difficulty: 'easy', points: 1,
    question: 'What does CTR stand for in search analytics?',
    options: ['Click Through Rate', 'Content To Ranking', 'Crawl To Result', 'Category Traffic Report'],
    correct: 'Click Through Rate',
    explanation: 'CTR (Click Through Rate) measures the percentage of people who click your result after seeing it in search. Calculated as Clicks ÷ Impressions × 100.',
    keyLearning: 'CTR is a key indicator of how well your title tag and meta description attract searchers.',
  },
  {
    id: 'r1q2', round: 1, roundLabel: 'SEO Foundations', number: 2,
    type: 'mcq', difficulty: 'easy', points: 1,
    question: 'Which keyword type has the highest search volume but lowest conversion rate?',
    options: ['Long-tail', 'Short-tail', 'Navigational', 'Branded'],
    correct: 'Short-tail',
    explanation: 'Short-tail keywords (1–2 words) have massive search volume but low conversion intent. Long-tail keywords are more specific, lower volume, but convert far better.',
    keyLearning: 'Balance short-tail for visibility with long-tail for conversion in any keyword strategy.',
  },
  {
    id: 'r1q3', round: 1, roundLabel: 'SEO Foundations', number: 3,
    type: 'mcq', difficulty: 'medium', points: 2,
    question: 'A user searches "best running shoes for flat feet." What search intent is this?',
    options: ['Navigational', 'Transactional', 'Commercial', 'Informational'],
    correct: 'Commercial',
    explanation: 'Commercial intent = research phase before purchase. The user is comparing options, not yet ready to buy (Transactional) and not just seeking information (Informational).',
    keyLearning: 'Commercial intent keywords need comparison/review content — not product pages and not blogs.',
  },
  {
    id: 'r1q4', round: 1, roundLabel: 'SEO Foundations', number: 4,
    type: 'calculation', difficulty: 'medium', points: 2,
    question: 'A keyword gets 8,000 monthly searches. Your page ranks position 1 with a 35% CTR. How many clicks per month do you receive?',
    options: ['2,400', '2,800', '3,200', '3,500'],
    correct: '2,800',
    explanation: '8,000 × 35% = 2,800 clicks per month. Position 1 CTR benchmarks vary by query type but 35% is a strong average for non-branded terms.',
    keyLearning: 'Moving from position 3 to position 1 on a high-volume keyword can more than double your organic traffic.',
  },

  // ─── ROUND 2: Content & E-E-A-T (4 questions) ────────────────
  {
    id: 'r2q1', round: 2, roundLabel: 'Content & E-E-A-T', number: 5,
    type: 'mcq', difficulty: 'easy', points: 1,
    question: 'Which E-E-A-T factor was added by Google in 2022 specifically to reward first-hand knowledge?',
    options: ['Expertise', 'Authority', 'Experience', 'Trust'],
    correct: 'Experience',
    explanation: 'Google added the first "E" (Experience) to the E-A-T framework in 2022. It specifically rewards content written by someone with direct, real-world experience of the topic.',
    keyLearning: 'This is why product reviews from actual users, and guides from genuine practitioners, outrank AI-generated content.',
  },
  {
    id: 'r2q2', round: 2, roundLabel: 'Content & E-E-A-T', number: 6,
    type: 'mcq', difficulty: 'medium', points: 2,
    question: 'In a topic cluster, what is the role of the pillar page?',
    options: [
      'Targets long-tail keywords with detailed answers',
      'Covers a broad topic comprehensively and links to supporting content',
      'Acts as the homepage for the entire website',
      'Contains all internal links for the domain',
    ],
    correct: 'Covers a broad topic comprehensively and links to supporting content',
    explanation: 'The pillar page covers a broad subject at a high level and internally links to cluster content (supporting articles) that cover sub-topics in depth. Together they signal topical authority to Google.',
    keyLearning: 'Internal linking between pillar and cluster pages passes authority and helps Google understand your topical expertise.',
  },
  {
    id: 'r2q3', round: 2, roundLabel: 'Content & E-E-A-T', number: 7,
    type: 'scenario', difficulty: 'hard', points: 3,
    question: 'An article has strong backlinks and high traffic but Google has recently reduced its rankings. The content was written by an AI tool and lacks author attribution. Which E-E-A-T dimension is most likely causing the ranking drop?',
    options: ['Authority', 'Experience', 'Expertise', 'Trust'],
    correct: 'Experience',
    explanation: 'Despite strong Authority signals (backlinks), the content lacks Evidence of real Experience. Google Quality Raters specifically flag content that appears to lack first-hand knowledge. AI-generated content without author attribution fails the Experience dimension.',
    keyLearning: 'Backlinks alone cannot compensate for poor E-E-A-T signals — all four dimensions need to be present.',
  },
  {
    id: 'r2q4', round: 2, roundLabel: 'Content & E-E-A-T', number: 8,
    type: 'mcq', difficulty: 'medium', points: 2,
    question: 'Which of the following content types is LEAST likely to be replaced by AI-generated content?',
    options: ['Product category descriptions', 'FAQ answers', 'Original industry research', 'Meta descriptions'],
    correct: 'Original industry research',
    explanation: 'Original research requires real data collection, methodology, and insight that AI cannot manufacture. Generic content (FAQs, descriptions, meta tags) is already being automated at scale.',
    keyLearning: 'Proprietary data and original research is increasingly the most valuable SEO asset because it is the one thing AI cannot replicate.',
  },

  // ─── ROUND 3: Technical SEO (3 questions) ────────────────────
  {
    id: 'r3q1', round: 3, roundLabel: 'Technical SEO', number: 9,
    type: 'mcq', difficulty: 'medium', points: 2,
    question: 'Which Core Web Vital measures how fast the main content of a page loads visually?',
    options: ['CLS', 'INP', 'LCP', 'FCP'],
    correct: 'LCP',
    explanation: 'LCP (Largest Contentful Paint) measures the render time of the largest visible element — typically a hero image or heading. Target: under 2.5 seconds. It has the highest weighting in the Core Web Vitals ranking signal.',
    keyLearning: 'LCP is most commonly impacted by large uncompressed images and render-blocking resources.',
  },
  {
    id: 'r3q2', round: 3, roundLabel: 'Technical SEO', number: 10,
    type: 'mcq', difficulty: 'hard', points: 3,
    question: 'A site has Googlebot blocked in robots.txt for the /products/ directory. What is the most likely SEO consequence?',
    options: [
      'Google will rank those pages lower than competitors',
      'Those pages will not appear in Google search results',
      'Those pages will rank but without meta descriptions',
      'Google will penalise the whole domain',
    ],
    correct: 'Those pages will not appear in Google search results',
    explanation: 'Blocking Googlebot in robots.txt prevents crawling entirely. Google cannot index pages it cannot crawl, so they will not appear in search results. This is one of the most critical technical SEO errors.',
    keyLearning: 'Always audit robots.txt when diagnosing sudden ranking drops — accidentally blocking key directories is a common cause.',
  },
  {
    id: 'r3q3', round: 3, roundLabel: 'Technical SEO', number: 11,
    type: 'scenario', difficulty: 'hard', points: 3,
    question: 'A page has CLS issues causing the "Add to Cart" button to jump when the page loads. What is the PRIMARY cause of this?',
    options: [
      'Images without defined width and height attributes',
      'Slow server response time',
      'Missing meta description',
      'Too many JavaScript files',
    ],
    correct: 'Images without defined width and height attributes',
    explanation: 'CLS (Cumulative Layout Shift) is most commonly caused by images, ads or embeds without specified dimensions. When the browser does not know the size before loading, it shifts surrounding content when the element appears.',
    keyLearning: 'Always define width and height on images in HTML. This alone eliminates the majority of CLS issues.',
  },

  // ─── ROUND 4: Google Ads (3 questions) ───────────────────────
  {
    id: 'r4q1', round: 4, roundLabel: 'Google Ads', number: 12,
    type: 'mcq', difficulty: 'easy', points: 1,
    question: 'Which keyword match type gives the greatest control over which searches trigger your ad?',
    options: ['Broad Match', 'Phrase Match', 'Exact Match', 'Modified Broad'],
    correct: 'Exact Match',
    explanation: 'Exact Match only triggers your ad for searches that match your keyword closely, giving maximum control. Broad Match triggers on loosely related searches — maximum volume but minimum control.',
    keyLearning: 'Exact Match reduces wasted spend but limits reach — use alongside Phrase Match for balance.',
  },
  {
    id: 'r4q2', round: 4, roundLabel: 'Google Ads', number: 13,
    type: 'mcq', difficulty: 'medium', points: 2,
    question: 'ROAS stands for Return On Ad Spend. If you spend £2,000 and generate £10,000 in revenue, what is your ROAS?',
    options: ['2x', '4x', '5x', '8x'],
    correct: '5x',
    explanation: 'ROAS = Revenue ÷ Ad Spend = £10,000 ÷ £2,000 = 5x. For every £1 spent, £5 in revenue is returned. Industry benchmarks vary but 4x+ is generally considered strong for e-commerce.',
    keyLearning: 'ROAS is the primary efficiency metric in paid media — always optimise toward your target ROAS, not just volume.',
  },
  {
    id: 'r4q3', round: 4, roundLabel: 'Google Ads', number: 14,
    type: 'scenario', difficulty: 'hard', points: 3,
    question: 'A campaign has high impressions and clicks but a very low conversion rate. Search term reports show ads are triggering for irrelevant queries. What is the most effective immediate fix?',
    options: [
      'Increase the daily budget',
      'Switch to Broad Match keywords',
      'Add negative keywords',
      'Create new ad copy',
    ],
    correct: 'Add negative keywords',
    explanation: 'Irrelevant queries in the search term report is a direct indicator of wasted spend caused by over-broad match types. Adding negative keywords stops ads showing for those queries immediately — the highest-ROI optimisation available.',
    keyLearning: 'Review your Search Terms Report weekly. Adding negatives costs nothing and improves ROAS immediately.',
  },

  // ─── ROUND 5: Analytics & Measurement (3 questions) ──────────
  {
    id: 'r5q1', round: 5, roundLabel: 'Analytics & Measurement', number: 15,
    type: 'mcq', difficulty: 'medium', points: 2,
    question: 'Traffic is up 40% month-on-month but revenue is down 15%. Which metric should you investigate first?',
    options: ['Sessions', 'Bounce Rate', 'Conversion Rate', 'Impressions'],
    correct: 'Conversion Rate',
    explanation: 'When traffic increases but revenue falls, conversion rate is always the first diagnostic metric. A drop in conversion rate means visitors are not completing the desired action — caused by traffic quality change, landing page issue, or tracking problem.',
    keyLearning: 'Traffic and revenue decoupling is almost always a conversion rate issue — segment by source and landing page to find the cause.',
  },
  {
    id: 'r5q2', round: 5, roundLabel: 'Analytics & Measurement', number: 16,
    type: 'mcq', difficulty: 'hard', points: 3,
    question: 'In Google Search Console, a keyword shows 50,000 impressions and 500 clicks at position 8.4. What action would deliver the biggest traffic increase?',
    options: [
      'Improve the meta description to increase CTR',
      'Move the page from position 8 to position 3 through content improvement',
      'Add the keyword to Google Ads',
      'Create more supporting content on the topic',
    ],
    correct: 'Move the page from position 8 to position 3 through content improvement',
    explanation: 'At position 8, CTR is approximately 1% (500 clicks from 50k impressions). Position 3 typically achieves ~9% CTR — moving there would deliver approximately 4,500 clicks from the same 50,000 impressions. That is a 9× traffic increase from the same keyword.',
    keyLearning: 'High impressions + low CTR + position 7–15 = your biggest SEO opportunity. Content improvement to push into top 3 is the highest-leverage action.',
  },
  {
    id: 'r5q3', round: 5, roundLabel: 'Analytics & Measurement', number: 17,
    type: 'scenario', difficulty: 'hard', points: 3,
    question: 'A GA4 report shows organic traffic fell 35% in October. Paid traffic and direct traffic are unchanged. The SEO team reports no ranking changes. What is the most likely cause?',
    options: [
      'Google algorithm update penalised the site',
      'GA4 tracking code was removed from key pages',
      'Organic rankings actually dropped but Search Console has a delay',
      'Competitors outranked the site for all keywords',
    ],
    correct: 'GA4 tracking code was removed from key pages',
    explanation: 'If only organic traffic drops while all other channels are stable, and rankings are unchanged, the most likely explanation is a GA4 tracking issue — not an actual traffic drop. Paid and direct traffic use different attribution paths, so if they are unaffected the tracking tag on organic landing pages is the prime suspect.',
    keyLearning: 'Always check tracking integrity before diagnosing an SEO problem. A missing tag creates a phantom traffic drop.',
  },

  // ─── ROUND 6: AI & Future Search (3 questions + final) ───────
  {
    id: 'r6q1', round: 6, roundLabel: 'AI & Future Search', number: 18,
    type: 'mcq', difficulty: 'medium', points: 2,
    question: 'What does GEO stand for in the context of AI-powered search?',
    options: [
      'Google Engine Optimisation',
      'Generative Engine Optimisation',
      'Geographic Engine Output',
      'Global Experience Optimisation',
    ],
    correct: 'Generative Engine Optimisation',
    explanation: 'GEO (Generative Engine Optimisation) is the emerging discipline of optimising content to be cited and referenced by AI-powered search tools like ChatGPT, Perplexity, and Google AI Overviews.',
    keyLearning: 'GEO requires authority signals, original data, and structured content — the same foundations as strong E-E-A-T SEO.',
  },
  {
    id: 'r6q2', round: 6, roundLabel: 'AI & Future Search', number: 19,
    type: 'mcq', difficulty: 'hard', points: 3,
    question: 'Which type of content is MOST likely to be cited by an AI Overview in Google Search?',
    options: [
      'A long-form blog post optimised for a broad keyword',
      'Original research with specific data, cited sources, and clear author credentials',
      'A product category page with strong backlink profile',
      'A FAQ page with schema markup',
    ],
    correct: 'Original research with specific data, cited sources, and clear author credentials',
    explanation: 'AI systems prioritise content that demonstrates authority and originality. Original research with verifiable data and expert authorship is the strongest signal for AI citation — it provides something the AI cannot generate itself.',
    keyLearning: 'The content that is hardest for AI to replicate is the content most likely to be cited by AI. Invest in original data and genuine expertise.',
  },
  {
    id: 'r6q3', round: 6, roundLabel: 'AI & Future Search', number: 20,
    type: 'scenario', difficulty: 'veryhard', points: 10,
    question: '🏆 FINAL QUESTION — Worth 10 points\n\nA fashion retailer has strong organic rankings (avg position 2.3), a 4.2x ROAS on paid search, and 85,000 monthly impressions on their category keyword — but only 850 clicks (1% CTR). AI Overviews are now appearing for their top 5 informational keywords. Paid search costs have risen 22% in 12 months.\n\nWhich single action would have the biggest combined impact on organic traffic, paid efficiency, and AI search visibility?',
    options: [
      'Increase the paid search budget to capture more volume before AI Overviews dominate',
      'Commission original consumer research and publish it as a citable industry report',
      'Improve the meta descriptions on all category pages to lift CTR from 1% to 5%',
      'Switch all keywords to Exact Match to reduce wasted paid spend',
    ],
    correct: 'Commission original consumer research and publish it as a citable industry report',
    explanation: 'Original research addresses all three challenges simultaneously: (1) It earns backlinks and authority signals that improve organic rankings and CTR. (2) It builds E-E-A-T credibility that helps resist AI Overview displacement. (3) It is the content type most cited by AI systems, building GEO visibility. (4) Improved organic performance reduces reliance on paid search, countering rising CPCs. No other single action addresses all four dimensions.',
    keyLearning: 'The most strategic SEO investment in the AI era is content that AI cannot produce — original research, proprietary data, and genuine expert insight. This is the intersection of E-E-A-T, GEO, and competitive differentiation.',
  },
]

export const TOTAL_QUESTIONS = QUESTIONS.length
export const MAX_SCORE = QUESTIONS.reduce((s, q) => s + q.points, 0)

export function getRoundQuestions(round: number): SMQuestion[] {
  return QUESTIONS.filter(q => q.round === round)
}

export function getTotalRounds(): number {
  return Math.max(...QUESTIONS.map(q => q.round))
}
