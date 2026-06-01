import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { CTR_ANSWERS } from '../../data/workshop'
import { ActivityCard, Alert, CharCount, LockedBadge, ScoreBreakdown } from '../ui/shared'

function charCountClass(len: number, min: number, max: number) {
  if (len === 0) return 'text-slate-400'
  if (len >= min && len <= max) return 'text-emerald-600 font-semibold'
  return 'text-amber-600 font-semibold'
}

export function Block2Panel() {
  const { team, scores, responses, updateScore, updateResponse, lockActivity } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // A4
  const [title, setTitle] = useState(responses.a4_title || '')
  const [meta, setMeta] = useState(responses.a4_meta || '')
  const [kw, setKw] = useState(responses.a4_kw || '')

  const scoreA4 = (t: string, m: string, k: string) => {
    let pts = 0
    const tl = t.length; const ml = m.length
    if (tl >= 30 && tl <= 60) pts += 2; else if (tl > 0) pts += 1
    if (ml >= 120 && ml <= 160) pts += 2; else if (ml > 0) pts += 1
    if (k.trim()) pts++
    updateScore('a4', Math.min(5, pts))
    updateResponse({ a4_title: t, a4_meta: m, a4_kw: k })
  }

  // A5 — lock-in, now 4 questions
  const a5Locked = !!responses.locked_a5
  const [p1, setP1] = useState(responses.a5_p1 || '')
  const [p8, setP8] = useState(responses.a5_p8 || '')
  const [p2, setP2] = useState(responses.a5_p2 || '')
  const [p3, setP3] = useState(responses.a5_p3 || '')
  const [a5Result, setA5Result] = useState<string | null>(null)

  const submitA5 = () => {
    if (a5Locked) return
    const r1 = parseInt(p1); const r8 = parseInt(p8); const r2 = parseInt(p2); const r3 = parseInt(p3)
    let correct = 0
    if (r1 === CTR_ANSWERS.p1) correct++
    if (r8 === CTR_ANSWERS.p8) correct++
    if (r2 === CTR_ANSWERS.p2) correct++
    if (r3 === CTR_ANSWERS.p3) correct++
    const cPts = [p1,p8,p2,p3].filter(v => v.trim()).length >= 4 ? 2 : [p1,p8,p2,p3].filter(v => v.trim()).length >= 2 ? 1 : 0
    const qPts = Math.min(3, correct)
    const pts = cPts + qPts
    updateScore('a5', pts, 5, cPts, qPts)
    updateResponse({ a5_p1: p1, a5_p8: p8, a5_p2: p2, a5_p3: p3, locked_a5: true })
    lockActivity('a5')
    setA5Result(`${correct}/4 correct. Answers: Pos 1 = 3,500 · Pos 8 = 300 · Page 2 = 50 · Pos 3 = 1,650 → ${pts} pts`)
  }

  const domainStr = brand.toLowerCase().replace(/[^a-z]/g, '')
  const allFilled = [p1,p8,p2,p3].every(v => v.trim())

  return (
    <div>
      {/* A4 */}
      <ActivityCard number={4} title="The On-Page Mini Ad" subtitle="Write an optimised Title Tag and Meta Description" points={scores.a4?.points || 0}>
        <Alert type="info">✍️ Write a Title Tag (30–60 chars) and Meta Description (120–160 chars) for <strong>{brand}'s</strong> homepage.</Alert>
        <div className="mb-4">
          <label className="form-label">Title Tag</label>
          <input className="form-input" placeholder={`e.g. ${brand} | Shop Now — Free Delivery on Orders Over £35`}
            value={title} onChange={e => { setTitle(e.target.value); scoreA4(e.target.value, meta, kw) }} />
          <div className={`text-xs mt-1 ${charCountClass(title.length, 30, 60)}`}>{title.length} characters (target: 30–60)</div>
        </div>
        <div className="mb-4">
          <label className="form-label">Meta Description</label>
          <textarea className="form-textarea" rows={3}
            placeholder="Describe the page compellingly within 120–160 characters..."
            value={meta} onChange={e => { setMeta(e.target.value); scoreA4(title, e.target.value, kw) }} />
          <div className={`text-xs mt-1 ${charCountClass(meta.length, 120, 160)}`}>{meta.length} characters (target: 120–160)</div>
        </div>
        <div className="mb-4">
          <label className="form-label">Primary Keyword Targeted</label>
          <input className="form-input" placeholder="What keyword is this page optimised for?"
            value={kw} onChange={e => { setKw(e.target.value); scoreA4(title, meta, e.target.value) }} />
        </div>
        {title && (
          <div>
            <label className="form-label">SERP Preview</label>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">https://www.{domainStr}.com</div>
              <div className="text-blue-700 font-medium text-[15px] mb-1 leading-snug">{title.slice(0, 65)}{title.length > 65 ? '…' : ''}</div>
              {meta && <div className="text-sm text-slate-500 leading-relaxed">{meta.slice(0, 160)}{meta.length > 160 ? '…' : ''}</div>}
            </div>
          </div>
        )}
      </ActivityCard>

      {/* A5 — 4 questions, lock-in */}
      <ActivityCard number={5} title="CTR Reality Check" subtitle="Calculate estimated clicks from search volume" points={scores.a5?.points || 0}>
        {a5Locked && <div className="flex items-center gap-2 mb-3"><LockedBadge />{a5Result && <span className="text-xs text-slate-500">{a5Result}</span>}</div>}
        <Alert type="info">🧮 Using CTR benchmarks, calculate estimated monthly clicks. Pos 1 = 35% · Pos 3 = 11% · Pos 8 = 3% · Page 2 = 0.5%</Alert>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-5 text-sm font-semibold text-slate-600">Volume: 10,000 searches / month (Q1–Q3) · 15,000 searches / month (Q4)</div>
        <div className="space-y-3 mb-4">
          {[
            { label: 'Position 1', formula: '10,000 × 35% =', state: p1, set: setP1, key: 'p1' as const },
            { label: 'Position 8', formula: '10,000 × 3% =', state: p8, set: setP8, key: 'p8' as const },
            { label: 'Page 2', formula: '10,000 × 0.5% =', state: p2, set: setP2, key: 'p2' as const },
            { label: 'Position 3', formula: '15,000 × 11% =', state: p3, set: setP3, key: 'p3' as const },
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
            </div>
          ))}
        </div>
        {!a5Locked && (
          <button className="btn-success btn-sm" onClick={submitA5} disabled={!allFilled}>Submit Answers</button>
        )}
        {!a5Locked && !allFilled && <div className="text-xs text-amber-600 mt-2">Complete all four answers before submitting.</div>}
        {a5Locked && scores.a5 && <ScoreBreakdown completionPts={scores.a5.completionPts} qualityPts={scores.a5.qualityPts} />}
      </ActivityCard>
    </div>
  )
}
