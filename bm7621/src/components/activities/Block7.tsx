import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { A17_AI_CORRECT, A17_HUMAN_CORRECT, A17_ALL_ITEMS } from '../../data/workshop'
import { runCMOEvaluation, verdictToPoints } from '../../lib/cmoEngine'
import { ActivityCard, Alert, EvalBar } from '../ui/shared'
import { cn } from '../../lib/utils'

const VERDICT_CONFIG = {
  approved: {
    icon: '✅', label: 'Board Approved', color: 'border-emerald-400 bg-emerald-50',
    titleColor: 'text-emerald-700',
    message: 'Strong strategic thinking with commercial depth. Your recommendations demonstrate comprehensive understanding of the search landscape.',
  },
  revisions: {
    icon: '🔄', label: 'Approved With Revisions', color: 'border-amber-400 bg-amber-50',
    titleColor: 'text-amber-700',
    message: 'Solid foundation but some strategic gaps remain. Strengthen the commercial impact section and ensure all four pillars are addressed.',
  },
  rejected: {
    icon: '❌', label: 'Strategy Rejected', color: 'border-red-400 bg-red-50',
    titleColor: 'text-red-700',
    message: 'The board requires more substantive analysis. Revisit each section and ensure recommendations are grounded in specific workshop evidence.',
  },
}

