import { useState } from 'react'
import { useWorkspaceStore } from '../../store/workspace'
import { QUALITY_KEYWORDS, calcQualityPts, calcCompletionPts, BRAND_EXAMPLES, ACTIVITY_DISPLAY_NUM } from '../../data/workshop'
import { ActivityCard, Alert, CharCount, FeedbackPanel, LockedBadge, ScoreBreakdown, SimInputs, QualityFeedback } from '../ui/shared'

const N = ACTIVITY_DISPLAY_NUM

const EEAT_DIMS = [
  { key: 'a9_exp' as const, noteKey: 'a9_exp_note' as const, label: 'Experience', hint: 'Does the brand show real customer experience? How?' },
  { key: 'a9_exp2' as const, noteKey: 'a9_exp2_note' as const, label: 'Expertise', hint: 'What makes this brand a credible subject matter expert?' },
  { key: 'a9_auth' as const, noteKey: 'a9_auth_note' as const, label: 'Authority', hint: 'How does the wider web recognise this brand as authoritative?' },
  { key: 'a9_trust' as const, noteKey: 'a9_trust_note' as const, label: 'Trust', hint: 'What signals make customers trust this brand online?' },
]

function StarRating({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} disabled={disabled}
          className={`w-7 h-7 border rounded text-base transition-all flex items-center justify-center ${n <= (hover || value) ? 'bg-amber-50 border-amber-300 text-amber-500' : 'border-slate-200 text-slate-300'} ${!disabled ? 'hover:border-amber-300' : 'cursor-default'}`}
          onMouseEnter={() => !disabled && setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => !disabled && onChange(n)}>★</button>
      ))}
    </div>
  )
}

const WEAK_ARTICLE = `Title: How to Get More Traffic

Getting more traffic to your website is important. There are many ways to do this. You can use social media, write blogs, and do SEO. SEO means search engine optimisation.

What is SEO?
SEO is about making your website better so Google shows it. You need keywords. Keywords are words people search for. Put them in your content.

Why Traffic Matters
Traffic means visitors. More visitors can mean more sales. Businesses want more sales. So traffic is important for business.

Conclusion
In summary, getting traffic is important and you should try different things to get it. Good luck with your website.`

