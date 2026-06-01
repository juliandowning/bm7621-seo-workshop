import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { SEARCH_CONSOLE_DATA, QUALITY_KEYWORDS, calcQualityPts, calcCompletionPts, ACTIVITY_DISPLAY_NUM } from '../../data/workshop'
import { ActivityCard, Alert, SimInputs, CharCount, FeedbackPanel, LockedBadge } from '../ui/shared'

const N = ACTIVITY_DISPLAY_NUM

export function Block6Panel() {
  const { team, scores, responses, simulators, updateScore, updateResponse, updateSimulator, lockActivity } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // A16 — Campaign Diagnosis (lock+feedback)
  const a14Locked = !!responses.locked_a14
  const [a14, setA14] = useState({ e1: responses.a14_e1 || '', e2: responses.a14_e2 || '', e3: responses.a14_e3 || '', next: responses.a14_next || '' })

  const submitA14 = () => {
    if (a14Locked) return
    const fields = [a14.e1, a14.e2, a14.e3, a14.next]
    const cPts = calcCompletionPts(fields, 30)
    const qPts = calcQualityPts(fields.join(' '), QUALITY_KEYWORDS.campaign_diagnosis)
    updateScore('a14', Math.min(5, cPts + qPts), 5, cPts, qPts)
    updateResponse({ a14_e1: a14.e1, a14_e2: a14.e2, a14_e3: a14.e3, a14_next: a14.next, locked_a14: true })
    lockActivity('a14')
  }

  // A17 — Search Console (lock+feedback)
  const a15Locked = !!responses.locked_a15
  const [a15, setA15] = useState({ high: responses.a15_high || '', low: responses.a15_low || '', opp: responses.a15_opp || '', action: responses.a15_action || '' })

  const submitA15 = () => {
    if (a15Locked) return
    const h = a15.high.toLowerCase(); const l = a15.low.toLowerCase(); const o = a15.opp.toLowerCase()
    let pts = 0
    if (h.includes('category')) pts++
    if (l.includes('category')) pts++
    if (o.includes('category') || o.includes('informational')) pts++
    if (a15.action.length > 40) pts++
    if (a15.action.length > 100) pts++
    updateScore('a15', Math.min(5, pts))
    updateResponse({ a15_high: a15.high, a15_low: a15.low, a15_opp: a15.opp, a15_action: a15.action, locked_a15: true })
    lockActivity('a15')
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
      {/* A16 — Campaign Diagnosis */}
      <ActivityCard number={N.a14} title="Campaign Diagnosis" subtitle="Diagnose the Traffic Up / Revenue Down anomaly" points={scores.a14?.points || 0}>
        {a14Locked && <div className="mb-3"><LockedBadge /></div>}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">⚠️ Anomaly Detected</div>
          <div className="font-bold text-slate-900 mb-1">📈 Traffic is UP 35% MoM &nbsp;|&nbsp; 📉 Revenue is DOWN 18%</div>
          <div className="text-sm text-slate-500">The CMO is asking for an immediate explanation. What are the possible causes?</div>
        </div>
        {[{ key: 'e1' as const, label: 'Explanation 1', placeholder: 'e.g. Traffic increase is from low-intent top-of-funnel keywords that don\'t convert...' },
          { key: 'e2' as const, label: 'Explanation 2', placeholder: 'e.g. Landing page UX issues causing high bounce rate from organic traffic...' },
          { key: 'e3' as const, label: 'Explanation 3', placeholder: 'e.g. Revenue attributed incorrectly — GA4 tracking gap during the period...' }].map(field => (
          <div key={field.key} className="mb-3">
            <label className="form-label">{field.label}</label>
            <input className="form-input" disabled={a14Locked} placeholder={field.placeholder} value={a14[field.key]} onChange={e => setA14(prev => ({ ...prev, [field.key]: e.target.value }))} />
            <CharCount value={a14[field.key]} min={30} max={250} />
          </div>
        ))}
        <label className="form-label">Recommended Next Step</label>
        <textarea className="form-textarea" rows={3} disabled={a14Locked}
          placeholder="What would you investigate first? What data would you pull? (min 50 chars)"
          value={a14.next} onChange={e => setA14(prev => ({ ...prev, next: e.target.value }))} />
        <CharCount value={a14.next} min={50} max={500} />
        {!a14Locked && (
          <button className="btn-success btn-sm mt-3" onClick={submitA14}
            disabled={[a14.e1, a14.e2, a14.e3].some(v => v.length < 30) || a14.next.length < 50}>Submit Answers</button>
        )}
        {a14Locked && scores.a14 && (
          <FeedbackPanel
            score={scores.a14.points} max={5}
            completionPts={scores.a14.completionPts} qualityPts={scores.a14.qualityPts}
            why="Completion: all 4 fields at minimum length = 2pts. Quality: use of conversion rate, traffic quality, attribution, landing page, funnel vocabulary = up to 3pts."
            example="E1: Traffic growth is sourced from high-volume informational queries added to the campaign — high click volume but low purchase intent, driving up session count without revenue. E2: Tracking gap — the GA4 tag was paused or misconfigured for 8 days in the reporting period, causing revenue under-attribution while session counts remained inflated. E3: Landing page test — a variant was accidentally pushed live that removed the CTA button, causing a significant drop in conversion rate for organic traffic specifically. Next step: Pull the GA4 engagement rate and conversion rate by landing page and source to isolate which traffic source and page caused the divergence."
            keyLearning={[
              'Traffic and revenue decoupling is almost always caused by traffic quality change, tracking issue, or landing page problem.',
              'Always check attribution first — GA4 misconfiguration is common and creates false anomalies.',
              'Segment by traffic source and landing page before drawing any conclusions from aggregate data.',
              'Conversion rate is the diagnostic metric — if it dropped, find where and why.',
            ]}
          />
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
