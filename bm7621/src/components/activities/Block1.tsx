import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { INTENT_KEYS, EXAMPLE_SEEDS, ACTIVITY_DISPLAY_NUM } from '../../data/workshop'
import { ActivityCard, Alert, LockedBadge, FeedbackPanel, CharCount } from '../ui/shared'
import type { Brand } from '../../types'

const N = ACTIVITY_DISPLAY_NUM

export function Block1Panel() {
  const { team, scores, responses, simulators, updateScore, updateResponse, updateSimulator, lockActivity } = useWorkspaceStore()
  const brand = (team?.brand || 'ASOS') as Brand
  const intentKeys = INTENT_KEYS[brand]
  const examples = EXAMPLE_SEEDS[brand]

  // A1 — lock+feedback
  const a1Locked = !!responses.locked_a1
  const [st1, setSt1] = useState(responses.a1_st1 || '')
  const [st2, setSt2] = useState(responses.a1_st2 || '')
  const [lt1, setLt1] = useState(responses.a1_lt1 || '')
  const [lt2, setLt2] = useState(responses.a1_lt2 || '')

  const submitA1 = () => {
    if (a1Locked) return
    let pts = 0
    if (st1.trim()) pts++
    if (st2.trim()) pts++
    if (lt1.trim() && lt1.trim().split(' ').length >= 3) pts += 1.5
    if (lt2.trim() && lt2.trim().split(' ').length >= 3) pts += 1.5
    pts = Math.min(5, Math.round(pts))
    const cPts = Math.min(2, Math.round(pts * 0.4))
    const qPts = Math.min(3, pts - cPts)
    updateScore('a1', pts, 5, cPts, qPts)
    updateResponse({ a1_st1: st1, a1_st2: st2, a1_lt1: lt1, a1_lt2: lt2, locked_a1: true })
    lockActivity('a1')
  }

  // A2 — lock+feedback
  const a2Locked = !!responses.locked_a2
  const [intents, setIntents] = useState<string[]>(responses.a2_intents || intentKeys.map(() => ''))
  const intentOptions = ['Informational', 'Commercial', 'Transactional', 'Navigational']

  const submitA2 = () => {
    if (a2Locked) return
    let correct = 0
    intentKeys.forEach((item, i) => { if (intents[i] === item.intent) correct++ })
    const cPts = intents.every(v => v) ? 2 : intents.some(v => v) ? 1 : 0
    const qPts = Math.min(3, Math.round(correct * 3 / intentKeys.length))
    const pts = cPts + qPts
    updateScore('a2', pts, 5, cPts, qPts)
    updateResponse({ a2_intents: intents, locked_a2: true })
    lockActivity('a2')
  }

  // A3 — lock+feedback
  const a3Locked = !!responses.locked_a3
  const serpItems = ['Paid Ads', 'AI Overview', 'Featured Snippet', 'People Also Ask', 'Image Pack', 'Video Results', 'Local Pack', 'Shopping Results']
  const [serpChecked, setSerpChecked] = useState<string[]>(responses.a3_serp || [])
  const [obs, setObs] = useState(responses.a3_obs || '')

  const submitA3 = () => {
    if (a3Locked) return
    let pts = 0
    if (serpChecked.length >= 1) pts++
    if (serpChecked.length >= 3) pts++
    if (serpChecked.length >= 5) pts++
    if (obs.length >= 50) pts++
    if (obs.length >= 150) pts++
    updateScore('a3', Math.min(5, pts))
    updateResponse({ a3_serp: serpChecked, a3_obs: obs, locked_a3: true })
    lockActivity('a3')
  }

  const a2Correct = (() => {
    let c = 0
    intentKeys.forEach((item, i) => { if (responses.a2_intents?.[i] === item.intent) c++ })
    return c
  })()

  return (
    <div>
      {/* A1 */}
      <ActivityCard number={N.a1} title="Human Seed List" subtitle="Generate keywords a real customer would search" points={scores.a1?.points || 0}>
        <Alert type="info">💡 Think about <strong>{brand}</strong> from a customer perspective. Generate 2 short-tail and 2 long-tail keywords.</Alert>
        {a1Locked && <LockedBadge />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <label className="form-label">Short-Tail Keywords (1–2 words)</label>
            <input className="form-input mb-2" placeholder="e.g. online shopping" disabled={a1Locked} value={st1} onChange={e => setSt1(e.target.value)} />
            <input className="form-input" placeholder="e.g. fashion retail" disabled={a1Locked} value={st2} onChange={e => setSt2(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Long-Tail Keywords (3+ words)</label>
            <input className="form-input mb-2" placeholder="e.g. best running shoes for beginners" disabled={a1Locked} value={lt1} onChange={e => setLt1(e.target.value)} />
            <input className="form-input" placeholder="e.g. how to choose the right laptop" disabled={a1Locked} value={lt2} onChange={e => setSt2(e.target.value)} />
          </div>
        </div>
        {!a1Locked && (
          <button className="btn-success btn-sm mt-3" onClick={submitA1} disabled={!st1.trim() && !st2.trim()}>Submit Answers</button>
        )}
        {a1Locked && scores.a1 && (
          <FeedbackPanel
            score={scores.a1.points} max={5}
            completionPts={scores.a1.completionPts} qualityPts={scores.a1.qualityPts}
            why={`Short-tail keywords score 1pt each when entered. Long-tail keywords score 1.5pts each when 3+ words are used. You earn more by thinking like a customer with specific intent rather than generic terms.`}
            example={`Short-tail: "${examples.short[0]}", "${examples.short[1]}" · Long-tail: "${examples.long[0]}", "${examples.long[1]}"`}
            keyLearning={[
              'Short-tail keywords have high volume but high competition — hard to rank for.',
              'Long-tail keywords are more specific, lower competition, and convert better.',
              'Always think about what a customer is actually typing into Google, not what you call your product internally.',
            ]}
          />
        )}
      </ActivityCard>

      {/* A2 */}
      <ActivityCard number={N.a2} title="Intent Mapping" subtitle="Match each keyword to its search intent" points={scores.a2?.points || 0}>
        <Alert type="info">🎯 Assign each keyword to the correct intent type. Answers lock on submission — choose carefully.</Alert>
        {a2Locked && <div className="mb-3"><LockedBadge /></div>}
        <div className="space-y-3 mb-4">
          {intentKeys.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono text-slate-700">{item.kw}</div>
              <select className="form-select w-48 flex-shrink-0" value={intents[i]} disabled={a2Locked}
                onChange={e => { if (a2Locked) return; const next = [...intents]; next[i] = e.target.value; setIntents(next); updateResponse({ a2_intents: next }) }}>
                <option value="">Select intent…</option>
                {intentOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {a2Locked && (
                <span className={`text-xs font-bold ${responses.a2_intents?.[i] === item.intent ? 'text-emerald-600' : 'text-red-500'}`}>
                  {responses.a2_intents?.[i] === item.intent ? '✓' : `✗ → ${item.intent}`}
                </span>
              )}
            </div>
          ))}
        </div>
        {!a2Locked && (
          <button className="btn-success btn-sm" onClick={submitA2} disabled={intents.some(v => !v)}>Submit Answers</button>
        )}
        {!a2Locked && intents.some(v => !v) && <div className="text-xs text-amber-600 mt-2">Select an intent for every keyword before submitting.</div>}
        {a2Locked && scores.a2 && (
          <FeedbackPanel
            score={scores.a2.points} max={5}
            completionPts={scores.a2.completionPts} qualityPts={scores.a2.qualityPts}
            why={`${a2Correct}/${intentKeys.length} correct. Each correct mapping scores quality points. Completion points awarded for attempting all keywords.`}
            example={`Navigational = brand name searches ("${brand.toLowerCase()}"). Commercial = comparison/research ("best ${brand.toLowerCase()} products"). Informational = how-to questions. Transactional = ready to buy ("buy now", "order online").`}
            keyLearning={[
              'Search intent determines which content type Google will rank — content must match intent.',
              'Transactional keywords need product/landing pages, not blog posts.',
              'Informational intent means the user is not ready to buy — don\'t push product at them.',
              'Navigational searches are dominated by the brand — high CTR but no opportunity for competitors.',
            ]}
          />
        )}
      </ActivityCard>

      {/* A3 */}
      <ActivityCard number={N.a3} title="SERP Visibility Challenge" subtitle="Identify SERP features visible for your brand" points={scores.a3?.points || 0}>
        <Alert type="info">🔍 Search for <strong>{brand}</strong> in Google. Tick every SERP feature you can see.</Alert>
        {a3Locked && <div className="mb-3"><LockedBadge /></div>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {serpItems.map(item => {
            const checked = serpChecked.includes(item)
            return (
              <label key={item} className={`flex items-center gap-2 p-3 border rounded-lg text-sm transition-all ${a3Locked ? 'cursor-default' : 'cursor-pointer'} ${checked ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                <input type="checkbox" checked={checked} disabled={a3Locked} className="accent-brand-500"
                  onChange={e => {
                    if (a3Locked) return
                    const next = e.target.checked ? [...serpChecked, item] : serpChecked.filter(x => x !== item)
                    setSerpChecked(next)
                  }} />
                {item}
              </label>
            )
          })}
        </div>
        <label className="form-label">Observations — What does this tell you about {brand}'s SERP position?</label>
        <textarea className="form-textarea" rows={3} disabled={a3Locked}
          placeholder="Note what you observe about SERP features and what this means for organic visibility... (min 50 chars)"
          value={obs} onChange={e => setObs(e.target.value)} />
        <CharCount value={obs} min={50} max={250} />
        {!a3Locked && (
          <button className="btn-success btn-sm mt-3" onClick={submitA3} disabled={obs.length < 50}>Submit Answers</button>
        )}
        {!a3Locked && obs.length < 50 && <div className="text-xs text-amber-600 mt-2">Write at least 50 characters in your observations before submitting.</div>}
        {a3Locked && scores.a3 && (
          <FeedbackPanel
            score={scores.a3.points} max={5}
            why="Points awarded for number of SERP features identified (up to 3pts) and quality of written observations (up to 2pts based on depth and length)."
            example="ASOS dominates the SERP with Paid Ads at position 1, a Featured Snippet for styling queries, a Shopping Pack for product searches, and People Also Ask capturing informational intent. AI Overviews are beginning to appear for how-to queries, reducing organic click-through on those terms."
            keyLearning={[
              'Each SERP feature reduces organic CTR for standard results — understand which features appear for your keywords.',
              'AI Overviews are now appearing for informational queries — a key SEO challenge for 2025.',
              'Paid Ads at position 1 push organic results down — brands often bid on their own name to protect SERP real estate.',
            ]}
          />
        )}
      </ActivityCard>
</div>
  )
}
