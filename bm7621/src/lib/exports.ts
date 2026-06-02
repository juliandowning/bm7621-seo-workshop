import type { Team, ScoreMap, ResponseMap, SimulatorMap, CMOEvaluation } from '../types'
import { ACTIVITY_LABELS, ACTIVITY_ORDER } from '../data/workshop'
import { totalScore } from './utils'
import { downloadFile } from './utils'

import type { SearchMastersState } from '../types'

interface ExportData {
  team: Team
  scores: ScoreMap
  responses: ResponseMap
  simulators: SimulatorMap
  cmoEval: CMOEvaluation | null
  searchMasters?: SearchMastersState | null
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

  lines.push('', '─── SEARCH MASTERS CHALLENGE ─────────────────────────────')
  if (data.searchMasters && data.searchMasters.totalScore > 0) {
    const sm = data.searchMasters
    const answered = Object.keys(sm.answers).length
    const correct = Object.values(sm.answers).filter((a: {correct:boolean}) => a.correct).length
    lines.push(`Quiz Score: ${sm.totalScore} points`)
    lines.push(`Questions Answered: ${answered}/20`)
    lines.push(`Correct Answers: ${correct}/${answered}`)
    lines.push(`Status: ${sm.completed ? 'Complete' : 'In Progress'}`)
  } else {
    lines.push('Search Masters Challenge: Not attempted')
  }

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
  const { team, scores, responses, simulators } = data
  const workshopTotal = totalScore(scores) + Object.values(simulators).reduce((s, v) => s + (v?.points || 0), 0)
  const sm = data.searchMasters
  const smAnswered = sm ? Object.keys(sm.answers).length : 0
  const smCorrect = sm ? Object.values(sm.answers).filter(a => a.correct).length : 0

  // Build activity rows
  const activityRows = [
    { label: 'A1 Human Seed List', key: 'a1' },
    { label: 'A2 Intent Mapping', key: 'a2' },
    { label: 'A3 SERP Visibility', key: 'a3' },
    { label: 'A4 On-Page Mini Ad', key: 'a4' },
    { label: 'A5 CTR Reality Check', key: 'a5' },
    { label: 'A6 Technical Friction Hunt', key: 'a6' },
    { label: 'A7 Prioritisation Matrix', key: 'a7' },
    { label: 'A8 E-E-A-T Audit', key: 'a9' },
    { label: 'A9 Topic Cluster Builder', key: 'a8' },
    { label: 'A10 Content Makeover', key: 'a10b' },
    { label: 'A11 Will The Ads Serve?', key: 'a11' },
    { label: 'A12 Negative Keywords', key: 'a12' },
    { label: 'A13 Writing a Search Ad', key: 'a12b' },
    { label: 'A14 Budget Allocation', key: 'a13' },
    { label: 'A15 Search Console', key: 'a15' },
    { label: 'A16 AI Visibility Audit', key: 'a16' },
    { label: 'A17 AI vs Human', key: 'a17' },
    { label: 'A18 Search Masters', key: 'a18' },
    { label: 'Sim — Search Lab', key: 'sim1', isSim: true },
    { label: 'Sim — Paid Media Lab', key: 'sim3', isSim: true },
    { label: 'Sim — Analytics Lab 1', key: 'sim4', isSim: true },
    { label: 'Sim — Analytics Lab 2', key: 'sim5', isSim: true },
  ]

  const actRows = activityRows.map(row => {
    const s = (row.isSim ? simulators[row.key] : scores[row.key as keyof typeof scores]) as { points?: number; max?: number; completed?: boolean } | undefined
    const pts = s?.points || 0
    const max = row.isSim ? 5 : (s as {max?:number})?.max || 5
    const done = (s as {completed?:boolean})?.completed || pts > 0
    return '<tr><td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;font-size:0.85rem;">' + row.label + '</td>' +
      '<td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:bold;color:' + (done?'#2c6fad':'#94a3b8') + '">' + pts + '/' + max + '</td>' +
      '<td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">' + (done?'✓':'—') + '</td></tr>'
  }).join('')

