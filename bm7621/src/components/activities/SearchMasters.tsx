import { useState, useEffect, useRef } from 'react'
import { useWorkspaceStore, selectTotalScore, selectAvgQuality } from '../../store/workspace'
import { QUESTIONS, ROUND_LABELS, MAX_SCORE, getTotalRounds } from '../../data/searchMasters'
import { cn } from '../../lib/utils'
import type { SMQuestion } from '../../data/searchMasters'

const QUESTION_TIME = 30 // seconds per question

// ─── TIMER RING ──────────────────────────────────────────────
function TimerRing({ seconds, total }: { seconds: number; total: number }) {
  const pct = seconds / total
  const r = 22
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  const color = seconds > 10 ? '#2c6fad' : seconds > 5 ? '#d97706' : '#dc2626'
  return (
    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
      <svg width="64" height="64" className="-rotate-90 absolute inset-0">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }} />
      </svg>
      <span className={cn('text-lg font-bold font-mono z-10', seconds <= 5 ? 'text-red-600' : 'text-slate-700')}>{seconds}</span>
    </div>
  )
}

// ─── QUESTION CARD ────────────────────────────────────────────
interface QuestionCardProps {
  q: SMQuestion
  onAnswer: (answer: string, timeMs: number) => void
  startTime: number
}
function QuestionCard({ q, onAnswer, startTime }: QuestionCardProps) {
  const [selected, setSelected] = useState('')
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [autoSubmitted, setAutoSubmitted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          if (!autoSubmitted) {
            setAutoSubmitted(true)
            const elapsed = Date.now() - startTime
            onAnswer('', elapsed)
          }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const handleSubmit = () => {
    if (!selected) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    const elapsed = Date.now() - startTime
    onAnswer(selected, elapsed)
  }

  const diffLabel: Record<string, string> = { easy: 'Easy · 1pt', medium: 'Medium · 2pts', hard: 'Hard · 3pts', veryhard: '★ Final · 10pts' }
  const diffColor: Record<string, string> = { easy: 'text-emerald-600 bg-emerald-50', medium: 'text-amber-600 bg-amber-50', hard: 'text-red-600 bg-red-50', veryhard: 'text-violet-700 bg-violet-50' }

  return (
    <div className={cn('card-p', q.difficulty === 'veryhard' && 'border-violet-400 border-2 shadow-lg')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-brand-500 mb-1">
            Round {q.round} · {q.roundLabel} · Question {q.number} of {QUESTIONS.length}
          </div>
          <span className={cn('text-[10px] font-bold px-2.5 py-0.5 rounded-full', diffColor[q.difficulty])}>
            {diffLabel[q.difficulty]}
          </span>
        </div>
        <TimerRing seconds={timeLeft} total={QUESTION_TIME} />
      </div>

      {/* Question */}
      <div className={cn('text-base font-semibold text-slate-900 leading-relaxed mb-5 whitespace-pre-line', q.difficulty === 'veryhard' && 'text-lg')}>
        {q.question}
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {q.options?.map(opt => (
          <button key={opt}
            onClick={() => setSelected(opt)}
            className={cn(
              'w-full text-left p-3.5 border-2 rounded-xl text-sm font-medium transition-all',
              selected === opt
                ? 'border-brand-500 bg-brand-50 text-brand-800'
                : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/50'
            )}>
            {opt}
          </button>
        ))}
      </div>

      <button
        className="btn-primary w-full justify-center py-3"
        onClick={handleSubmit}
        disabled={!selected}>
        Submit Answer →
      </button>
    </div>
  )
}

// ─── FEEDBACK CARD ────────────────────────────────────────────
interface FeedbackCardProps {
  q: SMQuestion
  answer: string
  correct: boolean
  points: number
  onNext: () => void
  isLast: boolean
}
function FeedbackCard({ q, answer, correct, points, onNext, isLast }: FeedbackCardProps) {
  return (
    <div className="card-p">
      <div className={cn('flex items-center gap-3 mb-5 p-4 rounded-xl border-2',
        correct ? 'bg-emerald-50 border-emerald-400' : 'bg-red-50 border-red-400')}>
        <div className="text-3xl">{correct ? '✅' : '❌'}</div>
        <div>
          <div className={cn('font-bold text-base', correct ? 'text-emerald-700' : 'text-red-700')}>
            {correct ? `Correct! +${points} point${points !== 1 ? 's' : ''}` : answer ? 'Incorrect' : 'Time ran out'}
          </div>
          {!correct && <div className="text-sm text-slate-600 mt-0.5">Correct answer: <strong>{q.correct}</strong></div>}
          {!correct && answer && <div className="text-sm text-slate-500 mt-0.5">Your answer: {answer}</div>}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Explanation</div>
        <p className="text-sm text-slate-700 leading-relaxed">{q.explanation}</p>
      </div>

      <div className="bg-brand-50 border border-brand-200 rounded-lg p-3.5 mb-5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-1">Key Learning</div>
        <p className="text-sm text-slate-700 leading-relaxed">{q.keyLearning}</p>
      </div>

      <button className="btn-primary w-full justify-center py-3" onClick={onNext}>
        {isLast ? '🏆 See Final Results' : 'Next Question →'}
      </button>
    </div>
  )
}

// ─── WINNER SCREEN ────────────────────────────────────────────
interface WinnerScreenProps {
  smScore: number
  totalWorkshopScore: number
  avgQuality: number
  teamName: string
  brand: string
  answeredCount: number
  correctCount: number
}
function WinnerScreen({ smScore, totalWorkshopScore, avgQuality, teamName, brand, answeredCount, correctCount }: WinnerScreenProps) {
  const questionPct = Math.round(answeredCount / QUESTIONS.length * 100)
  const grade = smScore >= 35 ? '🥇 Search Master' : smScore >= 25 ? '🥈 Search Expert' : smScore >= 15 ? '🥉 Search Practitioner' : '📚 Keep Learning'

  return (
    <div className="card-p text-center">
      <div className="text-6xl mb-3">🏆</div>
      <div className="text-[10px] font-bold tracking-widest uppercase text-violet-600 mb-2">Search Masters Challenge Complete</div>
      <h2 className="font-display text-2xl text-slate-900 mb-1">{teamName}</h2>
      <div className="text-slate-500 text-sm mb-6">{brand}</div>

      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-100 text-violet-800 font-bold text-sm mb-6">
        {grade}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-2">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-violet-600">{smScore}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Quiz Score</div>
          <div className="text-xs text-slate-400">out of {MAX_SCORE} pts · {correctCount}/{answeredCount} correct</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-brand-600">{totalWorkshopScore}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Workshop Total</div>
          <div className="text-xs text-slate-400">all activities + sims + quiz</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="text-3xl font-bold text-emerald-600">{avgQuality > 0 ? `${avgQuality}/3` : '—'}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Avg Quality</div>
          <div className="text-xs text-slate-400">depth of written responses</div>
        </div>
      </div>

      {/* Definitions */}
      <div className="text-left bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Score Definitions</div>
        <div className="text-xs text-slate-600"><strong className="text-violet-700">Quiz Score</strong> — points earned in the Search Masters Challenge (max {MAX_SCORE}). Easy=1pt · Medium=2pts · Hard=3pts · Final=10pts.</div>
        <div className="text-xs text-slate-600"><strong className="text-brand-700">Workshop Total</strong> — combined score across all activities, simulators, and the quiz. This is your overall rank on the leaderboard.</div>
        <div className="text-xs text-slate-600"><strong className="text-emerald-700">Avg Quality</strong> — average quality score across written activities (0–3). Rewards conceptual depth over word count.</div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Questions answered</span>
          <span>{answeredCount}/{QUESTIONS.length}</span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all duration-1000" style={{ width: `${questionPct}%` }} />
        </div>
      </div>

      <p className="text-xs text-slate-400">Results saved · Check the leaderboard to see how you compare with other teams</p>
    </div>
  )
}

// ─── ROUND HEADER ────────────────────────────────────────────
function RoundHeader({ round, label, questionNum, total }: { round: number; label: string; questionNum: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        R{round}
      </div>
      <div>
        <div className="font-bold text-slate-900 text-sm">{label}</div>
        <div className="text-xs text-slate-400">Question {questionNum} of {total}</div>
      </div>
      {/* Progress dots */}
      <div className="flex gap-1 ml-auto">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={cn('w-2 h-2 rounded-full',
            i < questionNum - 1 ? 'bg-brand-500' : i === questionNum - 1 ? 'bg-brand-300' : 'bg-slate-200'
          )} />
        ))}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export function SearchMastersPanel() {
  const { team, scores, searchMasters, simulators, submitSMAnswer, lockSearchMasters, updateScore } = useWorkspaceStore()
  const [currentIdx, setCurrentIdx] = useState(() => {
    // Resume from last unanswered question
    if (!searchMasters?.answers) return 0
    const answered = Object.keys(searchMasters.answers).length
    return Math.min(answered, QUESTIONS.length)
  })
  const [phase, setPhase] = useState<'intro' | 'question' | 'feedback' | 'complete'>(() => {
    if (searchMasters?.completed) return 'complete'
    if (currentIdx > 0) return 'question'
    return 'intro'
  })
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  const totalWorkshopScore = selectTotalScore(scores) + Object.values(simulators).reduce((s, v) => s + (v?.points || 0), 0)
  const avgQuality = selectAvgQuality(scores)

  const currentQ = QUESTIONS[currentIdx]
  const lastAnswer = currentQ && searchMasters?.answers[currentQ.id]

  const handleAnswer = (answer: string, timeMs: number) => {
    if (!currentQ) return
    const correct = answer.toLowerCase().trim() === currentQ.correct.toLowerCase().trim()
    const points = correct ? currentQ.points : 0
    submitSMAnswer({ questionId: currentQ.id, answer, correct, points, timeMs })
    setPhase('feedback')
  }

  const handleNext = () => {
    const nextIdx = currentIdx + 1
    if (nextIdx >= QUESTIONS.length) {
      // Award the quiz score to a18
      const smScore = searchMasters?.totalScore || 0
      const normalized = Math.min(5, Math.round(smScore / MAX_SCORE * 5))
      updateScore('a18', normalized, 5, Math.min(2, normalized), Math.min(3, normalized - 1 + 1))
      lockSearchMasters()
      setPhase('complete')
    } else {
      setCurrentIdx(nextIdx)
      setQuestionStartTime(Date.now())
      setPhase('question')
    }
  }

  const startQuiz = () => {
    setQuestionStartTime(Date.now())
    setPhase('question')
  }

  const smScore = searchMasters?.totalScore || 0
  const answeredCount = Object.keys(searchMasters?.answers || {}).length
  const totalRounds = getTotalRounds()

  // ── COMPLETE ──
  if (phase === 'complete' || searchMasters?.completed) {
    return (
      <div>
        <WinnerScreen
          smScore={smScore}
          totalWorkshopScore={totalWorkshopScore}
          avgQuality={avgQuality}
          teamName={team?.name || 'Team'}
          brand={team?.brand || ''}
          answeredCount={Object.keys(searchMasters?.answers || {}).length}
          correctCount={Object.values(searchMasters?.answers || {}).filter(a => a.correct).length}
        />
      </div>
    )
  }

  // ── INTRO ──
  if (phase === 'intro') {
    return (
      <div className="card-p">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🏆</div>
          <div className="text-[10px] font-bold tracking-widest uppercase text-violet-600 mb-2">Final Activity</div>
          <h2 className="font-display text-2xl text-slate-900 mb-2">Search Masters Challenge</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            20 questions · 6 rounds · covering everything from today's workshop. Answers lock on submission. Your score updates the leaderboard in real time.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.entries(ROUND_LABELS).map(([round, label]) => (
            <div key={round} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Round {round}</div>
              <div className="text-sm font-semibold text-slate-700">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 text-center mb-6">
          <div className="flex-1 bg-violet-50 border border-violet-200 rounded-lg p-3">
            <div className="text-xl font-bold text-violet-700">20</div>
            <div className="text-[10px] text-violet-500 uppercase tracking-wider">Questions</div>
          </div>
          <div className="flex-1 bg-brand-50 border border-brand-200 rounded-lg p-3">
            <div className="text-xl font-bold text-brand-700">{MAX_SCORE}</div>
            <div className="text-[10px] text-brand-500 uppercase tracking-wider">Max Points</div>
          </div>
          <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-xl font-bold text-amber-700">30s</div>
            <div className="text-[10px] text-amber-500 uppercase tracking-wider">Per Question</div>
          </div>
        </div>

        <button className="btn-primary w-full justify-center py-3.5 text-base" onClick={startQuiz}>
          Start Search Masters Challenge →
        </button>
      </div>
    )
  }

  // ── QUESTION ──
  if (phase === 'question' && currentQ) {
    return (
      <div>
        {/* Score strip */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="text-xs text-slate-500">
            Score: <span className="font-bold text-violet-600">{smScore}</span>/{MAX_SCORE}
          </div>
          <div className="flex gap-1">
            {QUESTIONS.map((q, i) => (
              <div key={q.id} className={cn('w-1.5 h-1.5 rounded-full',
                i < answeredCount ? (searchMasters?.answers[q.id]?.correct ? 'bg-emerald-500' : 'bg-red-400') :
                i === currentIdx ? 'bg-brand-500' : 'bg-slate-200'
              )} />
            ))}
          </div>
          <div className="text-xs text-slate-500">{answeredCount}/{QUESTIONS.length}</div>
        </div>
        <RoundHeader
          round={currentQ.round}
          label={currentQ.roundLabel}
          questionNum={currentQ.number}
          total={QUESTIONS.length}
        />
        <QuestionCard
          q={currentQ}
          onAnswer={handleAnswer}
          startTime={questionStartTime}
        />
      </div>
    )
  }

  // ── FEEDBACK ──
  if (phase === 'feedback' && currentQ && searchMasters?.answers[currentQ.id]) {
    const ans = searchMasters.answers[currentQ.id]
    return (
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="text-xs text-slate-500">Score: <span className="font-bold text-violet-600">{smScore}</span>/{MAX_SCORE}</div>
          <div className="text-xs text-slate-500">{answeredCount}/{QUESTIONS.length} answered</div>
        </div>
        <FeedbackCard
          q={currentQ}
          answer={ans.answer}
          correct={ans.correct}
          points={ans.points}
          onNext={handleNext}
          isLast={currentIdx === QUESTIONS.length - 1}
        />
      </div>
    )
  }

  return null
}
