import { useEffect, useState } from 'react'
import { useWorkspaceStore, selectTotalScore, selectAvgQuality } from '../../store/workspace'
import { subscribeToAllWorkspaces, getAllTeamsData } from '../../lib/supabase'
import { BRANDS } from '../../data/workshop'
import type { Brand } from '../../types'

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

export function LeaderboardPanel() {
  const { team, scores, simulators } = useWorkspaceStore()
  const myScore = selectTotalScore(scores) + Object.values(simulators).reduce((s, v) => s + (v?.points || 0), 0)
  const myCompleted = Object.values(scores).filter(s => s?.completed).length
  const myQuality = selectAvgQuality(scores)
  const totalActs = 22 // 18 activities + 4 sims

  const [entries, setEntries] = useState<LeaderboardEntry[]>(() =>
    BRANDS.map(b => ({
      name: b, brand: b,
      score: b === team?.brand ? myScore : 0,
      completed: b === team?.brand ? myCompleted : 0,
      completionPct: b === team?.brand ? Math.round(myCompleted / totalActs * 100) : 0,
      avgQuality: b === team?.brand ? myQuality : 0,
      isMine: b === team?.brand,
    }))
  )

  useEffect(() => {
    setEntries(prev => prev.map(e =>
      e.brand === team?.brand
        ? { ...e, name: team?.name || e.name, score: myScore, completed: myCompleted, completionPct: Math.round(myCompleted / totalActs * 100), avgQuality: myQuality }
        : e
    ))
  }, [myScore, myCompleted, myQuality, team])

  useEffect(() => {
    const loadAll = async () => {
      const data = await getAllTeamsData()
      if (!data?.length) return
      const updated = BRANDS.map(brand => {
        const row = data.find((r: { brand: string }) => r.brand === brand)
        if (brand === team?.brand) return { name: team?.name || brand, brand, score: myScore, completed: myCompleted, completionPct: Math.round(myCompleted / totalActs * 100), avgQuality: myQuality, isMine: true }
        if (!row) return { name: brand as string, brand, score: 0, completed: 0, completionPct: 0, avgQuality: 0, isMine: false }
        const wsData = row.bm7621seo_workspace_data?.[0]
        const sc = wsData?.scores || {}
        const sim = wsData?.simulators || {}
        const rowScore = Object.values(sc).reduce((s: number, v: unknown) => s + ((v as { points?: number })?.points || 0), 0)
          + Object.values(sim).reduce((s: number, v: unknown) => s + ((v as { points?: number })?.points || 0), 0)
        const rowDone = Object.values(sc).filter((v: unknown) => (v as { completed?: boolean })?.completed).length
        const withQ = Object.values(sc).filter((v: unknown) => (v as { completed?: boolean; qualityPts?: number })?.completed && (v as { qualityPts?: number })?.qualityPts)
        const rowQ = withQ.length ? Math.round(withQ.reduce((s: number, v: unknown) => s + ((v as { qualityPts?: number })?.qualityPts || 0), 0) / withQ.length * 10) / 10 : 0
        return { name: row.name || brand, brand, score: rowScore, completed: rowDone, completionPct: Math.round(rowDone / totalActs * 100), avgQuality: rowQ, isMine: false }
      })
      setEntries(updated as LeaderboardEntry[])
    }
    loadAll()
    const unsub = subscribeToAllWorkspaces(() => loadAll())
    return unsub
  }, [])

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
