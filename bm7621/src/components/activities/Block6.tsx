import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { SEARCH_CONSOLE_DATA, QUALITY_KEYWORDS, calcQualityPts, calcCompletionPts, ACTIVITY_DISPLAY_NUM } from '../../data/workshop'
import { ActivityCard, Alert, SimInputs, CharCount, FeedbackPanel, LockedBadge, QualityFeedback } from '../ui/shared'

const N = ACTIVITY_DISPLAY_NUM

export function Block6Panel() {
  const { team, scores, responses, simulators, updateScore, updateResponse, updateSimulator, lockActivity } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // SIM 4 — Analytics Lab 1 (now in Block 6)
  const [sim4Vals, setSim4Vals] = useState<(number | null)[]>(simulators['sim4']?.scores || [null, null, null, null, null])
  const handleSim4 = (vals: (number | null)[]) => {
    updateSimulator('sim4', vals)
    const valid = vals.filter((v): v is number => v !== null)
    if (valid.length > 0) {
      const avg = valid.reduce((a, b) => a + b, 0) / valid.length
      updateScore('sim4', avg >= 90 ? 5 : avg >= 80 ? 4 : avg >= 70 ? 3 : avg >= 60 ? 2 : 1)
    }
  }

  // A17 — Search Console (lock+feedback)
  const a15Locked = !!responses.locked_a15
  const [a15Fb, setA15Fb] = useState<{cPts:number;qPts:number;why:string}|null>(null)
  const [a15, setA15] = useState({ high: responses.a15_high || '', low: responses.a15_low || '', opp: responses.a15_opp || '', action: responses.a15_action || '' })

  const submitA15 = () => {
    if (a15Locked) return
    const h = a15.high.toLowerCase(); const l = a15.low.toLowerCase(); const o = a15.opp.toLowerCase()
    let pts = 0
    const h_correct = h.includes('category')
    const l_correct = l.includes('category')
    const o_correct = o.includes('category') || o.includes('informational')
    if (h_correct) pts++
    if (l_correct) pts++
    if (o_correct) pts++
    if (a15.action.length > 40) pts++
    if (a15.action.length > 100) pts++
    const correct = [h_correct, l_correct, o_correct].filter(Boolean).length
    const cPts = a15.action.length > 40 ? 2 : 1
    const qPts = Math.min(3, correct + (a15.action.length > 100 ? 1 : 0))
    updateScore('a15', Math.min(5, cPts + qPts), 5, cPts, qPts)
    updateResponse({ a15_high: a15.high, a15_low: a15.low, a15_opp: a15.opp, a15_action: a15.action, locked_a15: true })
    lockActivity('a15')
    const why = correct === 3 ? 'All three keywords correctly identified — "category keyword" has the highest impressions, lowest CTR, and biggest opportunity.' :
      correct === 2 ? `${3-correct} identification incorrect. The category keyword (85k impressions, 1% CTR, position 8.4) is the answer for all three.` :
      correct === 1 ? 'Two identifications incorrect. Look for the keyword with the highest impressions AND lowest CTR — that gap is the opportunity.' :
      'Focus on "category keyword" — 85,000 impressions, only 1% CTR, position 8.4. Moving to position 3 would 9× clicks from the same impressions.'
    setA15Fb({ cPts, qPts: Math.min(3,qPts), why })
  }

  const a15Correct = (() => {
    let c = 0
    if ((responses.a15_high || '').toLowerCase().includes('category')) c++
    if ((responses.a15_low || '').toLowerCase().includes('category')) c++
    if ((responses.a15_opp || '').toLowerCase().includes('category') || (responses.a15_opp || '').toLowerCase().includes('informational')) c++
    return c
  })()

  // SIM 4 & 5
  const makeSim = (key: string) => {
    const sim = simulators[key]
    return {
      vals: sim?.scores || [null, null, null, null, null],
      handler: (vals: (number | null)[]) => {
        updateSimulator(key, vals)
        const valid = vals.filter((v): v is number => v !== null)
        if (valid.length > 0) {
          const avg = valid.reduce((a, b) => a + b, 0) / valid.length
          updateScore(key as 'sim5', avg >= 90 ? 5 : avg >= 80 ? 4 : avg >= 70 ? 3 : avg >= 60 ? 2 : 1)
        }
      }
    }
  }

  const s5 = makeSim('sim5')
  const [sim5Vals, setSim5Vals] = useState<(number | null)[]>(s5.vals)

  return (
    <div>
      {/* SIM 4 — Analytics Lab 1 */}
      <ActivityCard number="SIM" title="Analytics Lab 1 — Simulator" subtitle="Enter individual student scores" points={scores.sim4?.points || 0} isSimulator>
        <SimInputs values={sim4Vals} onChange={vals => { setSim4Vals(vals); handleSim4(vals) }} memberCount={team?.members.length || 5} />
        {simulators['sim4']?.average !== null && simulators['sim4'] && (
          <div className="alert-success mt-3">Average: <strong>{simulators['sim4'].average?.toFixed(1)}</strong> → <strong>{simulators['sim4'].points} workshop points</strong></div>
        )}
      </ActivityCard>

      {/* A17 — Search Console Investigation */}
      <ActivityCard number={N.a15} title="Search Console Investigation" subtitle="Identify the biggest keyword opportunity" points={scores.a15?.points || 0}>
        {a15Locked && <div className="mb-3"><LockedBadge /></div>}
        <Alert type="info">🔍 Review the Search Console data below. Identify the highest impression keyword, lowest CTR, and biggest opportunity.</Alert>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Keyword', 'Impressions', 'Clicks', 'CTR', 'Avg. Position'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEARCH_CONSOLE_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 border-b border-slate-100 font-mono text-slate-700">{row.kw === 'brand name' ? brand.toLowerCase() : row.kw}</td>
                  <td className="px-4 py-2.5 border-b border-slate-100">{row.impressions.toLocaleString()}</td>
                  <td className="px-4 py-2.5 border-b border-slate-100">{row.clicks.toLocaleString()}</td>
                  <td className="px-4 py-2.5 border-b border-slate-100 font-semibold">{row.ctr}%</td>
                  <td className="px-4 py-2.5 border-b border-slate-100">{row.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {[{ key: 'high' as const, label: 'Highest Impressions Keyword', placeholder: 'Which keyword?' },
            { key: 'low' as const, label: 'Lowest CTR Keyword', placeholder: 'Which keyword?' },
            { key: 'opp' as const, label: 'Biggest Opportunity', placeholder: 'Which keyword?' }].map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              <input className="form-input" disabled={a15Locked} placeholder={f.placeholder} value={a15[f.key]}
                onChange={e => setA15(prev => ({ ...prev, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <label className="form-label">Recommended Action</label>
        <textarea className="form-textarea" rows={3} disabled={a15Locked}
          placeholder="What specific optimisation would you recommend? (min 50 chars)"
          value={a15.action} onChange={e => setA15(prev => ({ ...prev, action: e.target.value }))} />
        <CharCount value={a15.action} min={50} max={250} />
        {!a15Locked && (
          <button className="btn-success btn-sm mt-3" onClick={submitA15} disabled={a15.action.length < 50}>Submit Answers</button>
        )}
        {a15Locked && a15Fb && <QualityFeedback completionPts={a15Fb.cPts} qualityPts={a15Fb.qPts} qualityReason={a15Fb.why} />}
        {a15Locked && scores.a15 && (
          <FeedbackPanel
            score={scores.a15.points} max={5}
            why={`${a15Correct}/3 correct data identifications. Correct: Highest impressions = "category keyword" (85,000). Lowest CTR = "category keyword" (1%). Biggest opportunity = "category keyword" — position 8.4 with 85k impressions is a critical fix.`}
            example="Biggest opportunity: 'category keyword' at position 8.4 with 85,000 monthly impressions and just 1% CTR (850 clicks). Moving from position 8 to position 3 would increase CTR from ~1% to ~9% — an estimated 6,750 additional clicks per month from the same keyword. Recommended action: Consolidate category page content, improve internal linking from the pillar page, and add structured data to increase SERP visibility."
            keyLearning={[
              '"Category keyword" at position 8.4 with 85k impressions is the biggest opportunity — high volume, poor position.',
              'CTR of 1% at position 8 means 99% of users are clicking on a competitor result or the next SERP.',
              'The long tail keyword (position 2.3, 20% CTR) is already performing well — less priority.',
              'Search Console is most useful for finding high-impression, low-CTR opportunities — that gap represents recoverable clicks.',
            ]}
          />
        )}
      </ActivityCard>
      {/* SIM 5 */}
      <ActivityCard number="SIM" title="Analytics Lab 2 — Simulator" subtitle="Enter individual student scores" points={scores.sim5?.points || 0} isSimulator>
        <SimInputs values={sim5Vals} onChange={vals => { setSim5Vals(vals); s5.handler(vals) }} memberCount={team?.members.length || 5} />
        {simulators['sim5']?.average !== null && simulators['sim5'] && (
          <div className="alert-success mt-3">Average: <strong>{simulators['sim5'].average?.toFixed(1)}</strong> → <strong>{simulators['sim5'].points} workshop points</strong></div>
        )}
      </ActivityCard>
    </div>
  )
}
