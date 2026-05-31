import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { ActivityCard, Alert } from '../ui/shared'

const EEAT_DIMS = [
  { key: 'a9_exp' as const, noteKey: 'a9_exp_note' as const, label: 'Experience', hint: 'Evidence of first-hand experience...' },
  { key: 'a9_exp2' as const, noteKey: 'a9_exp2_note' as const, label: 'Expertise', hint: 'Subject matter knowledge and depth...' },
  { key: 'a9_auth' as const, noteKey: 'a9_auth_note' as const, label: 'Authority', hint: 'Backlinks, mentions, industry recognition...' },
  { key: 'a9_trust' as const, noteKey: 'a9_trust_note' as const, label: 'Trust', hint: 'Transparency, reviews, security signals...' },
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          className={`w-7 h-7 border rounded text-base transition-all flex items-center justify-center ${
            n <= (hover || value) ? 'bg-amber-50 border-amber-300 text-amber-500' : 'border-slate-200 text-slate-300 hover:border-amber-300'
          }`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >★</button>
      ))}
    </div>
  )
}

export function Block4Panel() {
  const { team, scores, responses, updateScore, updateResponse } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // A8
  const [a8, setA8] = useState({
    pillar: responses.a8_pillar || '',
    s1: responses.a8_s1 || '',
    s2: responses.a8_s2 || '',
    s3: responses.a8_s3 || '',
    q1: responses.a8_q1 || '',
    q2: responses.a8_q2 || '',
    q3: responses.a8_q3 || '',
  })

  const scoreA8 = (updated: typeof a8) => {
    const fields = Object.values(updated)
    const filled = fields.filter(v => v.trim().length > 0).length
    const pts = Math.min(5, Math.round(filled * 5 / fields.length) + (filled === fields.length ? 1 : 0))
    updateScore('a8', Math.min(5, pts))
    updateResponse({
      a8_pillar: updated.pillar, a8_s1: updated.s1, a8_s2: updated.s2, a8_s3: updated.s3,
      a8_q1: updated.q1, a8_q2: updated.q2, a8_q3: updated.q3,
    })
  }

  const updateA8 = (key: keyof typeof a8, val: string) => {
    const next = { ...a8, [key]: val }
    setA8(next); scoreA8(next)
  }

  // A9
  const [eeatRatings, setEeatRatings] = useState({
    a9_exp: responses.a9_exp || 0,
    a9_exp2: responses.a9_exp2 || 0,
    a9_auth: responses.a9_auth || 0,
    a9_trust: responses.a9_trust || 0,
  })
  const [eeatNotes, setEeatNotes] = useState({
    a9_exp_note: responses.a9_exp_note || '',
    a9_exp2_note: responses.a9_exp2_note || '',
    a9_auth_note: responses.a9_auth_note || '',
    a9_trust_note: responses.a9_trust_note || '',
  })

  const scoreA9 = (ratings: typeof eeatRatings, notes: typeof eeatNotes) => {
    const ratingsFilled = Object.values(ratings).filter(v => v > 0).length
    const notesFilled = Object.values(notes).filter(v => v.length > 10).length
    const pts = Math.min(5, Math.floor(ratingsFilled * 1.25) + notesFilled)
    updateScore('a9', pts)
    updateResponse({ ...ratings, ...notes })
  }

  const setRating = (key: keyof typeof eeatRatings, v: number) => {
    const next = { ...eeatRatings, [key]: v }
    setEeatRatings(next); scoreA9(next, eeatNotes)
  }
  const setNote = (key: keyof typeof eeatNotes, v: string) => {
    const next = { ...eeatNotes, [key]: v }
    setEeatNotes(next); scoreA9(eeatRatings, next)
  }

  // A10
  const [a10, setA10] = useState({
    gbp: responses.a10_gbp || '',
    reviews: responses.a10_reviews || '',
    citations: responses.a10_citations || '',
    nap: responses.a10_nap || '',
  })

  const scoreA10 = (updated: typeof a10) => {
    const filled = Object.values(updated).filter(v => v.trim().length > 20).length
    const pts = Math.min(5, filled + (filled >= 3 ? 1 : 0))
    updateScore('a10', pts)
    updateResponse({ a10_gbp: updated.gbp, a10_reviews: updated.reviews, a10_citations: updated.citations, a10_nap: updated.nap })
  }

  const updateA10 = (key: keyof typeof a10, val: string) => {
    const next = { ...a10, [key]: val }
    setA10(next); scoreA10(next)
  }

  return (
    <div>
      {/* A8 */}
      <ActivityCard number={8} title="Topic Cluster Builder" subtitle="Design a content hub around a pillar topic" points={scores.a8?.points || 0}>
        <Alert type="info">🏗️ A topic cluster has one pillar page and supporting content. Create a cluster relevant to <strong>{brand}</strong>.</Alert>
        <div className="mb-4">
          <label className="form-label">Pillar Topic</label>
          <input className="form-input" placeholder={`e.g. The Complete Guide to ${brand}`} value={a8.pillar} onChange={e => updateA8('pillar', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {(['s1', 's2', 's3'] as const).map((k, i) => (
            <div key={k}>
              <label className="form-label">Supporting Topic {i + 1}</label>
              <input className="form-input" placeholder={`Supporting article ${i + 1}`} value={a8[k]} onChange={e => updateA8(k, e.target.value)} />
            </div>
          ))}
        </div>
        <label className="form-label">Customer Questions (that this cluster answers)</label>
        {(['q1', 'q2', 'q3'] as const).map((k, i) => (
          <input key={k} className="form-input mb-2" placeholder={`Question ${i + 1}`} value={a8[k]} onChange={e => updateA8(k, e.target.value)} />
        ))}
      </ActivityCard>

      {/* A9 */}
      <ActivityCard number={9} title="E-E-A-T Audit" subtitle="Rate your brand's credibility signals" points={scores.a9?.points || 0}>
        <Alert type="info">🌟 Rate <strong>{brand}</strong> 1–5 stars on each E-E-A-T dimension. Add a note explaining your rating.</Alert>
        <div className="divide-y divide-slate-100">
          {EEAT_DIMS.map(dim => (
            <div key={dim.key} className="py-3 flex items-center gap-4">
              <div className="w-24 text-sm font-bold text-slate-700 flex-shrink-0">{dim.label}</div>
              <StarRating value={eeatRatings[dim.key]} onChange={v => setRating(dim.key, v)} />
              <input
                className="flex-1 form-input text-xs"
                placeholder={dim.hint}
                value={eeatNotes[dim.noteKey]}
                onChange={e => setNote(dim.noteKey, e.target.value)}
              />
            </div>
          ))}
        </div>
        {/* Summary */}
        {Object.values(eeatRatings).some(v => v > 0) && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {EEAT_DIMS.map(dim => (
              <div key={dim.key} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{dim.label}</div>
                <div className="text-2xl font-bold text-brand-600">{eeatRatings[dim.key] || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </ActivityCard>

      {/* A10 */}
      <ActivityCard number={10} title="Local SEO Challenge" subtitle="Provide Local SEO recommendations for your brand" points={scores.a10?.points || 0}>
        <Alert type="info">📍 Even global brands have a local SEO opportunity. Provide recommendations across the four pillars.</Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'gbp' as const, label: 'Google Business Profile', placeholder: 'What should your brand optimise in GBP? Categories, photos, posts, Q&A...' },
            { key: 'reviews' as const, label: 'Reviews Strategy', placeholder: 'How should your brand generate and manage reviews?' },
            { key: 'citations' as const, label: 'Citations & Directories', placeholder: 'Which directories should your brand be listed in?' },
            { key: 'nap' as const, label: 'NAP Consistency', placeholder: 'How will you ensure Name, Address, Phone are consistent everywhere?' },
          ].map(field => (
            <div key={field.key}>
              <label className="form-label">{field.label}</label>
              <textarea className="form-textarea" rows={3} placeholder={field.placeholder} value={a10[field.key]} onChange={e => updateA10(field.key, e.target.value)} />
            </div>
          ))}
        </div>
      </ActivityCard>
    </div>
  )
}
