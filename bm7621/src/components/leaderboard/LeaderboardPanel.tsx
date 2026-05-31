import { useEffect, useState } from 'react'
import { useWorkspaceStore, selectTotalScore } from '../../store/workspace'
import { subscribeToAllWorkspaces, getAllTeamsData } from '../../lib/supabase'
import { BRANDS } from '../../data/workshop'
import type { Brand } from '../../types'

interface LeaderboardEntry {
  name: string
  brand: Brand
  score: number
  completed: number
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

  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => {
    // Seed with all brands at 0
    return BRANDS.map(b => ({
      name: b,
      brand: b,
      score: b === team?.brand ? myScore : 0,
      completed: b === team?.brand ? myCompleted : 0,
      isMine: b === team?.brand,
    }))
  })

  // Update our own entry when scores change
  useEffect(() => {
    setEntries(prev => prev.map(e =>
      e.brand === team?.brand
        ? { ...e, name: team?.name || e.name, score: myScore, completed: myCompleted }
        : e
    ))
  }, [myScore, myCompleted, team])

  // Subscribe to Supabase for other teams
  useEffect(() => {
    const loadAll = async () => {
      const data = await getAllTeamsData()
      if (!data?.length) return
      const updated = BRANDS.map(brand => {
        const row = data.find((r: { brand: string }) => r.brand === brand)
        if (!row) return { name: brand, brand, score: brand === team?.brand ? myScore : 0, completed: brand === team?.brand ? myCompleted : 0, isMine: brand === team?.brand }
        const wsData = row.workspace_data?.[0]
        const sc = wsData?.scores || {}
        const sim = wsData?.simulators || {}
        const rowScore = Object.values(sc).reduce((s: number, v: unknown) => s + ((v as { points?: number })?.points || 0), 0)
          + Object.values(sim).reduce((s: number, v: unknown) => s + ((v as { points?: number })?.points || 0), 0)
        const rowDone = Object.values(sc).filter((v: unknown) => (v as { completed?: boolean })?.completed).length
        if (brand === team?.brand) return { name: team?.name || brand, brand, score: myScore, completed: myCompleted, isMine: true }
        return { name: row.name || brand, brand, score: rowScore, completed: rowDone, isMine: false }
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
      <div className="mb-6">
        <div className="text-[11px] font-bold tracking-widest uppercase text-brand-500 mb-1">Live Rankings</div>
        <h1 className="font-display text-2xl text-slate-900">Workshop Leaderboard</h1>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Rank</th>
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Team</th>
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Brand</th>
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Score</th>
              <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Activities</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, i) => (
              <tr
                key={entry.brand}
                className={`border-b border-slate-100 transition-colors ${entry.isMine ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
              >
                <td className="px-5 py-4">
                  <span className={`text-sm font-bold ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-slate-400'}`}>
                    {getRankIcon(i + 1)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-sm font-semibold ${entry.isMine ? 'text-brand-700' : 'text-slate-700'}`}>
                    {entry.name} {entry.isMine && <span className="text-[10px] text-brand-400 font-normal">(you)</span>}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-500">{entry.brand}</td>
                <td className="px-5 py-4">
                  <span className={`text-base font-bold tabular-nums ${entry.isMine ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {entry.score}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-400">{entry.completed} completed</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-slate-400 text-center">
        Scores update automatically · Simulators and activities both count
      </div>
    </div>
  )
}
