import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../assets/css/dash.css'
import { BarChart3, Users, TrendingUp, Zap, Settings } from 'lucide-react'


interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeNav: string
  setActiveNav: (nav: string) => void
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, activeNav, setActiveNav }: SidebarProps) {
  const items = [
    { id: 'overview', icon: BarChart3, label: 'Tableau de bord',path: '/dashoard' },
    { id: 'users', icon: Users, label: ' Utilisateur',path: '/users/management'},
    { id: 'analytics', icon: TrendingUp, label: 'Analyses' },
    { id: 'performance', icon: Zap, label: 'Performance' },
        { id: 'performance', icon: Zap, label: 'Performance',path:'logs' },

  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {sidebarOpen && <h5 className="sidebar-title m-0">Dashboard</h5>}
        <button
          className="sidebar-toggle btn btn-sm btn-outline-secondary"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-expanded={sidebarOpen}
        >
          ☰
        </button>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => setActiveNav(item.id)}
            className={`sidebar-item d-flex align-items-center gap-3 p-2 rounded ${activeNav === item.id ? 'active' : ''}`}
          >
            <item.icon size={18} />
            {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2">
          <Settings size={16} />
          {sidebarOpen && <small>parametres</small>}
        </div>
      </div>
    </aside>
  )
}
