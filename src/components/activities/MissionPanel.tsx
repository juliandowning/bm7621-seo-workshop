import { useWorkspaceStore, selectTotalScore, selectCompletedCount } from '../../store/workspace'
import { BLOCK_STRUCTURE, ACTIVITY_ORDER } from '../../data/workshop'
import { ProgressBar, Tag } from '../ui/shared'
import { cn } from '../../lib/utils'

interface MissionPanelProps {
  onNavigate: (panel: string) => void
}

const TAG_COLORS = ['blue', 'teal', 'teal', 'blue', 'amber', 'teal', 'teal'] as const

export function MissionPanel({ onNavigate }: MissionPanelProps) {
  const { team, scores, simulators } = useWorkspaceStore()
  const brand = team?.brand || 'ASOS'
  const total = selectTotalScore(scores) + Object.values(simulators).reduce((s, v) => s + (v?.points || 0), 0)
  const done = selectCompletedCount(scores)
  const totalActs = ACTIVITY_ORDER.length
  const pct = Math.round((done / totalActs) * 100)

  return (
    <div>
      {/* Scenario banner */}
      <div className="bg-slate-900 rounded-2xl p-7 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #2c6fad 0%, transparent 60%), radial-gradient(circle at 80% 20%, #1a9e8c 0%, transparent 50%)' }} />
        <div className="relative">
          <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">Client Scenario</div>
          <h2 className="font-display text-white text-xl leading-snug mb-3">{brand} — CMO Challenge</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Organic growth has stalled. Paid search costs are rising quarter-on-quarter. AI-powered search is reshaping how your audience discovers products. The CMO has retained your consultancy to diagnose the situation and return with a data-informed strategy recommendation.
          </p>
          <div className="flex flex-wrap gap-2">
            {['🔍 Search Strategy', '⚙️ Technical SEO', '📝 Content', '💰 Google Ads', '📊 Measurement', '🤖 AI Search'].map(tag => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full border border-white/15 text-slate-400">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Progress */}
        <div className="card-p">
          <div className="section-header">Workshop Progress</div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-slate-500">{done} of {totalActs} activities completed</span>
            <span className="font-bold text-slate-700">{pct}%</span>
          </div>
          <ProgressBar value={done} max={totalActs} className="mb-4" />
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600">{done}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-400">{totalActs - done}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{total}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Pts</div>
            </div>
          </div>
        </div>

        {/* Overview table */}
        <div className="card-p">
          <div className="section-header">Workshop Structure</div>
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Block', 'Focus', 'Activities'].map(h => (
                  <th key={h} className="text-left pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BLOCK_STRUCTURE.map((block, i) => (
                <tr key={block.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => onNavigate(`block${block.id}`)}>
                  <td className="py-2 border-b border-slate-50">
                    <Tag color={TAG_COLORS[i]}>{block.id}</Tag>
                  </td>
                  <td className="py-2 border-b border-slate-50 text-slate-600">{block.label}</td>
                  <td className="py-2 border-b border-slate-50 text-slate-400 text-xs">{block.activities.length} tasks</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {BLOCK_STRUCTURE.map((block, i) => {
          const done = block.activities.filter(a => scores[a]?.completed).length
          const allDone = done === block.activities.length
          return (
            <button
              key={block.id}
              onClick={() => onNavigate(`block${block.id}`)}
              className={cn(
                'p-3 border rounded-xl text-center transition-all hover:-translate-y-0.5',
                allDone
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50'
              )}
            >
              <div className="text-lg font-bold text-slate-900">{block.id}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{block.label.split(' ')[0]}</div>
              <div className="text-[10px] mt-1 font-semibold text-emerald-600">{done}/{block.activities.length}</div>
            </button>
          )
        })}
      </div>

      <div className="flex gap-3 flex-wrap">
        <button className="btn-primary" onClick={() => onNavigate('block1')}>Start Block 1 →</button>
        <button className="btn-secondary" onClick={() => onNavigate('exports')}>↓ Export Centre</button>
        <button className="btn-secondary" onClick={() => onNavigate('leaderboard')}>📊 Leaderboard</button>
      </div>
    </div>
  )
}
