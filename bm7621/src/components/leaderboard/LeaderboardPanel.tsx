import { useEffect, useState } from 'react'
import { useWorkspaceStore, selectTotalScore, selectAvgQuality } from '../../store/workspace'
import { subscribeToAllWorkspaces, getAllTeamsData } from '../../lib/supabase'
import { BRANDS } from '../../data/workshop'
import type { Brand } from '../../types'

const totalActs = 22

interface LeaderboardEntry {
  name: string
  brand: Brand
  score: number
  completed: number
  completionPct: number
  avgQuality: number
  isMine: boolean
}

function getRankIcon(rank: number) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

function extractScore(sc: Record<string, unknown>, sim: Record<string, unknown>) {
  const actScore = Object.values(sc).reduce((s: number, v: unknown) => s + ((v as { points?: number })?.points || 0), 0)
  const simScore = Object.values(sim).reduce((s: number, v: unknown) => s + ((v as { points?: number })?.points || 0), 0)
  return actScore + simScore
}

function extractCompleted(sc: Record<string, unknown>) {
  return Object.values(sc).filter((v: unknown) => (v as { completed?: boolean })?.completed).length
}

function extractQuality(sc: Record<string, unknown>) {
  const withQ = Object.values(sc).filter((v: unknown) => {
    const s = v as { completed?: boolean; qualityPts?: number }
    return s?.completed && (s?.qualityPts || 0) > 0
  })
  if (!withQ.length) return 0
  const total = withQ.reduce((s: number, v: unknown) => s + ((v as { qualityPts?: number })?.qualityPts || 0), 0)
  return Math.round(total / withQ.length * 10) / 10
}

export function LeaderboardPanel() {
  const { team, scores, simulators } = useWorkspaceStore()
  const myScore = selectTotalScore(scores) + Object.values(simulators).reduce((s, v) => s + (v?.points || 0), 0)
  const myCompleted = Object.values(scores).filter(s => s?.completed).length
  const myQuality = selectAvgQuality(scores)

  const [entries, setEntries] = useState<LeaderboardEntry[]>(
    BRANDS.map(b => ({
      name: b, brand: b,
      score: b === team?.brand ? myScore : 0,
      completed: b === team?.brand ? myCompleted : 0,
      completionPct: b === team?.brand ? Math.round(myCompleted / totalActs * 100) : 0,
      avgQuality: b === team?.brand ? myQuality : 0,
      isMine: b === team?.brand,
    }))
  )

  const buildEntries = (data: unknown[]) => {
    return BRANDS.map(brand => {
      const row = data.find((r: unknown) => (r as { brand: string }).brand === brand) as {
        name?: string; brand: Brand
        bm7621seo_workspace_data?: { scores?: Record<string, unknown>; simulators?: Record<string, unknown> }[]
      } | undefined

      // Always use live local state for current team
      if (brand === team?.brand) {
        return {
          name: team?.name || brand, brand,
          score: myScore, completed: myCompleted,
          completionPct: Math.round(myCompleted / totalActs * 100),
          avgQuality: myQuality, isMine: true,
        }
      }

      if (!row) return { name: String(brand), brand, score: 0, completed: 0, completionPct: 0, avgQuality: 0, isMine: false }

      const wsData = row.bm7621seo_workspace_data?.[0]
      const sc = (wsData?.scores || {}) as Record<string, unknown>
      const sim = (wsData?.simulators || {}) as Record<string, unknown>

      return {
        name: row.name || String(brand), brand,
        score: extractScore(sc, sim),
        completed: extractCompleted(sc),
        completionPct: Math.round(extractCompleted(sc) / totalActs * 100),
        avgQuality: extractQuality(sc),
        isMine: false,
      }
    })
  }

  // Update current team entry when scores change
  useEffect(() => {
    setEntries(prev => prev.map(e =>
      e.brand === team?.brand
        ? { ...e, name: team?.name || e.name, score: myScore, completed: myCompleted, completionPct: Math.round(myCompleted / totalActs * 100), avgQuality: myQuality }
        : e
    ))
  }, [myScore, myCompleted, myQuality, team])

  // Load all teams from Supabase
  useEffect(() => {
    const loadAll = async () => {
      const data = await getAllTeamsData()
      if (!data) return
      setEntries(buildEntries(data as unknown[]))
    }
    loadAll()
    const unsub = subscribeToAllWorkspaces(() => { loadAll() })
    return () => { unsub() }
  }, [myScore, myCompleted, myQuality]) // re-run when own score changes to keep current team fresh

  const sorted = [...entries].sort((a, b) => b.score - a.score || b.completed - a.completed)

  return (
    <div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Rank', 'Team', 'Brand', 'Score', 'Completion', 'Avg Quality'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, i) => (
              <tr key={entry.brand} className={`border-b border-slate-100 transition-colors ${entry.isMine ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
                <td className="px-5 py-4">
                  <span className={`text-sm font-bold ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-slate-400'}`}>{getRankIcon(i + 1)}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-sm font-semibold ${entry.isMine ? 'text-brand-700' : 'text-slate-700'}`}>
                    {entry.name} {entry.isMine && <span className="text-[10px] text-brand-400 font-normal">(you)</span>}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-500">{entry.brand}</td>
                <td className="px-5 py-4">
                  <span className={`text-base font-bold tabular-nums ${entry.isMine ? 'text-emerald-600' : 'text-slate-700'}`}>{entry.score}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${entry.completionPct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{entry.completionPct}%</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-sm font-bold tabular-nums ${entry.avgQuality >= 2 ? 'text-emerald-600' : entry.avgQuality >= 1 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {entry.avgQuality > 0 ? `${entry.avgQuality}/3` : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-slate-400 text-center">Scores update automatically · Avg quality rewards conceptual depth over word count</div>
    </div>
  )
}
