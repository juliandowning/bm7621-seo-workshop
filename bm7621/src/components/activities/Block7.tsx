import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { A17_AI_CORRECT, A17_HUMAN_CORRECT, A17_ALL_ITEMS, QUALITY_KEYWORDS, calcQualityPts, calcCompletionPts, BOARD_OPTIONS, BOARD_SCORING, ACTIVITY_DISPLAY_NUM } from '../../data/workshop'
import { ActivityCard, Alert, EvalBar, CharCount, FeedbackPanel, LockedBadge, BoardOptionGroup } from '../ui/shared'
import { cn } from '../../lib/utils'
import type { BoardVerdict } from '../../types'

const N = ACTIVITY_DISPLAY_NUM

const VERDICT_CONFIG = {
  approved: { icon: '✅', label: 'Board Approved', color: 'border-emerald-400 bg-emerald-50', titleColor: 'text-emerald-700', message: 'Strong strategic thinking. Your decisions demonstrate a coherent, commercially-aligned search strategy.' },
  revisions: { icon: '🔄', label: 'Approved With Revisions', color: 'border-amber-400 bg-amber-50', titleColor: 'text-amber-700', message: 'Solid foundation but some alignment gaps between priorities and business goal. Consider how each channel decision reinforces the others.' },
  rejected: { icon: '❌', label: 'Strategy Rejected', color: 'border-red-400 bg-red-50', titleColor: 'text-red-700', message: 'The board cannot approve a strategy where the channel priorities conflict with the stated business goal. Revisit your selections.' },
}

function scoreBoardDecision(seo: string, ppc: string, ai: string, goal: string, rationale: string) {
  if (!seo || !ppc || !ai || !goal) return { pts: 0, dimensions: [], verdict: 'rejected' as BoardVerdict, strengths: [], weaknesses: [] }

  const seoCoverage = (BOARD_SCORING[seo]?.[goal] || 1) / 3 * 100
  const ppcCoverage = (BOARD_SCORING[ppc]?.[goal] || 1) / 3 * 100
  const aiCoverage = (BOARD_SCORING[ai]?.[goal] || 1) / 3 * 100
  const rationalePts = calcQualityPts(rationale, QUALITY_KEYWORDS.board_rationale)
  const rationaleCoverage = rationalePts / 3 * 100
  const completionCoverage = rationale.length >= 100 ? 100 : rationale.length / 100 * 100

  const dimensions = [
    { label: 'SEO Alignment', score: seoCoverage },
    { label: 'PPC Alignment', score: ppcCoverage },
    { label: 'AI Strategy Alignment', score: aiCoverage },
    { label: 'Reasoning Quality', score: rationaleCoverage },
    { label: 'Decision Coverage', score: completionCoverage },
  ]
  const avg = dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length
  const verdict: BoardVerdict = avg >= 70 ? 'approved' : avg >= 45 ? 'revisions' : 'rejected'

  const verdictPts = verdict === 'approved' ? 5 : verdict === 'revisions' ? 3 : 1
  const rationalePtsBonus = rationalePts
  const pts = Math.min(5, Math.round((verdictPts + rationalePtsBonus) / 2))

  const strengths = dimensions.filter(d => d.score >= 70).map(d => d.label)
  const weaknesses = dimensions.filter(d => d.score < 40).map(d => {
    const msgs: Record<string, string> = {
      'SEO Alignment': 'SEO priority does not align strongly with stated business goal',
      'PPC Alignment': 'PPC priority does not align strongly with stated business goal',
      'AI Strategy Alignment': 'AI strategy does not align strongly with stated business goal',
      'Reasoning Quality': 'Rationale needs more specific commercial and strategic language',
      'Decision Coverage': 'Rationale must be at least 100 characters to demonstrate reasoning',
    }
    return msgs[d.label] || d.label
  })

  return { pts, dimensions, verdict, strengths, weaknesses }
}

