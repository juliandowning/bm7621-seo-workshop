import { useWorkspaceStore } from '../../store/workspace'
import { exportWorkbookText, exportStrategyHTML } from '../../lib/exports'

export function ExportsPanel() {
  const { team, scores, responses, simulators, cmoEval, searchMasters, importJSON } = useWorkspaceStore()

  const handleExportWorkbook = () => {
    if (!team) return
    exportWorkbookText({ team, scores, responses, simulators, cmoEval, searchMasters })
  }

  const handleExportStrategy = () => {
    if (!team) return
    exportStrategyHTML({ team, scores, responses, simulators, cmoEval, searchMasters })
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const ok = importJSON(text)
      if (ok) alert('✅ Data restored successfully.')
      else alert('❌ Invalid backup file.')
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
      title: 'Workshop Report',
      subtitle: 'Full results report including Search Masters quiz performance',
      format: 'HTML',
      icon: '🏛️',
      action: handleExportStrategy,
      color: 'border-amber-200 bg-amber-50',
      badge: 'bg-amber-100 text-amber-700',
    },
  ]

  return (
    <div>
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

      {/* Restore — lecturer only, hidden in plain sight */}
      <details className="mt-6">
        <summary className="text-xs text-slate-400 cursor-pointer select-none hover:text-slate-500">Advanced options</summary>
        <div className="card-p mt-3">
          <div className="section-header">Restore from Backup</div>
          <p className="text-sm text-slate-500 mb-4">If you have a previous JSON backup from your lecturer, restore it here.</p>
          <button className="btn-secondary" onClick={handleImport}>📂 Import JSON Backup</button>
        </div>
      </details>
    </div>
  )
}
