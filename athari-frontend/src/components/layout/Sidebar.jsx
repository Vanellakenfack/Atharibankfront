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
  ChevronDown,
  FileChartLine,
  FileText,
  FileType,
  BookOpen,
  List,
  House
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showDATMenu, setShowDATMenu] = useState(false);
  const [showPlanComptable, setShowPlanComptable] = useState(false);
  const [showTransactions , setShowTransactions ] = useState(false);

  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const [showReporting, setShowReporting] = useState(false);

  const items = [
    { id: 'overview', icon: BarChart3, label: 'Tableau de bord', path: '/dashboard' },
    { id: 'users', icon: Users, label: 'Utilisateurs', path: '/users/management' },
    { id: 'Clients', icon: Users, label: 'Clients', path: '/client' },
    { id: 'logs', icon: ShieldCheck, label: 'Logs d\'audit', path: '/log' },
    { id: 'analytics', icon: TrendingUp, label: 'Analyses', path: '/analytics' },
    { id: 'Performance', icon: Zap, label: 'Performance', path: '/performance' },
  ];

  const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await logout();
      navigate('/login');
    }
  };

  const isDATPATH = location.pathname.startsWith('/dat');
  const isAccountPATH = location.pathname === '/compte' || location.pathname === '/liste-des-comptes';
  const isTypeComptePATH = location.pathname === '/Liste-type-de-compte' || location.pathname === '/Ajout-type-de-compte';
  const isReportingPATH = location.pathname === '/' || location.pathname === '/';

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

        {/* MENU Plan-comptable */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              location.pathname.startsWith('/plan-comptable') ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: location.pathname.startsWith('/plan-comptable') ? activeGradient : 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => setShowPlanComptable(!showPlanComptable)}
          >
            <div className="d-flex align-items-center gap-3">
              <FileChartLine size={20} />
              {sidebarOpen && <span className="small fw-bold">Plan comptable</span>}
            </div>
            {sidebarOpen && (
              <ChevronDown 
                size={16} 
                className={`transition-all ${showPlanComptable ? 'rotate-180' : ''}`}
                style={{ transition: 'transform 0.2s ease' }}
              />
            )}
          </div>
          
          {/* Sous-menu plan-comptable */}
          {showPlanComptable && sidebarOpen && (
            <div className="ms-4 mt-1">
              <Link
                to="/plan-comptable"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  location.pathname === '/plan-comptable' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/plan-comptable' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} />
                Plan comptable
              </Link>
                      
              <Link
                to="/plan-comptable/categories"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  location.pathname === '/plan-comptable/categories' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/plan-comptable/categories' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileType size={16} />
                Categories Plan comptable
              </Link>
            </div>
          )}
        </div>
        
        {/* MENU DAT - SAISIE DAT ET TYPE DAT */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              isDATPATH ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isDATPATH ? activeGradient : 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => setShowDATMenu(!showDATMenu)}
          >
            <div className="d-flex align-items-center gap-3">
              <FileChartLine size={20} />
              {sidebarOpen && <span className="small fw-bold">DAT</span>}
            </div>
            {sidebarOpen && (
              <ChevronDown 
                size={16} 
                className={`transition-all ${showDATMenu ? 'rotate-180' : ''}`}
                style={{ transition: 'transform 0.2s ease' }}
              />
            )}
          </div>
          
          {/* Sous-menu DAT */}
          {showDATMenu && sidebarOpen && (
            <div className="ms-4 mt-1">
              <Link
                to="/dat/contracts"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  location.pathname === '/dat/contracts' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/dat/contracts' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} />
                Saisie DAT
              </Link>
              
              <Link
                to="/dat/types"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  location.pathname === '/dat/types' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/dat/types' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileType size={16} />
                Types DAT
              </Link>
            </div>
          )}
        </div>

        {/* MENU COMPTE - OUVERTURE ET LISTE DES COMPTES */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              isAccountPATH ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isAccountPATH ? activeGradient : 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => setShowAccountMenu(!showAccountMenu)}
          >
            <div className="d-flex align-items-center gap-3">
              <BookOpen size={20} />
              {sidebarOpen && <span className="small fw-bold">Compte</span>}
            </div>
            {sidebarOpen && (
              <ChevronDown 
                size={16} 
                className={`transition-all ${showAccountMenu ? 'rotate-180' : ''}`}
                style={{ transition: 'transform 0.2s ease' }}
              />
            )}
          </div>
          
          {/* Sous-menu Compte */}
          {showAccountMenu && sidebarOpen && (
            <div className="ms-4 mt-1">
              <Link
                to="/compte"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
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
                <BookOpen size={16} />
                Ouvrir un compte
              </Link>
              
              <Link
                to="/liste-des-comptes"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  location.pathname === '/liste-des-comptes' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/liste-des-comptes' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <List size={16} />
                Liste des comptes
              </Link>
            </div>
          )}
        </div>
        
        {/* MENU reporting */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              isReportingPATH ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isReportingPATH ? activeGradient : 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => setShowReporting(!showReporting)}
          >
            <div className="d-flex align-items-center gap-3">
              <BookOpen size={20} />
              {sidebarOpen && <span className="small fw-bold">Reporting</span>}
            </div>
            {sidebarOpen && (
              <ChevronDown 
                size={16} 
                className={`transition-all ${showReporting ? 'rotate-180' : ''}`}
                style={{ transition: 'transform 0.2s ease' }}
              />
            )}
          </div>
          
          {/* Sous-menu Compte */}
          {showReporting && sidebarOpen && (
            <div className="ms-4 mt-1">
              <Link
                to="/Journal-Comptable"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  location.pathname === '/Journal-Comptable' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/Journal-Comptable' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <BookOpen size={16} />
                Journal-Comptable
              </Link>
              
              <Link
                to="/"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  location.pathname === '/' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <List size={16} />
                Reporting 2
              </Link>
            </div>
          )}
        </div>

        {/* MENU Transactions administratives  - SAISIE DAT ET TYPE DAT */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              isDATPATH ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isDATPATH ? activeGradient : 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => setShowTransactions (!showTransactions )}
          >
            <div className="d-flex align-items-center gap-3">
              <FileChartLine size={20} />
              {sidebarOpen && <span className="small fw-bold">Transactions administratives </span>}
            </div>
            {sidebarOpen && (
              <ChevronDown 
                size={16} 
                className={`transition-all ${showTransactions  ? 'rotate-180' : ''}`}
                style={{ transition: 'transform 0.2s ease' }}
              />
            )}
          </div>
          
          {/* Sous-menu Transactions administratives*/}
          {showTransactions  && sidebarOpen && (
            <div className="ms-4 mt-1">
              <Link
                to="/agence/form"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  location.pathname === '/agence/form' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/agence/form' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} />
                Ouverture/fermeture Agence
              </Link>
              
              <Link
                to="/guichet/form"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  location.pathname === '/guichet/form' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/guichet/form' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileType size={16} />
                Ouverture/Fermeture du guichet
              </Link>

              <Link
                to="/caisse/form"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  location.pathname === '/caisse/form' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/caisse/form' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileType size={16} />
                Ouverture/Fermeture de la caisse
              </Link>

            </div>
          )}
        </div>

      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer p-3 border-top mt-auto">
        <div className="mb-1">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              location.pathname.startsWith('/settings') || isTypeComptePATH ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: location.pathname.startsWith('/settings') || isTypeComptePATH ? activeGradient : 'transparent',
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
          {/* Sous-menu Paramètres */}
          {showSettingsMenu && sidebarOpen && (
            <div className="ms-4 mt-1">
              <Link
                to="/users/roles"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  location.pathname === '/users/roles' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/users/roles' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} />
                Roles des utilisaters
              </Link>

          {/* Agence */}

              <Link
                to="/agence"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  location.pathname === '/agence' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/agence' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <House size={16} />
                Agences
              </Link>


                {/* Liste des Type de comptes */}
              <Link
                to="/Liste-type-de-compte"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  location.pathname === '/Liste-type-de-compte' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/Liste-type-de-compte' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <List size={16} />
                Liste des Type de comptes
              </Link>

              {/*<Link
                to="/frais/commissions"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  location.pathname.startsWith('/frais/commissions') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname.startsWith('/frais/commissions') ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} />
                Frais et commissions
              </Link>
              <Link
                to="/users/management"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  location.pathname.startsWith('/users/management') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname.startsWith('/users/management') ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} />
                  Gestion des utilisateurs
              </Link>
*/}
              
              <Link
                to="/frais/applications"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  location.pathname === '/frais/applications' 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: location.pathname === '/frais/applications' ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} />
                Frais et applications
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