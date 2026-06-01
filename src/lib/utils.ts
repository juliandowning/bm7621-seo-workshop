import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ScoreMap, ActivityKey } from '../types'
import { ACTIVITY_ORDER, BLOCK_STRUCTURE } from '../data/workshop'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreBadgeClass(points: number, max: number) {
  if (points === 0) return 'score-pending'
  if (points >= max) return 'score-earned'
  return 'score-partial'
}

export function totalScore(scores: ScoreMap): number {
  return Object.values(scores).reduce((sum, s) => sum + (s?.points || 0), 0)
}

export function completedCount(scores: ScoreMap): number {
  return Object.values(scores).filter(s => s?.completed).length
}

export function completionPct(scores: ScoreMap): number {
  const total = ACTIVITY_ORDER.length
  const done = completedCount(scores)
  return Math.round((done / total) * 100)
}

export function currentBlock(scores: ScoreMap): number {
  for (let i = BLOCK_STRUCTURE.length - 1; i >= 0; i--) {
    const block = BLOCK_STRUCTURE[i]
    if (block.activities.some(a => scores[a]?.completed)) return block.id
  }
  return 1
}

export function wordCoverageScore(text: string, keywords: string[]): number {
  if (!text || text.length < 20) return 0
  const lower = text.toLowerCase()
  const matches = keywords.filter(k => lower.includes(k.toLowerCase())).length
  const lengthBonus = text.length > 150 ? 25 : text.length > 80 ? 15 : text.length > 40 ? 8 : 0
  return Math.min(100, matches * 14 + lengthBonus)
}

export function formatScore(pts: number): string {
  return pts.toString()
}

export function blockForActivity(key: ActivityKey): number {
  for (const block of BLOCK_STRUCTURE) {
    if (block.activities.includes(key)) return block.id
  }
  return 1
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
