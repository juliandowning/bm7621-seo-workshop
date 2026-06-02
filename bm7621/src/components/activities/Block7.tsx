import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { A17_AI_CORRECT, A17_HUMAN_CORRECT, A17_ALL_ITEMS, QUALITY_KEYWORDS, calcQualityPts, calcCompletionPts, ACTIVITY_DISPLAY_NUM } from '../../data/workshop'
import { ActivityCard, Alert, CharCount, FeedbackPanel, LockedBadge, QualityFeedback } from '../ui/shared'
import { SearchMastersPanel } from './SearchMasters'
import { cn } from '../../lib/utils'

const N = ACTIVITY_DISPLAY_NUM

export function Block7Panel() {
  const { team, scores, responses, updateScore, updateResponse, lockActivity } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // A18 — AI Visibility
  const a16Locked = !!responses.locked_a16
  const [a16Fb, setA16Fb] = useState<{cPts:number;qPts:number;why:string}|null>(null)
  const [a16, setA16] = useState({
    auth: responses.a16_auth || '', cite: responses.a16_cite || '',
    orig: responses.a16_orig || '', struct: responses.a16_struct || '',
  })

  const submitA16 = () => {
    if (a16Locked) return
    const fields = Object.values(a16)
    const cPts = calcCompletionPts(fields, 50)
    const qPts = calcQualityPts(fields.join(' '), QUALITY_KEYWORDS.ai_visibility)
    updateScore('a16', Math.min(5, cPts + qPts), 5, cPts, qPts)
    updateResponse({ a16_auth: a16.auth, a16_cite: a16.cite, a16_orig: a16.orig, a16_struct: a16.struct, locked_a16: true })
    lockActivity('a16')
    const why = qPts >= 3 ? 'Strong AI visibility analysis — good use of authority, citation, original research and structured content concepts.' :
      qPts === 2 ? 'Good foundation. Strengthen by naming specific types of original research or structured content your brand could produce.' :
      qPts === 1 ? 'Analysis is too general. Name specific signals — e.g. which publications should cite you, what schema types to add.' :
      'Each field needs specific, actionable observations. What exactly should your brand do in each dimension?'
    setA16Fb({ cPts, qPts, why })
  }

  // A19 — AI vs Human
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

  return (
    <div>
      {/* A16 — AI Visibility */}
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
        {a16Locked && a16Fb && <QualityFeedback completionPts={a16Fb.cPts} qualityPts={a16Fb.qPts} qualityReason={a16Fb.why} />}
        {a16Locked && scores.a16 && (
          <FeedbackPanel
            score={scores.a16.points} max={5}
            completionPts={scores.a16.completionPts} qualityPts={scores.a16.qualityPts}
            why="Completion: all 4 fields with 50+ chars = 2pts. Quality: use of authority, citation, original, expertise, structured, schema vocabulary = up to 3pts."
            example={`${brand} Authority: Strong press coverage and industry awards build AI citation credibility. Opportunities: Commission original consumer research that journalists will cite. Citation: Secure coverage in sector-specific publications and trade body reports. Original Research: Publish an annual consumer survey or sector trend report. Structured: Add FAQ schema on product pages and HowTo schema for buying guides.`}
            keyLearning={[
              'AI systems cite sources with established authority — original research and citations build that.',
              'Structured content (schema, FAQ, Q&A) makes content more parseable by AI systems.',
              'Generative Engine Optimisation (GEO) is emerging as a discipline alongside traditional SEO.',
              'Original, proprietary research is the most AI-citable content type.',
            ]}
          />
        )}
      </ActivityCard>

      {/* A17 — AI vs Human */}
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
            example="AI produces commodity content at scale — definitions, reformulated articles, generic lists. It cannot replicate real-world experience, first-hand research, or genuine expert insight."
            keyLearning={[
              'E-E-A-T\'s first E (Experience) rewards content AI cannot produce — real experience.',
              'Commodity content is increasingly produced by AI at scale and loses ranking power.',
              'The safest SEO investment is content requiring genuine human experience or original data.',
              'Case studies and personal experience content will increase in value as AI floods generic topics.',
            ]}
          />
        )}
      </ActivityCard>

      {/* A18 — Search Masters Challenge */}
      <div className="card-p mb-5 border-violet-300 border-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A{N.a18}</div>
          <div>
            <div className="font-bold text-slate-900 text-sm">Search Masters Challenge</div>
            <div className="text-xs text-slate-500">Final activity · 20 questions · 6 rounds · Everything from today</div>
          </div>
          <div className={`score-${scores.a18?.points ? 'earned' : 'pending'} ml-auto`}>
            {scores.a18?.points || 0} / 5 pts
          </div>
        </div>
        <SearchMastersPanel />
      </div>
    </div>
  )
}
