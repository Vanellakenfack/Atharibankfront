import React, { useState, useEffect } from 'react';
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

  // Définition des chemins pour chaque menu (chemins d'origine)
  const menuPaths = {
    overview: '/dashboard',
    users: '/users/management',
    clients: '/client',
    logs: '/log',
    analytics: '/analytics',
    performance: '/performance',
    planComptable: '/plan-comptable',
    planComptableCategories: '/plan-comptable/categories',
    datContracts: '/dat/contracts',
    datTypes: '/dat/types',
    compte: '/compte',
    listeComptes: '/liste-des-comptes',
    journalComptable: '/Journal-Comptable',
    reporting2: '/reporting-2',
    agenceForm: '/agence/form',
    guichetForm: '/guichet/form',
    caisseForm: '/caisse/form',
    dashboardCaissieres: '/Dashboard-Caissieres',
    entreesSortiesCaisse: '/entrees-sorties-caisse',
    retraitEspeces: '/Retrait-Especes',
    transfertInterCaisse: '/Transfert-Inter-Caisse',
    transfertInterEnvoi: '/front-office/caisse-espece/transfert-inter-envoi',
    transfertInterReception: '/front-office/caisse-espece/transfert-inter-reception',
    versement: '/versement',
    versementClient: '/versement/client',
    versementAC: '/versement/ac',
    caisseDevise: '/front-office/caisse-devise',
    transfertFond: '/front-office/transfert-fond',
    usersRoles: '/users/roles',
    agence: '/agence',
    listeTypeCompte: '/Liste-type-de-compte',
    fraisApplications: '/frais/applications'
  };

  // Groupes de chemins pour les menus déroulants
  const pathGroups = {
    DAT: [menuPaths.datContracts, menuPaths.datTypes],
    PlanComptable: [menuPaths.planComptable, menuPaths.planComptableCategories],
    Account: [menuPaths.compte, menuPaths.listeComptes],
    Reporting: [menuPaths.journalComptable, menuPaths.reporting2],
    TransactionsAdmin: [menuPaths.agenceForm, menuPaths.guichetForm, menuPaths.caisseForm],
    FrontOffice: [
      menuPaths.dashboardCaissieres,
      menuPaths.entreesSortiesCaisse,
      menuPaths.retraitEspeces,
      menuPaths.transfertInterCaisse,
      menuPaths.transfertInterEnvoi,
      menuPaths.transfertInterReception,
      menuPaths.versement,
      menuPaths.versementClient,
      menuPaths.versementAC,
      menuPaths.caisseDevise,
      menuPaths.transfertFond
    ],
    CaisseEspece: [
      menuPaths.entreesSortiesCaisse,
      menuPaths.retraitEspeces,
      menuPaths.transfertInterCaisse,
      menuPaths.transfertInterEnvoi,
      menuPaths.transfertInterReception,
      menuPaths.versement
    ],
    Versement: [menuPaths.versement, menuPaths.versementClient, menuPaths.versementAC],
    Settings: [menuPaths.usersRoles, menuPaths.agence, menuPaths.listeTypeCompte, menuPaths.fraisApplications]
  };

  // Fonction améliorée pour vérifier si un chemin est actif
  const isActivePath = (path, exact = false) => {
    const currentPath = location.pathname;
    
    if (exact) {
      return currentPath === path || currentPath === path + '/';
    }
    
    // Cas spécial pour éviter le conflit entre /agence et /agence/form
    if (path === '/agence/form') {
      return currentPath === '/agence/form' || 
             currentPath.startsWith('/agence/form/') ||
             currentPath === '/agence/form';
    }
    
    if (path === '/agence') {
      // Pour /agence, on vérifie que ce n'est pas /agence/form
      const isAgenceForm = currentPath === '/agence/form' || 
                          currentPath.startsWith('/agence/form/');
      return (currentPath === '/agence' || 
              currentPath === '/agence/' ||
              (currentPath.startsWith('/agence/') && 
               !isAgenceForm && 
               !currentPath.startsWith('/agence/form')));
    }
    
    return currentPath.startsWith(path);
  };

  // Fonction pour vérifier si un groupe de chemins contient un chemin actif
  const isGroupActive = (groupKey) => {
    const paths = pathGroups[groupKey];
    if (!paths) return false;
    
    return paths.some(path => {
      // Gestion spéciale pour éviter les conflits
      if (path === menuPaths.agenceForm && isActivePath(menuPaths.agenceForm)) {
        return true;
      }
      if (path === menuPaths.agence) {
        // Vérifier que c'est bien /agence et non /agence/form
        return isActivePath(menuPaths.agence) && !isActivePath(menuPaths.agenceForm);
      }
      return isActivePath(path, false);
    });
  };

  // Fonction pour ouvrir automatiquement les menus contenant des liens actifs
  const autoOpenMenus = () => {
    const currentPath = location.pathname;
    
    // Vérifier et ouvrir les menus spécifiques d'abord
    if (currentPath === '/agence/form' || currentPath.startsWith('/agence/form/')) {
      setShowTransactions(true);
      setShowSettingsMenu(false);
    } else if (currentPath === '/agence' || currentPath === '/agence/' || 
               (currentPath.startsWith('/agence/') && !currentPath.startsWith('/agence/form'))) {
      setShowSettingsMenu(true);
      setShowTransactions(false);
    }
    
    // Ouvrir les autres menus basés sur les groupes
    if (isGroupActive('DAT')) setShowDATMenu(true);
    if (isGroupActive('PlanComptable')) setShowPlanComptable(true);
    if (isGroupActive('Account')) setShowAccountMenu(true);
    if (isGroupActive('Reporting')) setShowReporting(true);
    if (isGroupActive('TransactionsAdmin') && !isActivePath(menuPaths.agence)) setShowTransactions(true);
    if (isGroupActive('FrontOffice')) setShowFrontOffice(true);
    if (isGroupActive('CaisseEspece')) setShowCaisseEspece(true);
    if (isGroupActive('Versement')) setShowVersementMenu(true);
    if (isGroupActive('Settings') && !isActivePath(menuPaths.agenceForm)) setShowSettingsMenu(true);
  };

  // Effet pour gérer l'ouverture automatique des menus
  useEffect(() => {
    autoOpenMenus();
  }, [location.pathname]);

  const items = [
    { id: 'overview', icon: BarChart3, label: 'Tableau de bord', path: menuPaths.overview },
    { id: 'users', icon: Users, label: 'Utilisateurs', path: menuPaths.users },
    { id: 'clients', icon: Users, label: 'Clients', path: menuPaths.clients },
    { id: 'logs', icon: ShieldCheck, label: 'Logs d\'audit', path: menuPaths.logs },
    { id: 'analytics', icon: TrendingUp, label: 'Analyses', path: menuPaths.analytics },
    { id: 'performance', icon: Zap, label: 'Performance', path: menuPaths.performance },
  ];

  const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

  // Styles pour la sidebar fermée
  const closedSidebarStyle = {
    width: '80px',
    minWidth: '80px',
    maxWidth: '80px'
  };

  const openSidebarStyle = {
    width: '280px',
    minWidth: '280px',
    maxWidth: '280px'
  };

  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <aside 
      className={`sidebar ${sidebarOpen ? 'open' : 'closed'} border-end bg-white`} 
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1000,
        ...(sidebarOpen ? openSidebarStyle : closedSidebarStyle)
      }}
    >
      
      {/* HEADER */}
      <div className="sidebar-header d-flex align-items-center justify-content-between p-4">
        {sidebarOpen && (
          <h5 className="m-0 fw-bold" style={{ 
            background: activeGradient, 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            AthariBank
          </h5>
        )}
        <button 
          className="btn btn-light border-0 rounded-3 p-1 shadow-sm" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ minWidth: '36px' }}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* SESSION UTILISATEUR */}
      {sidebarOpen && user && (
        <div className="mx-3 mb-4 p-3 rounded-4 bg-light border-0">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-circle shadow-sm d-flex align-items-center justify-content-center text-white fw-bold" 
              style={{ 
                width: '40px', 
                height: '40px', 
                background: activeGradient, 
                fontSize: '0.9rem' 
              }}
            >
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
        {/* Titre de section */}
        <small 
          className={`text-muted text-uppercase fw-bold mb-3 d-block ${!sidebarOpen ? 'text-center' : ''}`} 
          style={{ fontSize: '0.7rem', letterSpacing: '1px' }}
        >
          {sidebarOpen ? 'Menu Principal' : '•••'}
        </small>
        
        {items.map((item) => {
          const isActive = isActivePath(item.path, true);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`d-flex align-items-center gap-3 p-2 rounded-3 mb-2 text-decoration-none transition-all ${
                isActive ? 'text-white shadow' : 'text-secondary hover-bg-light'
              }`}
              style={{ 
                background: isActive ? activeGradient : 'transparent',
                transition: '0.2s ease',
                justifyContent: sidebarOpen ? 'flex-start' : 'center'
              }}
              title={!sidebarOpen ? item.label : ''}
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
              isGroupActive('PlanComptable') ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isGroupActive('PlanComptable') ? activeGradient : 'transparent',
              cursor: 'pointer',
              justifyContent: sidebarOpen ? 'space-between' : 'center'
            }}
            onClick={() => {
              if (sidebarOpen) setShowPlanComptable(!showPlanComptable);
            }}
            title={!sidebarOpen ? 'Plan comptable' : ''}
          >
            <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
              <FileChartLine size={20} strokeWidth={isGroupActive('PlanComptable') ? 3 : 2} />
              {sidebarOpen && <span className="small fw-bold">Plan comptable</span>}
            </div>
            {sidebarOpen && showPlanComptable && (
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
                to={menuPaths.planComptable}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  isActivePath(menuPaths.planComptable, true) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.planComptable, true) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} strokeWidth={isActivePath(menuPaths.planComptable, true) ? 3 : 2} />
                Plan comptable
              </Link>
                      
              <Link
                to={menuPaths.planComptableCategories}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  isActivePath(menuPaths.planComptableCategories) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.planComptableCategories) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileType size={16} strokeWidth={isActivePath(menuPaths.planComptableCategories) ? 3 : 2} />
                Categories Plan comptable
              </Link>
            </div>
          )}
        </div>
        
        {/* MENU DAT */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              isGroupActive('DAT') ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isGroupActive('DAT') ? activeGradient : 'transparent',
              cursor: 'pointer',
              justifyContent: sidebarOpen ? 'space-between' : 'center'
            }}
            onClick={() => {
              if (sidebarOpen) setShowDATMenu(!showDATMenu);
            }}
            title={!sidebarOpen ? 'DAT' : ''}
          >
            <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
              <FileChartLine size={20} strokeWidth={isGroupActive('DAT') ? 3 : 2} />
              {sidebarOpen && <span className="small fw-bold">DAT</span>}
            </div>
            {sidebarOpen && showDATMenu && (
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
                to={menuPaths.datContracts}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  isActivePath(menuPaths.datContracts) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.datContracts) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} strokeWidth={isActivePath(menuPaths.datContracts) ? 3 : 2} />
                Saisie DAT
              </Link>
              
              <Link
                to={menuPaths.datTypes}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  isActivePath(menuPaths.datTypes) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.datTypes) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileType size={16} strokeWidth={isActivePath(menuPaths.datTypes) ? 3 : 2} />
                Types DAT
              </Link>
            </div>
          )}
        </div>

        {/* MENU COMPTE */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              isGroupActive('Account') ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isGroupActive('Account') ? activeGradient : 'transparent',
              cursor: 'pointer',
              justifyContent: sidebarOpen ? 'space-between' : 'center'
            }}
            onClick={() => {
              if (sidebarOpen) setShowAccountMenu(!showAccountMenu);
            }}
            title={!sidebarOpen ? 'Compte' : ''}
          >
            <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
              <BookOpen size={20} strokeWidth={isGroupActive('Account') ? 3 : 2} />
              {sidebarOpen && <span className="small fw-bold">Compte</span>}
            </div>
            {sidebarOpen && showAccountMenu && (
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
                to={menuPaths.compte}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  isActivePath(menuPaths.compte, true) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.compte, true) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <BookOpen size={16} strokeWidth={isActivePath(menuPaths.compte, true) ? 3 : 2} />
                Ouvrir un compte
              </Link>
              
              <Link
                to={menuPaths.listeComptes}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  isActivePath(menuPaths.listeComptes) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.listeComptes) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <List size={16} strokeWidth={isActivePath(menuPaths.listeComptes) ? 3 : 2} />
                Liste des comptes
              </Link>
            </div>
          )}
        </div>
        
        {/* MENU reporting */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              isGroupActive('Reporting') ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isGroupActive('Reporting') ? activeGradient : 'transparent',
              cursor: 'pointer',
              justifyContent: sidebarOpen ? 'space-between' : 'center'
            }}
            onClick={() => {
              if (sidebarOpen) setShowReporting(!showReporting);
            }}
            title={!sidebarOpen ? 'Reporting' : ''}
          >
            <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
              <BookOpen size={20} strokeWidth={isGroupActive('Reporting') ? 3 : 2} />
              {sidebarOpen && <span className="small fw-bold">Reporting</span>}
            </div>
            {sidebarOpen && showReporting && (
              <ChevronDown 
                size={16} 
                className={`transition-all ${showReporting ? 'rotate-180' : ''}`}
                style={{ transition: 'transform 0.2s ease' }}
              />
            )}
          </div>
          
          {/* Sous-menu Reporting */}
          {showReporting && sidebarOpen && (
            <div className="ms-4 mt-1">
              <Link
                to={menuPaths.journalComptable}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  isActivePath(menuPaths.journalComptable) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.journalComptable) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <BookOpen size={16} strokeWidth={isActivePath(menuPaths.journalComptable) ? 3 : 2} />
                Journal-Comptable
              </Link>
              
              <Link
                to={menuPaths.reporting2}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  isActivePath(menuPaths.reporting2) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.reporting2) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <List size={16} strokeWidth={isActivePath(menuPaths.reporting2) ? 3 : 2} />
                Reporting 2
              </Link>
            </div>
          )}
        </div>

        {/* MENU Transactions administratives */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              isGroupActive('TransactionsAdmin') ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isGroupActive('TransactionsAdmin') ? activeGradient : 'transparent',
              cursor: 'pointer',
              justifyContent: sidebarOpen ? 'space-between' : 'center'
            }}
            onClick={() => {
              if (sidebarOpen) setShowTransactions(!showTransactions);
            }}
            title={!sidebarOpen ? 'Transactions administratives' : ''}
          >
            <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
              <FileChartLine size={20} strokeWidth={isGroupActive('TransactionsAdmin') ? 3 : 2} />
              {sidebarOpen && <span className="small fw-bold">Transactions administratives</span>}
            </div>
            {sidebarOpen && showTransactions && (
              <ChevronDown 
                size={16} 
                className={`transition-all ${showTransactions ? 'rotate-180' : ''}`}
                style={{ transition: 'transform 0.2s ease' }}
              />
            )}
          </div>
          
          {/* Sous-menu Transactions administratives */}
          {showTransactions && sidebarOpen && (
            <div className="ms-4 mt-1">
              <Link
                to={menuPaths.agenceForm}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  isActivePath(menuPaths.agenceForm) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.agenceForm) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} strokeWidth={isActivePath(menuPaths.agenceForm) ? 3 : 2} />
                Ouverture/fermeture Agence
              </Link>
              
              <Link
                to={menuPaths.guichetForm}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  isActivePath(menuPaths.guichetForm) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.guichetForm) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileType size={16} strokeWidth={isActivePath(menuPaths.guichetForm) ? 3 : 2} />
                Ouverture/Fermeture du guichet
              </Link>

              <Link
                to={menuPaths.caisseForm}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  isActivePath(menuPaths.caisseForm) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.caisseForm) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileType size={16} strokeWidth={isActivePath(menuPaths.caisseForm) ? 3 : 2} />
                Ouverture/Fermeture de la caisse
              </Link>
            </div>
          )}
        </div>

        {/* MENU Transaction Front Office */}
        <div className="mb-2">
          <div 
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
              isGroupActive('FrontOffice') ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isGroupActive('FrontOffice') ? activeGradient : 'transparent',
              cursor: 'pointer',
              justifyContent: sidebarOpen ? 'space-between' : 'center'
            }}
            onClick={() => {
              if (sidebarOpen) setShowFrontOffice(!showFrontOffice);
            }}
            title={!sidebarOpen ? 'Transaction Front Office' : ''}
          >
            <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
              <CreditCard size={20} strokeWidth={isGroupActive('FrontOffice') ? 3 : 2} />
              {sidebarOpen && <span className="small fw-bold">Transaction Front Office</span>}
            </div>
            {sidebarOpen && showFrontOffice && (
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
              {/* Dashboard caissieres */}
              <Link
                to={menuPaths.dashboardCaissieres}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  isActivePath(menuPaths.dashboardCaissieres) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.dashboardCaissieres) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <BarChart3 size={16} strokeWidth={isActivePath(menuPaths.dashboardCaissieres) ? 3 : 2} />
                Dashboard caissieres
              </Link>

              {/* Transaction Caisse Espèce */}
              <div className="mb-1">
                <div 
                  className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
                    isGroupActive('CaisseEspece') ? 'text-white' : 'text-secondary hover-bg-light'
                  }`}
                  style={{ 
                    background: isGroupActive('CaisseEspece') ? activeGradient : 'transparent',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCaisseEspece(!showCaisseEspece);
                  }}
                >
                  <div className="d-flex align-items-center gap-2" style={{ flex: 1 }}>
                    <Wallet size={16} strokeWidth={isGroupActive('CaisseEspece') ? 3 : 2} />
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
                      to={menuPaths.entreesSortiesCaisse}
                      className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                        isActivePath(menuPaths.entreesSortiesCaisse) 
                          ? 'text-white fw-bold' 
                          : 'text-secondary hover-bg-light'
                      }`}
                      style={{ 
                        background: isActivePath(menuPaths.entreesSortiesCaisse) ? activeGradient : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowDownUp size={14} strokeWidth={isActivePath(menuPaths.entreesSortiesCaisse) ? 3 : 2} />
                      Entrer/sortie caisse
                    </Link>

                    <Link
                      to={menuPaths.retraitEspeces}
                      className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                        isActivePath(menuPaths.retraitEspeces) 
                          ? 'text-white fw-bold' 
                          : 'text-secondary hover-bg-light'
                      }`}
                      style={{ 
                        background: isActivePath(menuPaths.retraitEspeces) ? activeGradient : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowDownUp size={14} strokeWidth={isActivePath(menuPaths.retraitEspeces) ? 3 : 2} />
                      Retrait Especes
                    </Link>

                    <Link
                      to={menuPaths.transfertInterCaisse}
                      className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                        isActivePath(menuPaths.transfertInterCaisse) 
                          ? 'text-white fw-bold' 
                          : 'text-secondary hover-bg-light'
                      }`}
                      style={{ 
                        background: isActivePath(menuPaths.transfertInterCaisse) ? activeGradient : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Repeat size={14} strokeWidth={isActivePath(menuPaths.transfertInterCaisse) ? 3 : 2} />
                      Transfert caisse
                    </Link>
                    
                    <Link
                      to={menuPaths.transfertInterEnvoi}
                      className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                        isActivePath(menuPaths.transfertInterEnvoi) 
                          ? 'text-white fw-bold' 
                          : 'text-secondary hover-bg-light'
                      }`}
                      style={{ 
                        background: isActivePath(menuPaths.transfertInterEnvoi) ? activeGradient : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Receipt size={14} strokeWidth={isActivePath(menuPaths.transfertInterEnvoi) ? 3 : 2} />
                      Transfert inter caisse envoi
                    </Link>
                    
                    <Link
                      to={menuPaths.transfertInterReception}
                      className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                        isActivePath(menuPaths.transfertInterReception) 
                          ? 'text-white fw-bold' 
                          : 'text-secondary hover-bg-light'
                      }`}
                      style={{ 
                        background: isActivePath(menuPaths.transfertInterReception) ? activeGradient : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Receipt size={14} strokeWidth={isActivePath(menuPaths.transfertInterReception) ? 3 : 2} />
                      Transfert inter caisse réception
                    </Link>

                    {/* MENU Versement avec sous-menus */}
                    <div className="mb-1">
                      <div 
                        className={`d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer ${
                          isGroupActive('Versement') ? 'text-white' : 'text-secondary hover-bg-light'
                        }`}
                        style={{ 
                          background: isGroupActive('Versement') ? activeGradient : 'transparent',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowVersementMenu(!showVersementMenu);
                        }}
                      >
                        <div className="d-flex align-items-center gap-2" style={{ flex: 1 }}>
                          <DollarSign size={14} strokeWidth={isGroupActive('Versement') ? 3 : 2} />
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
                            to={menuPaths.versement}
                            className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                              isActivePath(menuPaths.versement, true) 
                                ? 'text-white fw-bold' 
                                : 'text-secondary hover-bg-light'
                            }`}
                            style={{ 
                              background: isActivePath(menuPaths.versement, true) ? activeGradient : 'transparent',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DollarSign size={12} strokeWidth={isActivePath(menuPaths.versement, true) ? 3 : 2} />
                            Versement espèce
                          </Link>
                          {/* les different bordereau de versement 
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
                          </Link>*/}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Transaction Caisse Devise */}
              <Link
                to={menuPaths.caisseDevise}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  isActivePath(menuPaths.caisseDevise) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.caisseDevise) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Coins size={16} strokeWidth={isActivePath(menuPaths.caisseDevise) ? 3 : 2} />
                Transaction caisse devise
              </Link>
              
              {/* Transfert de fond */}
              <Link
                to={menuPaths.transfertFond}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  isActivePath(menuPaths.transfertFond) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.transfertFond) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Repeat size={16} strokeWidth={isActivePath(menuPaths.transfertFond) ? 3 : 2} />
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
              isGroupActive('Settings') ? 'text-white' : 'text-secondary hover-bg-light'
            }`}
            style={{ 
              background: isGroupActive('Settings') ? activeGradient : 'transparent',
              cursor: 'pointer',
              justifyContent: sidebarOpen ? 'space-between' : 'center'
            }}
            onClick={() => {
              if (sidebarOpen) setShowSettingsMenu(!showSettingsMenu);
            }}
            title={!sidebarOpen ? 'Paramètres' : ''}
          >
            <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
              <Settings size={20} strokeWidth={isGroupActive('Settings') ? 3 : 2} />
              {sidebarOpen && <span className="small fw-bold">Paramètres</span>}
            </div>
            {sidebarOpen && showSettingsMenu && (
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
                to={menuPaths.usersRoles}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  isActivePath(menuPaths.usersRoles) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.usersRoles) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} strokeWidth={isActivePath(menuPaths.usersRoles) ? 3 : 2} />
                Roles des utilisateurs
              </Link>

              {/* Agence */}
              <Link
                to={menuPaths.agence}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  isActivePath(menuPaths.agence) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.agence) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <House size={16} strokeWidth={isActivePath(menuPaths.agence) ? 3 : 2} />
                Agences
              </Link>

              {/* Liste des Type de comptes */}
              <Link
                to={menuPaths.listeTypeCompte}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 mb-1 ${
                  isActivePath(menuPaths.listeTypeCompte) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.listeTypeCompte) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <List size={16} strokeWidth={isActivePath(menuPaths.listeTypeCompte) ? 3 : 2} />
                Liste des Type de comptes
              </Link>
              
              <Link
                to={menuPaths.fraisApplications}
                className={`d-flex align-items-center gap-2 p-2 text-decoration-none small rounded-3 ${
                  isActivePath(menuPaths.fraisApplications) 
                    ? 'text-white fw-bold' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{ 
                  background: isActivePath(menuPaths.fraisApplications) ? activeGradient : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} strokeWidth={isActivePath(menuPaths.fraisApplications) ? 3 : 2} />
                Frais et applications
              </Link>
            </div>
          )}
        </div>

        <div 
          role="button"
          onClick={handleLogout}
          className="d-flex align-items-center gap-3 p-2 text-danger rounded-3 cursor-pointer hover-bg-danger-subtle transition-all"
          style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
          title={!sidebarOpen ? 'Déconnexion' : ''}
        >
          <LogOut size={20} />
          {sidebarOpen && <span className="small fw-bold text-uppercase">Déconnexion</span>}
        </div>
      </div>
    </aside>
  );
}