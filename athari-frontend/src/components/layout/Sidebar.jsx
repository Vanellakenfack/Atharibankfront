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
  House,
  Receipt,
  CreditCard,
  Repeat,
  ArrowDownUp,
  Wallet,
  Coins,
  DollarSign,
  FileCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showDATMenu, setShowDATMenu] = useState(false);
  const [showPlanComptable, setShowPlanComptable] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showFrontOffice, setShowFrontOffice] = useState(false);
  const [showCaisseEspece, setShowCaisseEspece] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showReporting, setShowReporting] = useState(false);
  const [showVersementMenu, setShowVersementMenu] = useState(false);

  const items = [
    { id: 'overview', icon: BarChart3, label: 'Tableau de bord', path: '/dashboard' },
    { id: 'users', icon: Users, label: 'Utilisateurs', path: '/users/management' },
    { id: 'Clients', icon: Users, label: 'Clients', path: '/client' },
    { id: 'logs', icon: ShieldCheck, label: 'Logs d\'audit', path: '/log' },
    { id: 'analytics', icon: TrendingUp, label: 'Analyses', path: '/analytics' },
    { id: 'Performance', icon: Zap, label: 'Performance', path: '/performance' },
  ];

  const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

  // Fonction utilitaire pour vérifier les chemins actifs
  const isActivePath = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Chemins actifs
  const isDATPATH = isActivePath('/dat');
  const isAccountPATH = isActivePath('/compte') || isActivePath('/liste-des-comptes');
  const isTypeComptePATH = isActivePath('/Liste-type-de-compte') || isActivePath('/Ajout-type-de-compte');
  const isReportingPATH = isActivePath('/Journal-Comptable');
  const isFrontOfficePATH = isActivePath('/front-office') || 
                           isActivePath('/versement') || 
                           location.pathname.includes('caisse-espece') ||
                           location.pathname.includes('caisse-devise') ||
                           location.pathname.includes('transfert-fond');
  const isVersementPATH = isActivePath('/versement');

  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await logout();
      navigate('/login');
    }
  };

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
          const isActive = isActivePath(item.path);
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
              {sidebarOpen && <span className="fw-bold small">{item.label}</span>}
            </Link>
          );
        })}

        {/* MENU Plan-comptable */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              isActivePath('/plan-comptable') ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isActivePath('/plan-comptable') ? activeGradient : 'transparent',
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
                  isActivePath('/plan-comptable', true) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/plan-comptable', true) ? activeGradient : 'transparent',
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
                  isActivePath('/plan-comptable/categories') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/plan-comptable/categories') ? activeGradient : 'transparent',
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
                  isActivePath('/dat/contracts') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/dat/contracts') ? activeGradient : 'transparent',
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
                  isActivePath('/dat/types') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/dat/types') ? activeGradient : 'transparent',
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
                  isActivePath('/compte', true) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/compte', true) ? activeGradient : 'transparent',
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
                  isActivePath('/liste-des-comptes') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/liste-des-comptes') ? activeGradient : 'transparent',
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
                  isActivePath('/Journal-Comptable') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/Journal-Comptable') ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <BookOpen size={16} />
                Journal-Comptable
              </Link>
              
              <Link
                to="/reporting-2"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  isActivePath('/reporting-2') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/reporting-2') ? activeGradient : 'transparent',
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

        {/* MENU Transactions administratives */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              isActivePath('/transactions-admin') ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isActivePath('/transactions-admin') ? activeGradient : 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => setShowTransactions(!showTransactions)}
          >
            <div className="d-flex align-items-center gap-3">
              <FileChartLine size={20} />
              {sidebarOpen && <span className="small fw-bold">Transactions administratives</span>}
            </div>
            {sidebarOpen && (
              <ChevronDown 
                size={16} 
                className={`transition-all ${showTransactions ? 'rotate-180' : ''}`}
                style={{ transition: 'transform 0.2s ease' }}
              />
            )}
          </div>
          
          {/* Sous-menu Transactions administratives*/}
          {showTransactions && sidebarOpen && (
            <div className="ms-4 mt-1">
              <Link
                to="/agence/form"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  isActivePath('/agence/form') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/agence/form') ? activeGradient : 'transparent',
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
                  isActivePath('/guichet/form') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/guichet/form') ? activeGradient : 'transparent',
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
                  isActivePath('/caisse/form') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/caisse/form') ? activeGradient : 'transparent',
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

        {/* MENU Transaction Front Office */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              isFrontOfficePATH ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isFrontOfficePATH ? activeGradient : 'transparent',
              cursor: 'pointer'
            }}
            onClick={() => setShowFrontOffice(!showFrontOffice)}
          >
            <div className="d-flex align-items-center gap-3">
              <CreditCard size={20} />
              {sidebarOpen && <span className="small fw-bold">Transaction Front Office</span>}
            </div>
            {sidebarOpen && (
              <ChevronDown 
                size={16} 
                className={`transition-all ${showFrontOffice ? 'rotate-180' : ''}`}
                style={{ transition: 'transform 0.2s ease' }}
              />
            )}
          </div>
          
          {/* Sous-menu Transaction Front Office */}
          {showFrontOffice && sidebarOpen && (
            <div className="ms-4 mt-1">
              {/* Transaction Caisse Espèce */}
              <div className="mb-1">
                <div 
                  className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
                    isActivePath('/front-office/caisse-espece') || isVersementPATH ? 'text-white' : 'text-secondary hover-bg-light'
                  }`}
                  style={{ 
                    background: isActivePath('/front-office/caisse-espece') || isVersementPATH ? activeGradient : 'transparent',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCaisseEspece(!showCaisseEspece);
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Wallet size={16} />
                    <span className="small">Transaction caisse espèce</span>
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`transition-all ${showCaisseEspece ? 'rotate-180' : ''}`}
                    style={{ transition: 'transform 0.2s ease' }}
                  />
                </div>
                
                {/* Sous-sous-menu Transaction Caisse Espèce */}
                {showCaisseEspece && (
                  <div className="ms-3 mt-1">
                    <Link
                      to="/entrees-sorties-caisse"
                      className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                        isActivePath('/entrees-sorties-caisse') 
                          ? 'text-white fw-bold' 
                          : 'text-secondary hover-bg-light'
                      }`}
                      style={{ 
                        background: isActivePath('/entrees-sorties-caisse') ? activeGradient : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowDownUp size={14} />
                      Entrer/sortie caisse
                    </Link>
                    
                    <Link
                      to="/Transfert-Inter-Caisse"
                      className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                        isActivePath('/Transfert-Inter-Caisse') 
                          ? 'text-white fw-bold' 
                          : 'text-secondary hover-bg-light'
                      }`}
                      style={{ 
                        background: isActivePath('/Transfert-Inter-Caisse') ? activeGradient : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Repeat size={14} />
                      Transfert caisse
                    </Link>
                    
                    <Link
                      to="/front-office/caisse-espece/transfert-inter-envoi"
                      className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                        isActivePath('/front-office/caisse-espece/transfert-inter-envoi') 
                          ? 'text-white fw-bold' 
                          : 'text-secondary hover-bg-light'
                      }`}
                      style={{ 
                        background: isActivePath('/front-office/caisse-espece/transfert-inter-envoi') ? activeGradient : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Receipt size={14} />
                      Transfert inter caisse envoi
                    </Link>
                    
                    <Link
                      to="/front-office/caisse-espece/transfert-inter-reception"
                      className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                        isActivePath('/front-office/caisse-espece/transfert-inter-reception') 
                          ? 'text-white fw-bold' 
                          : 'text-secondary hover-bg-light'
                      }`}
                      style={{ 
                        background: isActivePath('/front-office/caisse-espece/transfert-inter-reception') ? activeGradient : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Receipt size={14} />
                      Transfert inter caisse réception
                    </Link>

                    {/* MENU Versement avec sous-menus */}
                    <div className="mb-1">
                      <div 
                        className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
                          isVersementPATH ? 'text-white' : 'text-secondary hover-bg-light'
                        }`}
                        style={{ 
                          background: isVersementPATH ? activeGradient : 'transparent',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowVersementMenu(!showVersementMenu);
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <DollarSign size={14} />
                          <span className="small">Gestion des Versement</span>
                        </div>
                        <ChevronDown 
                          size={12} 
                          className={`transition-all ${showVersementMenu ? 'rotate-180' : ''}`}
                          style={{ transition: 'transform 0.2s ease' }}
                        />
                      </div>
                      
                      {/* Sous-sous-menu Versement */}
                      {showVersementMenu && (
                        <div className="ms-3 mt-1">
                          <Link
                            to="/versement"
                            className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                              isActivePath('/versement', true) 
                                ? 'text-white fw-bold' 
                                : 'text-secondary hover-bg-light'
                            }`}
                            style={{ 
                              background: isActivePath('/versement', true) ? activeGradient : 'transparent',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DollarSign size={12} />
                            Versement espèce
                          </Link>
                          
                          <Link
                            to="/versement/client"
                            className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                              isActivePath('/versement/client') 
                                ? 'text-white fw-bold' 
                                : 'text-secondary hover-bg-light'
                            }`}
                            style={{ 
                              background: isActivePath('/versement/client') ? activeGradient : 'transparent',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileCheck size={12} />
                            Bordereau de Versement Client
                          </Link>
                          
                          <Link
                            to="/versement/ac"
                            className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                              isActivePath('/versement/ac') 
                                ? 'text-white fw-bold' 
                                : 'text-secondary hover-bg-light'
                            }`}
                            style={{ 
                              background: isActivePath('/versement/ac') ? activeGradient : 'transparent',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileSpreadsheet size={12} />
                            Bordereau de Versement AC
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Transaction Caisse Devise */}
              <Link
                to="/front-office/caisse-devise"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  isActivePath('/front-office/caisse-devise') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/front-office/caisse-devise') ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Coins size={16} />
                Transaction caisse devise
              </Link>
              
              {/* Transfert de fond */}
              <Link
                to="/front-office/transfert-fond"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  isActivePath('/front-office/transfert-fond') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/front-office/transfert-fond') ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Repeat size={16} />
                Transfert de fond
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
              isActivePath('/settings') || isTypeComptePATH ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isActivePath('/settings') || isTypeComptePATH ? activeGradient : 'transparent',
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
                  isActivePath('/users/roles') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/users/roles') ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} />
                Roles des utilisateurs
              </Link>

              {/* Agence */}
              <Link
                to="/agence"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  isActivePath('/agence') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/agence') ? activeGradient : 'transparent',
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
                  isActivePath('/Liste-type-de-compte') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/Liste-type-de-compte') ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <List size={16} />
                Liste des Type de comptes
              </Link>
              
              <Link
                to="/frais/applications"
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  isActivePath('/frais/applications') 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath('/frais/applications') ? activeGradient : 'transparent',
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
          {sidebarOpen && <span className="small fw-bold text-uppercase">Déconnexion</span>}
        </div>
      </div>
    </aside>
  );
}