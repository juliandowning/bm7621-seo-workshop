import { useState } from 'react'
import { useWorkspaceStore } from './store/workspace'
import { SetupScreen } from './components/layout/SetupScreen'
import { Sidebar } from './components/layout/Sidebar'
import { HeaderBar } from './components/layout/HeaderBar'
import { MissionPanel } from './components/activities/MissionPanel'
import { Block1Panel } from './components/activities/Block1'
import { Block2Panel } from './components/activities/Block2'
import { Block3Panel } from './components/activities/Block3'
import { Block4Panel } from './components/activities/Block4'
import { Block5Panel } from './components/activities/Block5'
import { Block6Panel } from './components/activities/Block6'
import { Block7Panel } from './components/activities/Block7'
import { SearchMastersPanel } from './components/activities/SearchMasters'
import { LeaderboardPanel } from './components/leaderboard/LeaderboardPanel'
import { ExportsPanel } from './components/exports/ExportsPanel'
import { FacilitatorDashboard } from './components/facilitator/FacilitatorDashboard'

type Panel = 'mission' | 'block1' | 'block2' | 'block3' | 'block4' | 'block5' | 'block6' | 'block7' | 'leaderboard' | 'exports'

const PANEL_META: Record<Panel, { title: string; subtitle: string }> = {
  mission: { title: 'Workshop Brief', subtitle: 'Mission Control' },
  block1: { title: 'SEO Foundations', subtitle: 'Block 1 · Keyword Research & SERP Analysis' },
  block2: { title: 'Understanding Search', subtitle: 'Block 2 · On-Page SEO & CTR Analysis' },
  block3: { title: 'Technical SEO', subtitle: 'Block 3 · Technical Audit & Prioritisation' },
  block4: { title: 'Content Optimisation', subtitle: 'Block 4 · Topic Clusters, E-E-A-T & Local SEO' },
  block5: { title: 'Google Ads', subtitle: 'Block 5 · Ad Policy, Negatives & Budget Strategy' },
  block6: { title: 'Measurement', subtitle: 'Block 6 · Campaign Diagnosis & Search Console' },
  block7: { title: 'AI & Future Search', subtitle: 'Block 7 · AI Visibility, AI vs Human & Search Masters Challenge' },
  leaderboard: { title: 'Workshop Leaderboard', subtitle: 'Live Rankings' },
  exports: { title: 'Export Centre', subtitle: 'Download Your Work' },
}

function WorkshopApp() {
  const [panel, setPanel] = useState<Panel>('mission')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigate = (p: string) => {
    setPanel(p as Panel)
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }

  const { title, subtitle } = PANEL_META[panel]

  const renderPanel = () => {
    switch (panel) {
      case 'mission': return <MissionPanel onNavigate={navigate} />
      case 'block1': return <Block1Panel />
      case 'block2': return <Block2Panel />
      case 'block3': return <Block3Panel />
      case 'block4': return <Block4Panel />
      case 'block5': return <Block5Panel />
      case 'block6': return <Block6Panel />
      case 'block7': return <Block7Panel />
      case 'leaderboard': return <LeaderboardPanel />
      case 'exports': return <ExportsPanel />
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar currentPanel={panel} onNavigate={navigate} onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-1 md:ml-64">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(s => !s)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 text-lg"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <div className="text-sm font-bold text-slate-900 truncate">{title}</div>
        </div>
        <div className="p-6 md:p-8 max-w-4xl">
          <HeaderBar title={title} subtitle={subtitle} onNavigate={navigate} />
          {renderPanel()}
          {panel.startsWith('block') && (() => {
            const num = parseInt(panel.replace('block', ''))
            const prev = num > 1 ? `block${num - 1}` : 'mission'
            const next = num < 7 ? `block${num + 1}` : 'leaderboard'
            const prevLabel = num > 1 ? `Block ${num - 1}` : 'Mission Brief'
            const nextLabel = num < 7 ? `Block ${num + 1}` : 'Leaderboard'
            return (
              <div className="flex justify-between mt-8 pt-4 border-t border-slate-200">
                <button className="btn-secondary" onClick={() => navigate(prev)}>← {prevLabel}</button>
                <button className="btn-primary" onClick={() => navigate(next)}>{nextLabel} →</button>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { team } = useWorkspaceStore()
  const [isFacilitator, setIsFacilitator] = useState(false)
  if (isFacilitator) return <FacilitatorDashboard />
  if (!team) return <SetupScreen onComplete={() => {}} onFacilitator={() => setIsFacilitator(true)} />
  return <WorkshopApp />
}
