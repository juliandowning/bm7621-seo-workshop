import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { SEARCH_CONSOLE_DATA, QUALITY_KEYWORDS, calcQualityPts, calcCompletionPts } from '../../data/workshop'
import { ActivityCard, Alert, SimInputs, CharCount, ScoreBreakdown } from '../ui/shared'

export function Block6Panel() {
  const { team, scores, responses, simulators, updateScore, updateResponse, updateSimulator } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // A14
  const [a14, setA14] = useState({
    e1: responses.a14_e1 || '', e2: responses.a14_e2 || '',
    e3: responses.a14_e3 || '', next: responses.a14_next || '',
  })

  const scoreA14 = (updated: typeof a14) => {
    const fields = [updated.e1, updated.e2, updated.e3, updated.next]
    const cPts = calcCompletionPts(fields, 30)
    const allText = fields.join(' ')
    const qPts = calcQualityPts(allText, QUALITY_KEYWORDS.campaign_diagnosis)
    updateScore('a14', Math.min(5, cPts + qPts), 5, cPts, qPts)
    updateResponse({ a14_e1: updated.e1, a14_e2: updated.e2, a14_e3: updated.e3, a14_next: updated.next })
  }

  const updateA14 = (key: keyof typeof a14, val: string) => {
    const next = { ...a14, [key]: val }; setA14(next); scoreA14(next)
  }

  // A15
  const [a15, setA15] = useState({
    high: responses.a15_high || '', low: responses.a15_low || '',
    opp: responses.a15_opp || '', action: responses.a15_action || '',
  })
  const [a15Result, setA15Result] = useState<string | null>(null)

  const checkA15 = () => {
    const h = a15.high.toLowerCase(); const l = a15.low.toLowerCase(); const o = a15.opp.toLowerCase()
    let pts = 0
    if (h.includes('category')) pts++
    if (l.includes('category')) pts++
    if (o.includes('category') || o.includes('informational')) pts++
    if (a15.action.length > 40) pts++
    if (a15.action.length > 100) pts++
    updateScore('a15', Math.min(5, pts))
    updateResponse({ a15_high: a15.high, a15_low: a15.low, a15_opp: a15.opp, a15_action: a15.action })
    setA15Result(`Highest Impressions: "category keyword" (85,000) · Lowest CTR: "category keyword" (1%) · Biggest Opportunity: position 8.4 with 85k impressions — moving to position 3 could 5× clicks. → ${pts} points`)
  }

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
          updateScore(key as 'sim4' | 'sim5', avg >= 90 ? 5 : avg >= 80 ? 4 : avg >= 70 ? 3 : avg >= 60 ? 2 : 1)
        }
      }
    }
  }

  const s4 = makeSim('sim4'); const s5 = makeSim('sim5')
  const [sim4Vals, setSim4Vals] = useState<(number | null)[]>(s4.vals)
  const [sim5Vals, setSim5Vals] = useState<(number | null)[]>(s5.vals)

  return (
    <div>
      {/* A14 */}
      <ActivityCard number={14} title="Campaign Diagnosis" subtitle="Diagnose the Traffic Up / Revenue Down anomaly" points={scores.a14?.points || 0}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">⚠️ Anomaly Detected</div>
          <div className="font-bold text-slate-900 mb-1">📈 Traffic is UP 35% month-on-month &nbsp;|&nbsp; 📉 Revenue is DOWN 18%</div>
          <div className="text-sm text-slate-500">The CMO is asking for an immediate explanation. What are the possible causes?</div>
        </div>
        {[
          { key: 'e1' as const, label: 'Explanation 1', placeholder: 'e.g. Traffic increase is from low-intent top-of-funnel keywords that don\'t convert...' },
          { key: 'e2' as const, label: 'Explanation 2', placeholder: 'e.g. Landing page UX issues causing high bounce rate from organic traffic...' },
          { key: 'e3' as const, label: 'Explanation 3', placeholder: 'e.g. Revenue attributed incorrectly — GA4 tracking gap during the period...' },
        ].map(field => (
          <div key={field.key} className="mb-3">
            <label className="form-label">{field.label}</label>
            <input className="form-input" placeholder={field.placeholder} value={a14[field.key]} onChange={e => updateA14(field.key, e.target.value)} />
            <CharCount value={a14[field.key]} min={30} max={250} />
          </div>
        ))}
        <label className="form-label">Recommended Next Step</label>
        <textarea className="form-textarea" rows={3}
          placeholder="What would you investigate first? What data would you pull? (min 50 chars)"
          value={a14.next} onChange={e => updateA14('next', e.target.value)} />
        <CharCount value={a14.next} min={50} max={500} />
        {scores.a14 && <ScoreBreakdown completionPts={scores.a14.completionPts} qualityPts={scores.a14.qualityPts} />}
      </ActivityCard>

      {/* A15 */}
      <ActivityCard number={15} title="Search Console Investigation" subtitle="Identify the biggest keyword opportunity" points={scores.a15?.points || 0}>
        <Alert type="info">🔍 Review the Search Console data below. Identify insights and the biggest opportunity.</Alert>
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
          {[
            { key: 'high' as const, label: 'Highest Impressions Keyword', placeholder: 'Which keyword?' },
            { key: 'low' as const, label: 'Lowest CTR Keyword', placeholder: 'Which keyword?' },
            { key: 'opp' as const, label: 'Biggest Opportunity', placeholder: 'Which keyword?' },
          ].map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              <input className="form-input" placeholder={f.placeholder} value={a15[f.key]}
                onChange={e => { setA15({ ...a15, [f.key]: e.target.value }); updateResponse({ [`a15_${f.key}`]: e.target.value } as never) }} />
            </div>
          ))}
        </div>
        <label className="form-label">Recommended Action</label>
        <textarea className="form-textarea" rows={3} placeholder="What specific optimisation would you recommend?" value={a15.action}
          onChange={e => { setA15({ ...a15, action: e.target.value }); updateResponse({ a15_action: e.target.value }) }} />
        <CharCount value={a15.action} min={50} max={250} />
        <button className="btn-success btn-sm mt-3" onClick={checkA15}>Check Answers</button>
        {a15Result && <div className="alert-info mt-3 text-sm">{a15Result}</div>}
      </ActivityCard>

      {/* SIM 4 */}
      <ActivityCard number="SIM" title="Analytics Lab 1 — Simulator" subtitle="Enter individual student scores" points={scores.sim4?.points || 0} isSimulator>
        <SimInputs values={sim4Vals} onChange={vals => { setSim4Vals(vals); s4.handler(vals) }} memberCount={team?.members.length || 5} />
        {simulators['sim4']?.average !== null && simulators['sim4'] && (
          <div className="alert-success mt-3">Average: <strong>{simulators['sim4'].average?.toFixed(1)}</strong> → <strong>{simulators['sim4'].points} workshop points</strong></div>
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
