import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { A11_ANSWERS, NEG_KW_CORRECT, NEG_KW_ALL, QUALITY_KEYWORDS, calcQualityPts, calcCompletionPts, ACTIVITY_DISPLAY_NUM } from '../../data/workshop'
import { ActivityCard, Alert, SimInputs, CharCount, LockedBadge, FeedbackPanel, QualityFeedback } from '../ui/shared'
import { cn } from '../../lib/utils'

const N = ACTIVITY_DISPLAY_NUM

const ADS_SCENARIOS = [
  { key: 'a' as const, label: 'Scenario A', text: '"A pharmaceutical brand bids on \'buy prescription painkillers online\' in the UK with no prior Google Healthcare certification."' },
  { key: 'b' as const, label: 'Scenario B', text: '"A fashion retailer bids on \'summer dresses 2025\' with a relevant landing page and no restricted content."' },
  { key: 'c' as const, label: 'Scenario C', text: '"A competitor bids on a rival\'s trademarked brand name as a keyword. The ad copy does not mention the trademark."' },
]
const ADS_OPTIONS = ['Serve', 'Limited', 'Unlikely']
const ADS_LABELS: Record<string, string> = { Serve: 'Serve', Limited: 'Serve With Limitations', Unlikely: 'Unlikely To Serve' }

