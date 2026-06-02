import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { TECH_MATRIX_CORRECT, ACTIVITY_DISPLAY_NUM } from '../../data/workshop'
import { ActivityCard, Alert, SimInputs, CharCount, LockedBadge, FeedbackPanel, QualityFeedback } from '../ui/shared'
import { cn } from '../../lib/utils'

const N = ACTIVITY_DISPLAY_NUM

const CWV_OPTIONS = [
  { key: 'LCP', label: 'LCP', desc: 'Largest Contentful Paint', detail: 'How fast main content loads. Target: <2.5s' },
  { key: 'INP', label: 'INP', desc: 'Interaction to Next Paint', detail: 'Responsiveness to interactions. Target: <200ms' },
  { key: 'CLS', label: 'CLS', desc: 'Cumulative Layout Shift', detail: 'Visual stability. Target: <0.1' },
]

const MATRIX_ITEMS = {
  now: ['Broken Mobile UX', 'Indexing Blocked', 'Slow Category Pages', 'CLS Issues'],
  next: ['Broken Mobile UX', 'Indexing Blocked', 'Slow Category Pages', 'CLS Issues'],
  monitor: ['Metadata Issues', 'Redirect Cleanup', 'Slow Category Pages', 'CLS Issues'],
}

export function Block3Panel() {
  const { team, scores, responses, simulators, updateScore, updateResponse, updateSimulator, lockActivity } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // A6 — lock+feedback
  const a6Locked = !!responses.locked_a6
  const [a6Fb, setA6Fb] = useState<{cPts:number;qPts:number;why:string}|null>(null)
  const [cwv, setCwv] = useState(responses.a6_cwv || '')
  const [explain, setExplain] = useState(responses.a6_explain || '')

  const submitA6 = () => {
    if (a6Locked) return
    let pts = 0
    if (cwv) pts += 2
    if (explain.length >= 50) pts += 2
    if (explain.length >= 150) pts++
    const cPts = cwv && explain.length >= 50 ? 2 : cwv || explain.length > 0 ? 1 : 0
    const qPts = Math.min(3, pts - cPts)
    updateScore('a6', Math.min(5, pts), 5, cPts, qPts)
    updateResponse({ a6_cwv: cwv, a6_explain: explain, locked_a6: true })
    lockActivity('a6')
    const why = qPts >= 3 ? 'Excellent — clear CWV selection with a detailed explanation.' :
      qPts === 2 ? 'Good explanation. Add more detail on the specific business impact for full marks.' :
      qPts === 1 ? 'Basic explanation. Describe specifically what causes this CWV issue and how to fix it.' :
      'Explanation too short. Write at least 50 characters explaining why this CWV matters for your brand.'
    setA6Fb({ cPts, qPts, why })
  }

  // A7 — lock+feedback
  const a7Locked = !!responses.locked_a7
  const [a7now, setA7now] = useState<string[]>(responses.a7_now || [])
  const [a7next, setA7next] = useState<string[]>(responses.a7_next || [])
  const [a7monitor, setA7monitor] = useState<string[]>(responses.a7_monitor || [])

  const submitA7 = () => {
    if (a7Locked) return
    let correct = 0
    TECH_MATRIX_CORRECT.now.forEach(item => { if (a7now.includes(item)) correct++ })
    TECH_MATRIX_CORRECT.next.forEach(item => { if (a7next.includes(item)) correct++ })
    TECH_MATRIX_CORRECT.monitor.forEach(item => { if (a7monitor.includes(item)) correct++ })
    const cPts = (a7now.length + a7next.length + a7monitor.length) >= 4 ? 2 : 1
    const qPts = Math.min(3, Math.round(correct * 3 / 6))
    updateScore('a7', Math.min(5, cPts + qPts), 5, cPts, qPts)
    updateResponse({ a7_now: a7now, a7_next: a7next, a7_monitor: a7monitor, locked_a7: true })
    lockActivity('a7')
  }

  const a7Correct = (() => {
    let c = 0
    TECH_MATRIX_CORRECT.now.forEach(i => { if ((responses.a7_now || []).includes(i)) c++ })
    TECH_MATRIX_CORRECT.next.forEach(i => { if ((responses.a7_next || []).includes(i)) c++ })
    TECH_MATRIX_CORRECT.monitor.forEach(i => { if ((responses.a7_monitor || []).includes(i)) c++ })
    return c
  })()

  const toggleMatrix = (col: 'now' | 'next' | 'monitor', item: string) => {
    if (a7Locked) return
    const setters = { now: setA7now, next: setA7next, monitor: setA7monitor }
    const current = col === 'now' ? a7now : col === 'next' ? a7next : a7monitor
    setters[col](current.includes(item) ? current.filter(x => x !== item) : [...current, item])
  }

  return (
    <div>
      {/* A6 */}
      <ActivityCard number={N.a6} title="Technical Friction Hunt" subtitle="Identify the biggest Core Web Vital issue" points={scores.a6?.points || 0}>
        <Alert type="info">⚙️ Select the Core Web Vital that poses the biggest challenge for <strong>{brand}</strong> and explain your reasoning.</Alert>
        {a6Locked && <div className="mb-3"><LockedBadge /></div>}
        <div className="mb-4">
          <label className="form-label">Select Biggest Core Web Vital Issue</label>
          <div className="flex gap-3 flex-wrap">
            {CWV_OPTIONS.map(opt => (
              <button key={opt.key} disabled={a6Locked}
                onClick={() => { if (!a6Locked) setCwv(opt.key) }}
                className={cn('flex-1 min-w-36 text-left p-3.5 border-2 rounded-xl transition-all',
                  cwv === opt.key ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                  a6Locked && 'cursor-default')}>
                <div className="font-bold text-sm mb-0.5">{opt.label} — {opt.desc}</div>
                <div className="text-xs text-slate-400">{opt.detail}</div>
              </button>
            ))}
          </div>
        </div>
        <label className="form-label">Explanation — Why is this the biggest issue for {brand}?</label>
        <textarea className="form-textarea" rows={4} disabled={a6Locked}
          placeholder="Describe what you observe and why this Core Web Vital is most critical... (min 50 chars)"
          value={explain} onChange={e => setExplain(e.target.value)} />
        <CharCount value={explain} min={50} max={500} />
        {!a6Locked && (
          <button className="btn-success btn-sm mt-3" onClick={submitA6} disabled={!cwv || explain.length < 50}>Submit Answers</button>
        )}
        {a6Locked && a6Fb && <QualityFeedback completionPts={a6Fb.cPts} qualityPts={a6Fb.qPts} qualityReason={a6Fb.why} />}
        {a6Locked && scores.a6 && (
          <FeedbackPanel
            score={scores.a6.points} max={5}
            why={`Selecting a CWV = 2pts. Explanation ≥50 chars = 2pts, ≥150 chars = full marks. You selected ${cwv}.`}
            example="For a retail brand like ASOS, LCP is typically the biggest issue. Product images are the largest contentful elements and slow loading directly impacts conversion rate. Google's research shows that every 100ms improvement in LCP increases conversion by 1.3%. LCP also has the highest weighting in the Core Web Vitals ranking signal."
            keyLearning={[
              'LCP measures how fast the largest visible element loads — typically a hero image or heading.',
              'CLS causes elements to shift as a page loads — jarring UX that particularly affects mobile checkout.',
              'INP replaced FID in 2024 — it measures how quickly the page responds to every user interaction, not just the first.',
              'All three CWVs are confirmed Google ranking signals.',
            ]}
          />
        )}
      </ActivityCard>

      {/* A7 */}
      <ActivityCard number={N.a7} title="Technical Prioritisation Matrix" subtitle="Sort issues into the correct priority categories" points={scores.a7?.points || 0}>
        {a7Locked && <div className="mb-3"><LockedBadge /></div>}
        <Alert type="info">📋 Assign each technical issue to the correct priority column. Answers lock on submission.</Alert>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { col: 'now' as const, label: '🔴 Fix Now', items: MATRIX_ITEMS.now, bg: 'bg-red-50 border-red-200', title: 'text-red-700', state: a7now },
            { col: 'next' as const, label: '🟡 Fix Next', items: MATRIX_ITEMS.next, bg: 'bg-amber-50 border-amber-200', title: 'text-amber-700', state: a7next },
            { col: 'monitor' as const, label: '🟢 Monitor', items: MATRIX_ITEMS.monitor, bg: 'bg-teal-50 border-teal-200', title: 'text-teal-700', state: a7monitor },
          ].map(col => (
            <div key={col.col} className={`border rounded-xl p-4 ${col.bg}`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${col.title}`}>{col.label}</div>
              {col.items.map(item => (
                <label key={item} className={cn('flex items-center gap-2 py-1.5 text-sm text-slate-700', a7Locked ? 'cursor-default' : 'cursor-pointer')}>
                  <input type="checkbox" checked={col.state.includes(item)} disabled={a7Locked}
                    onChange={() => toggleMatrix(col.col, item)} className="accent-brand-500" />
                  {item}
                </label>
              ))}
            </div>
          ))}
        </div>
        {!a7Locked && <button className="btn-success btn-sm" onClick={submitA7}>Submit Answers</button>}
        {a7Locked && scores.a7 && (
          <FeedbackPanel
            score={scores.a7.points} max={5}
            completionPts={scores.a7.completionPts} qualityPts={scores.a7.qualityPts}
            why={`${a7Correct}/6 correct placements. Fix Now: Broken Mobile UX, Indexing Blocked (immediate revenue impact). Fix Next: Slow Category Pages, CLS Issues (important but not blocking). Monitor: Metadata Issues, Redirect Cleanup (low priority, track over time).`}
            example="Broken Mobile UX and Indexing Blocked are Fix Now because they directly prevent Google from seeing and ranking your content. Slow Category Pages and CLS are Fix Next — they hurt UX and rankings but the site is still functioning. Metadata and redirects are Monitor — they're best practice issues that can be batched in a sprint."
            keyLearning={[
              'Indexing blocked is the most critical SEO issue — if Google can\'t crawl your page, it cannot rank.',
              'Broken mobile UX is a Fix Now because Google uses mobile-first indexing for all sites.',
              'Prioritisation prevents technical debt — fix what matters most first, batch the rest.',
            ]}
          />
        )}
      </ActivityCard>
</div>
  )
}
