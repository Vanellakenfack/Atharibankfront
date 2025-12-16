import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/css/dash.css';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Zap, 
  Settings, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Définition des liens de navigation
  const items = [
    { id: 'overview', icon: BarChart3, label: 'Tableau de bord', path: '/' },
    { id: 'users', icon: Users, label: 'Utilisateurs', path: '/users/management' },
    { id: 'logs', icon: ShieldCheck, label: 'Logs d\'audit', path: '/audit-logs' },
    { id: 'analytics', icon: TrendingUp, label: 'Analyses', path: '/analytics' },
    { id: 'performance', icon: Zap, label: 'Performance', path: '/performance' },
  ];

  // Fonction pour gérer la déconnexion avec redirection
  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await logout(); // Vide le contexte et le localStorage
      navigate('/login'); // Redirige vers la page de connexion
    }
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      {/* HEADER DE LA SIDEBAR */}
      <div className="sidebar-header d-flex align-items-center justify-content-between p-3">
        {sidebarOpen && <h5 className="sidebar-title m-0 text-primary fw-bold">Athari Admin</h5>}
        <button
          className="btn btn-sm btn-light border"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Réduire" : "Agrandir"}
        >
          ☰
        </button>
      </div>

      {/* INFOS UTILISATEUR CONNECTÉ */}
      {sidebarOpen && user && (
        <div className="px-3 py-3 border-bottom mb-2 bg-light">
          <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.7rem' }}>
            Session active
          </small>
          <div className="d-flex align-items-center gap-2 mt-1">
            <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}>
              {user.name?.charAt(0)}
            </div>
            <strong className="text-dark" style={{ fontSize: '0.9rem' }}>{user.name}</strong>
          </div>
        </div>
      )}

      {/* NAVIGATION PRINCIPALE */}
      <nav className="sidebar-nav px-2 flex-grow-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-item d-flex align-items-center gap-3 p-2 rounded mb-1 text-decoration-none transition-all ${
                isActive ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* PIED DE PAGE ET DÉCONNEXION */}
      <div className="sidebar-footer mt-auto p-3 border-top bg-white">
        {/* Paramètres */}
        <Link 
          to="/settings" 
          className="d-flex align-items-center gap-3 p-2 text-muted text-decoration-none mb-2 rounded hover-bg-light"
        >
          <Settings size={20} />
          {sidebarOpen && <span>Paramètres</span>}
        </Link>

        {/* Bouton de Déconnexion */}
        <div 
          role="button"
          onClick={handleLogout}
          className="d-flex align-items-center gap-3 p-2 text-danger rounded cursor-pointer sidebar-logout-btn transition-all"
        >
          <LogOut size={20} />
          {sidebarOpen && <span className="fw-bold">Déconnexion</span>}
        </div>
      </div>
    </aside>
  );
}