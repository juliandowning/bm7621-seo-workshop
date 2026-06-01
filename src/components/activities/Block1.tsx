import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { INTENT_KEYS } from '../../data/workshop'
import { ActivityCard, Alert, SimInputs, LockedBadge, ScoreBreakdown } from '../ui/shared'
import type { Brand } from '../../types'

export function Block1Panel() {
  const { team, scores, responses, simulators, updateScore, updateResponse, updateSimulator, lockActivity } = useWorkspaceStore()
  const brand = (team?.brand || 'ASOS') as Brand
  const intentKeys = INTENT_KEYS[brand]

  // A1
  const [st1, setSt1] = useState(responses.a1_st1 || '')
  const [st2, setSt2] = useState(responses.a1_st2 || '')
  const [lt1, setLt1] = useState(responses.a1_lt1 || '')
  const [lt2, setLt2] = useState(responses.a1_lt2 || '')

  const scoreA1 = (v: { st1?: string; st2?: string; lt1?: string; lt2?: string }) => {
    const s1 = v.st1 ?? st1; const s2 = v.st2 ?? st2
    const l1 = v.lt1 ?? lt1; const l2 = v.lt2 ?? lt2
    let pts = 0
    if (s1.trim()) pts++
    if (s2.trim()) pts++
    if (l1.trim() && l1.trim().split(' ').length >= 3) pts += 1.5
    if (l2.trim() && l2.trim().split(' ').length >= 3) pts += 1.5
    pts = Math.min(5, Math.round(pts))
    updateScore('a1', pts, 5, Math.min(2, Math.round(pts * 0.4)), Math.min(3, Math.round(pts * 0.6)))
    updateResponse({ a1_st1: s1, a1_st2: s2, a1_lt1: l1, a1_lt2: l2 })
  }

  // A2 — lock-in
  const a2Locked = !!responses.locked_a2
  const [intents, setIntents] = useState<string[]>(responses.a2_intents || intentKeys.map(() => ''))
  const [a2Result, setA2Result] = useState<string | null>(null)

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
    setA2Result(`${correct}/${intentKeys.length} correct → ${pts} points (Completion: ${cPts}/2 · Quality: ${qPts}/3)`)
  }

  // A3
  const serpItems = ['Paid Ads', 'AI Overview', 'Featured Snippet', 'People Also Ask', 'Image Pack', 'Video Results', 'Local Pack', 'Shopping Results']
  const [serpChecked, setSerpChecked] = useState<string[]>(responses.a3_serp || [])
  const [obs, setObs] = useState(responses.a3_obs || '')

  const scoreA3 = (checked: string[], observation: string) => {
    let pts = 0
    if (checked.length >= 1) pts++
    if (checked.length >= 3) pts++
    if (checked.length >= 5) pts++
    if (observation.length > 30) pts++
    if (observation.length > 80) pts++
    updateScore('a3', Math.min(5, pts))
    updateResponse({ a3_serp: checked, a3_obs: observation })
  }

  // SIM1
  const sim1 = simulators['sim1']
  const [simVals, setSimVals] = useState<(number | null)[]>(sim1?.scores || [null, null, null, null, null])

  const handleSim = (vals: (number | null)[]) => {
    setSimVals(vals)
    updateSimulator('sim1', vals)
    const valid = vals.filter((v): v is number => v !== null)
    if (valid.length > 0) {
      const avg = valid.reduce((a, b) => a + b, 0) / valid.length
      const pts = avg >= 90 ? 5 : avg >= 80 ? 4 : avg >= 70 ? 3 : avg >= 60 ? 2 : 1
      updateScore('sim1', pts)
    }
  }

  const intentOptions = ['Informational', 'Commercial', 'Transactional', 'Navigational']

  return (
    <div>
      {/* A1 */}
      <ActivityCard number={1} title="Human Seed List" subtitle="Generate keywords a real customer would search" points={scores.a1?.points || 0}>
        <Alert type="info">💡 Think about <strong>{brand}</strong> from a customer perspective. Generate 2 short-tail and 2 long-tail keywords.</Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Short-Tail Keywords (1–2 words)</label>
            <input className="form-input mb-2" placeholder="e.g. online shopping" value={st1} onChange={e => { setSt1(e.target.value); scoreA1({ st1: e.target.value }) }} />
            <input className="form-input" placeholder="e.g. fashion retail" value={st2} onChange={e => { setSt2(e.target.value); scoreA1({ st2: e.target.value }) }} />
          </div>
          <div>
            <label className="form-label">Long-Tail Keywords (3+ words)</label>
            <input className="form-input mb-2" placeholder="e.g. affordable summer dresses free delivery" value={lt1} onChange={e => { setLt1(e.target.value); scoreA1({ lt1: e.target.value }) }} />
            <input className="form-input" placeholder="e.g. best rated trainers for running" value={lt2} onChange={e => { setLt2(e.target.value); scoreA1({ lt2: e.target.value }) }} />
          </div>
        </div>
      </ActivityCard>

      {/* A2 — lock-in */}
      <ActivityCard number={2} title="Intent Mapping" subtitle="Match each keyword to its search intent" points={scores.a2?.points || 0}>
        {a2Locked && <div className="flex items-center gap-2 mb-3"><LockedBadge />{a2Result && <span className="text-xs text-slate-500">{a2Result}</span>}</div>}
        <Alert type="info">🎯 Assign each keyword to the correct intent type. Answers lock on submission — choose carefully.</Alert>
        <div className="space-y-3 mb-4">
          {intentKeys.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-mono text-slate-700">{item.kw}</div>
              <select
                className="form-select w-48 flex-shrink-0"
                value={intents[i]}
                disabled={a2Locked}
                onChange={e => {
                  if (a2Locked) return
                  const next = [...intents]; next[i] = e.target.value
                  setIntents(next); updateResponse({ a2_intents: next })
                }}
              >
                <option value="">Select intent…</option>
                {intentOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        {!a2Locked && (
          <button className="btn-success btn-sm" onClick={submitA2} disabled={intents.some(v => !v)}>
            Submit Answers
          </button>
        )}
        {!a2Locked && intents.some(v => !v) && (
          <div className="text-xs text-amber-600 mt-2">Select an intent for every keyword before submitting.</div>
        )}
        {a2Locked && scores.a2 && <ScoreBreakdown completionPts={scores.a2.completionPts} qualityPts={scores.a2.qualityPts} />}
      </ActivityCard>

      {/* A3 */}
      <ActivityCard number={3} title="SERP Visibility Challenge" subtitle="Identify SERP features visible for your brand" points={scores.a3?.points || 0}>
        <Alert type="info">🔍 Search for <strong>{brand}</strong> in Google. Tick every SERP feature you can see.</Alert>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {serpItems.map(item => {
            const checked = serpChecked.includes(item)
            return (
              <label key={item} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer text-sm transition-all ${checked ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                <input type="checkbox" checked={checked} className="accent-brand-500"
                  onChange={e => {
                    const next = e.target.checked ? [...serpChecked, item] : serpChecked.filter(x => x !== item)
                    setSerpChecked(next); scoreA3(next, obs)
                  }}
                />
                {item}
              </label>
            )
          })}
        </div>
        <label className="form-label">Observations — What does this tell you about {brand}'s SERP position?</label>
        <textarea className="form-textarea" rows={3}
          placeholder="Note what you observe about SERP features and what this means for organic visibility..."
          value={obs}
          onChange={e => { setObs(e.target.value); scoreA3(serpChecked, e.target.value) }}
        />
      </ActivityCard>

      {/* SIM 1 */}
      <ActivityCard number="SIM" title="Search Lab — Simulator" subtitle="Enter individual student scores from Search Lab" points={scores.sim1?.points || 0} isSimulator>
        <Alert type="info">📊 Enter each team member's Search Lab score. Blanks are ignored. Auto-converted to workshop points.</Alert>
        <SimInputs values={simVals} onChange={handleSim} memberCount={team?.members.length || 5} />
        {sim1 && sim1.average !== null && (
          <div className="alert-success mt-3">Average: <strong>{sim1.average.toFixed(1)}</strong> → <strong>{sim1.points} workshop points</strong></div>
        )}
      </ActivityCard>
    </div>
  )
}
