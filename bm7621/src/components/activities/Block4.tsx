import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { QUALITY_KEYWORDS, calcQualityPts, calcCompletionPts } from '../../data/workshop'
import { ActivityCard, Alert, CharCount, ScoreBreakdown } from '../ui/shared'

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
        <button key={n}
          className={`w-7 h-7 border rounded text-base transition-all flex items-center justify-center ${n <= (hover || value) ? 'bg-amber-50 border-amber-300 text-amber-500' : 'border-slate-200 text-slate-300 hover:border-amber-300'}`}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)}>★</button>
      ))}
    </div>
  )
}

// Weak article for Content Makeover
const WEAK_ARTICLE = `Title: How to Get More Traffic

Getting more traffic to your website is important. There are many ways to do this. You can use social media, write blogs, and do SEO. SEO means search engine optimisation.

What is SEO?
SEO is about making your website better so Google shows it. You need keywords. Keywords are words people search for. Put them in your content.

Why Traffic Matters
Traffic means visitors. More visitors can mean more sales. Businesses want more sales. So traffic is important for business.

Conclusion
In summary, getting traffic is important and you should try different things to get it. Good luck with your website.`

export function Block4Panel() {
  const { team, scores, responses, updateScore, updateResponse } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // A9 — E-E-A-T (now first in block)
  const [eeatRatings, setEeatRatings] = useState({
    a9_exp: responses.a9_exp || 0, a9_exp2: responses.a9_exp2 || 0,
    a9_auth: responses.a9_auth || 0, a9_trust: responses.a9_trust || 0,
  })
  const [eeatNotes, setEeatNotes] = useState({
    a9_exp_note: responses.a9_exp_note || '', a9_exp2_note: responses.a9_exp2_note || '',
    a9_auth_note: responses.a9_auth_note || '', a9_trust_note: responses.a9_trust_note || '',
  })

  const scoreA9 = (ratings: typeof eeatRatings, notes: typeof eeatNotes) => {
    const ratingsFilled = Object.values(ratings).filter(v => v > 0).length
    const notesFilled = Object.values(notes).filter(v => v.length > 20).length
    const cPts = ratingsFilled >= 4 ? 2 : ratingsFilled >= 2 ? 1 : 0
    const qPts = Math.min(3, notesFilled)
    updateScore('a9', cPts + qPts, 5, cPts, qPts)
    updateResponse({ ...ratings, ...notes })
  }

  const setRating = (key: keyof typeof eeatRatings, v: number) => {
    const next = { ...eeatRatings, [key]: v }; setEeatRatings(next); scoreA9(next, eeatNotes)
  }
  const setNote = (key: keyof typeof eeatNotes, v: string) => {
    const next = { ...eeatNotes, [key]: v }; setEeatNotes(next); scoreA9(eeatRatings, next)
  }

  // A8 — Topic Cluster
  const [a8, setA8] = useState({
    pillar: responses.a8_pillar || '', s1: responses.a8_s1 || '', s2: responses.a8_s2 || '', s3: responses.a8_s3 || '',
    q1: responses.a8_q1 || '', q2: responses.a8_q2 || '', q3: responses.a8_q3 || '',
  })

  const scoreA8 = (updated: typeof a8) => {
    const fields = Object.values(updated)
    const filled = fields.filter(v => v.trim().length > 0).length
    const pts = Math.min(5, Math.round(filled * 5 / fields.length) + (filled === fields.length ? 1 : 0))
    updateScore('a8', Math.min(5, pts))
    updateResponse({ a8_pillar: updated.pillar, a8_s1: updated.s1, a8_s2: updated.s2, a8_s3: updated.s3, a8_q1: updated.q1, a8_q2: updated.q2, a8_q3: updated.q3 })
  }

  const updateA8 = (key: keyof typeof a8, val: string) => {
    const next = { ...a8, [key]: val }; setA8(next); scoreA8(next)
  }

  // A10 — Local SEO
  const [a10, setA10] = useState({
    gbp: responses.a10_gbp || '', reviews: responses.a10_reviews || '',
    citations: responses.a10_citations || '', nap: responses.a10_nap || '',
  })

  const scoreA10 = (updated: typeof a10) => {
    const fields = Object.values(updated)
    const cPts = calcCompletionPts(fields, 50)
    const allText = fields.join(' ')
    const qPts = calcQualityPts(allText, ['local', 'google', 'review', 'citation', 'nap', 'consist', 'directory', 'gbp', 'map'])
    updateScore('a10', Math.min(5, cPts + qPts), 5, cPts, qPts)
    updateResponse({ a10_gbp: updated.gbp, a10_reviews: updated.reviews, a10_citations: updated.citations, a10_nap: updated.nap })
  }

  const updateA10 = (key: keyof typeof a10, val: string) => {
    const next = { ...a10, [key]: val }; setA10(next); scoreA10(next)
  }

  // A10b — Content Makeover
  const [a10b, setA10b] = useState({
    heading: responses.a10b_heading || '', intro: responses.a10b_intro || '',
    imp1: responses.a10b_imp1 || '', imp2: responses.a10b_imp2 || '', imp3: responses.a10b_imp3 || '',
    why: responses.a10b_why || '',
  })

  const scoreA10b = (updated: typeof a10b) => {
    const fields = [updated.heading, updated.intro, updated.imp1, updated.imp2, updated.imp3, updated.why]
    const cPts = calcCompletionPts(fields, 20)
    const allText = fields.join(' ')
    const qPts = calcQualityPts(allText, QUALITY_KEYWORDS.content_makeover)
    updateScore('a10b', Math.min(5, cPts + qPts), 5, cPts, qPts)
    updateResponse({ a10b_heading: updated.heading, a10b_intro: updated.intro, a10b_imp1: updated.imp1, a10b_imp2: updated.imp2, a10b_imp3: updated.imp3, a10b_why: updated.why })
  }

  const updateA10b = (key: keyof typeof a10b, val: string) => {
    const next = { ...a10b, [key]: val }; setA10b(next); scoreA10b(next)
  }

  return (
    <div>
      {/* A9 — E-E-A-T (first in block) */}
      <ActivityCard number={9} title="E-E-A-T Audit" subtitle="Rate your brand's credibility signals" points={scores.a9?.points || 0}>
        <Alert type="info">🌟 Rate <strong>{brand}</strong> 1–5 stars on each E-E-A-T dimension. Add a note explaining your rating (min 20 chars).</Alert>
        <div className="divide-y divide-slate-100">
          {EEAT_DIMS.map(dim => (
            <div key={dim.key} className="py-3 flex items-center gap-4">
              <div className="w-24 text-sm font-bold text-slate-700 flex-shrink-0">{dim.label}</div>
              <StarRating value={eeatRatings[dim.key]} onChange={v => setRating(dim.key, v)} />
              <input className="flex-1 form-input text-xs" placeholder={dim.hint}
                value={eeatNotes[dim.noteKey]} onChange={e => setNote(dim.noteKey, e.target.value)} />
            </div>
          ))}
        </div>
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
        {scores.a9 && <ScoreBreakdown completionPts={scores.a9.completionPts} qualityPts={scores.a9.qualityPts} />}
      </ActivityCard>

      {/* A8 — Topic Cluster */}
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
        <label className="form-label">Customer Questions this cluster answers</label>
        {(['q1', 'q2', 'q3'] as const).map((k, i) => (
          <input key={k} className="form-input mb-2" placeholder={`Question ${i + 1}`} value={a8[k]} onChange={e => updateA8(k, e.target.value)} />
        ))}
      </ActivityCard>

      {/* A10 — Local SEO */}
      <ActivityCard number={10} title="Local SEO Challenge" subtitle="Provide Local SEO recommendations for your brand" points={scores.a10?.points || 0}>
        <Alert type="info">📍 Even global brands have a local SEO opportunity. Provide recommendations across the four pillars (min 50 chars each).</Alert>
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
              <CharCount value={a10[field.key]} min={50} max={250} />
            </div>
          ))}
        </div>
        {scores.a10 && <ScoreBreakdown completionPts={scores.a10.completionPts} qualityPts={scores.a10.qualityPts} />}
      </ActivityCard>

      {/* A10b — Content Makeover Challenge */}
      <ActivityCard number="10b" title="Content Makeover Challenge" subtitle="Improve an underperforming article" points={scores.a10b?.points || 0}>
        <Alert type="warning">📝 The article below has several quality problems. Your job is to improve it using SEO and E-E-A-T principles.</Alert>
        <div className="bg-slate-900 text-slate-300 rounded-xl p-4 mb-5 font-mono text-xs leading-relaxed whitespace-pre-wrap border border-slate-700">
          {WEAK_ARTICLE}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Improved Heading</label>
            <input className="form-input" placeholder="Write a clear, keyword-rich, specific heading..." value={a10b.heading} onChange={e => updateA10b('heading', e.target.value)} />
            <CharCount value={a10b.heading} min={20} max={100} />
          </div>
          <div>
            <label className="form-label">Improved Introduction</label>
            <textarea className="form-textarea" rows={3} placeholder="Write an intro that demonstrates expertise and sets expectations..." value={a10b.intro} onChange={e => updateA10b('intro', e.target.value)} />
            <CharCount value={a10b.intro} min={50} max={250} />
          </div>
        </div>
        <label className="form-label">Three Content Improvements You Would Make</label>
        {(['imp1', 'imp2', 'imp3'] as const).map((k, i) => (
          <div key={k} className="mb-2">
            <input className="form-input" placeholder={`Improvement ${i + 1} — e.g. Add expert quotes and cited research to build authority`} value={a10b[k]} onChange={e => updateA10b(k, e.target.value)} />
            <CharCount value={a10b[k]} min={20} max={250} />
          </div>
        ))}
        <label className="form-label">Why Is Your Version Better?</label>
        <textarea className="form-textarea" rows={4}
          placeholder="Explain using E-E-A-T principles why your version demonstrates more expertise, authority and trust... (min 100 chars)"
          value={a10b.why} onChange={e => updateA10b('why', e.target.value)} />
        <CharCount value={a10b.why} min={100} max={500} />
        {scores.a10b && <ScoreBreakdown completionPts={scores.a10b.completionPts} qualityPts={scores.a10b.qualityPts} />}
      </ActivityCard>
    </div>
  )
}