export function Block4Panel() {
  const { team, scores, responses, simulators, updateScore, updateResponse, updateSimulator, lockActivity } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'
  const brandEx = BRAND_EXAMPLES[brand as keyof typeof BRAND_EXAMPLES] || BRAND_EXAMPLES['ASOS']

  // A8 — E-E-A-T (displayed as A8)
  const a9Locked = !!responses.locked_a9
  const [a9Fb, setA9Fb] = useState<{cPts:number;qPts:number;why:string}|null>(null)
  const [eeatRatings, setEeatRatings] = useState({
    a9_exp: responses.a9_exp || 0, a9_exp2: responses.a9_exp2 || 0,
    a9_auth: responses.a9_auth || 0, a9_trust: responses.a9_trust || 0,
  })
  const [eeatNotes, setEeatNotes] = useState({
    a9_exp_note: responses.a9_exp_note || '', a9_exp2_note: responses.a9_exp2_note || '',
    a9_auth_note: responses.a9_auth_note || '', a9_trust_note: responses.a9_trust_note || '',
  })

  const submitA9 = () => {
    if (a9Locked) return
    const ratingsFilled = Object.values(eeatRatings).filter(v => v > 0).length
    const notesValues = Object.values(eeatNotes)
    const notesFilled = notesValues.filter(v => {
      if (!v || v.length < 20) return false
      if (v.toLowerCase().includes('lorem') || v.toLowerCase().includes('ipsum')) return false
      // Must contain some specific signal words, not just generic filler
      const signalWords = ['because', 'has', 'include', 'show', 'demonstrate', 'award', 'review',
        'press', 'certif', 'partner', 'research', 'data', 'expert', 'trust', 'policy', 'secure',
        'return', 'transparent', 'coverage', 'mention', 'backlink', 'wikipedia', 'recogni']
      return signalWords.some(w => v.toLowerCase().includes(w)) || v.length >= 60
    }).length
    const cPts = ratingsFilled >= 4 ? 2 : ratingsFilled >= 2 ? 1 : 0
    const qPts = Math.min(3, notesFilled)
    updateScore('a9', cPts + qPts, 5, cPts, qPts)
    updateResponse({ ...eeatRatings, ...eeatNotes, locked_a9: true })
    lockActivity('a9')
    const hasLorem = notesValues.some(v => v.toLowerCase().includes('lorem'))
    const why = hasLorem ? 'Placeholder text scores 0 for quality. Write genuine observations about your brand E-E-A-T signals.' :
      qPts >= 3 ? 'All four E-E-A-T dimensions explained with specific evidence.' :
      qPts === 2 ? 'Good — some notes have specific evidence. Add specific signals for the remaining dimensions (e.g. press coverage, certifications, review platforms).' :
      qPts === 1 ? 'Notes are too brief or generic. Name specific evidence — what does your brand actually do to demonstrate each signal?' :
      'Notes need specific evidence. For each dimension, describe concrete signals not generic statements.'
    setA9Fb({ cPts, qPts, why })
  }

  // A9 — Topic Cluster (displayed as A9)
  const a8Locked = !!responses.locked_a8
  const [a8, setA8] = useState({
    pillar: responses.a8_pillar || '', s1: responses.a8_s1 || '', s2: responses.a8_s2 || '', s3: responses.a8_s3 || '',
    q1: responses.a8_q1 || '', q2: responses.a8_q2 || '', q3: responses.a8_q3 || '',
  })

  const submitA8 = () => {
    if (a8Locked) return
    const fields = Object.values(a8)
    const filled = fields.filter(v => v.trim().length > 0).length
    const pts = Math.min(5, Math.round(filled * 5 / fields.length) + (filled === fields.length ? 1 : 0))
    updateScore('a8', Math.min(5, pts))
    updateResponse({ a8_pillar: a8.pillar, a8_s1: a8.s1, a8_s2: a8.s2, a8_s3: a8.s3, a8_q1: a8.q1, a8_q2: a8.q2, a8_q3: a8.q3, locked_a8: true })
    lockActivity('a8')
  }

  // A10 — Content Makeover (displayed as A10)
  const a10bLocked = !!responses.locked_a10b
  const [a10b, setA10b] = useState({
    heading: responses.a10b_heading || '', intro: responses.a10b_intro || '',
    imp1: responses.a10b_imp1 || '', imp2: responses.a10b_imp2 || '', imp3: responses.a10b_imp3 || '',
    why: responses.a10b_why || '',
  })

  const submitA10b = () => {
    if (a10bLocked) return
    const fields = [a10b.heading, a10b.intro, a10b.imp1, a10b.imp2, a10b.imp3, a10b.why]
    const cPts = calcCompletionPts(fields, 20)
    const qPts = calcQualityPts(fields.join(' '), QUALITY_KEYWORDS.content_makeover)
    updateScore('a10b', Math.min(5, cPts + qPts), 5, cPts, qPts)
    updateResponse({ a10b_heading: a10b.heading, a10b_intro: a10b.intro, a10b_imp1: a10b.imp1, a10b_imp2: a10b.imp2, a10b_imp3: a10b.imp3, a10b_why: a10b.why, locked_a10b: true })
    lockActivity('a10b')
  }


  // SIM 1 — Search Lab (end of Block 4)
  const [sim1Vals, setSim1Vals] = useState<(number | null)[]>(simulators['sim1']?.scores || [null, null, null, null, null])
  const handleSim1 = (vals: (number | null)[]) => {
    updateSimulator('sim1', vals)
    const valid = vals.filter((v): v is number => v !== null)
    if (valid.length > 0) {
      const avg = valid.reduce((a, b) => a + b, 0) / valid.length
      updateScore('sim1', avg >= 90 ? 5 : avg >= 80 ? 4 : avg >= 70 ? 3 : avg >= 60 ? 2 : 1)
    }
  }

  return (
    <div>
      {/* A8 — E-E-A-T */}
      <ActivityCard number={N.a9} title="E-E-A-T Audit" subtitle="Rate your brand's credibility signals" points={scores.a9?.points || 0}>
        <Alert type="info">🌟 Rate <strong>{brand}</strong> 1–5 stars on each E-E-A-T dimension. Add a note explaining your rating (min 20 chars).</Alert>
        {a9Locked && <div className="mb-3"><LockedBadge /></div>}
        <div className="divide-y divide-slate-100 mb-3">
          {EEAT_DIMS.map(dim => (
            <div key={dim.key} className="py-3 flex items-center gap-4">
              <div className="w-24 text-sm font-bold text-slate-700 flex-shrink-0">{dim.label}</div>
              <StarRating value={eeatRatings[dim.key]} disabled={a9Locked} onChange={v => setEeatRatings(prev => ({ ...prev, [dim.key]: v }))} />
              <input className="flex-1 form-input text-xs" disabled={a9Locked} placeholder={dim.hint}
                value={eeatNotes[dim.noteKey]} onChange={e => setEeatNotes(prev => ({ ...prev, [dim.noteKey]: e.target.value }))} />
            </div>
          ))}
        </div>
        {!a9Locked && (
          <button className="btn-success btn-sm" onClick={submitA9}
            disabled={Object.values(eeatRatings).some(v => v === 0)}>Submit Answers</button>
        )}
        {a9Locked && a9Fb && <QualityFeedback completionPts={a9Fb.cPts} qualityPts={a9Fb.qPts} qualityReason={a9Fb.why} />}
        {a9Locked && scores.a9 && (
          <FeedbackPanel
            score={scores.a9.points} max={5}
            completionPts={scores.a9.completionPts} qualityPts={scores.a9.qualityPts}
            why="Completion: all 4 dimensions rated = 2pts. Quality: each note with 20+ chars = 1pt each (max 3). Strong answers explain specific evidence for each dimension."
            example={brandEx.eeatExample}
            keyLearning={[
              'E-E-A-T (Experience, Expertise, Authority, Trust) is Google\'s framework for evaluating content quality.',
              'Experience (the first E) was added in 2022 — content must demonstrate real first-hand experience.',
              'Trust is the foundation of the whole framework — without trust, the other signals are undermined.',
              'E-E-A-T is not a direct ranking factor but influences how Google\'s quality raters evaluate content, which shapes the algorithm.',
            ]}
          />
        )}
      </ActivityCard>

      {/* A9 — Topic Cluster */}
      <ActivityCard number={N.a8} title="Topic Cluster Builder" subtitle="Design a content hub around a pillar topic" points={scores.a8?.points || 0}>
        <Alert type="info">🏗️ A topic cluster has one pillar page and supporting content articles that link back to it. Create a cluster for <strong>{brand}</strong>.</Alert>
        {a8Locked && <div className="mb-3"><LockedBadge /></div>}
        <div className="mb-4">
          <label className="form-label">Pillar Topic</label>
          <input className="form-input" disabled={a8Locked} placeholder={`e.g. The Complete Guide to ${brand} — Everything You Need to Know`}
            value={a8.pillar} onChange={e => setA8(prev => ({ ...prev, pillar: e.target.value }))} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {(['s1', 's2', 's3'] as const).map((k, i) => (
            <div key={k}>
              <label className="form-label">Supporting Topic {i + 1}</label>
              <input className="form-input" disabled={a8Locked} placeholder={`Supporting article ${i + 1}`}
                value={a8[k]} onChange={e => setA8(prev => ({ ...prev, [k]: e.target.value }))} />
            </div>
          ))}
        </div>
        <label className="form-label">Customer Questions this cluster answers</label>
        <div className="alert-info mb-3 text-xs">💡 Think about: common problems customers have · comparison searches · how-to questions · buying decisions · frequently asked questions about {brand}</div>
        {(['q1', 'q2', 'q3'] as const).map((k, i) => (
          <input key={k} className="form-input mb-2" disabled={a8Locked}
            placeholder={`Question ${i + 1} — e.g. "How do I return an item to ${brand}?"`}
            value={a8[k]} onChange={e => setA8(prev => ({ ...prev, [k]: e.target.value }))} />
        ))}
        {!a8Locked && (
          <button className="btn-success btn-sm mt-2" onClick={submitA8} disabled={!a8.pillar.trim()}>Submit Answers</button>
        )}
        {a8Locked && scores.a8 && (
          <FeedbackPanel
            score={scores.a8.points} max={5}
            why="Points awarded for completion across all fields. A complete cluster (pillar + 3 supporting + 3 questions) = maximum score."
            example={brandEx.topicCluster}
            keyLearning={[
              'Topic clusters tell Google you have comprehensive, authoritative coverage of a subject.',
              'The pillar page targets a broad keyword — supporting articles target specific long-tail variations.',
              'Internal links between cluster pages pass authority and help Google understand the topic hierarchy.',
              'Answering customer questions directly in cluster content captures People Also Ask and featured snippet opportunities.',
            ]}
          />
        )}
      </ActivityCard>
      {/* A11 — Content Makeover */}
      <ActivityCard number={N.a10b} title="Content Makeover Challenge" subtitle="Improve an underperforming article" points={scores.a10b?.points || 0}>
        <Alert type="warning">📝 The article below has several quality problems. Improve it using SEO and E-E-A-T principles.</Alert>
        {a10bLocked && <div className="mb-3"><LockedBadge /></div>}
        <div className="bg-slate-900 text-slate-300 rounded-xl p-4 mb-5 font-mono text-xs leading-relaxed whitespace-pre-wrap border border-slate-700">{WEAK_ARTICLE}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Improved Heading</label>
            <input className="form-input" disabled={a10bLocked} placeholder="Write a clear, keyword-rich, specific heading..." value={a10b.heading} onChange={e => setA10b(prev => ({ ...prev, heading: e.target.value }))} />
            <CharCount value={a10b.heading} min={20} max={100} />
          </div>
          <div>
            <label className="form-label">Improved Introduction</label>
            <textarea className="form-textarea" rows={3} disabled={a10bLocked} placeholder="Write an intro that demonstrates expertise and sets expectations..." value={a10b.intro} onChange={e => setA10b(prev => ({ ...prev, intro: e.target.value }))} />
            <CharCount value={a10b.intro} min={50} max={250} />
          </div>
        </div>
        <label className="form-label">Three Content Improvements You Would Make</label>
        {(['imp1', 'imp2', 'imp3'] as const).map((k, i) => (
          <div key={k} className="mb-2">
            <input className="form-input" disabled={a10bLocked} placeholder={`Improvement ${i + 1} — e.g. Add expert quotes and cited research to build authority`} value={a10b[k]} onChange={e => setA10b(prev => ({ ...prev, [k]: e.target.value }))} />
            <CharCount value={a10b[k]} min={20} max={250} />
          </div>
        ))}
        <label className="form-label">Why Is Your Version Better?</label>
        <textarea className="form-textarea" rows={4} disabled={a10bLocked}
          placeholder="Explain using E-E-A-T principles why your version demonstrates more expertise, authority and trust... (min 100 chars)"
          value={a10b.why} onChange={e => setA10b(prev => ({ ...prev, why: e.target.value }))} />
        <CharCount value={a10b.why} min={100} max={500} />
        {!a10bLocked && (
          <button className="btn-success btn-sm mt-3" onClick={submitA10b}
            disabled={[a10b.heading, a10b.intro, a10b.imp1, a10b.imp2, a10b.imp3, a10b.why].some(v => v.length < 20)}>Submit Answers</button>
        )}
        {a10bLocked && scores.a10b && (
          <FeedbackPanel
            score={scores.a10b.points} max={5}
            completionPts={scores.a10b.completionPts} qualityPts={scores.a10b.qualityPts}
            why="Completion: all fields with 20+ chars = 2pts. Quality: use of E-E-A-T vocabulary (expertise, authority, trust, structure, evidence) increases quality score."
            example={`Improved heading: "The Complete SEO Traffic Guide: 12 Proven Strategies With Data (2025)" · Improved intro: "In this guide, we break down exactly how to increase organic traffic using tactics validated across 200+ websites. We cover keyword strategy, technical fundamentals, and content frameworks — with real results." · Improvements: 1) Replace vague claims with specific data points and cited research. 2) Add a structured H2/H3 hierarchy with keyword-rich subheadings. 3) Include first-hand case studies or expert quotes to demonstrate genuine Experience.`}
            keyLearning={[
              'The original article fails E-E-A-T on all four dimensions — no evidence of experience, no expertise demonstrated, no authority signals, no trust indicators.',
              'Specific, data-backed claims dramatically increase perceived expertise and E-E-A-T score.',
              'Structured headings help both readers and Google understand the content hierarchy.',
              'Google\'s Quality Raters Manual specifically flags "thin content" — content that lacks depth, specificity and genuine value.',
            ]}
          />
        )}
      </ActivityCard>

      {/* SIM 1 — Search Lab */}
      <ActivityCard number="SIM" title="Search Lab — Simulator" subtitle="Enter individual student scores from Search Lab" points={scores.sim1?.points || 0} isSimulator>
        <Alert type="info">📊 Enter each team member's Search Lab score. Blanks are ignored. Auto-converted to workshop points.</Alert>
        <SimInputs values={sim1Vals} onChange={vals => { setSim1Vals(vals); handleSim1(vals) }} memberCount={team?.members.length || 5} />
        {simulators['sim1']?.average !== null && simulators['sim1'] && (
          <div className="alert-success mt-3">Average: <strong>{simulators['sim1'].average?.toFixed(1)}</strong> → <strong>{simulators['sim1'].points} workshop points</strong></div>
        )}
      </ActivityCard>
    </div>
  )
}
