import type { ResponseMap, CMOEvaluation, BoardVerdict } from '../types'
import { wordCoverageScore } from './utils'

// Legacy CMO engine - kept for export compatibility
// Board scoring is now handled inline in Block7
const SEO_KEYWORDS = ['keyword', 'organic', 'content', 'ranking', 'traffic', 'search', 'volume', 'intent', 'cluster', 'pillar']
const TECH_KEYWORDS = ['technical', 'speed', 'core web', 'lcp', 'cls', 'mobile', 'indexing', 'crawl', 'structured']
const PPC_KEYWORDS = ['paid', 'roas', 'cpc', 'budget', 'conversion', 'campaign', 'negative', 'brand', 'bidding', 'ad']
const AI_KEYWORDS = ['ai', 'generative', 'overview', 'authority', 'citation', 'structured', 'original', 'research']
const COMMERCIAL_KEYWORDS = ['revenue', 'growth', 'roi', 'return', 'cost', 'profit', 'customer', 'acquisition', 'market']

export function runCMOEvaluation(responses: ResponseMap): CMOEvaluation {
  // Build text from board decision fields
  const seo = responses.a18_seo_pick || ''
  const ppc = responses.a18_ppc_pick || ''
  const ai = responses.a18_ai_pick || ''
  const goal = responses.a18_goal_pick || ''
  const rationale = responses.a18_rationale || ''

  const combined = [seo, ppc, ai, goal, rationale].join(' ')
  const seoCoverage = wordCoverageScore(combined, SEO_KEYWORDS)
  const techCoverage = wordCoverageScore(combined, TECH_KEYWORDS)
  const ppcCoverage = wordCoverageScore(combined, PPC_KEYWORDS)
  const aiCoverage = wordCoverageScore(combined, AI_KEYWORDS)
  const commercialScore = wordCoverageScore(rationale, COMMERCIAL_KEYWORDS)
  const completionScore = [seo, ppc, ai, goal].every(Boolean) ? 100 : 50

  const dimensions = [
    { label: 'SEO Coverage', score: seoCoverage },
    { label: 'PPC Coverage', score: ppcCoverage },
    { label: 'AI Coverage', score: aiCoverage },
    { label: 'Commercial Thinking', score: commercialScore },
    { label: 'Decision Coverage', score: completionScore },
  ]

  const avg = dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length
  const verdict: BoardVerdict = avg >= 60 ? 'approved' : avg >= 35 ? 'revisions' : 'rejected'
  const strengths = dimensions.filter(d => d.score >= 60).map(d => d.label)
  const weaknesses = dimensions.filter(d => d.score < 30).map(d => d.label)

  return { dimensions, strengths, weaknesses, verdict, generated_at: new Date().toISOString() }
}

export function verdictToPoints(verdict: BoardVerdict): number {
  if (verdict === 'approved') return 5
  if (verdict === 'revisions') return 3
  return 1
}
