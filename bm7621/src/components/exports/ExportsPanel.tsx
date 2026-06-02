import { useWorkspaceStore } from '../../store/workspace'
import { exportWorkbookText, exportStrategyHTML, exportJSONBackup } from '../../lib/exports'

export function ExportsPanel() {
  const { team, scores, responses, simulators, cmoEval, searchMasters, exportJSON, importJSON } = useWorkspaceStore()

  const handleExportWorkbook = () => {
    if (!team) return
    exportWorkbookText({ team, scores, responses, simulators, cmoEval, searchMasters })
  }

  const handleExportStrategy = () => {
    if (!team) return
    exportStrategyHTML({ team, scores, responses, simulators, cmoEval, searchMasters })
  }

  const handleExportJSON = () => {
    if (!team) return
    exportJSONBackup({ team, scores, responses, simulators, cmoEval, searchMasters })
  }

  const handleExportRaw = () => {
    const json = exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bm7621-backup-${Date.now()}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const ok = importJSON(text)
      if (ok) alert('✅ Data restored successfully. Refresh to see changes.')
      else alert('❌ Invalid backup file. Please use a valid BM7621 JSON backup.')
    }
    input.click()
  }

  const EXPORTS = [
    {
      title: 'Team Workbook',
      subtitle: 'Complete record of all activity responses and scores',
      format: 'TXT',
      icon: '📄',
      action: handleExportWorkbook,
      color: 'border-brand-200 bg-brand-50',
      badge: 'bg-brand-100 text-brand-700',
    },
    {
      title: 'Final Strategy Report',
      subtitle: 'Board-ready HTML report with CMO evaluation results',
      format: 'HTML',
      icon: '🏛️',
      action: handleExportStrategy,
      color: 'border-amber-200 bg-amber-50',
      badge: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'JSON Data Backup',
      subtitle: 'Full workspace backup including all scores and responses',
      format: 'JSON',
      icon: '💾',
      action: handleExportRaw,
      color: 'border-emerald-200 bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-700',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <div className="text-[11px] font-bold tracking-widest uppercase text-brand-500 mb-1">Export Centre</div>
        <h1 className="font-display text-2xl text-slate-900">Download Your Work</h1>
        <p className="text-sm text-slate-500 mt-1">All data is auto-saved to Supabase. Use exports for local backup and submission.</p>
      </div>

      <div className="space-y-4 mb-8">
        {EXPORTS.map(exp => (
          <div key={exp.title} className={`border rounded-xl p-5 flex items-center justify-between gap-4 ${exp.color}`}>
            <div className="flex items-center gap-4">
              <div className="text-3xl">{exp.icon}</div>
              <div>
                <div className="font-bold text-slate-900 text-sm mb-0.5">{exp.title}</div>
                <div className="text-xs text-slate-500">{exp.subtitle}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${exp.badge}`}>{exp.format}</span>
              <button className="btn-primary btn-sm" onClick={exp.action}>Download</button>
            </div>
          </div>
        ))}
      </div>

      {/* Restore */}
      <div className="card-p">
        <div className="section-header">Restore from Backup</div>
        <p className="text-sm text-slate-500 mb-4">If you have a previous JSON backup, restore it here. This will overwrite current unsaved data.</p>
        <button className="btn-secondary" onClick={handleImport}>📂 Import JSON Backup</button>
      </div>
    </div>
  )
}
