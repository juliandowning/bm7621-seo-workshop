import { useState } from 'react'
import { getTeamByCode, isSupabaseConfigured } from '../../lib/supabase'
import { useWorkspaceStore } from '../../store/workspace'
import { WORKSHOP_CODES } from '../../data/workshop'
import type { Team } from '../../types'

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
  onComplete: () => void
  onFacilitator: () => void
}

export function SetupScreen({ onComplete, onFacilitator }: SetupScreenProps) {
  const { setTeam } = useWorkspaceStore()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [members, setMembers] = useState(['', '', '', '', ''])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [step, setStep] = useState<'code' | 'details'>('code')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCode = async () => {
    const trimmed = code.toUpperCase().trim()
    if (!trimmed) { setError('Please enter your access code.'); return }

    if (trimmed === 'FACILITATOR24') { onFacilitator(); return }

    setLoading(true); setError('')
    try {
      let team: Team | null = null

      if (isSupabaseConfigured()) {
        team = await getTeamByCode(trimmed) as Team | null
      }

      if (!team) {
        // Fallback: match demo teams
        const demo = DEMO_TEAMS.find(t => t.code === trimmed)
        if (demo) team = demo
      }

      if (!team) {
        setError('Access code not recognised. Check with your lecturer.')
        setLoading(false); return
      }

      setSelectedTeam(team)
      setName(team.name)
      setStep('details')
    } catch {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  const handleSave = () => {
    if (!selectedTeam) return
    if (!name.trim()) { setError('Please enter your team name.'); return }
    const updatedTeam: Team = {
      ...selectedTeam,
      name: name.trim(),
      members: members
        .map((m, i) => ({ name: m.trim(), order: i + 1 }))
        .filter(m => m.name),
    }
    setTeam(updatedTeam)
    onComplete()
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-5 py-12">
      {/* Welcome card */}
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
                  placeholder="ALPHA24"
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
                <span className="text-xs text-slate-400">{selectedTeam?.code}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Team Details</h2>
              <p className="text-sm text-slate-500 mb-5">Confirm your team name and add members.</p>

              <div className="mb-4">
                <label className="form-label">Team Name</label>
                <input className="form-input" placeholder="Enter your team PIN" value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div className="mb-5">
                <label className="form-label">Team Members</label>
                <div className="space-y-2">
                  {members.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-5 text-right flex-shrink-0">{i + 1}</span>
                      <input
                        className="form-input flex-1"
                        placeholder={i === 4 ? 'Member 5 (optional)' : `Member ${i + 1}`}
                        value={m}
                        onChange={e => { const next = [...members]; next[i] = e.target.value; setMembers(next) }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="alert-danger mb-4">{error}</div>}
              <div className="flex gap-3">
                <button className="btn-primary flex-1 justify-center py-3" onClick={handleSave}>Enter Workshop →</button>
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
