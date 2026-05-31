import { useEffect, useState } from 'react'
import { getAllTeamsData, subscribeToAllWorkspaces } from '../../lib/supabase'
import { BRANDS, BLOCK_STRUCTURE } from '../../data/workshop'
import { ProgressBar } from '../ui/shared'
import type { Brand } from '../../types'

interface TeamRow {
  brand: Brand
  name: string
  score: number
  completed: number
  pct: number
  currentBlock: number
  lastUpdated: string | null
}

function computeRow(raw: { brand: Brand; name: string; workspace_data?: { scores?: Record<string, { points: number; completed: boolean }>; simulators?: Record<string, { points: number }>; updated_at?: string }[] }): TeamRow {
  const ws = raw.workspace_data?.[0]
  const sc = ws?.scores || {}
  const sim = ws?.simulators || {}
  const score = Object.values(sc).reduce((s: number, v) => s + (v?.points || 0), 0)
    + Object.values(sim).reduce((s: number, v) => s + (v?.points || 0), 0)
  const completed = Object.values(sc).filter(v => v?.completed).length
  const pct = Math.round((completed / 23) * 100)

  // determine current block
  let currentBlock = 1
  for (let i = BLOCK_STRUCTURE.length - 1; i >= 0; i--) {
    const blk = BLOCK_STRUCTURE[i]
    if (blk.activities.some(a => sc[a]?.completed)) { currentBlock = blk.id; break }
  }

  return {
    brand: raw.brand,
    name: raw.name || raw.brand,
    score, completed, pct, currentBlock,
    lastUpdated: ws?.updated_at || null,
  }
}

export function FacilitatorDashboard() {
  const [rows, setRows] = useState<TeamRow[]>(
    BRANDS.map(b => ({ brand: b, name: b, score: 0, completed: 0, pct: 0, currentBlock: 1, lastUpdated: null }))
  )
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const refresh = async () => {
    const data = await getAllTeamsData()
    if (!data?.length) return
    const updated = BRANDS.map(brand => {
      const raw = data.find((r: { brand: string }) => r.brand === brand)
      if (!raw) return { brand, name: brand as string, score: 0, completed: 0, pct: 0, currentBlock: 1, lastUpdated: null }
      return computeRow(raw as Parameters<typeof computeRow>[0])
    })
    setRows(updated as TeamRow[])
    setLastRefresh(new Date())
  }

  useEffect(() => {
    refresh()
    const unsub = subscribeToAllWorkspaces(() => refresh())
    const interval = setInterval(refresh, 30000)
    return () => { unsub(); clearInterval(interval) }
  }, [])

  const sorted = [...rows].sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-brand-500 mb-1">BM7621 · Facilitator View</div>
            <h1 className="font-display text-3xl text-slate-900">Workshop Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Last refresh: {lastRefresh.toLocaleTimeString()}</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <button className="btn-secondary btn-sm" onClick={refresh}>Refresh</button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="card-p text-center">
            <div className="text-3xl font-bold text-brand-600">{rows.filter(r => r.completed > 0).length}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Teams Active</div>
          </div>
          <div className="card-p text-center">
            <div className="text-3xl font-bold text-slate-900">{Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length)}%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Avg Completion</div>
          </div>
          <div className="card-p text-center">
            <div className="text-3xl font-bold text-emerald-600">{sorted[0]?.score || 0}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Leading Score</div>
          </div>
          <div className="card-p text-center">
            <div className="text-3xl font-bold text-slate-600">{Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length)}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Avg Score</div>
          </div>
        </div>

        {/* Team table */}
        <div className="card overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Progress</div>
            <div className="text-xs text-slate-400">Real-time · updates automatically</div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Rank', 'Team', 'Brand', 'Block', 'Progress', 'Score', 'Last Active'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr key={row.brand} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-bold text-slate-500">#{i + 1}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{row.name}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{row.brand}</td>
                  <td className="px-5 py-3.5">
                    <span className="badge-blue text-[10px]">Block {row.currentBlock}</span>
                  </td>
                  <td className="px-5 py-3.5 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={row.pct} className="flex-1" />
                      <span className="text-xs font-semibold text-slate-600 w-8">{row.pct}%</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{row.completed}/23 done</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-lg font-bold tabular-nums text-slate-900">{row.score}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {row.lastUpdated ? new Date(row.lastUpdated).toLocaleTimeString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Block completion heatmap */}
        <div className="card-p">
          <div className="section-header">Block Coverage</div>
          <div className="text-xs text-slate-400">Tracks which teams have completed activities in each block.</div>
        </div>
      </div>
    </div>
  )
}
