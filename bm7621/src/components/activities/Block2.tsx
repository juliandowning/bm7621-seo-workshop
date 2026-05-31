import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { CTR_ANSWERS } from '../../data/workshop'
import { ActivityCard, Alert } from '../ui/shared'

function charCountClass(len: number, min: number, max: number) {
  if (len === 0) return 'text-slate-400'
  if (len >= min && len <= max) return 'text-emerald-600 font-semibold'
  return 'text-amber-600 font-semibold'
}

export function Block2Panel() {
  const { team, scores, responses, updateScore, updateResponse } = useWorkspaceStore()
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

  // A5
  const [p1, setP1] = useState(responses.a5_p1 || '')
  const [p8, setP8] = useState(responses.a5_p8 || '')
  const [p2, setP2] = useState(responses.a5_p2 || '')
  const [a5Result, setA5Result] = useState<string | null>(null)

  const checkA5 = () => {
    const r1 = parseInt(p1); const r8 = parseInt(p8); const r2 = parseInt(p2)
    let correct = 0
    if (r1 === CTR_ANSWERS.p1) correct++
    if (r8 === CTR_ANSWERS.p8) correct++
    if (r2 === CTR_ANSWERS.p2) correct++
    const pts = correct === 3 ? 5 : correct === 2 ? 3 : correct === 1 ? 2 : 0
    updateScore('a5', pts)
    updateResponse({ a5_p1: p1, a5_p8: p8, a5_p2: p2 })
    setA5Result(`${correct}/3 correct. Answers: Position 1 = 3,500 | Position 8 = 300 | Page 2 = 50 → ${pts} points`)
  }

  const domainStr = brand.toLowerCase().replace(/[^a-z]/g, '')

  return (
    <div>
      {/* A4 */}
      <ActivityCard number={4} title="The On-Page Mini Ad" subtitle="Write an optimised Title Tag and Meta Description" points={scores.a4?.points || 0}>
        <Alert type="info">✍️ Write a Title Tag (30–60 chars) and Meta Description (120–160 chars) for <strong>{brand}'s</strong> homepage. Character counts validated live.</Alert>

        <div className="mb-4">
          <label className="form-label">Title Tag</label>
          <input
            className="form-input"
            placeholder={`e.g. ${brand} | Shop Now — Free Delivery on Orders Over £35`}
            value={title}
            onChange={e => { setTitle(e.target.value); scoreA4(e.target.value, meta, kw) }}
          />
          <div className={`text-xs mt-1 ${charCountClass(title.length, 30, 60)}`}>
            {title.length} characters (target: 30–60)
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Meta Description</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Describe the page compellingly within 120–160 characters to maximise SERP click-through rate..."
            value={meta}
            onChange={e => { setMeta(e.target.value); scoreA4(title, e.target.value, kw) }}
          />
          <div className={`text-xs mt-1 ${charCountClass(meta.length, 120, 160)}`}>
            {meta.length} characters (target: 120–160)
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Primary Keyword Targeted</label>
          <input
            className="form-input"
            placeholder="What keyword is this page optimised for?"
            value={kw}
            onChange={e => { setKw(e.target.value); scoreA4(title, meta, e.target.value) }}
          />
        </div>

        {/* SERP preview */}
        {title && (
          <div>
            <label className="form-label">SERP Preview</label>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">https://www.{domainStr}.com</div>
              <div className="text-blue-700 font-medium text-[15px] mb-1 leading-snug">
                {title.slice(0, 65)}{title.length > 65 ? '…' : ''}
              </div>
              {meta && (
                <div className="text-sm text-slate-500 leading-relaxed">
                  {meta.slice(0, 160)}{meta.length > 160 ? '…' : ''}
                </div>
              )}
            </div>
          </div>
        )}
      </ActivityCard>

      {/* A5 */}
      <ActivityCard number={5} title="CTR Reality Check" subtitle="Calculate estimated clicks from 10,000 monthly searches" points={scores.a5?.points || 0}>
        <Alert type="info">🧮 Using the CTR benchmarks, calculate estimated monthly clicks. Benchmark: Position 1 = 35% · Position 8 = 3% · Page 2 = 0.5%</Alert>

        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-5 text-sm font-semibold text-slate-600">
          Volume: 10,000 searches / month
        </div>

        <div className="space-y-3 mb-4">
          {[
            { label: 'Position 1', formula: '10,000 × 35% =', state: p1, set: setP1, key: 'p1' as const },
            { label: 'Position 8', formula: '10,000 × 3% =', state: p8, set: setP8, key: 'p8' as const },
            { label: 'Page 2', formula: '10,000 × 0.5% =', state: p2, set: setP2, key: 'p2' as const },
          ].map(row => (
            <div key={row.key} className="flex items-center gap-4">
              <div className="w-28 text-sm font-semibold text-slate-700">{row.label}</div>
              <div className="font-mono text-xs text-slate-400 w-36">{row.formula}</div>
              <input
                type="number"
                className="w-28 text-center font-bold text-base border border-slate-200 rounded-lg py-2 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 font-mono"
                placeholder="?"
                value={row.state}
                onChange={e => {
                  row.set(e.target.value)
                  updateResponse({ [`a5_${row.key}`]: e.target.value } as never)
                }}
              />
              <span className="text-sm text-slate-400">clicks / month</span>
            </div>
          ))}
        </div>

        <button className="btn-success btn-sm" onClick={checkA5}>Check Answers</button>
        {a5Result && <div className={`mt-3 ${parseInt(p1) === CTR_ANSWERS.p1 && parseInt(p8) === CTR_ANSWERS.p8 && parseInt(p2) === CTR_ANSWERS.p2 ? 'alert-success' : 'alert-warning'}`}>{a5Result}</div>}
      </ActivityCard>
    </div>
  )
}
