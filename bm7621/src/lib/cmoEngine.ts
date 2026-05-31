import type { ResponseMap, CMOEvaluation, EvalDimension, BoardVerdict } from '../types'
import { wordCoverageScore } from './utils'

const SEO_KEYWORDS = ['keyword', 'organic', 'content', 'ranking', 'traffic', 'search', 'volume', 'intent', 'cluster', 'pillar', 'backlink', 'authority']
const TECH_KEYWORDS = ['technical', 'speed', 'core web', 'lcp', 'cls', 'mobile', 'indexing', 'crawl', 'structured', 'schema', 'performance']
const PPC_KEYWORDS = ['paid', 'roas', 'cpc', 'budget', 'conversion', 'campaign', 'negative', 'brand', 'bidding', 'ad', 'google ads', 'ppc']
const AI_KEYWORDS = ['ai', 'generative', 'overview', 'authority', 'citation', 'structured', 'original', 'research', 'visibility', 'llm', 'ai search', 'sgе']
const COMMERCIAL_KEYWORDS = ['revenue', 'growth', 'roi', 'return', 'cost', 'profit', 'customer', 'acquisition', 'retention', 'market', 'sales', 'commercial']

export function runCMOEvaluation(responses: ResponseMap): CMOEvaluation {
  const r = responses
  const seo = r.a18_seo || ''
  const tech = r.a18_tech || ''
  const ppc = r.a18_ppc || ''
  const ai = r.a18_ai || ''
  const recs = [r.a18_r1 || '', r.a18_r2 || '', r.a18_r3 || '']
  const impact = r.a18_impact || ''

  const seoCoverage = wordCoverageScore(seo, SEO_KEYWORDS)
  const techCoverage = wordCoverageScore(tech, TECH_KEYWORDS)
  const ppcCoverage = wordCoverageScore(ppc, PPC_KEYWORDS)
  const aiCoverage = wordCoverageScore(ai, AI_KEYWORDS)
  const commercialScore = wordCoverageScore(impact, COMMERCIAL_KEYWORDS)
  const recsCompleted = recs.filter(r => r.trim().length > 20).length
  const recsScore = recsCompleted * 33

  const dimensions: EvalDimension[] = [
    { label: 'SEO Coverage', score: seoCoverage },
    { label: 'Technical Coverage', score: techCoverage },
    { label: 'PPC Coverage', score: ppcCoverage },
    { label: 'AI Search Coverage', score: aiCoverage },
    { label: 'Commercial Thinking', score: commercialScore },
    { label: 'Recommendation Clarity', score: recsScore },
  ]

  const avg = dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length
  const verdict: BoardVerdict = avg >= 68 ? 'approved' : avg >= 42 ? 'revisions' : 'rejected'

  const strengths = dimensions
    .filter(d => d.score >= 60)
    .map(d => d.label)

  const weaknesses = dimensions
    .filter(d => d.score < 35)
    .map(d => {
      const msgs: Record<string, string> = {
        'SEO Coverage': 'SEO strategy needs more specific keyword and content evidence',
        'Technical Coverage': 'Technical risk assessment requires more depth',
        'PPC Coverage': 'Paid search recommendations are underdeveloped',
        'AI Search Coverage': 'AI search opportunity is not addressed sufficiently',
        'Commercial Thinking': 'Business impact must be quantified and specific',
        'Recommendation Clarity': 'All three recommendations must be clearly stated',
      }
      return msgs[d.label] || d.label
    })

  return {
    dimensions,
    strengths,
    weaknesses,
    verdict,
    generated_at: new Date().toISOString(),
  }
}

export function verdictToPoints(verdict: BoardVerdict): number {
  if (verdict === 'approved') return 5
  if (verdict === 'revisions') return 3
  return 1
}
