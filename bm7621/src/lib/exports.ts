import type { Team, ScoreMap, ResponseMap, SimulatorMap, CMOEvaluation } from '../types'
import { ACTIVITY_LABELS, ACTIVITY_ORDER } from '../data/workshop'
import { totalScore } from './utils'
import { downloadFile } from './utils'

interface ExportData {
  team: Team
  scores: ScoreMap
  responses: ResponseMap
  simulators: SimulatorMap
  cmoEval: CMOEvaluation | null
}

// ─── WORKBOOK TEXT EXPORT ────────────────────────────────────
export function exportWorkbookText(data: ExportData) {
  const { team, scores, responses, simulators, cmoEval } = data
  const total = totalScore(scores)

  const lines: string[] = [
    '═══════════════════════════════════════════════════════════',
    'BM7621 SEO WORKSHOP COMPANION — TEAM WORKBOOK',
    '═══════════════════════════════════════════════════════════',
    '',
    `Team Name: ${team.name}`,
    `Assigned Brand: ${team.brand}`,
    `Access Code: ${team.code}`,
    `Team Members: ${team.members.map(m => m.name).filter(Boolean).join(', ')}`,
    `Export Date: ${new Date().toLocaleString()}`,
    '',
    '─── TOTAL SCORE ───────────────────────────────────────────',
    `${total} points`,
    '',
    '─── ACTIVITY SCORES ───────────────────────────────────────',
  ]

  ACTIVITY_ORDER.forEach(key => {
    const score = scores[key]
    const label = ACTIVITY_LABELS[key]
    lines.push(`${label}: ${score?.points ?? 0} / ${score?.max ?? 5} pts${score?.completed ? ' ✓' : ''}`)
  })

  lines.push('', '─── SIMULATOR SCORES ──────────────────────────────────────')
  Object.entries(simulators).forEach(([key, sim]) => {
    if (sim) {
      lines.push(`${key}: avg ${sim.average?.toFixed(1) ?? '—'} → ${sim.points} pts`)
    }
  })

  lines.push('', '─── CMO STRATEGY ──────────────────────────────────────────')
  lines.push(`SEO Opportunity: ${responses.a18_seo || '—'}`)
  lines.push(`Technical Risk: ${responses.a18_tech || '—'}`)
  lines.push(`PPC Opportunity: ${responses.a18_ppc || '—'}`)
  lines.push(`AI Opportunity: ${responses.a18_ai || '—'}`)
  lines.push(`Recommendation 1: ${responses.a18_r1 || '—'}`)
  lines.push(`Recommendation 2: ${responses.a18_r2 || '—'}`)
  lines.push(`Recommendation 3: ${responses.a18_r3 || '—'}`)
  lines.push(`Business Impact: ${responses.a18_impact || '—'}`)

  if (cmoEval) {
    lines.push('', '─── BOARD EVALUATION ──────────────────────────────────────')
    lines.push(`Verdict: ${cmoEval.verdict.toUpperCase()}`)
    cmoEval.dimensions.forEach(d => {
      lines.push(`  ${d.label}: ${Math.round(d.score)}%`)
    })
    if (cmoEval.strengths.length) lines.push(`Strengths: ${cmoEval.strengths.join(', ')}`)
    if (cmoEval.weaknesses.length) lines.push(`Areas to Strengthen: ${cmoEval.weaknesses.join(', ')}`)
  }

  lines.push('', '═══════════════════════════════════════════════════════════')

  downloadFile(
    lines.join('\n'),
    `BM7621-Workbook-${team.name.replace(/\s+/g, '-')}.txt`,
    'text/plain'
  )
}

