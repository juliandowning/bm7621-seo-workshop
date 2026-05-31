import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { TECH_MATRIX_CORRECT } from '../../data/workshop'
import { ActivityCard, Alert, SimInputs } from '../ui/shared'
import { cn } from '../../lib/utils'

const CWV_OPTIONS = [
  { key: 'LCP', label: 'LCP', desc: 'Largest Contentful Paint', detail: 'How fast main content loads. Target: <2.5s', color: 'brand' },
  { key: 'INP', label: 'INP', desc: 'Interaction to Next Paint', detail: 'Responsiveness to interactions. Target: <200ms', color: 'teal' },
  { key: 'CLS', label: 'CLS', desc: 'Cumulative Layout Shift', detail: 'Visual stability / page jumping. Target: <0.1', color: 'violet' },
]

const MATRIX_ITEMS = {
  now: ['Broken Mobile UX', 'Indexing Blocked', 'Slow Category Pages', 'CLS Issues'],
  next: ['Broken Mobile UX', 'Indexing Blocked', 'Slow Category Pages', 'CLS Issues'],
  monitor: ['Metadata Issues', 'Redirect Cleanup', 'Slow Category Pages', 'CLS Issues'],
}

export function Block3Panel() {
  const { team, scores, responses, simulators, updateScore, updateResponse, updateSimulator } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // A6
  const [cwv, setCwv] = useState(responses.a6_cwv || '')
  const [explain, setExplain] = useState(responses.a6_explain || '')

  const scoreA6 = (c: string, e: string) => {
    let pts = 0
    if (c) pts += 2
    if (e.length > 40) pts += 2
    if (e.length > 100) pts++
    updateScore('a6', Math.min(5, pts))
    updateResponse({ a6_cwv: c, a6_explain: e })
  }

  // A7
  const [a7now, setA7now] = useState<string[]>(responses.a7_now || [])
  const [a7next, setA7next] = useState<string[]>(responses.a7_next || [])
  const [a7monitor, setA7monitor] = useState<string[]>(responses.a7_monitor || [])
  const [a7Result, setA7Result] = useState<string | null>(null)

  const checkA7 = () => {
    let correct = 0
    TECH_MATRIX_CORRECT.now.forEach(item => { if (a7now.includes(item)) correct++ })
    TECH_MATRIX_CORRECT.next.forEach(item => { if (a7next.includes(item)) correct++ })
    TECH_MATRIX_CORRECT.monitor.forEach(item => { if (a7monitor.includes(item)) correct++ })
    const pts = Math.min(5, Math.round(correct * 5 / 6))
    updateScore('a7', pts)
    updateResponse({ a7_now: a7now, a7_next: a7next, a7_monitor: a7monitor })
    setA7Result(`${correct}/6 correct → ${pts} points. Fix Now: Broken Mobile UX, Indexing Blocked. Fix Next: Slow Category Pages, CLS Issues. Monitor: Metadata Issues, Redirect Cleanup.`)
  }

  const toggleMatrix = (col: 'now' | 'next' | 'monitor', item: string) => {
    const setters = { now: setA7now, next: setA7next, monitor: setA7monitor }
    const current = col === 'now' ? a7now : col === 'next' ? a7next : a7monitor
    const next = current.includes(item) ? current.filter(x => x !== item) : [...current, item]
    setters[col](next)
  }

  // SIM 2
  const sim2 = simulators['sim2']
  const [simVals, setSimVals] = useState<(number | null)[]>(sim2?.scores || [null, null, null, null, null])

  const handleSim = (vals: (number | null)[]) => {
    setSimVals(vals)
    updateSimulator('sim2', vals)
    const valid = vals.filter((v): v is number => v !== null)
    if (valid.length > 0) {
      const avg = valid.reduce((a, b) => a + b, 0) / valid.length
      const pts = avg >= 90 ? 5 : avg >= 80 ? 4 : avg >= 70 ? 3 : avg >= 60 ? 2 : 1
      updateScore('sim2', pts)
    }
  }

  return (
    <div>
      {/* A6 */}
      <ActivityCard number={6} title="Technical Friction Hunt" subtitle="Identify the biggest Core Web Vital issue" points={scores.a6?.points || 0}>
        <Alert type="info">⚙️ Select the Core Web Vital that poses the biggest challenge for <strong>{brand}</strong> and explain your reasoning.</Alert>

        <div className="mb-4">
          <label className="form-label">Select Biggest Core Web Vital Issue</label>
          <div className="flex gap-3 flex-wrap">
            {CWV_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => { setCwv(opt.key); scoreA6(opt.key, explain) }}
                className={cn(
                  'flex-1 min-w-36 text-left p-3.5 border-2 rounded-xl transition-all',
                  cwv === opt.key
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                )}
              >
                <div className="font-bold text-sm mb-0.5">{opt.label} — {opt.desc}</div>
                <div className="text-xs text-slate-400">{opt.detail}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">Explanation — Why is this the biggest issue for {brand}?</label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder={`Describe what you observe and why this Core Web Vital is the most critical issue for ${brand}...`}
            value={explain}
            onChange={e => { setExplain(e.target.value); scoreA6(cwv, e.target.value) }}
          />
        </div>
      </ActivityCard>

      {/* A7 */}
      <ActivityCard number={7} title="Technical Prioritisation Matrix" subtitle="Sort issues into the correct priority categories" points={scores.a7?.points || 0}>
        <Alert type="info">📋 Assign each technical issue to the correct priority column. Check boxes in the appropriate column.</Alert>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { col: 'now' as const, label: '🔴 Fix Now', items: MATRIX_ITEMS.now, bg: 'bg-red-50 border-red-200', title: 'text-red-700', state: a7now },
            { col: 'next' as const, label: '🟡 Fix Next', items: MATRIX_ITEMS.next, bg: 'bg-amber-50 border-amber-200', title: 'text-amber-700', state: a7next },
            { col: 'monitor' as const, label: '🟢 Monitor', items: MATRIX_ITEMS.monitor, bg: 'bg-teal-50 border-teal-200', title: 'text-teal-700', state: a7monitor },
          ].map(col => (
            <div key={col.col} className={`border rounded-xl p-4 ${col.bg}`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${col.title}`}>{col.label}</div>
              {col.items.map(item => (
                <label key={item} className="flex items-center gap-2 py-1.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={col.state.includes(item)}
                    onChange={() => toggleMatrix(col.col, item)}
                    className="accent-brand-500"
                  />
                  {item}
                </label>
              ))}
            </div>
          ))}
        </div>
        <button className="btn-success btn-sm" onClick={checkA7}>Check Answers</button>
        {a7Result && <div className="alert-success mt-3 text-sm">{a7Result}</div>}
      </ActivityCard>

      {/* SIM 2 */}
      <ActivityCard number="SIM" title="Conversion Lab — Simulator" subtitle="Enter individual student scores from Conversion Lab" points={scores.sim2?.points || 0} isSimulator>
        <Alert type="info">📊 Enter each team member's Conversion Lab score. Auto-converted to workshop points.</Alert>
        <SimInputs values={simVals} onChange={handleSim} memberCount={team?.members.length || 5} />
        {sim2 && sim2.average !== null && (
          <div className="alert-success mt-3">Average: <strong>{sim2.average.toFixed(1)}</strong> → <strong>{sim2.points} workshop points</strong></div>
        )}
      </ActivityCard>
    </div>
  )
}
