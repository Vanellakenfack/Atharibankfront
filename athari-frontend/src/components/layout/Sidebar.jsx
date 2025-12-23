import React, { useState } from 'react';
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
  ShieldCheck,
  ChevronLeft,
  Menu,
  ChevronDown
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const items = [
    { id: 'overview', icon: BarChart3, label: 'Tableau de bord', path: '/dashboard' },
    { id: 'users', icon: Users, label: 'Utilisateurs', path: '/users' },
    { id: 'Clients', icon: Users, label: 'Clients', path: '/client' },
    { id: 'logs', icon: ShieldCheck, label: 'Logs d\'audit', path: '/log' },
    { id: 'analytics', icon: TrendingUp, label: 'Analyses', path: '/analytics' },
    { id: 'Performance', icon: Zap, label: 'Performance', path: '/performance' },
  ];

  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await logout();
      navigate('/login');
    }
  };

  const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} border-end bg-white`} 
           style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 1000 }}>
      
      {/* HEADER */}
      <div className="sidebar-header d-flex align-items-center justify-content-between p-4">
        {sidebarOpen && (
          <h5 className="m-0 fw-bold" style={{ background: activeGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AthariBank
          </h5>
        )}
        <button className="btn btn-light border-0 rounded-3 p-1 shadow-sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* SESSION UTILISATEUR */}
      {sidebarOpen && user && (
        <div className="mx-3 mb-4 p-3 rounded-4 bg-light border-0">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle shadow-sm d-flex align-items-center justify-content-center text-white fw-bold" 
                 style={{ width: '40px', height: '40px', background: activeGradient, fontSize: '0.9rem' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-dark fw-bold small text-truncate">{user.name}</div>
              <div className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>ADMINISTRATEUR</div>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="sidebar-nav px-3 flex-grow-1">
        {/* Titre de section mis en gras */}
        <small className={`text-muted text-uppercase fw-bold mb-3 d-block ${!sidebarOpen && 'text-center'}`} style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
          Menu Principal
        </small>
        
        {items.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`d-flex align-items-center gap-3 p-2 rounded-3 mb-2 text-decoration-none transition-all ${
                isActive ? 'text-white shadow' : 'text-secondary hover-bg-light'
              }`}
              style={{ 
                background: isActive ? activeGradient : 'transparent',
                transition: '0.2s ease'
              }}
            >
              <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
              {/* Texte du lien mis en gras (fw-bold) */}
              {sidebarOpen && <span className="fw-bold small">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer p-3 border-top mt-auto">
        <div className="mb-1">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              location.pathname.startsWith('/settings') ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: location.pathname.startsWith('/settings') ? activeGradient : 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          >
            <div className="d-flex align-items-center gap-3">
              <Settings size={20} />
              {sidebarOpen && <span className="small fw-bold">Paramètres</span>}
            </div>
            {sidebarOpen && (
              <ChevronDown 
                size={16} 
                className={`transition-all ${showSettingsMenu ? 'rotate-180' : ''}`}
                style={{ transition: 'transform 0.2s ease' }}
              />
            )}
          </div>
          
          {showSettingsMenu && sidebarOpen && (
            <div className="ms-4 mt-1">
              <Link
                to="/compte"
                className={`d-block p-2 text-decoration-none small rounded-3 mb-1 ${
                  location.pathname === '/compte' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/compte' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                Comptes
              
              <Link
                to="/liste-des-comptes"
                className={`d-block p-2 text-decoration-none small rounded-3 ${
                  location.pathname === '/liste-des-comptes' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '//liste-des-comptes' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                liste des comptes
              </Link>
              
              </Link>

              <Link
                to="/Liste-type-de-compte"
                className={`d-block p-2 text-decoration-none small rounded-3 ${
                  location.pathname === '/Liste-type-de-compte' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/Ajout-type-de-compte' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                Liste des Type de comptes
              </Link>
            </div>
          )}
        </div>

        <div 
          role="button"
          onClick={handleLogout}
          className="d-flex align-items-center gap-3 p-2 text-danger rounded-3 cursor-pointer hover-bg-danger-subtle transition-all"
        >
          <LogOut size={20} />
          {/* Texte déconnexion mis en gras */}
          {sidebarOpen && <span className="small fw-bold text-uppercase">Déconnexion</span>}
        </div>
      </div>
    </aside>
  );
}