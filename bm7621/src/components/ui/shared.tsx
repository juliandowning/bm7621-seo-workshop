import { cn, getScoreBadgeClass } from '../../lib/utils'

// ─── SCORE BADGE ─────────────────────────────────────────────
interface ScoreBadgeProps { points: number; max?: number }
export function ScoreBadge({ points, max = 5 }: ScoreBadgeProps) {
  return <span className={getScoreBadgeClass(points, max)}>{points} / {max} pts</span>
}

// ─── ACTIVITY CARD ───────────────────────────────────────────
interface ActivityCardProps {
  number: number | string; title: string; subtitle?: string
  points: number; max?: number; isSimulator?: boolean; children: React.ReactNode
}
export function ActivityCard({ number, title, subtitle, points, max = 5, isSimulator = false, children }: ActivityCardProps) {
  return (
    <div className={cn('card-p mb-5', isSimulator && 'border-brand-300 border-2')}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5',
            isSimulator ? 'bg-violet-500' : 'bg-brand-500')}>
            {isSimulator ? 'SIM' : `A${number}`}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{title}</div>
            {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
          </div>
        </div>
        <ScoreBadge points={points} max={max} />
      </div>
      {children}
    </div>
  )
}

// ─── FEEDBACK PANEL (LOCK → SCORE → LEARN) ───────────────────
interface FeedbackPanelProps {
  score: number; max?: number
  why: string
  example?: string
  keyLearning?: string[]
  completionPts?: number; qualityPts?: number
}
export function FeedbackPanel({ score, max = 5, why, example, keyLearning, completionPts, qualityPts }: FeedbackPanelProps) {
  return (
    <div className="mt-4 border border-brand-200 bg-brand-50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-brand-500 flex items-center justify-between">
        <span className="text-white font-bold text-sm">Your Score: {score}/{max}</span>
        {(completionPts !== undefined && qualityPts !== undefined) && (
          <span className="text-brand-100 text-xs font-mono">Completion {completionPts}/2 · Quality {qualityPts}/3</span>
        )}
      </div>
      <div className="px-4 py-3 border-b border-brand-100">
        <div className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-1">Why you scored this</div>
        <div className="text-sm text-slate-700 leading-relaxed">{why}</div>
      </div>
      {example && (
        <div className="px-4 py-3 border-b border-brand-100 bg-white">
          <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-1">Example strong answer</div>
          <div className="text-sm text-slate-600 leading-relaxed italic">{example}</div>
        </div>
      )}
      {keyLearning && keyLearning.length > 0 && (
        <div className="px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Key learning points</div>
          <ul className="space-y-1">
            {keyLearning.map((pt, i) => (
              <li key={i} className="text-xs text-slate-600 flex gap-2">
                <span className="text-brand-400 flex-shrink-0">→</span>{pt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── ALERT ───────────────────────────────────────────────────
interface AlertProps { type?: 'info' | 'success' | 'warning' | 'danger'; children: React.ReactNode; className?: string }
export function Alert({ type = 'info', children, className }: AlertProps) {
  return <div className={cn(`alert-${type}`, 'mb-4', className)}><span>{children}</span></div>
}

// ─── PROGRESS BAR ────────────────────────────────────────────
interface ProgressBarProps { value: number; max?: number; className?: string; color?: string }
export function ProgressBar({ value, max = 100, className, color }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className={cn('progress-bar-track', className)}>
      <div className={cn('progress-bar-fill', color)} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ─── EVAL BAR ────────────────────────────────────────────────
interface EvalBarProps { label: string; score: number }
export function EvalBar({ label, score }: EvalBarProps) {
  const pct = Math.min(100, Math.round(score))
  const color = pct >= 65 ? 'bg-emerald-500' : pct >= 35 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1"><span>{label}</span><span>{pct}%</span></div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── TAG ─────────────────────────────────────────────────────
interface TagProps { children: React.ReactNode; color?: 'blue' | 'teal' | 'green' | 'amber' | 'red' | 'slate' }
export function Tag({ children, color = 'blue' }: TagProps) {
  const colorMap = { blue: 'badge-blue', teal: 'badge-teal', green: 'badge-green', amber: 'badge-amber', red: 'badge-red', slate: 'badge-slate' }
  return <span className={colorMap[color]}>{children}</span>
}

// ─── SIMULATOR INPUT ROW ──────────────────────────────────────
interface SimInputsProps { values: (number | null)[]; onChange: (vals: (number | null)[]) => void; memberCount?: number }
export function SimInputs({ values, onChange, memberCount = 5 }: SimInputsProps) {
  const handleChange = (i: number, raw: string) => {
    const next = [...values]
    const v = parseFloat(raw)
    next[i] = raw === '' ? null : isNaN(v) ? null : Math.max(0, Math.min(100, v))
    onChange(next)
  }
  return (
    <div className="flex gap-2 flex-wrap">
      {Array.from({ length: memberCount }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="text-[10px] text-slate-400 font-semibold">Score {i + 1}</div>
          <input type="number" min={0} max={100} value={values[i] ?? ''} onChange={e => handleChange(i, e.target.value)}
            placeholder="—" className="w-16 text-center font-bold text-base border border-slate-200 rounded-lg py-2 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
        </div>
      ))}
    </div>
  )
}

// ─── CHAR COUNT ───────────────────────────────────────────────
interface CharCountProps { value: string; min: number; max: number }
export function CharCount({ value, min, max }: CharCountProps) {
  const len = value.length
  const ok = len >= min && len <= max
  const over = len > max
  return (
    <div className={`text-[10px] mt-1 font-mono ${ok ? 'text-emerald-600' : over ? 'text-red-500' : 'text-slate-400'}`}>
      {len} / {max} &nbsp;·&nbsp; min {min}
    </div>
  )
}

// ─── LOCKED BADGE ────────────────────────────────────────────
export function LockedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      🔒 Submitted
    </span>
  )
}

// ─── SCORE BREAKDOWN ─────────────────────────────────────────
interface ScoreBreakdownProps { completionPts: number; qualityPts: number }
export function ScoreBreakdown({ completionPts, qualityPts }: ScoreBreakdownProps) {
  return (
    <div className="flex gap-3 text-[10px] font-mono text-slate-400 mt-1">
      <span>Completion: <strong className="text-slate-600">{completionPts}/2</strong></span>
      <span>Quality: <strong className="text-slate-600">{qualityPts}/3</strong></span>
    </div>
  )
}

// ─── BOARD OPTION SELECTOR ───────────────────────────────────
interface BoardOption { id: string; label: string; desc: string }
interface BoardOptionGroupProps {
  label: string; options: BoardOption[]; selected: string; onChange: (id: string) => void; locked?: boolean
}
export function BoardOptionGroup({ label, options, selected, onChange, locked = false }: BoardOptionGroupProps) {
  return (
    <div className="mb-5">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</div>
      <div className="grid grid-cols-1 gap-2">
        {options.map(opt => (
          <button key={opt.id} disabled={locked}
            onClick={() => onChange(opt.id)}
            className={cn('text-left p-3 border-2 rounded-xl transition-all',
              selected === opt.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300',
              locked && 'cursor-default'
            )}>
            <div className={cn('font-bold text-sm', selected === opt.id ? 'text-brand-700' : 'text-slate-800')}>{opt.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