// ─── STRATEGY REPORT HTML ────────────────────────────────────
export function exportStrategyHTML(data: ExportData) {
  const { team, scores, responses, cmoEval } = data
  const total = totalScore(scores)

  const verdictColors = {
    approved: '#1d9a6c',
    revisions: '#d4820a',
    rejected: '#c0392b',
  }
  const verdictColor = cmoEval ? verdictColors[cmoEval.verdict] : '#2c6fad'
  const verdictLabel = cmoEval
    ? { approved: 'Board Approved', revisions: 'Approved With Revisions', rejected: 'Strategy Rejected' }[cmoEval.verdict]
    : 'Pending Review'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Search Strategy Report — ${team.name}</title>
<style>
  body { font-family: Georgia, serif; max-width: 820px; margin: 48px auto; padding: 0 32px; color: #1a2233; }
  h1 { font-size: 2.2rem; border-bottom: 3px solid #2c6fad; padding-bottom: 14px; margin-bottom: 8px; font-weight: normal; }
  h2 { font-size: 0.78rem; color: #2c6fad; text-transform: uppercase; letter-spacing: 0.12em; margin: 28px 0 8px; }
  .meta { color: #8896a8; font-size: 0.88rem; margin-bottom: 32px; }
  p { line-height: 1.75; margin-bottom: 12px; font-size: 0.95rem; }
  .recs { background: #f0f5fb; border-left: 4px solid #2c6fad; padding: 16px 20px; border-radius: 6px; }
  .rec { margin-bottom: 10px; font-size: 0.95rem; }
  .verdict-box { border: 2px solid ${verdictColor}; border-radius: 8px; padding: 20px 24px; margin-top: 24px; text-align: center; }
  .verdict-label { font-size: 1.3rem; color: ${verdictColor}; font-weight: bold; }
  .dim-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e2e6ed; font-size: 0.88rem; }
  .dim-bar { height: 6px; background: #e2e6ed; border-radius: 3px; width: 160px; overflow: hidden; margin-left: 12px; }
  .dim-fill { height: 100%; background: #2c6fad; border-radius: 3px; }
  .score-box { display: inline-block; background: #1a2233; color: #fff; padding: 10px 20px; border-radius: 6px; font-size: 0.9rem; margin-top: 24px; }
  @media print { .score-box { break-inside: avoid; } }
</style>
</head>
<body>
<h1>Search Strategy Report</h1>
<div class="meta">${team.name} &nbsp;·&nbsp; ${team.brand} &nbsp;·&nbsp; BM7621 SEO Workshop &nbsp;·&nbsp; ${new Date().toLocaleDateString()}</div>

<h2>Executive Summary</h2>
<p>Following a comprehensive 6-hour SEO workshop, this report presents our strategic recommendations for ${team.brand}'s search performance. Organic growth has stalled whilst paid search costs have increased. AI-powered search is reshaping how customers discover products. This strategy addresses immediate opportunities and long-term positioning across organic, technical, paid, and AI-driven search.</p>

<h2>SEO Opportunity</h2>
<p>${responses.a18_seo || '—'}</p>

<h2>Biggest Technical Risk</h2>
<p>${responses.a18_tech || '—'}</p>

<h2>PPC Opportunity</h2>
<p>${responses.a18_ppc || '—'}</p>

<h2>AI Search Opportunity</h2>
<p>${responses.a18_ai || '—'}</p>

<h2>Top 3 Strategic Recommendations</h2>
<div class="recs">
  <div class="rec">1. ${responses.a18_r1 || '—'}</div>
  <div class="rec">2. ${responses.a18_r2 || '—'}</div>
  <div class="rec">3. ${responses.a18_r3 || '—'}</div>
</div>

<h2>Expected Business Impact</h2>
<p>${responses.a18_impact || '—'}</p>

${cmoEval ? `
<h2>Board Evaluation</h2>
${cmoEval.dimensions.map(d => `
<div class="dim-row">
  <span>${d.label}</span>
  <div style="display:flex;align-items:center;gap:10px">
    <span style="font-weight:700;color:#2c6fad">${Math.round(d.score)}%</span>
    <div class="dim-bar"><div class="dim-fill" style="width:${Math.min(100,d.score)}%"></div></div>
  </div>
</div>`).join('')}
<div class="verdict-box">
  <div class="verdict-label">${verdictLabel}</div>
</div>
` : ''}

<div class="score-box">Workshop Score: ${total} points</div>
</body>
</html>`

  downloadFile(
    html,
    `BM7621-Strategy-${team.brand}-${new Date().toISOString().slice(0, 10)}.html`,
    'text/html'
  )
}

// ─── JSON BACKUP ─────────────────────────────────────────────
export function exportJSONBackup(data: ExportData) {
  downloadFile(
    JSON.stringify(data, null, 2),
    `BM7621-Backup-${data.team.name.replace(/\s+/g, '-')}-${Date.now()}.json`,
    'application/json'
  )
}
