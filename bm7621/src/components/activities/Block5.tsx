import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { A11_ANSWERS, NEG_KW_CORRECT, NEG_KW_ALL } from '../../data/workshop'
import { ActivityCard, Alert, SimInputs } from '../ui/shared'
import { cn } from '../../lib/utils'

const ADS_SCENARIOS = [
  { key: 'a' as const, label: 'Scenario A', text: '"A pharmaceutical brand bids on the keyword \'buy prescription painkillers online\' in the UK with no prior Google Healthcare certification."' },
  { key: 'b' as const, label: 'Scenario B', text: '"A fashion retailer bids on \'summer dresses 2025\' with a relevant landing page and no restricted content."' },
  { key: 'c' as const, label: 'Scenario C', text: '"A competitor bids on a rival\'s trademarked brand name as a keyword. The ad copy does not mention the trademark."' },
]
const ADS_OPTIONS = ['Serve', 'Limited', 'Unlikely']
const ADS_LABELS: Record<string, string> = { Serve: 'Serve', Limited: 'Serve With Limitations', Unlikely: 'Unlikely To Serve' }

export function Block5Panel() {
  const { team, scores, responses, simulators, updateScore, updateResponse, updateSimulator } = useWorkspaceStore()

  // A11
  const [a11Picks, setA11Picks] = useState<Record<string, string>>({
    a: responses.a11_a || '',
    b: responses.a11_b || '',
    c: responses.a11_c || '',
  })
  const [a11Result, setA11Result] = useState<string | null>(null)

  const checkA11 = () => {
    let correct = 0
    if (a11Picks.a === A11_ANSWERS.a) correct++
    if (a11Picks.b === A11_ANSWERS.b) correct++
    if (a11Picks.c === A11_ANSWERS.c) correct++
    const pts = correct === 3 ? 5 : correct === 2 ? 3 : correct === 1 ? 2 : 0
    updateScore('a11', pts)
    updateResponse({ a11_a: a11Picks.a, a11_b: a11Picks.b, a11_c: a11Picks.c })
    setA11Result(`${correct}/3 correct. Answers: A = Unlikely To Serve · B = Serve · C = Serve (bidding on competitor keywords is allowed; using the trademark in copy is not). → ${pts} points`)
  }

  // A12
  const [negSelected, setNegSelected] = useState<string[]>(responses.a12_negkw || [])
  const [a12Result, setA12Result] = useState<string | null>(null)

  const toggleNeg = (kw: string) => {
    setNegSelected(prev => prev.includes(kw) ? prev.filter(x => x !== kw) : [...prev, kw])
  }

  const checkA12 = () => {
    const correct = negSelected.filter(k => NEG_KW_CORRECT.has(k)).length
    const falsePos = negSelected.filter(k => !NEG_KW_CORRECT.has(k)).length
    const pts = Math.max(0, Math.min(5, correct * 2 - falsePos))
    updateScore('a12', pts)
    updateResponse({ a12_negkw: negSelected })
    setA12Result(`Correct negatives: free, jobs, repair. You selected ${correct}/3 correct, ${falsePos} incorrect. → ${pts} points`)
  }

  // A13
  const [budget, setBudget] = useState({
    brand: responses.a13_brand ?? 3000,
    generic: responses.a13_generic ?? 4000,
    comp: responses.a13_comp ?? 1500,
    retarg: responses.a13_retarg ?? 1500,
  })
  const [rationale, setRationale] = useState(responses.a13_rationale || '')

  const total = Object.values(budget).reduce((s, v) => s + v, 0)

  const scoreA13 = (b: typeof budget, r: string) => {
    let pts = 0
    const t = Object.values(b).reduce((s, v) => s + v, 0)
    if (t === 10000) pts += 3
    if (r.length > 40) pts++
    if (r.length > 100) pts++
    updateScore('a13', Math.min(5, pts))
    updateResponse({ a13_brand: b.brand, a13_generic: b.generic, a13_comp: b.comp, a13_retarg: b.retarg, a13_rationale: r })
  }

  const updateBudgetField = (key: keyof typeof budget, val: number) => {
    const next = { ...budget, [key]: val }
    setBudget(next); scoreA13(next, rationale)
  }

  // SIM 3
  const sim3 = simulators['sim3']
  const [simVals, setSimVals] = useState<(number | null)[]>(sim3?.scores || [null, null, null, null, null])

  const handleSim = (vals: (number | null)[]) => {
    setSimVals(vals)
    updateSimulator('sim3', vals)
    const valid = vals.filter((v): v is number => v !== null)
    if (valid.length > 0) {
      const avg = valid.reduce((a, b) => a + b, 0) / valid.length
      const pts = avg >= 90 ? 5 : avg >= 80 ? 4 : avg >= 70 ? 3 : avg >= 60 ? 2 : 1
      updateScore('sim3', pts)
    }
  }

  const budgetRows = [
    { key: 'brand' as const, label: 'Brand' },
    { key: 'generic' as const, label: 'Generic' },
    { key: 'comp' as const, label: 'Competitor' },
    { key: 'retarg' as const, label: 'Retargeting' },
  ]

  return (
    <div>
      {/* A11 */}
      <ActivityCard number={11} title="Will The Ads Serve?" subtitle="Predict Google's ad policy decision for three scenarios" points={scores.a11?.points || 0}>
        <Alert type="info">⚖️ For each scenario, predict whether Google will serve the ad. Auto-scored against policy answer key.</Alert>
        <div className="space-y-4 mb-4">
          {ADS_SCENARIOS.map(scenario => (
            <div key={scenario.key} className="border border-slate-200 rounded-xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{scenario.label}</div>
              <div className="text-sm text-slate-600 italic mb-3">{scenario.text}</div>
              <div className="flex gap-2 flex-wrap">
                {ADS_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      const next = { ...a11Picks, [scenario.key]: opt }
                      setA11Picks(next)
                      updateResponse({ [`a11_${scenario.key}`]: opt } as never)
                    }}
                    className={cn(
                      'flex-1 min-w-28 py-2 px-3 border rounded-lg text-sm font-semibold transition-all text-center',
                      a11Picks[scenario.key] === opt
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
                    )}
                  >
                    {ADS_LABELS[opt]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className="btn-success btn-sm" onClick={checkA11}>Check Answers</button>
        {a11Result && <div className="alert-info mt-3 text-sm">{a11Result}</div>}
      </ActivityCard>

      {/* A12 */}
      <ActivityCard number={12} title="Negative Keyword Challenge" subtitle="Identify which keywords should be negatives" points={scores.a12?.points || 0}>
        <Alert type="info">🚫 A brand search campaign is wasting budget on irrelevant queries. Select all keywords that should be added as negatives.</Alert>
        <div className="flex flex-wrap gap-2 mb-4">
          {NEG_KW_ALL.map(kw => {
            const sel = negSelected.includes(kw)
            return (
              <button
                key={kw}
                onClick={() => toggleNeg(kw)}
                className={cn(
                  'px-4 py-2 rounded-full border font-mono text-sm transition-all',
                  sel
                    ? 'border-red-400 bg-red-50 text-red-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-red-300'
                )}
              >
                {kw}
              </button>
            )
          })}
        </div>
        <button className="btn-success btn-sm" onClick={checkA12}>Check Answers</button>
        {a12Result && <div className="alert-info mt-3 text-sm">{a12Result}</div>}
      </ActivityCard>

      {/* A13 */}
      <ActivityCard number={13} title="Budget Allocation Challenge" subtitle="Allocate exactly £10,000 across campaign types" points={scores.a13?.points || 0}>
        <Alert type="info">💷 Allocate exactly £10,000 across the four campaign types. Must equal £10,000 to score full points.</Alert>
        <div className="space-y-3 mb-4">
          {budgetRows.map(row => (
            <div key={row.key} className="flex items-center gap-4">
              <div className="w-28 text-sm font-semibold text-slate-700">{row.label}</div>
              <input
                type="range" min={0} max={10000} step={100}
                value={budget[row.key]}
                onChange={e => updateBudgetField(row.key, parseInt(e.target.value))}
                className="flex-1 accent-brand-500"
              />
              <input
                type="number" min={0} max={10000} step={100}
                value={budget[row.key]}
                onChange={e => updateBudgetField(row.key, parseInt(e.target.value) || 0)}
                className="w-28 text-right font-bold font-mono border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none focus:border-brand-400"
              />
            </div>
          ))}
        </div>
        <div className={cn(
          'flex justify-between items-center px-4 py-3 rounded-lg font-bold text-sm',
          total === 10000 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          total > 10000 ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-amber-50 text-amber-700 border border-amber-200'
        )}>
          <span>Total</span>
          <span>£{total.toLocaleString()} / £10,000 {total === 10000 ? '✓' : total > 10000 ? '— over budget' : `— £${(10000 - total).toLocaleString()} remaining`}</span>
        </div>
        <div className="mt-4">
          <label className="form-label">Budget Rationale</label>
          <textarea
            className="form-textarea" rows={3}
            placeholder="Justify your allocation. Which campaign type did you prioritise and why?"
            value={rationale}
            onChange={e => { setRationale(e.target.value); scoreA13(budget, e.target.value) }}
          />
        </div>
      </ActivityCard>

      {/* SIM 3 */}
      <ActivityCard number="SIM" title="ROAS Lab — Simulator" subtitle="Enter individual student scores from ROAS Lab" points={scores.sim3?.points || 0} isSimulator>
        <Alert type="info">📊 Enter each team member's ROAS Lab score. Auto-converted to workshop points.</Alert>
        <SimInputs values={simVals} onChange={handleSim} memberCount={team?.members.length || 5} />
        {sim3 && sim3.average !== null && (
          <div className="alert-success mt-3">Average: <strong>{sim3.average.toFixed(1)}</strong> → <strong>{sim3.points} workshop points</strong></div>
        )}
      </ActivityCard>
    </div>
  )
}
