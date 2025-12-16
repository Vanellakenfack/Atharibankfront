import React from 'react'
import { Link, useLocation } from 'react-router-dom' // Import pour la navigation
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../assets/css/dash.css'
import { BarChart3, Users, TrendingUp, Zap, Settings, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from "../../context/AuthContext"; // Import du contexte

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user, logout } = useAuth(); // Récupération des infos du contexte
  const location = useLocation(); // Pour savoir quelle route est active

  const items = [
    { id: 'overview', icon: BarChart3, label: 'Tableau de bord', path: '/' },
    { id: 'users', icon: Users, label: 'Utilisateurs', path: '/users/management' },
    { id: 'logs', icon: ShieldCheck, label: 'Logs d\'audit', path: '/audit-logs' }, // Route vers vos logs
    { id: 'analytics', icon: TrendingUp, label: 'Analyses', path: '/analytics' },
    { id: 'performance', icon: Zap, label: 'Performance', path: '/performance' },
  ]

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header d-flex align-items-center justify-content-between p-3">
        {sidebarOpen && <h5 className="sidebar-title m-0 text-primary">AdminPanel</h5>}
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
      </div>

      {/* Infos Utilisateur (Nouveau) */}
      {sidebarOpen && user && (
        <div className="px-3 py-2 border-bottom mb-2">
          <small className="text-muted d-block">Connecté en tant que :</small>
          <strong className="text-dark">{user.name}</strong>
        </div>
      )}

      <nav className="sidebar-nav px-2">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`sidebar-item d-flex align-items-center gap-3 p-2 rounded mb-1 text-decoration-none ${
              location.pathname === item.path ? 'active bg-primary text-white' : 'text-dark'
            }`}
          >
            <item.icon size={18} />
            {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer mt-auto p-3 border-top">
        {/* Paramètres */}
        <div className="d-flex align-items-center gap-3 p-2 text-muted mb-2 cursor-pointer">
          <Settings size={18} />
          {sidebarOpen && <span>Paramètres</span>}
        </div>

        {/* Déconnexion (Nouveau) */}
        <div 
          role="button"
          onClick={logout}
          className="d-flex align-items-center gap-3 p-2 text-danger rounded cursor-pointer sidebar-logout"
          style={{ cursor: 'pointer' }}
        >
          <LogOut size={18} />
          {sidebarOpen && <span>Déconnexion</span>}
        </div>
      </div>
    </aside>
  )
}