export function Block7Panel() {
  const { team, scores, responses, cmoEval, updateScore, updateResponse, setCMOEval, lockActivity } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // A18 — AI Visibility (lock+feedback)
  const a16Locked = !!responses.locked_a16
  const [a16, setA16] = useState({ auth: responses.a16_auth || '', cite: responses.a16_cite || '', orig: responses.a16_orig || '', struct: responses.a16_struct || '' })

  const submitA16 = () => {
    if (a16Locked) return
    const fields = Object.values(a16)
    const cPts = calcCompletionPts(fields, 50)
    const qPts = calcQualityPts(fields.join(' '), QUALITY_KEYWORDS.ai_visibility)
    updateScore('a16', Math.min(5, cPts + qPts), 5, cPts, qPts)
    updateResponse({ a16_auth: a16.auth, a16_cite: a16.cite, a16_orig: a16.orig, a16_struct: a16.struct, locked_a16: true })
    lockActivity('a16')
  }

  // A19 — AI Sort (lock+feedback)
  const a17Locked = !!responses.locked_a17
  const [a17ai, setA17ai] = useState<string[]>(responses.a17_ai || [])
  const [a17human, setA17human] = useState<string[]>(responses.a17_human || [])

  const submitA17 = () => {
    if (a17Locked) return
    const aiCorrect = a17ai.filter(i => A17_AI_CORRECT.includes(i)).length
    const humanCorrect = a17human.filter(i => A17_HUMAN_CORRECT.includes(i)).length
    const aiFalse = a17ai.filter(i => !A17_AI_CORRECT.includes(i)).length
    const humanFalse = a17human.filter(i => !A17_HUMAN_CORRECT.includes(i)).length
    const correct = aiCorrect + humanCorrect
    const penalty = aiFalse + humanFalse
    const pts = Math.max(0, Math.min(5, Math.round((correct - penalty) * 5 / 7)))
    updateScore('a17', pts)
    updateResponse({ a17_ai: a17ai, a17_human: a17human, locked_a17: true })
    lockActivity('a17')
  }

  const a17Correct = (() => {
    const ai = responses.a17_ai || []
    const human = responses.a17_human || []
    return ai.filter(i => A17_AI_CORRECT.includes(i)).length + human.filter(i => A17_HUMAN_CORRECT.includes(i)).length
  })()

  // A20 — Board Decision Challenge
  const a18Locked = !!responses.locked_a18
  const [picks, setPicks] = useState({
    seo: responses.a18_seo_pick || '',
    ppc: responses.a18_ppc_pick || '',
    ai: responses.a18_ai_pick || '',
    goal: responses.a18_goal_pick || '',
  })
  const [rationale, setRationale] = useState(responses.a18_rationale || '')
  const [boardResult, setBoardResult] = useState<ReturnType<typeof scoreBoardDecision> | null>(null)

  const allPicked = Object.values(picks).every(Boolean)

  const submitA18 = () => {
    if (a18Locked) return
    const result = scoreBoardDecision(picks.seo, picks.ppc, picks.ai, picks.goal, rationale)
    setBoardResult(result)
    const cPts = allPicked && rationale.length >= 100 ? 2 : allPicked ? 1 : 0
    const qPts = result.pts - cPts < 0 ? 0 : Math.min(3, result.pts)
    updateScore('a18', result.pts, 5, cPts, Math.min(3, result.pts - cPts + 1))
    updateResponse({ a18_seo_pick: picks.seo, a18_ppc_pick: picks.ppc, a18_ai_pick: picks.ai, a18_goal_pick: picks.goal, a18_rationale: rationale, locked_a18: true })
    // Store as cmoEval for export compatibility
    setCMOEval({
      dimensions: result.dimensions,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      verdict: result.verdict,
      generated_at: new Date().toISOString(),
    })
    lockActivity('a18')
  }

  const savedResult = a18Locked && cmoEval ? { dimensions: cmoEval.dimensions, verdict: cmoEval.verdict, strengths: cmoEval.strengths, weaknesses: cmoEval.weaknesses } : boardResult

  return (
    <div>
      {/* A18 — AI Visibility */}
      <ActivityCard number={N.a16} title="AI Visibility Audit" subtitle="Assess your brand's AI search signals" points={scores.a16?.points || 0}>
        <Alert type="info">🤖 Audit <strong>{brand}</strong> across the four AI visibility dimensions (min 50 chars each).</Alert>
        {a16Locked && <div className="mb-3"><LockedBadge /></div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'auth' as const, label: 'Authority Signals', placeholder: 'Wikipedia entries, news mentions, industry citations, awards...' },
            { key: 'cite' as const, label: 'Citation Opportunities', placeholder: 'Publications, directories, authoritative sources that link to you...' },
            { key: 'orig' as const, label: 'Original Research & Data', placeholder: 'Proprietary research, reports, original insights, data sets...' },
            { key: 'struct' as const, label: 'Structured Content', placeholder: 'Schema markup, FAQs, clear Q&A format content, how-to guides...' },
          ].map(field => (
            <div key={field.key}>
              <label className="form-label">{field.label}</label>
              <textarea className="form-textarea" rows={3} disabled={a16Locked} placeholder={field.placeholder} value={a16[field.key]}
                onChange={e => setA16(prev => ({ ...prev, [field.key]: e.target.value }))} />
              <CharCount value={a16[field.key]} min={50} max={250} />
            </div>
          ))}
        </div>
        {!a16Locked && (
          <button className="btn-success btn-sm mt-3" onClick={submitA16} disabled={Object.values(a16).some(v => v.length < 50)}>Submit Answers</button>
        )}
        {a16Locked && scores.a16 && (
          <FeedbackPanel
            score={scores.a16.points} max={5}
            completionPts={scores.a16.completionPts} qualityPts={scores.a16.qualityPts}
            why="Completion: all 4 fields with 50+ chars = 2pts. Quality: use of authority, citation, original, expertise, structured, schema vocabulary = up to 3pts."
            example={`${brand} Authority: Strong — Featured in Forbes, Guardian, BBC coverage. Industry awards (e.g. Which? Recommended). Wikipedia presence with cited sources. Opportunities: Commission original consumer research that journalists will cite. Build relationships with industry analysts. Citation: Listed in major directories. Opportunities: Secure coverage in sector-specific publications. Submit data to government and trade body reports. Original Research: Limited proprietary data currently published. Opportunity: Annual consumer survey, sector trend reports. Structured: Good FAQ schema on product pages. Opportunity: Add HowTo schema for buying guides, Speakable schema for voice/AI eligibility.`}
            keyLearning={[
              'AI systems like ChatGPT and Perplexity cite sources with established authority — citations and original research build that.',
              'Structured content (schema, FAQ, clear Q&A format) makes content more parseable by AI systems.',
              'Generative Engine Optimisation (GEO) is emerging as a discipline alongside traditional SEO.',
              'Original, proprietary research is the most AI-citable content — it cannot be replicated or replaced by AI itself.',
            ]}
          />
        )}
      </ActivityCard>

      {/* A19 — AI vs Human */}
      <ActivityCard number={N.a17} title="AI vs Human Advantage" subtitle="Sort content types into the correct category" points={scores.a17?.points || 0}>
        {a17Locked && <div className="mb-3"><LockedBadge /></div>}
        <Alert type="info">🧠 Which content types can AI replace effectively? Which require genuine human expertise? Answers lock on submission.</Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { col: 'ai' as const, label: '🤖 AI Can Replace', state: a17ai, setState: setA17ai, bg: 'bg-violet-50 border-violet-200', title: 'text-violet-700', correctSet: A17_AI_CORRECT },
            { col: 'human' as const, label: '👤 Human Advantage', state: a17human, setState: setA17human, bg: 'bg-brand-50 border-brand-200', title: 'text-brand-700', correctSet: A17_HUMAN_CORRECT },
          ].map(col => (
            <div key={col.col} className={`border rounded-xl p-4 ${col.bg}`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${col.title}`}>{col.label}</div>
              {A17_ALL_ITEMS.map(item => {
                const isChecked = col.state.includes(item)
                const isCorrect = col.correctSet.includes(item)
                return (
                  <label key={item} className={cn('flex items-center gap-2 py-1.5 text-sm text-slate-700', a17Locked ? 'cursor-default' : 'cursor-pointer')}>
                    <input type="checkbox" checked={isChecked} disabled={a17Locked} className="accent-brand-500"
                      onChange={e => {
                        if (a17Locked) return
                        const next = e.target.checked ? [...col.state, item] : col.state.filter(x => x !== item)
                        col.setState(next); updateResponse({ [`a17_${col.col}`]: next } as never)
                      }} />
                    {item}
                    {a17Locked && isChecked && (
                      <span className={`text-xs font-bold ml-1 ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>{isCorrect ? '✓' : '✗'}</span>
                    )}
                  </label>
                )
              })}
            </div>
          ))}
        </div>
        {!a17Locked && <button className="btn-success btn-sm" onClick={submitA17}>Submit Answers</button>}
        {a17Locked && scores.a17 && (
          <FeedbackPanel
            score={scores.a17.points} max={5}
            why={`${a17Correct}/7 correctly placed. AI Can Replace: Definitions, Rewritten Content, Commodity Listicles. Human Advantage: Original Research, Personal Experience, Case Studies, Expert Insight.`}
            example="AI can produce commodity content at scale — definitions, reformulated articles, generic lists. But it cannot replicate real-world experience, first-hand research, or genuine expert insight. A product review written by someone who actually used the product for three months cannot be replaced by AI. Original research that required commissioning 1,000 survey respondents cannot be synthesised from existing data."
            keyLearning={[
              'E-E-A-T\'s first E (Experience) is specifically designed to reward content that AI cannot produce — real experience.',
              'Commodity content (definitions, rewrites) is increasingly produced by AI at scale — it becomes commoditised and loses ranking power.',
              'The safest SEO investment is content that requires genuine human experience, expertise or original data.',
              'Case studies and personal experience content will increase in value as AI content floods generic topics.',
            ]}
          />
        )}
      </ActivityCard>

      {/* A20 — Board Decision Challenge */}
      <ActivityCard number={N.a18} title="Board Decision Challenge" subtitle="Select your strategic recommendations for the board" points={scores.a18?.points || 0}>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Board Presentation</div>
          <div className="text-sm text-slate-700">Choose one priority from each category. Your decisions must be commercially coherent — the board will assess whether your strategy aligns with your stated business goal.</div>
        </div>
        {a18Locked && <div className="mb-3"><LockedBadge /></div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <BoardOptionGroup label="SEO Priority" options={BOARD_OPTIONS.seo} selected={picks.seo} locked={a18Locked}
            onChange={id => { setPicks(prev => ({ ...prev, seo: id })); updateResponse({ a18_seo_pick: id }) }} />
          <BoardOptionGroup label="PPC Priority" options={BOARD_OPTIONS.ppc} selected={picks.ppc} locked={a18Locked}
            onChange={id => { setPicks(prev => ({ ...prev, ppc: id })); updateResponse({ a18_ppc_pick: id }) }} />
          <BoardOptionGroup label="AI Priority" options={BOARD_OPTIONS.ai} selected={picks.ai} locked={a18Locked}
            onChange={id => { setPicks(prev => ({ ...prev, ai: id })); updateResponse({ a18_ai_pick: id }) }} />
          <BoardOptionGroup label="Primary Business Goal" options={BOARD_OPTIONS.goal} selected={picks.goal} locked={a18Locked}
            onChange={id => { setPicks(prev => ({ ...prev, goal: id })); updateResponse({ a18_goal_pick: id }) }} />
        </div>

        <div className="mt-2">
          <label className="form-label">Strategic Rationale — Explain why these decisions work together</label>
          <textarea className="form-textarea" rows={4} disabled={a18Locked}
            placeholder="Explain how your SEO, PPC and AI priorities combine to achieve your business goal. Use commercial language — revenue, conversion, ROI, intent... (min 100 chars)"
            value={rationale} onChange={e => { setRationale(e.target.value); updateResponse({ a18_rationale: e.target.value }) }} />
          <CharCount value={rationale} min={100} max={300} />
        </div>

        {!a18Locked && (
          <button className="btn-primary mt-4" onClick={submitA18}
            disabled={!allPicked || rationale.length < 100}>🏛️ Submit to Board</button>
        )}
        {(!allPicked && !a18Locked) && <div className="text-xs text-amber-600 mt-2">Select one option from each category and provide your rationale before submitting.</div>}

        {/* Board Verdict */}
        {savedResult && (
          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Board Evaluation</div>
            {savedResult.dimensions.map(d => <EvalBar key={d.label} label={d.label} score={d.score} />)}
            <div className={cn('border-2 rounded-xl p-6 text-center mt-5', VERDICT_CONFIG[savedResult.verdict].color)}>
              <div className="text-4xl mb-2">{VERDICT_CONFIG[savedResult.verdict].icon}</div>
              <div className={cn('font-display text-xl font-semibold mb-2', VERDICT_CONFIG[savedResult.verdict].titleColor)}>{VERDICT_CONFIG[savedResult.verdict].label}</div>
              <div className="text-sm text-slate-600">{VERDICT_CONFIG[savedResult.verdict].message}</div>
            </div>
            {savedResult.strengths.length > 0 && <div className="alert-success mt-4"><strong>Strengths:</strong> {savedResult.strengths.join(', ')}</div>}
            {savedResult.weaknesses.length > 0 && <div className="alert-warning mt-2 text-sm">{savedResult.weaknesses.join(' · ')}</div>}
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your Decisions</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: 'SEO', pick: picks.seo, options: BOARD_OPTIONS.seo },
                  { label: 'PPC', pick: picks.ppc, options: BOARD_OPTIONS.ppc },
                  { label: 'AI', pick: picks.ai, options: BOARD_OPTIONS.ai },
                  { label: 'Goal', pick: picks.goal, options: BOARD_OPTIONS.goal },
                ].map(row => {
                  const opt = row.options.find(o => o.id === row.pick)
                  return opt ? (
                    <div key={row.label} className="flex gap-2">
                      <span className="text-slate-400 font-semibold w-10">{row.label}:</span>
                      <span className="text-slate-700">{opt.label}</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </div>
        )}
      </ActivityCard>
    </div>
  )
}