  // Search Masters question table
  const smRows = sm && smAnswered > 0
    ? Object.entries(sm.answers).map(([id, ans]) => {
        const qNum = id.replace('r', 'R').replace('q', 'Q')
        return '<tr><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;font-family:monospace;font-size:0.78rem;">' + qNum + '</td>' +
          '<td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;font-size:0.82rem;">' + (ans.answer || '—') + '</td>' +
          '<td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;color:' + (ans.correct?'#16a34a':'#dc2626') + '">' + (ans.correct?'✓':'✗') + '</td>' +
          '<td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;text-align:center;">' + ans.points + '</td></tr>'
      }).join('')
    : '<tr><td colspan="4" style="padding:12px;color:#94a3b8;font-size:0.85rem;">Not attempted</td></tr>'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>BM7621 Workshop Report — ${team.name}</title>
<style>
  body { font-family: Georgia, serif; max-width: 860px; margin: 48px auto; padding: 0 32px; color: #1a2233; }
  h1 { font-size: 2rem; border-bottom: 3px solid #2c6fad; padding-bottom: 14px; margin-bottom: 8px; font-weight: normal; }
  h2 { font-size: 0.75rem; color: #2c6fad; text-transform: uppercase; letter-spacing: 0.12em; margin: 32px 0 10px; }
  .meta { color: #8896a8; font-size: 0.88rem; margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  th { text-align: left; padding: 8px 12px; background: #f1f5f9; border-bottom: 2px solid #e2e8f0; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
  .score-strip { display: flex; gap: 24px; background: #f8faff; border: 1px solid #dde8f7; border-radius: 8px; padding: 20px 24px; margin-bottom: 8px; }
  .score-item { text-align: center; }
  .score-num { font-size: 2rem; font-weight: bold; color: #2c6fad; }
  .score-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-top: 2px; }
  .sm-summary { background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 14px 18px; border-radius: 6px; margin-bottom: 12px; }
  @media print { h2 { page-break-before: auto; } table { page-break-inside: avoid; } }
</style>
</head>
<body>
<h1>BM7621 Workshop Report</h1>
<div class="meta">${team.name} &nbsp;·&nbsp; ${team.brand} &nbsp;·&nbsp; Kingston Business School &nbsp;·&nbsp; ${new Date().toLocaleDateString()}</div>

<div class="score-strip">
  <div class="score-item"><div class="score-num">${workshopTotal}</div><div class="score-label">Workshop Total</div></div>
  <div class="score-item"><div class="score-num" style="color:#7c3aed">${sm?.totalScore || 0}</div><div class="score-label">Quiz Score</div></div>
  <div class="score-item"><div class="score-num" style="color:#16a34a">${smCorrect}/${smAnswered}</div><div class="score-label">Quiz Correct</div></div>
  <div class="score-item"><div class="score-num" style="font-size:1.3rem">${sm?.completed ? '✅ Complete' : '—'}</div><div class="score-label">Quiz Status</div></div>
</div>

<h2>Activity Scores</h2>
<table>
  <tr><th>Activity</th><th style="text-align:center">Score</th><th style="text-align:center">Done</th></tr>
  ${actRows}
</table>

<h2>Search Masters Challenge — Question Results</h2>
${sm?.totalScore ? '<div class="sm-summary">Quiz score: <strong>' + sm.totalScore + ' points</strong> · ' + smCorrect + '/' + smAnswered + ' correct</div>' : ''}
<table>
  <tr><th>Question</th><th>Your Answer</th><th style="text-align:center">Result</th><th style="text-align:center">Points</th></tr>
  ${smRows}
</table>

<h2>Key Activity Responses</h2>
${responses.a6_cwv ? '<p><strong>Core Web Vital identified:</strong> ' + responses.a6_cwv + (responses.a6_explain ? ' — ' + responses.a6_explain : '') + '</p>' : ''}
${responses.a16_auth ? '<p><strong>AI Authority signals:</strong> ' + responses.a16_auth + '</p>' : ''}
${responses.a16_orig ? '<p><strong>Original research opportunities:</strong> ' + responses.a16_orig + '</p>' : ''}

</body>
</html>`

  downloadFile(
    html,
    `BM7621-Report-${team.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.html`,
    'text/html'
  )
}