export function Block5Panel() {
  const { team, scores, responses, simulators, updateScore, updateResponse, updateSimulator, lockActivity } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // A12 — Will Ads Serve (lock+feedback)
  const a11Locked = !!responses.locked_a11
  const [a11Picks, setA11Picks] = useState<Record<string, string>>({ a: responses.a11_a || '', b: responses.a11_b || '', c: responses.a11_c || '' })

  const submitA11 = () => {
    if (a11Locked) return
    let correct = 0
    if (a11Picks.a === A11_ANSWERS.a) correct++
    if (a11Picks.b === A11_ANSWERS.b) correct++
    if (a11Picks.c === A11_ANSWERS.c) correct++
    const pts = correct === 3 ? 5 : correct === 2 ? 3 : correct === 1 ? 2 : 0
    updateScore('a11', pts)
    updateResponse({ a11_a: a11Picks.a, a11_b: a11Picks.b, a11_c: a11Picks.c, locked_a11: true })
    lockActivity('a11')
  }

  // A13 — Negative Keywords (lock+feedback)
  const a12Locked = !!responses.locked_a12
  const [negSelected, setNegSelected] = useState<string[]>(responses.a12_negkw || [])

  const submitA12 = () => {
    if (a12Locked) return
    const correct = negSelected.filter(k => NEG_KW_CORRECT.has(k)).length
    const falsePos = negSelected.filter(k => !NEG_KW_CORRECT.has(k)).length
    const pts = Math.max(0, Math.min(5, correct * 2 - falsePos))
    updateScore('a12', pts)
    updateResponse({ a12_negkw: negSelected, locked_a12: true })
    lockActivity('a12')
  }

  // A14 — Search Ad
  const [ad, setAd] = useState({
    h1: responses.a12b_h1 || '', h2: responses.a12b_h2 || '', h3: responses.a12b_h3 || '',
    d1: responses.a12b_d1 || '', d2: responses.a12b_d2 || '', cta: responses.a12b_cta || '',
  })

  const scoreAd = (updated: typeof ad) => {
    const fields = [updated.h1, updated.h2, updated.h3, updated.d1, updated.d2, updated.cta]
    const cPts = calcCompletionPts(fields, 5)
    const qPts = calcQualityPts(fields.join(' '), QUALITY_KEYWORDS.search_ad)
    updateScore('a12b', Math.min(5, cPts + qPts), 5, cPts, qPts)
    updateResponse({ a12b_h1: updated.h1, a12b_h2: updated.h2, a12b_h3: updated.h3, a12b_d1: updated.d1, a12b_d2: updated.d2, a12b_cta: updated.cta })
  }

  // A15 — Budget
  const [budget, setBudget] = useState({
    brand: responses.a13_brand ?? 0, generic: responses.a13_generic ?? 0,
    comp: responses.a13_comp ?? 0, retarg: responses.a13_retarg ?? 0,
  })
  const [rationale, setRationale] = useState(responses.a13_rationale || '')
  const a13Locked = !!responses.locked_a13
  const [a13Fb, setA13Fb] = useState<{cPts:number;qPts:number;why:string}|null>(null)
  const total = Object.values(budget).reduce((s, v) => s + v, 0)

  const submitA13 = () => {
    if (a13Locked) return
    const cPts = total === 10000 ? 2 : total > 0 ? 1 : 0
    const qPts = calcQualityPts(rationale, QUALITY_KEYWORDS.budget)
    updateScore('a13', Math.min(5, cPts + qPts), 5, cPts, qPts)
    updateResponse({ a13_brand: budget.brand, a13_generic: budget.generic, a13_comp: budget.comp, a13_retarg: budget.retarg, a13_rationale: rationale, locked_a13: true })
    lockActivity('a13')
    const why = qPts >= 3 ? 'Excellent — rationale uses strong paid media vocabulary (ROI, conversion, retargeting, intent).' :
      qPts === 2 ? 'Good rationale. Strengthen by referencing why you allocated more/less to each campaign type specifically.' :
      qPts === 1 ? 'Rationale mentions some relevant concepts but needs more commercial depth — reference ROI, conversion intent, or ROAS.' :
      'Rationale is too generic. Explain why you chose each split — e.g. why brand gets X% and retargeting gets Y%.'
    setA13Fb({ cPts, qPts, why })
  }

  // SIM 3
  const sim3 = simulators['sim3']
  const [simVals, setSimVals] = useState<(number | null)[]>(sim3?.scores || [null, null, null, null, null])
  const handleSim = (vals: (number | null)[]) => {
    setSimVals(vals); updateSimulator('sim3', vals)
    const valid = vals.filter((v): v is number => v !== null)
    if (valid.length > 0) {
      const avg = valid.reduce((a, b) => a + b, 0) / valid.length
      updateScore('sim3', avg >= 90 ? 5 : avg >= 80 ? 4 : avg >= 70 ? 3 : avg >= 60 ? 2 : 1)
    }
  }

  const a11Correct = [a11Picks.a === A11_ANSWERS.a, a11Picks.b === A11_ANSWERS.b, a11Picks.c === A11_ANSWERS.c].filter(Boolean).length
  const negCorrect = negSelected.filter(k => NEG_KW_CORRECT.has(k)).length
  const negFalse = negSelected.filter(k => !NEG_KW_CORRECT.has(k)).length

  return (
    <div>
      {/* A12 — Will Ads Serve */}
      <ActivityCard number={N.a11} title="Will The Ads Serve?" subtitle="Predict Google's ad policy decision for three scenarios" points={scores.a11?.points || 0}>
        {a11Locked && <div className="mb-3"><LockedBadge /></div>}
        <Alert type="info">⚖️ For each scenario, predict whether Google will serve the ad. Answers lock on submission.</Alert>
        <div className="space-y-4 mb-4">
          {ADS_SCENARIOS.map(scenario => (
            <div key={scenario.key} className="border border-slate-200 rounded-xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{scenario.label}</div>
              <div className="text-sm text-slate-600 italic mb-3">{scenario.text}</div>
              <div className="flex gap-2 flex-wrap">
                {ADS_OPTIONS.map(opt => (
                  <button key={opt} disabled={a11Locked}
                    onClick={() => { if (!a11Locked) { const next = { ...a11Picks, [scenario.key]: opt }; setA11Picks(next); updateResponse({ [`a11_${scenario.key}`]: opt } as never) } }}
                    className={cn('flex-1 min-w-28 py-2 px-3 border rounded-lg text-sm font-semibold transition-all text-center',
                      a11Picks[scenario.key] === opt ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 bg-white text-slate-600',
                      !a11Locked && 'hover:border-brand-300', a11Locked && 'cursor-default'
                    )}>{ADS_LABELS[opt]}</button>
                ))}
              </div>
              {a11Locked && (
                <div className={`text-xs font-bold mt-2 ${a11Picks[scenario.key] === (A11_ANSWERS as Record<string,string>)[scenario.key] ? 'text-emerald-600' : 'text-red-500'}`}>
                  {a11Picks[scenario.key] === (A11_ANSWERS as Record<string,string>)[scenario.key] ? '✓ Correct' : `✗ Answer: ${(A11_ANSWERS as Record<string,string>)[scenario.key]}`}
                </div>
              )}
            </div>
          ))}
        </div>
        {!a11Locked && (
          <button className="btn-success btn-sm" onClick={submitA11} disabled={Object.values(a11Picks).some(v => !v)}>Submit Answers</button>
        )}
        {a11Locked && scores.a11 && (
          <FeedbackPanel
            score={scores.a11.points} max={5}
            why={`${a11Correct}/3 correct. Scenario A = Unlikely (pharmaceutical content requires Google Healthcare certification). Scenario B = Serve (standard retail, no policy issues). Scenario C = Serve (bidding on competitor keywords is permitted — using the trademark in the ad copy is not).`}
            example="Google's ad policies restrict certain categories regardless of budget: healthcare, financial products, gambling, adult content. Within allowed categories, ads serve if landing page is relevant, no misleading claims, and no restricted content. Competitor keyword bidding (conquesting) is a common and legitimate tactic — but copy must not include the competitor's trademark."
            keyLearning={[
              'Google has strict category restrictions — healthcare, finance and gambling require certification before ads will serve.',
              'Competitor keyword bidding is legal — using their trademark in your ad copy is not (trademark infringement).',
              'Ad policy issues cause silent non-delivery — the campaign runs, budget drains, but ads never appear.',
              'Always check Google\'s policy centre when launching in a new product category.',
            ]}
          />
        )}
      </ActivityCard>

      {/* A13 — Negative Keywords */}
      <ActivityCard number={N.a12} title="Negative Keyword Challenge" subtitle="Identify which keywords should be negatives" points={scores.a12?.points || 0}>
        {a12Locked && <div className="mb-3"><LockedBadge /></div>}
        <Alert type="info">🚫 A brand search campaign is wasting budget on irrelevant queries. Select all keywords that should be added as negatives.</Alert>
        <div className="flex flex-wrap gap-2 mb-4">
          {NEG_KW_ALL.map(kw => {
            const sel = negSelected.includes(kw)
            return (
              <button key={kw} disabled={a12Locked}
                onClick={() => { if (!a12Locked) setNegSelected(prev => prev.includes(kw) ? prev.filter(x => x !== kw) : [...prev, kw]) }}
                className={cn('px-4 py-2 rounded-full border font-mono text-sm transition-all',
                  sel ? 'border-red-400 bg-red-50 text-red-700 font-semibold' : 'border-slate-200 bg-white text-slate-600',
                  !a12Locked && 'hover:border-red-300', a12Locked && 'cursor-default'
                )}>{kw}</button>
            )
          })}
        </div>
        {!a12Locked && <button className="btn-success btn-sm" onClick={submitA12} disabled={negSelected.length === 0}>Submit Answers</button>}
        {a12Locked && scores.a12 && (
          <FeedbackPanel
            score={scores.a12.points} max={5}
            why={`Correct negatives: free, jobs, repair. You selected ${negCorrect}/3 correct and ${negFalse} incorrect. False positives (wrong negatives) deduct points.`}
            example="Negative: 'free' (budget-seekers, not buyers), 'jobs' (recruitment intent, not purchase), 'repair' (post-purchase service intent). Keep: 'premium' (high-value buyer signal), 'buy now' (transactional intent — this is what you want), 'review' (research phase — still valuable), 'sale' (price-conscious but still purchase intent), 'near me' (local intent — keep unless you have no physical presence)."
            keyLearning={[
              'Negative keywords prevent ads showing for irrelevant searches — wasted spend drains budget from converting queries.',
              'False positives (blocking the wrong terms) can cut revenue — be precise about what you exclude.',
              'Review your Search Terms Report weekly to find new negatives your current list has missed.',
              'Adding negatives is one of the few zero-cost ways to improve ROAS immediately.',
            ]}
          />
        )}
      </ActivityCard>

      {/* A14 — Search Ad */}
      <ActivityCard number={N.a12b} title="Writing a Search Ad" subtitle={`Write a Google Search ad for ${brand}`} points={scores.a12b?.points || 0}>
        <Alert type="info">📢 Write a complete Google Search ad. Headlines max 30 chars · Descriptions max 90 chars. Include your primary keyword and a clear CTA.</Alert>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {[{ key: 'h1' as const, label: 'Headline 1', max: 30 }, { key: 'h2' as const, label: 'Headline 2', max: 30 }, { key: 'h3' as const, label: 'Headline 3', max: 30 }].map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              <input className="form-input" maxLength={f.max} placeholder={f.label} value={ad[f.key]}
                onChange={e => { const next = { ...ad, [f.key]: e.target.value }; setAd(next); scoreAd(next) }} />
              <CharCount value={ad[f.key]} min={5} max={f.max} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {[{ key: 'd1' as const, label: 'Description 1', max: 90 }, { key: 'd2' as const, label: 'Description 2', max: 90 }].map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              <textarea className="form-textarea" rows={2} maxLength={f.max} placeholder={f.label} value={ad[f.key]}
                onChange={e => { const next = { ...ad, [f.key]: e.target.value }; setAd(next); scoreAd(next) }} />
              <CharCount value={ad[f.key]} min={20} max={f.max} />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="form-label">Call to Action</label>
          <input className="form-input" placeholder="e.g. Shop Now, Learn More, Get a Quote…" value={ad.cta}
            onChange={e => { const next = { ...ad, cta: e.target.value }; setAd(next); scoreAd(next) }} />
        </div>
        {(ad.h1 || ad.h2 || ad.h3) && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3">
            <div className="text-xs text-slate-400 mb-1">Ad · www.{brand.toLowerCase().replace(/[^a-z]/g,'')}.com</div>
            <div className="text-blue-700 font-medium text-sm mb-1">{[ad.h1, ad.h2, ad.h3].filter(Boolean).join(' | ')}</div>
            {ad.d1 && <div className="text-xs text-slate-500">{ad.d1}</div>}
            {ad.d2 && <div className="text-xs text-slate-500">{ad.d2}</div>}
            {ad.cta && <div className="text-xs text-brand-600 font-semibold mt-1">{ad.cta} →</div>}
          </div>
        )}
        {scores.a12b && <FeedbackPanel score={scores.a12b.points} max={5} why="Completion: all fields filled = 2pts. Quality: use of keyword, benefit, CTA vocabulary in combined ad text increases quality score (max 3pts)." example={`H1: "${brand} Official Store" | H2: "Free Next-Day Delivery" | H3: "Shop the Latest Collection" · D1: "Explore thousands of styles across clothing, shoes and accessories. Free returns on every order." · D2: "Join millions of ${brand} shoppers. Exclusive member offers and new drops every week." · CTA: Shop Now`} keyLearning={['Headlines are the most important element — lead with keyword and primary benefit.', 'Each headline appears in different combinations — make sure all three work independently.', 'Descriptions should expand on the headline benefit and address a potential objection.', 'A clear CTA in descriptions (not just extensions) improves CTR.']} />}
      </ActivityCard>
      {/* A15 — Budget */}
      <ActivityCard number={N.a13} title="Budget Allocation Challenge" subtitle="Allocate exactly £10,000 across campaign types" points={scores.a13?.points || 0}>
        {a13Locked && <div className="mb-3"><LockedBadge /></div>}
        <Alert type="info">💷 Allocate exactly £10,000 across the four campaign types. Explain your rationale using ROI and intent thinking.</Alert>
        <div className="space-y-3 mb-4">
          {[{ key: 'brand' as const, label: 'Brand' }, { key: 'generic' as const, label: 'Generic' }, { key: 'comp' as const, label: 'Competitor' }, { key: 'retarg' as const, label: 'Retargeting' }].map(row => (
            <div key={row.key} className="flex items-center gap-4">
              <div className="w-28 text-sm font-semibold text-slate-700">{row.label}</div>
              <input type="range" min={0} max={10000} step={100} disabled={a13Locked} value={budget[row.key]}
                onChange={e => setBudget(prev => ({ ...prev, [row.key]: parseInt(e.target.value) }))} className="flex-1 accent-brand-500" />
              <input type="number" min={0} max={10000} step={100} disabled={a13Locked} value={budget[row.key]}
                onChange={e => setBudget(prev => ({ ...prev, [row.key]: parseInt(e.target.value) || 0 }))}
                className="w-28 text-right font-bold font-mono border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none focus:border-brand-400 disabled:bg-slate-50" />
            </div>
          ))}
        </div>
        <div className={cn('flex justify-between items-center px-4 py-3 rounded-lg font-bold text-sm mb-4',
          total === 10000 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          total > 10000 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200')}>
          <span>Total</span>
          <span>£{total.toLocaleString()} / £10,000 {total === 10000 ? '✓' : total > 10000 ? '— over budget' : `— £${(10000 - total).toLocaleString()} remaining`}</span>
        </div>
        <label className="form-label">Budget Rationale</label>
        <textarea className="form-textarea" rows={3} disabled={a13Locked}
          placeholder="Justify your allocation using ROI, conversion intent, and retargeting strategy... (min 50 chars)"
          value={rationale} onChange={e => setRationale(e.target.value)} />
        <CharCount value={rationale} min={50} max={250} />
        {!a13Locked && (
          <div className="mt-3">
            <button className="btn-success btn-sm" onClick={submitA13} disabled={total !== 10000 || rationale.length < 50}>Submit Answers</button>
            {total !== 10000 && <div className="text-xs text-amber-600 mt-1.5">Budget must total exactly £10,000 before submitting (currently £{total.toLocaleString()})</div>}
            {total === 10000 && rationale.length < 50 && <div className="text-xs text-amber-600 mt-1.5">Add your budget rationale (min 50 chars) before submitting</div>}
          </div>
        )}
        {a13Locked && a13Fb && <QualityFeedback completionPts={a13Fb.cPts} qualityPts={a13Fb.qPts} qualityReason={a13Fb.why} />}
        {a13Locked && scores.a13 && (
          <FeedbackPanel
            score={scores.a13.points} max={5}
            completionPts={scores.a13.completionPts} qualityPts={scores.a13.qualityPts}
            why={`Completion: total must equal exactly £10,000 = 2pts. Quality: rationale using ROI, conversion, retargeting, intent vocabulary = up to 3pts.`}
            example="Brand (£2,500 — 25%): Protect branded searches from competitor conquesting. High ROAS, low CPC. Generic (£4,000 — 40%): Highest volume opportunity. Mid-funnel, drives discovery. Competitor (£1,500 — 15%): Conquesting spend to capture comparison shoppers. Retargeting (£2,000 — 20%): Highest converting segment — users who have already shown purchase intent. Strongest ROAS of all campaign types."
            keyLearning={[
              'Brand campaigns have the highest ROAS — always protect your brand terms from competitor bidding.',
              'Generic campaigns drive volume but at higher CPC — require strong Quality Score to be efficient.',
              'Retargeting typically delivers the strongest ROAS of any campaign type — prior intent signals make conversion more likely.',
              'Competitor campaigns (conquesting) can drive share of voice but watch for low Quality Score and high CPC.',
            ]}
          />
        )}
      </ActivityCard>

      {/* SIM 3 */}
      <ActivityCard number="SIM" title="Paid Media Lab — Simulator" subtitle="Enter individual student scores from Paid Media Lab" points={scores.sim3?.points || 0} isSimulator>
        <Alert type="info">📊 Enter each team member's Paid Media Lab score. Auto-converted to workshop points.</Alert>
        <SimInputs values={simVals} onChange={handleSim} memberCount={team?.members.length || 5} />
        {sim3 && sim3.average !== null && (
          <div className="alert-success mt-3">Average: <strong>{sim3.average.toFixed(1)}</strong> → <strong>{sim3.points} workshop points</strong></div>
        )}
      </ActivityCard>
    </div>
  )
}