export function Block7Panel() {
  const { team, scores, responses, cmoEval, updateScore, updateResponse, setCMOEval } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'

  // A16
  const [a16, setA16] = useState({
    auth: responses.a16_auth || '',
    cite: responses.a16_cite || '',
    orig: responses.a16_orig || '',
    struct: responses.a16_struct || '',
  })

  const scoreA16 = (updated: typeof a16) => {
    const filled = Object.values(updated).filter(v => v.trim().length > 20).length
    updateScore('a16', Math.min(5, filled + (filled >= 3 ? 1 : 0)))
    updateResponse({ a16_auth: updated.auth, a16_cite: updated.cite, a16_orig: updated.orig, a16_struct: updated.struct })
  }

  // A17
  const [a17ai, setA17ai] = useState<string[]>(responses.a17_ai || [])
  const [a17human, setA17human] = useState<string[]>(responses.a17_human || [])
  const [a17Result, setA17Result] = useState<string | null>(null)

  const checkA17 = () => {
    const aiCorrect = a17ai.filter(i => A17_AI_CORRECT.includes(i)).length
    const humanCorrect = a17human.filter(i => A17_HUMAN_CORRECT.includes(i)).length
    const aiFalse = a17ai.filter(i => !A17_AI_CORRECT.includes(i)).length
    const humanFalse = a17human.filter(i => !A17_HUMAN_CORRECT.includes(i)).length
    const correct = aiCorrect + humanCorrect
    const penalty = aiFalse + humanFalse
    const pts = Math.max(0, Math.min(5, Math.round((correct - penalty) * 5 / 7)))
    updateScore('a17', pts)
    updateResponse({ a17_ai: a17ai, a17_human: a17human })
    setA17Result(`AI Can Replace: Definitions, Rewritten Content, Commodity Listicles. Human Advantage: Original Research, Personal Experience, Case Studies, Expert Insight. → ${pts} points`)
  }

  // A18
  const [a18, setA18] = useState({
    seo: responses.a18_seo || '',
    tech: responses.a18_tech || '',
    ppc: responses.a18_ppc || '',
    ai: responses.a18_ai || '',
    r1: responses.a18_r1 || '',
    r2: responses.a18_r2 || '',
    r3: responses.a18_r3 || '',
    impact: responses.a18_impact || '',
  })

  const scoreA18 = (updated: typeof a18) => {
    const fields = Object.values(updated)
    const filled = fields.filter(v => v.trim().length > 20).length
    const pts = Math.min(5, Math.round(filled * 5 / fields.length) + (filled >= 7 ? 1 : 0))
    updateScore('a18', Math.min(5, pts))
    updateResponse({
      a18_seo: updated.seo, a18_tech: updated.tech, a18_ppc: updated.ppc, a18_ai: updated.ai,
      a18_r1: updated.r1, a18_r2: updated.r2, a18_r3: updated.r3, a18_impact: updated.impact,
    })
  }

  const updateA18 = (key: keyof typeof a18, val: string) => {
    const next = { ...a18, [key]: val }; setA18(next); scoreA18(next)
  }

  const handleSubmitBoard = () => {
    const eval_ = runCMOEvaluation(responses)
    setCMOEval(eval_)
    const pts = verdictToPoints(eval_.verdict)
    updateScore('a18', Math.max(scores.a18?.points || 0, pts))
  }

  return (
    <div>
      {/* A16 */}
      <ActivityCard number={16} title="AI Visibility Audit" subtitle="Assess your brand's AI search signals" points={scores.a16?.points || 0}>
        <Alert type="info">🤖 As AI Overviews reshape search, brands need new credibility signals. Audit <strong>{brand}</strong> across the four AI visibility dimensions.</Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'auth' as const, label: 'Authority Signals', placeholder: 'Wikipedia entries, news mentions, industry citations?' },
            { key: 'cite' as const, label: 'Citation Opportunities', placeholder: 'Publications, directories, authoritative sources that link to you?' },
            { key: 'orig' as const, label: 'Original Research & Data', placeholder: 'Proprietary research, reports, original insights?' },
            { key: 'struct' as const, label: 'Structured Content', placeholder: 'Schema markup, FAQs, clear Q&A format content?' },
          ].map(field => (
            <div key={field.key}>
              <label className="form-label">{field.label}</label>
              <textarea className="form-textarea" rows={3} placeholder={field.placeholder} value={a16[field.key]}
                onChange={e => { const next = { ...a16, [field.key]: e.target.value }; setA16(next); scoreA16(next) }} />
            </div>
          ))}
        </div>
      </ActivityCard>

      {/* A17 */}
      <ActivityCard number={17} title="AI Can Replace vs Human Advantage" subtitle="Sort content types into the correct category" points={scores.a17?.points || 0}>
        <Alert type="info">🧠 Which content types can AI replace effectively? Which require genuine human expertise?</Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { col: 'ai' as const, label: '🤖 AI Can Replace', state: a17ai, setState: setA17ai, bg: 'bg-violet-50 border-violet-200', title: 'text-violet-700' },
            { col: 'human' as const, label: '👤 Human Advantage', state: a17human, setState: setA17human, bg: 'bg-brand-50 border-brand-200', title: 'text-brand-700' },
          ].map(col => (
            <div key={col.col} className={`border rounded-xl p-4 ${col.bg}`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${col.title}`}>{col.label}</div>
              {A17_ALL_ITEMS.map(item => (
                <label key={item} className="flex items-center gap-2 py-1.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={col.state.includes(item)}
                    onChange={e => {
                      const next = e.target.checked ? [...col.state, item] : col.state.filter(x => x !== item)
                      col.setState(next)
                      updateResponse({ [`a17_${col.col}`]: next } as never)
                    }}
                    className="accent-brand-500"
                  />
                  {item}
                </label>
              ))}
            </div>
          ))}
        </div>
        <button className="btn-success btn-sm" onClick={checkA17}>Check Answers</button>
        {a17Result && <div className="alert-info mt-3 text-sm">{a17Result}</div>}
      </ActivityCard>

      {/* A18 */}
      <ActivityCard number={18} title="CMO Strategy Challenge" subtitle="Deliver your final board-ready recommendation" points={scores.a18?.points || 0}>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Board Presentation</div>
          <div className="text-sm text-slate-700">You have 5 minutes with the CMO. Your strategy must be clear, commercial, and evidenced by today's workshop.</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { key: 'seo' as const, label: 'Biggest SEO Opportunity', placeholder: 'The single most impactful organic opportunity...' },
            { key: 'tech' as const, label: 'Biggest Technical Risk', placeholder: 'The technical issue that poses the greatest risk...' },
            { key: 'ppc' as const, label: 'Biggest PPC Opportunity', placeholder: 'Where can paid search drive the strongest commercial return?' },
            { key: 'ai' as const, label: 'Biggest AI Opportunity', placeholder: 'How should your brand position for AI-driven search?' },
          ].map(field => (
            <div key={field.key}>
              <label className="form-label">{field.label}</label>
              <textarea className="form-textarea" rows={3} placeholder={field.placeholder} value={a18[field.key]} onChange={e => updateA18(field.key, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="form-label">Top 3 Recommendations (in priority order)</label>
          {[
            { key: 'r1' as const, placeholder: 'Recommendation 1 — Most impactful, immediate action' },
            { key: 'r2' as const, placeholder: 'Recommendation 2' },
            { key: 'r3' as const, placeholder: 'Recommendation 3' },
          ].map(f => (
            <input key={f.key} className="form-input mb-2" placeholder={f.placeholder} value={a18[f.key]} onChange={e => updateA18(f.key, e.target.value)} />
          ))}
        </div>
        <div className="mb-5">
          <label className="form-label">Expected Business Impact</label>
          <textarea className="form-textarea" rows={3} placeholder="What commercial outcomes do you predict? Be specific about metrics and timeframes." value={a18.impact} onChange={e => updateA18('impact', e.target.value)} />
        </div>
        <button className="btn-primary" onClick={handleSubmitBoard}>🏛️ Submit to Board</button>
      </ActivityCard>

      {/* CMO Eval result */}
      {cmoEval && (
        <div className="card-p mt-0">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Board Evaluation Report</div>
          {cmoEval.dimensions.map(d => <EvalBar key={d.label} label={d.label} score={d.score} />)}
          <div className={cn('border-2 rounded-xl p-6 text-center mt-5', VERDICT_CONFIG[cmoEval.verdict].color)}>
            <div className="text-4xl mb-2">{VERDICT_CONFIG[cmoEval.verdict].icon}</div>
            <div className={cn('font-display text-xl font-semibold mb-2', VERDICT_CONFIG[cmoEval.verdict].titleColor)}>{VERDICT_CONFIG[cmoEval.verdict].label}</div>
            <div className="text-sm text-slate-600">{VERDICT_CONFIG[cmoEval.verdict].message}</div>
          </div>
          {cmoEval.strengths.length > 0 && (
            <div className="alert-success mt-4"><strong>Strengths:</strong> {cmoEval.strengths.join(', ')}</div>
          )}
          {cmoEval.weaknesses.length > 0 && (
            <div className="alert-warning mt-2 text-sm">{cmoEval.weaknesses.join(' · ')}</div>
          )}
        </div>
      )}
    </div>
  )
}
