import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { CTR_ANSWERS, ACTIVITY_DISPLAY_NUM } from '../../data/workshop'
import { ActivityCard, Alert, FeedbackPanel, CharCount, LockedBadge } from '../ui/shared'

const N = ACTIVITY_DISPLAY_NUM

function charCountClass(len: number, min: number, max: number) {
  if (len === 0) return 'text-slate-400'
  if (len >= min && len <= max) return 'text-emerald-600 font-semibold'
  return 'text-amber-600 font-semibold'
}

export function Block2Panel() {
  const { team, scores, responses, updateScore, updateResponse, lockActivity } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // A4 — lock+feedback
  const a4Locked = !!responses.locked_a4
  const [title, setTitle] = useState(responses.a4_title || '')
  const [meta, setMeta] = useState(responses.a4_meta || '')
  const [kw, setKw] = useState(responses.a4_kw || '')

  const scoreA4 = (t: string, m: string, k: string, lock = false) => {
    let pts = 0
    if (t.length >= 30 && t.length <= 60) pts += 2; else if (t.length > 0) pts++
    if (m.length >= 120 && m.length <= 160) pts += 2; else if (m.length > 0) pts++
    if (k.trim()) pts++
    updateScore('a4', Math.min(5, pts))
    updateResponse({ a4_title: t, a4_meta: m, a4_kw: k, ...(lock ? { locked_a4: true } : {}) })
    if (lock) lockActivity('a4')
  }

  // A5 — 3 questions (Q4 removed), lock+feedback
  const a5Locked = !!responses.locked_a5
  const [p1, setP1] = useState(responses.a5_p1 || '')
  const [p8, setP8] = useState(responses.a5_p8 || '')
  const [p2, setP2] = useState(responses.a5_p2 || '')

  const submitA5 = () => {
    if (a5Locked) return
    const r1 = parseInt(p1); const r8 = parseInt(p8); const r2 = parseInt(p2)
    let correct = 0
    if (r1 === CTR_ANSWERS.p1) correct++
    if (r8 === CTR_ANSWERS.p8) correct++
    if (r2 === CTR_ANSWERS.p2) correct++
    const cPts = [p1,p8,p2].filter(v => v.trim()).length >= 3 ? 2 : [p1,p8,p2].filter(v => v.trim()).length >= 1 ? 1 : 0
    const qPts = Math.min(3, correct)
    const pts = cPts + qPts
    updateScore('a5', pts, 5, cPts, qPts)
    updateResponse({ a5_p1: p1, a5_p8: p8, a5_p2: p2, locked_a5: true })
    lockActivity('a5')
  }

  const a5Correct = (() => {
    let c = 0
    if (parseInt(responses.a5_p1 || '0') === CTR_ANSWERS.p1) c++
    if (parseInt(responses.a5_p8 || '0') === CTR_ANSWERS.p8) c++
    if (parseInt(responses.a5_p2 || '0') === CTR_ANSWERS.p2) c++
    return c
  })()

  const domainStr = brand.toLowerCase().replace(/[^a-z]/g, '')
  const allFilled = [p1, p8, p2].every(v => v.trim())

  return (
    <div>
      {/* A4 */}
      <ActivityCard number={N.a4} title="The On-Page Mini Ad" subtitle="Write an optimised Title Tag and Meta Description" points={scores.a4?.points || 0}>
        <Alert type="info">✍️ Write a Title Tag (30–60 chars) and Meta Description (120–160 chars) for <strong>{brand}'s</strong> homepage.</Alert>
        {a4Locked && <div className="mb-3"><LockedBadge /></div>}
        <div className="mb-4">
          <label className="form-label">Title Tag</label>
          <input className="form-input" disabled={a4Locked}
            placeholder={`e.g. ${brand} | Shop Now — Free Delivery on Orders Over £35`}
            value={title} onChange={e => { setTitle(e.target.value); if (!a4Locked) scoreA4(e.target.value, meta, kw) }} />
          <div className={`text-xs mt-1 ${charCountClass(title.length, 30, 60)}`}>{title.length} characters (target: 30–60)</div>
        </div>
        <div className="mb-4">
          <label className="form-label">Meta Description</label>
          <textarea className="form-textarea" rows={3} disabled={a4Locked}
            placeholder="Describe the page compellingly within 120–160 characters..."
            value={meta} onChange={e => { setMeta(e.target.value); if (!a4Locked) scoreA4(title, e.target.value, kw) }} />
          <div className={`text-xs mt-1 ${charCountClass(meta.length, 120, 160)}`}>{meta.length} characters (target: 120–160)</div>
        </div>
        <div className="mb-4">
          <label className="form-label">Primary Keyword Targeted</label>
          <input className="form-input" disabled={a4Locked} placeholder="What keyword is this page optimised for?"
            value={kw} onChange={e => { setKw(e.target.value); if (!a4Locked) scoreA4(title, meta, e.target.value) }} />
        </div>
        {title && (
          <div className="mb-4">
            <label className="form-label">SERP Preview</label>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">https://www.{domainStr}.com</div>
              <div className="text-blue-700 font-medium text-[15px] mb-1 leading-snug">{title.slice(0, 65)}{title.length > 65 ? '…' : ''}</div>
              {meta && <div className="text-sm text-slate-500">{meta.slice(0, 160)}{meta.length > 160 ? '…' : ''}</div>}
            </div>
          </div>
        )}
        {!a4Locked && (
          <button className="btn-success btn-sm" onClick={() => scoreA4(title, meta, kw, true)}
            disabled={!title.trim() || !meta.trim() || !kw.trim()}>Submit Answers</button>
        )}
        {a4Locked && scores.a4 && (
          <FeedbackPanel
            score={scores.a4.points} max={5}
            why={`Title tag: ${title.length} chars (target 30–60 = 2pts, any value = 1pt). Meta: ${meta.length} chars (target 120–160 = 2pts). Keyword field: 1pt for completion.`}
            example={`Title: "${brand} Official Store | Free Delivery on Orders Over £35 | Shop Now" — 64 chars, keyword-rich, includes brand, benefit and CTA. Meta: "Shop the latest ${brand} collections with free next-day delivery. Browse thousands of styles across clothing, shoes and accessories. Easy returns." — 148 chars.`}
            keyLearning={[
              'Title tags are the most important on-page SEO element — lead with the primary keyword.',
              'Meta descriptions don\'t directly affect rankings but a well-written meta significantly improves CTR.',
              'Google truncates titles over ~60 chars and metas over ~160 chars — always stay within limits.',
            ]}
          />
        )}
      </ActivityCard>

      {/* A5 — 3 questions */}
      <ActivityCard number={N.a5} title="CTR Reality Check" subtitle="Calculate estimated clicks from 10,000 monthly searches" points={scores.a5?.points || 0}>
        {a5Locked && <div className="mb-3"><LockedBadge /></div>}
        <Alert type="info">🧮 Using the CTR benchmarks, calculate estimated monthly clicks. Pos 1 = 35% · Pos 8 = 3% · Page 2 = 0.5%</Alert>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-5 text-sm font-semibold text-slate-600">Volume: 10,000 searches / month</div>
        <div className="space-y-3 mb-4">
          {[
            { label: 'Position 1', formula: '10,000 × 35% =', state: p1, set: setP1, key: 'p1' as const, answer: CTR_ANSWERS.p1 },
            { label: 'Position 8', formula: '10,000 × 3% =', state: p8, set: setP8, key: 'p8' as const, answer: CTR_ANSWERS.p8 },
            { label: 'Page 2', formula: '10,000 × 0.5% =', state: p2, set: setP2, key: 'p2' as const, answer: CTR_ANSWERS.p2 },
          ].map(row => (
            <div key={row.key} className="flex items-center gap-4">
              <div className="w-28 text-sm font-semibold text-slate-700">{row.label}</div>
              <div className="font-mono text-xs text-slate-400 w-36">{row.formula}</div>
              <input type="number" disabled={a5Locked}
                className="w-28 text-center font-bold text-base border border-slate-200 rounded-lg py-2 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 font-mono disabled:bg-slate-50"
                placeholder="?" value={row.state}
                onChange={e => { row.set(e.target.value); updateResponse({ [`a5_${row.key}`]: e.target.value } as never) }}
              />
              <span className="text-sm text-slate-400">clicks / month</span>
              {a5Locked && (
                <span className={`text-xs font-bold ${parseInt(row.state) === row.answer ? 'text-emerald-600' : 'text-red-500'}`}>
                  {parseInt(row.state) === row.answer ? '✓' : `✗ → ${row.answer.toLocaleString()}`}
                </span>
              )}
            </div>
          ))}
        </div>
        {!a5Locked && (
          <button className="btn-success btn-sm" onClick={submitA5} disabled={!allFilled}>Submit Answers</button>
        )}
        {!a5Locked && !allFilled && <div className="text-xs text-amber-600 mt-2">Complete all three answers before submitting.</div>}
        {a5Locked && scores.a5 && (
          <FeedbackPanel
            score={scores.a5.points} max={5}
            completionPts={scores.a5.completionPts} qualityPts={scores.a5.qualityPts}
            why={`${a5Correct}/3 correct. Correct answers: Pos 1 = 3,500 clicks · Pos 8 = 300 clicks · Page 2 = 50 clicks.`}
            example="Position 1 captures 35% of all clicks (3,500). By position 8 this falls to just 3% (300 clicks) — a 91% drop for the same search volume. Page 2 effectively delivers zero traffic at 0.5% (50 clicks). This is why ranking on page 1 matters so much."
            keyLearning={[
              'The difference in CTR between position 1 and position 8 is enormous — 35% vs 3%.',
              'Page 2 receives almost no traffic — for most businesses, it is the same as not ranking at all.',
              'Moving from position 5 to position 3 can more than double your organic traffic from the same keyword.',
            ]}
          />
        )}
      </ActivityCard>
    </div>
  )
}
