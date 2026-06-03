import { useState } from 'react'
import { getTeamByCode, getWorkspaceData, updateTeamMembers, isSupabaseConfigured } from '../../lib/supabase'
import { useWorkspaceStore } from '../../store/workspace'
import { WORKSHOP_CODES } from '../../data/workshop'
import { currentBlock } from '../../lib/utils'
import type { Team, ScoreMap, ResponseMap, SimulatorMap } from '../../types'

// Fallback teams for offline/demo mode
const DEMO_TEAMS: Team[] = Object.entries(WORKSHOP_CODES)
  .filter(([code]) => code !== 'FACILITATOR24')
  .map(([code, info], i) => ({
    id: `demo-${i}`,
    code,
    name: info.name,
    brand: info.brand,
    members: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

interface SetupScreenProps {
  onComplete: (resumeBlock?: number) => void
  onFacilitator: () => void
}

export function SetupScreen({ onComplete, onFacilitator }: SetupScreenProps) {
  const { setTeam, updateScore, updateResponse, updateSimulator, setCMOEval } = useWorkspaceStore()
  const [code, setCode] = useState('')
  const [members, setMembers] = useState(['', '', '', '', ''])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [step, setStep] = useState<'code' | 'members'>('code')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCode = async () => {
    const trimmed = code.toUpperCase().trim()
    if (!trimmed) { setError('Please enter your access code.'); return }
    if (trimmed === 'FACILITATOR24') { onFacilitator(); return }

    setLoading(true); setError('')
    try {
      let team: Team | null = null
      let existingWorkspace: Record<string, unknown> | null = null

      if (isSupabaseConfigured()) {
        team = await getTeamByCode(trimmed) as Team | null
        if (team) existingWorkspace = await getWorkspaceData(team.id) as Record<string, unknown> | null
      }

      // Demo fallback only if Supabase not configured or lookup failed
      if (!team) {
        const demo = DEMO_TEAMS.find(t => t.code === trimmed)
        if (demo) team = demo
      }

      if (!team) {
        setError('Access code not recognised. Check with your lecturer.')
        setLoading(false); return
      }

      // Returning team — has saved members on teams table = skip members screen
      if (team.members && team.members.length > 0 && !team.id.startsWith('demo-')) {
        // Restore workspace data if it exists
        if (existingWorkspace) {
          const ws = existingWorkspace as {
            scores?: ScoreMap; responses?: ResponseMap
            simulators?: Record<string, unknown>; cmo_eval?: unknown
          }
          if (ws.scores) Object.entries(ws.scores).forEach(([key, val]) => {
            if (val) updateScore(key as Parameters<typeof updateScore>[0], val.points, val.max, val.completionPts, val.qualityPts)
          })
          if (ws.responses) updateResponse(ws.responses as ResponseMap)
          if (ws.simulators) Object.entries(ws.simulators).forEach(([key, val]) => {
            if (val && typeof val === 'object' && 'scores' in val)
              updateSimulator(key, (val as { scores: (number | null)[] }).scores)
          })
          if (ws.cmo_eval) setCMOEval(ws.cmo_eval as Parameters<typeof setCMOEval>[0])
        }
        setTeam(team)
        const lastBlock = existingWorkspace
          ? currentBlock((existingWorkspace as { scores?: ScoreMap }).scores || {})
          : 1
        setLoading(false)
        onComplete(lastBlock)
        return
      }

      // New team (no members yet) — show members screen
      setSelectedTeam(team)
      if (team.members?.length) {
        const filled = ['', '', '', '', '']
        team.members.forEach(m => { if (m.order >= 1 && m.order <= 5) filled[m.order - 1] = m.name })
        setMembers(filled)
      }
      setStep('members')
    } catch {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!selectedTeam) return
    const teamMembers = members
      .map((m, i) => ({ name: m.trim(), order: i + 1 }))
      .filter(m => m.name)

    const updatedTeam: Team = { ...selectedTeam, members: teamMembers }
    setTeam(updatedTeam)

    // Save members to teams table immediately — not debounced
    if (teamMembers.length > 0 && !selectedTeam.id.startsWith('demo-')) {
      console.log('[handleSave] saving members to Supabase, teamId:', selectedTeam.id, teamMembers)
      const result = await updateTeamMembers(selectedTeam.id, teamMembers)
      console.log('[handleSave] updateTeamMembers result:', result)
    }

    onComplete(1)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">CIM Level 4 · Digital Marketing</div>
          <h1 className="font-display text-white text-3xl leading-tight mb-2">BM7621 SEO Workshop</h1>
          <p className="text-slate-400 text-sm">Search Engine Optimisation · 6-Hour Workshop</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card-lg overflow-hidden">
          {step === 'code' ? (
            <div className="p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Enter Access Code</h2>
              <p className="text-sm text-slate-500 mb-6">Your lecturer will give you a 7-character code.</p>
              <div className="mb-4">
                <input
                  type="text"
                  className="form-input text-center text-2xl font-mono font-bold uppercase tracking-widest py-4"
                  placeholder="Enter code"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleCode()}
                  maxLength={14}
                  autoFocus
                />
              </div>
              {error && <div className="alert-danger mb-4">{error}</div>}
              <button className="btn-primary w-full justify-center py-3" onClick={handleCode} disabled={loading}>
                {loading ? 'Checking code…' : 'Enter Workshop →'}
              </button>
            </div>
          ) : (
            <div className="p-8">
              <div className="flex items-center gap-2 mb-5">
                <span className="badge-teal">{selectedTeam?.brand}</span>
                <span className="font-semibold text-slate-700 text-sm">{selectedTeam?.name}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Who's in your team?</h2>
              <p className="text-sm text-slate-500 mb-5">Add your names so your lecturer can see who's here. All optional.</p>
              <div className="mb-5">
                <div className="space-y-2">
                  {members.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-5 text-right flex-shrink-0">{i + 1}</span>
                      <input
                        className="form-input flex-1"
                        placeholder={`Member ${i + 1}`}
                        value={m}
                        onChange={e => { const next = [...members]; next[i] = e.target.value; setMembers(next) }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {error && <div className="alert-danger mb-4">{error}</div>}
              <div className="flex gap-3">
                <button className="btn-primary flex-1 justify-center py-3" onClick={handleSave}>
                  Enter Workshop →
                </button>
                <button className="btn-secondary" onClick={() => { setStep('code'); setError('') }}>← Back</button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">Kingston Business School · BM7621</p>
      </div>
    </div>
  )
}
