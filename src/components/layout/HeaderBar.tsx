import { Download, RefreshCw } from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspace'

interface HeaderBarProps {
  title: string
  subtitle?: string
  onNavigate: (panel: string) => void
}

export function HeaderBar({ title, subtitle, onNavigate }: HeaderBarProps) {
  const { syncStatus, syncToSupabase } = useWorkspaceStore()

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        {subtitle && (
          <div className="text-[11px] font-bold tracking-widest uppercase text-brand-500 mb-1">{subtitle}</div>
        )}
        <h1 className="font-display text-2xl text-slate-900 leading-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {syncStatus === 'error' && (
          <button
            className="btn-ghost text-xs"
            onClick={() => syncToSupabase()}
          >
            <RefreshCw size={12} /> Retry sync
          </button>
        )}
        <button
          className="btn-secondary text-xs"
          onClick={() => onNavigate('exports')}
        >
          <Download size={12} /> Export
        </button>
      </div>
    </div>
  )
}
