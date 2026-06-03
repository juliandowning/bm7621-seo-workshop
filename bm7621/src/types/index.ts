export type Brand = 'ASOS' | 'Ryanair' | 'Starbucks' | 'Coca-Cola' | 'Samsung'

export interface TeamMember { name: string; order: number }

export interface Team {
  id: string; code: string; name: string; brand: Brand
  members: TeamMember[]; created_at: string; updated_at: string
}

export type ActivityKey =
  | 'a1' | 'a2' | 'a3' | 'sim1'
  | 'a4' | 'a5'
  | 'a6' | 'a7' | 'sim2'
  | 'a9' | 'a8' | 'a10b'
  | 'a11' | 'a12' | 'a12b' | 'a13' | 'sim3'
  | 'a15' | 'sim4' | 'sim5'
  | 'a16' | 'a17' | 'a18'

export interface ActivityScore {
  key: ActivityKey; points: number; completionPts: number; qualityPts: number
  max: number; completed: boolean; locked: boolean; timestamp?: string
}

export type ScoreMap = Partial<Record<ActivityKey, ActivityScore>>

export interface ResponseMap {
  a1_st1?: string; a1_st2?: string; a1_lt1?: string; a1_lt2?: string
  a2_intents?: string[]
  a3_serp?: string[]; a3_obs?: string
  a4_title?: string; a4_meta?: string; a4_kw?: string
  a5_p1?: string; a5_p8?: string; a5_p2?: string
  a6_cwv?: string; a6_explain?: string
  a7_now?: string[]; a7_next?: string[]; a7_monitor?: string[]
  a9_exp?: number; a9_exp2?: number; a9_auth?: number; a9_trust?: number
  a9_exp_note?: string; a9_exp2_note?: string; a9_auth_note?: string; a9_trust_note?: string
  a8_pillar?: string; a8_s1?: string; a8_s2?: string; a8_s3?: string
  a8_q1?: string; a8_q2?: string; a8_q3?: string
  a10b_heading?: string; a10b_intro?: string
  a10b_imp1?: string; a10b_imp2?: string; a10b_imp3?: string; a10b_why?: string
  a11_a?: string; a11_b?: string; a11_c?: string
  a12_negkw?: string[]
  a12b_h1?: string; a12b_h2?: string; a12b_h3?: string
  a12b_d1?: string; a12b_d2?: string; a12b_cta?: string
  a13_brand?: number; a13_generic?: number; a13_comp?: number; a13_retarg?: number
  a13_rationale?: string
  a15_high?: string; a15_low?: string; a15_opp?: string; a15_action?: string
  a16_auth?: string; a16_cite?: string; a16_orig?: string; a16_struct?: string
  a17_ai?: string[]; a17_human?: string[]
  // Board Decision Challenge (replaces CMO freeform)
  a18_seo_pick?: string; a18_ppc_pick?: string; a18_ai_pick?: string; a18_goal_pick?: string
  a18_rationale?: string
  // Lock flags
  locked_a1?: boolean; locked_a2?: boolean; locked_a3?: boolean
  locked_a4?: boolean; locked_a5?: boolean
  locked_a6?: boolean; locked_a7?: boolean
  locked_a9?: boolean; locked_a8?: boolean; locked_a10?: boolean; locked_a10b?: boolean
  locked_a11?: boolean; locked_a12?: boolean; locked_a12b?: boolean; locked_a13?: boolean
  locked_a15?: boolean
  locked_a16?: boolean; locked_a17?: boolean; locked_a18?: boolean
  sm_locked?: boolean
  _members?: { name: string; order: number }[]
}

export interface SimulatorEntry {
  key: string; scores: (number | null)[]; average: number | null; points: number
}
export type SimulatorMap = Partial<Record<string, SimulatorEntry>>

export type BoardVerdict = 'approved' | 'revisions' | 'rejected'
export interface EvalDimension { label: string; score: number }
export interface CMOEvaluation {
  dimensions: EvalDimension[]; strengths: string[]; weaknesses: string[]
  verdict: BoardVerdict; generated_at: string
}

// ─── SEARCH MASTERS ─────────────────────────────────────────
export interface SearchMastersAnswer {
  questionId: string
  answer: string
  correct: boolean
  points: number
  timeMs: number
}

export interface SearchMastersState {
  answers: Record<string, SearchMastersAnswer>
  totalScore: number
  completed: boolean
  completedAt: string | null
}

export interface WorkspaceState {
  team: Team | null; scores: ScoreMap; responses: ResponseMap
  simulators: SimulatorMap; cmoEval: CMOEvaluation | null
  syncStatus: 'idle' | 'saving' | 'saved' | 'error' | 'offline'; lastSaved: string | null
  searchMasters: SearchMastersState | null
}

export interface TeamSummary {
  team: Team; totalScore: number; activitiesCompleted: number
  currentBlock: number; completionPct: number
}
