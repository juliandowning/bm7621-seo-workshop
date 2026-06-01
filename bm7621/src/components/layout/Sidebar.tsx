import { BookOpen, BarChart3, CheckCircle, Circle, Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { useWorkspaceStore, selectTotalScore, selectCompletedCount } from '../../store/workspace'
import { BLOCK_STRUCTURE, ACTIVITY_ORDER } from '../../data/workshop'
import { cn } from '../../lib/utils'

interface SidebarProps {
  currentPanel: string
  onNavigate: (panel: string) => void
}

const SYNC_ICONS = {
  idle: null,
  saving: <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />,
  saved: <Wifi size={10} className="text-emerald-400" />,
  error: <AlertCircle size={10} className="text-red-400" />,
  offline: <WifiOff size={10} className="text-slate-500" />,
}

export function Sidebar({ currentPanel, onNavigate }: SidebarProps) {
  const { team, scores, simulators, syncStatus, lastSaved } = useWorkspaceStore()
  const totalPts = selectTotalScore(scores)
  const simPts = Object.values(simulators).reduce((s, v) => s + (v?.points || 0), 0)
  const totalWithSim = totalPts + simPts
  const completed = selectCompletedCount(scores)
  const total = ACTIVITY_ORDER.length

  const isActivityDone = (key: string) => !!scores[key as keyof typeof scores]?.completed

  return (
    <aside className="w-64 h-screen bg-slate-900 flex flex-col fixed top-0 left-0 z-50 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">BM7621</div>
        <div className="font-display text-white text-base leading-snug">SEO Workshop</div>
        <div className="text-[10px] text-slate-500 mt-1">CIM Level 4 · Digital Marketing</div>
      </div>

      {/* Team info */}
      {team && (
        <div className="px-5 py-3.5 bg-brand-500/15 border-b border-white/8">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{team.brand}</div>
          <div className="text-sm font-bold text-white">{team.name}</div>
          <div className="flex items-center gap-3 mt-2">
            <div className="text-xs text-slate-400">
              Score: <span className="text-emerald-400 font-bold text-sm">{totalWithSim}</span>
            </div>
            <div className="text-xs text-slate-500">
              {completed}/{total} done
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-brand-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.round(completed / total * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2">
        {/* Mission */}
        <button
          className={cn('sidebar-link w-full text-left', currentPanel === 'mission' && 'active')}
          onClick={() => onNavigate('mission')}
        >
          <BookOpen size={14} />
          Mission Brief
        </button>

        {/* Blocks */}
        {BLOCK_STRUCTURE.map(block => (
          <div key={block.id} className="mt-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-1">
              Block {block.id} — {block.label}
            </div>
            {block.activities.map(actKey => {
              const done = isActivityDone(actKey)
              const simKey = actKey.startsWith('sim') ? actKey : null
              const simDone = simKey ? (simulators[simKey]?.points || 0) > 0 : false
              const isDone = done || simDone
              const panelId = `block${block.id}`
              return (
                <button
                  key={actKey}
                  className={cn(
                    'sidebar-link w-full text-left text-[11px] pl-5',
                    currentPanel === panelId && 'active'
                  )}
                  onClick={() => onNavigate(panelId)}
                >
                  {isDone
                    ? <CheckCircle size={11} className="text-emerald-400 flex-shrink-0" />
                    : <Circle size={11} className="flex-shrink-0" />
                  }
                  <span className="truncate">{actKey.toUpperCase().replace('SIM', 'Sim ')}</span>
                </button>
              )
            })}
          </div>
        ))}

        {/* Leaderboard */}
        <div className="mt-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-1">Tools</div>
          <button
            className={cn('sidebar-link w-full text-left', currentPanel === 'leaderboard' && 'active')}
            onClick={() => onNavigate('leaderboard')}
          >
            <BarChart3 size={14} />
            Leaderboard
          </button>
          <button
            className={cn('sidebar-link w-full text-left', currentPanel === 'exports' && 'active')}
            onClick={() => onNavigate('exports')}
          >
            <span className="text-slate-500 text-[12px]">↓</span>
            Export Centre
          </button>
        </div>
      </nav>

      {/* Sync status */}
      <div className="px-4 py-3 border-t border-white/8">
        <div className="flex items-center gap-2 text-[10px] text-slate-600">
          {SYNC_ICONS[syncStatus]}
          <span>
            {syncStatus === 'saved' && lastSaved
              ? `Saved ${new Date(lastSaved).toLocaleTimeString()}`
              : syncStatus === 'saving'
              ? 'Saving...'
              : syncStatus === 'error'
              ? 'Sync error — saved locally'
              : syncStatus === 'offline'
              ? 'Working offline'
              : 'Auto-save on'}
          </span>
        </div>
      </div>

      {/* Switch team */}
      <div className="px-4 pb-4 border-t border-white/8 pt-3">
        <button
          onClick={() => {
            if (window.confirm('Switch team? Your progress is saved and will reload when you enter your code again.')) {
              useWorkspaceStore.getState().clearWorkspace()
              window.location.reload()
            }
          }}
          className="w-full text-left text-[11px] text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1.5 py-1"
        >
          <span>⇄</span> Switch Team / Sign Out
        </button>
      </div>
    </aside>
  )
}
