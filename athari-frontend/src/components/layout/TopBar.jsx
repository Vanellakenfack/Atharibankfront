import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Bell, X, Copy, Check, Shield } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/css/dash.css';
import ApiClient from '../../services/api/ApiClient';

export default function TopBar({
  sidebarOpen,
  notifications = [],
  unreadCount = 0,
  formatDate,
  loadNotifications,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [approvalCodes, setApprovalCodes] = useState([]);
  const [dgCodes, setDgCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [loadingDgCodes, setLoadingDgCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeTab, setActiveTab] = useState('caisse'); // 'caisse' ou 'dg'
  const [userRole, setUserRole] = useState(null); // État pour stocker le rôle de l'utilisateur
  const [userProfile, setUserProfile] = useState(null); // État pour stocker le profil complet
  
  // Référence pour détecter les clics en dehors du panneau
  const notificationPanelRef = useRef(null);
  const bellButtonRef = useRef(null);

  // Calculer le nombre de notifications non lues
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const calculatedUnreadCount = safeNotifications.filter(n => !n.read).length;
  const displayUnreadCount = unreadCount >= 0 ? unreadCount : calculatedUnreadCount;

  // Fonction pour récupérer le profil utilisateur (similaire à votre premier code)
  const fetchUserProfile = useCallback(async () => {
    try {
      console.log("=== CHARGEMENT PROFIL UTILISATEUR POUR TOPBAR ===");
      
      // 1. Essayer le localStorage d'abord (même méthode que votre premier code)
      const tokenData = localStorage.getItem('token_data');
      if (tokenData) {
        try {
          const parsed = JSON.parse(tokenData);
          console.log("Données localStorage:", parsed);
          
          const userData = parsed;
          
          if (userData && userData.role) {
            console.log("Rôle trouvé dans localStorage:", userData.role);
            setUserProfile(userData);
            setUserRole(userData.role);
            return;
          }
        } catch (error) {
          console.error("Erreur parsing localStorage:", error);
        }
      }

      // 2. Essayer l'API
      try {
        const response = await ApiClient.get("/me");
        console.log("Réponse API /me:", response.data);
        
        const userData = response.data;
        
        if (userData && userData.role) {
          console.log("Rôle trouvé dans API:", userData.role);
          setUserProfile(userData);
          setUserRole(userData.role);
        }
      } catch (apiError) {
        console.log("Erreur API /me:", apiError.message);
      }
    } catch (error) {
      console.error("Erreur récupération profil:", error);
    }
  }, []);

  // Fonction pour récupérer les codes d'approbation de caisse
  const fetchApprovalCodes = useCallback(async () => {
    try {
      setLoadingCodes(true);
      const response = await ApiClient.get('/supervision-caisse/codes-approbation');
      
      if (response.data && Array.isArray(response.data)) {
        const sortedCodes = response.data.sort((a, b) => 
          new Date(b.date_approbation) - new Date(a.date_approbation)
        );
        setApprovalCodes(sortedCodes);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des codes de caisse:', error);
    } finally {
      setLoadingCodes(false);
    }
  }, []);

  // Fonction pour récupérer les codes de validation DG
  const fetchDgCodes = useCallback(async () => {
    try {
      setLoadingDgCodes(true);
      const response = await ApiClient.get('/operation-diverses/codes/validation-dg');
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const sortedCodes = response.data.data.sort((a, b) => 
          new Date(b.date_decision) - new Date(a.date_decision)
        );
        setDgCodes(sortedCodes);
      } else {
        console.warn('Structure de réponse inattendue:', response.data);
        setDgCodes([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des codes DG:', error);
      setDgCodes([]);
    } finally {
      setLoadingDgCodes(false);
    }
  }, []);

  // Fonction pour charger tous les codes (UNIQUEMENT si l'utilisateur est Caissière)
  const fetchAllCodes = useCallback(async () => {
    // Vérifier si l'utilisateur a le rôle "Caissière" avant de charger les codes
    if (userRole !== 'Caissière') {
      console.log("Utilisateur n'est pas Caissière, annulation du chargement des codes");
      return;
    }
    
    await Promise.all([
      fetchApprovalCodes(),
      fetchDgCodes()
    ]);
  }, [fetchApprovalCodes, fetchDgCodes, userRole]);

  // Charger le profil utilisateur au montage du composant
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Mettre à jour les codes toutes les 30 secondes seulement si l'utilisateur est Caissière
  useEffect(() => {
    if (userRole === 'Caissière') {
      console.log("Utilisateur est Caissière, chargement des codes...");
      fetchAllCodes(); // Charger initialement
      
      const interval = setInterval(() => {
        fetchAllCodes();
      }, 30000); // 30 secondes

      return () => clearInterval(interval);
    } else {
      console.log("Utilisateur n'est pas Caissière, pas de chargement automatique des codes");
    }
  }, [fetchAllCodes, userRole]);

  // Gestionnaire de clic en dehors du panneau
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && notificationPanelRef.current) {
        const isBellButton = bellButtonRef.current && bellButtonRef.current.contains(event.target);
        const isNotificationPanel = notificationPanelRef.current.contains(event.target);
        
        if (!isNotificationPanel && !isBellButton) {
          setShowNotifications(false);
          setCopiedCode(null);
          setActiveTab('caisse');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Configurer l'intervalle pour la mise à jour périodique quand le panneau est ouvert
  useEffect(() => {
    let codeUpdateInterval;

    if (showNotifications && userRole === 'Caissière') {
      codeUpdateInterval = setInterval(() => {
        fetchAllCodes();
      }, 10000); // 10 secondes
    }

    return () => {
      if (codeUpdateInterval) clearInterval(codeUpdateInterval);
    };
  }, [showNotifications, fetchAllCodes, userRole]);

  const handleNotificationClick = (e) => {
    e.stopPropagation();
    
    // Vérifier si l'utilisateur est Caissière avant d'ouvrir les notifications
    if (userRole !== 'Caissière') {
      console.log("Accès refusé: Seul le rôle Caissière peut voir les codes de validation");
      // Vous pouvez afficher une alerte ou un message ici si vous le souhaitez
      return;
    }
    
    setShowNotifications(prev => !prev);
    if (!showNotifications) {
      fetchAllCodes();
    }
  };

  const handleNotificationClose = () => {
    setShowNotifications(false);
    setCopiedCode(null);
    setActiveTab('caisse');
  };

  // Formater la date
  const formatNotificationDate = (dateString) => {
    if (formatDate && typeof formatDate === 'function') {
      return formatDate(dateString);
    }
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Copier le code dans le presse-papier
  const handleCopyCode = (code, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
      })
      .catch(err => {
        console.error('Erreur lors de la copie:', err);
      });
  };

  // Empêcher la propagation des clics dans le panneau
  const handlePanelClick = (e) => {
    e.stopPropagation();
  };

  // Calculer les totaux (seulement si Caissière)
  const isCashier = userRole === 'Caissière';
  const totalCaisseCodes = isCashier ? approvalCodes.length : 0;
  const totalDgCodes = isCashier ? dgCodes.length : 0;
  const totalCodesToday = isCashier ? totalCaisseCodes + totalDgCodes : 0;

  // Déterminer la couleur et le texte du badge selon le rôle
  const getBadgeInfo = () => {
    if (!isCashier) {
      return {
        showBadge: false,
        badgeColor: '#6c757d', // gris
        badgeText: '0'
      };
    }
    
    return {
      showBadge: totalCodesToday > 0,
      badgeColor: totalCaisseCodes > 0 ? '#4caf50' : '#2196f3',
      badgeText: totalCodesToday.toString()
    };
  };

  const badgeInfo = getBadgeInfo();

  return (
    <>
      <header 
        className="top-bar d-flex align-items-center px-4 w-100"
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e0e0e0',
          height: '50px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 1030,
        }}
      >
        <div className="d-flex justify-content-between align-items-center w-100">
          
          {/* BLOC GAUCHE : NOM BANQUE */}
          <div className="d-flex align-items-center gap-3">
            <span 
              className="fw-bold" 
              style={{ 
                fontSize: '0.95rem',
                color: 'white'
              }}
            >
              AthariBank
            </span>
          </div>

          {/* BLOC DROITE : RECHERCHE, NOTIFICATIONS & PROFIL */}
          <div className="d-flex align-items-center gap-3">
            
            {/* RECHERCHE */}
            <div 
              className="d-flex align-items-center" 
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '4px',
                padding: '4px 8px',
                width: '200px'
              }}
            >
              <Search size={16} className="text-muted me-2" />
              <input 
                type="text" 
                className="form-control form-control-sm bg-transparent border-0 shadow-none p-0" 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {/* NOTIFICATIONS - Seulement pour Caissière */}
            <div className="position-relative">
              <button 
                ref={bellButtonRef}
                className="btn btn-link text-dark p-1 position-relative"
                onClick={handleNotificationClick}
                style={{ textDecoration: 'none' }}
                title={isCashier ? "Codes de validation" : "Réservé aux Caissières"}
              >
                <Bell size={20} />
                
                {/* Indicateur de notification - seulement si Caissière et avec des codes */}
                {badgeInfo.showBadge && (
                  <span 
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill new-codes-pulse" 
                    style={{ 
                      fontSize: '0.6rem',
                      backgroundColor: badgeInfo.badgeColor,
                      minWidth: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white',
                      fontWeight: 'bold'
                    }}
                    title={`${totalCaisseCodes} code(s) caisse · ${totalDgCodes} code(s) DG`}
                  >
                    {badgeInfo.badgeText}
                  </span>
                )}
                
                {/* Petit indicateur si non-Caissière */}
                {!isCashier && userRole && (
                  <span 
                    className="position-absolute top-0 start-100 translate-middle" 
                    style={{ 
                      fontSize: '0.5rem',
                      color: '#6c757d'
                    }}
                    title="Réservé aux Caissières"
                  >
                    ⚠️
                  </span>
                )}
              </button>

              {/* PANEL DES NOTIFICATIONS - Seulement pour Caissière */}
              {showNotifications && isCashier && (
                <div 
                  ref={notificationPanelRef}
                  className="position-absolute end-0 mt-2 bg-white rounded shadow-lg"
                  style={{
                    width: '500px',
                    maxHeight: '700px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1050,
                    border: '1px solid #e0e0e0',
                  }}
                  onClick={handlePanelClick}
                >
                  {/* HEADER */}
                  <div 
                    className="d-flex justify-content-between align-items-center p-3"
                    style={{ 
                      backgroundColor: '#1a237e',
                      color: 'white',
                      borderTopLeftRadius: 'inherit',
                      borderTopRightRadius: 'inherit'
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <Bell size={18} />
                      <span className="fw-medium">Codes de validation</span>
                      <span 
                        className="badge bg-light text-dark ms-2" 
                        style={{ fontSize: '0.7rem' }}
                      >
                        Caissière
                      </span>
                      {(loadingCodes || loadingDgCodes) && (
                        <span 
                          className="badge bg-warning ms-2" 
                          style={{ fontSize: '0.7rem' }}
                        >
                          Mise à jour...
                        </span>
                      )}
                      {totalCodesToday > 0 && !loadingCodes && !loadingDgCodes && (
                        <span 
                          className="badge bg-success ms-2" 
                          style={{ fontSize: '0.7rem' }}
                        >
                          {totalCodesToday}
                        </span>
                      )}
                    </div>
                    <button 
                      className="btn btn-link text-white p-0"
                      onClick={handleNotificationClose}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* TABS */}
                  <div className="d-flex border-bottom">
                    <button
                      className={`flex-grow-1 py-3 btn btn-link text-decoration-none ${
                        activeTab === 'caisse' ? 'active' : ''
                      }`}
                      onClick={() => setActiveTab('caisse')}
                      style={{
                        backgroundColor: activeTab === 'caisse' ? '#f8f9fa' : 'transparent',
                        borderBottom: activeTab === 'caisse' ? '3px solid #4caf50' : 'none',
                        color: activeTab === 'caisse' ? '#1a237e' : '#6c757d',
                        fontWeight: activeTab === 'caisse' ? 'bold' : 'normal',
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <span>Caisses</span>
                        {totalCaisseCodes > 0 && (
                          <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>
                            {totalCaisseCodes}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      className={`flex-grow-1 py-3 btn btn-link text-decoration-none ${
                        activeTab === 'dg' ? 'active' : ''
                      }`}
                      onClick={() => setActiveTab('dg')}
                      style={{
                        backgroundColor: activeTab === 'dg' ? '#f8f9fa' : 'transparent',
                        borderBottom: activeTab === 'dg' ? '3px solid #2196f3' : 'none',
                        color: activeTab === 'dg' ? '#1a237e' : '#6c757d',
                        fontWeight: activeTab === 'dg' ? 'bold' : 'normal',
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <Shield size={16} />
                        <span>Direction Générale</span>
                        {totalDgCodes > 0 && (
                          <span className="badge bg-primary" style={{ fontSize: '0.7rem' }}>
                            {totalDgCodes}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* CONTENU PRINCIPAL */}
                  <div 
                    style={{ 
                      overflow: 'auto', 
                      flex: 1,
                      padding: '20px'
                    }}
                  >
                    {activeTab === 'caisse' ? (
                      <>
                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem', color: '#1a237e' }}>
                              Codes de validation - Caisses
                            </h6>
                            {totalCaisseCodes > 0 && (
                              <div className="d-flex align-items-center gap-1">
                                <span 
                                  className="badge bg-success"
                                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                >
                                  {totalCaisseCodes} code(s)
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                            Cliquez sur un code pour le copier dans le presse-papier
                          </p>
                        </div>

                        {totalCaisseCodes === 0 ? (
                          <div className="text-center py-5">
                            <Bell size={40} className="text-muted mb-3" />
                            <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                              Aucun code de caisse disponible aujourd'hui
                            </p>
                            <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                              Les codes approuvés aujourd'hui apparaîtront ici
                            </p>
                          </div>
                        ) : (
                          <div className="codes-container">
                            {approvalCodes.map((code) => (
                              <div 
                                key={code.id} 
                                className="code-item mb-3"
                              >
                                <div 
                                  className="p-4 rounded border"
                                  style={{ 
                                    backgroundColor: copiedCode === code.code_validation ? '#d4edd7' : '#e8f5e9',
                                    borderColor: '#c8e6c9',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                  }}
                                  onClick={(e) => handleCopyCode(code.code_validation, e)}
                                >
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div style={{ flex: 1 }}>
                                      <div className="fw-medium mb-1" style={{ fontSize: '0.85rem', color: '#2e7d32' }}>
                                        Code de validation
                                      </div>
                                      <div className="d-flex align-items-center gap-3 mt-2">
                                        <code 
                                          style={{ 
                                            fontSize: '1.4rem', 
                                            fontWeight: 'bold',
                                            letterSpacing: '2px',
                                            color: '#1a237e',
                                            fontFamily: 'monospace',
                                            userSelect: 'none'
                                          }}
                                        >
                                          {code.code_validation}
                                        </code>
                                        <div 
                                          className="copy-btn p-2 rounded"
                                          style={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            cursor: 'pointer'
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyCode(code.code_validation, e);
                                          }}
                                        >
                                          {copiedCode === code.code_validation ? (
                                            <Check size={18} className="text-success" />
                                          ) : (
                                            <Copy size={18} className="text-muted" />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-end">
                                      <div className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                                        Créé le
                                      </div>
                                      <div className="fw-medium" style={{ fontSize: '0.85rem', color: '#1a237e' }}>
                                        {formatNotificationDate(code.date_approbation)}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Message de confirmation de copie */}
                                  {copiedCode === code.code_validation && (
                                    <div 
                                      className="mt-3 p-2 text-center rounded"
                                      style={{ 
                                        backgroundColor: '#4caf50',
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        animation: 'fadeIn 0.3s ease-in'
                                      }}
                                    >
                                      ✓ Code copié dans le presse-papier
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem', color: '#1a237e' }}>
                              <Shield size={18} className="me-2" />
                              Codes de validation - Direction Générale
                            </h6>
                            {totalDgCodes > 0 && (
                              <div className="d-flex align-items-center gap-1">
                                <span 
                                  className="badge bg-primary"
                                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                >
                                  {totalDgCodes} code(s)
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                            Codes de validation pour les opérations nécessitant l'approbation du DG
                          </p>
                        </div>

                        {totalDgCodes === 0 ? (
                          <div className="text-center py-5">
                            <Shield size={40} className="text-muted mb-3" />
                            <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                              Aucun code DG disponible aujourd'hui
                            </p>
                            <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                              Les codes validés par le DG apparaîtront ici
                            </p>
                          </div>
                        ) : (
                          <div className="codes-container">
                            {dgCodes.map((code) => (
                              <div 
                                key={code.id} 
                                className="code-item mb-3"
                              >
                                <div 
                                  className="p-4 rounded border"
                                  style={{ 
                                    backgroundColor: copiedCode === code.code_a_verifier ? '#e3f2fd' : '#e8f5e9',
                                    borderColor: '#bbdefb',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                  }}
                                  onClick={(e) => handleCopyCode(code.code_a_verifier, e)}
                                >
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div style={{ flex: 1 }}>
                                      <div className="fw-medium mb-1" style={{ fontSize: '0.85rem', color: '#1565c0' }}>
                                        Code de validation DG
                                      </div>
                                      <div className="d-flex align-items-center gap-3 mt-2">
                                        <code 
                                          style={{ 
                                            fontSize: '1.4rem', 
                                            fontWeight: 'bold',
                                            letterSpacing: '2px',
                                            color: '#1a237e',
                                            fontFamily: 'monospace',
                                            userSelect: 'none'
                                          }}
                                        >
                                          {code.code_a_verifier}
                                        </code>
                                        <div 
                                          className="copy-btn p-2 rounded"
                                          style={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            cursor: 'pointer'
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyCode(code.code_a_verifier, e);
                                          }}
                                        >
                                          {copiedCode === code.code_a_verifier ? (
                                            <Check size={18} className="text-success" />
                                          ) : (
                                            <Copy size={18} className="text-muted" />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-end">
                                      <div className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                                        Validé le
                                      </div>
                                      <div className="fw-medium" style={{ fontSize: '0.85rem', color: '#1a237e' }}>
                                        {formatNotificationDate(code.date_decision)}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Message de confirmation de copie */}
                                  {copiedCode === code.code_a_verifier && (
                                    <div 
                                      className="mt-3 p-2 text-center rounded"
                                      style={{ 
                                        backgroundColor: '#2196f3',
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        animation: 'fadeIn 0.3s ease-in'
                                      }}
                                    >
                                      ✓ Code DG copié dans le presse-papier
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* FOOTER */}
                  <div className="p-3 border-top" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="text-center">
                      <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                        {loadingCodes || loadingDgCodes 
                          ? 'Mise à jour en cours...' 
                          : `Dernière mise à jour: ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Message si utilisateur non-Caissière essaie d'ouvrir */}
              {showNotifications && !isCashier && (
                <div 
                  ref={notificationPanelRef}
                  className="position-absolute end-0 mt-2 bg-white rounded shadow-lg"
                  style={{
                    width: '350px',
                    zIndex: 1050,
                    border: '1px solid #e0e0e0',
                  }}
                  onClick={handlePanelClick}
                >
                  <div 
                    className="d-flex justify-content-between align-items-center p-3"
                    style={{ 
                      backgroundColor: '#6c757d',
                      color: 'white',
                      borderTopLeftRadius: 'inherit',
                      borderTopRightRadius: 'inherit'
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <Bell size={18} />
                      <span className="fw-medium">Accès refusé</span>
                    </div>
                    <button 
                      className="btn btn-link text-white p-0"
                      onClick={handleNotificationClose}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="p-4 text-center">
                    <div className="mb-3">
                      <span style={{ fontSize: '2rem' }}>🔒</span>
                    </div>
                    <h6 className="fw-bold mb-2" style={{ color: '#1a237e' }}>
                      Fonctionnalité réservée
                    </h6>
                    <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                      Les codes de validation sont uniquement accessibles aux <strong>Caissières</strong>.
                    </p>
                    {userRole && (
                      <div className="alert alert-secondary" role="alert" style={{ fontSize: '0.85rem' }}>
                        Votre rôle actuel: <strong>{userRole}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SEPARATEUR */}
            <div className="vr" style={{ height: '24px' }}></div>

            {/* INFOS UTILISATEUR + AVATAR */}
            <div className="d-flex align-items-center gap-2">
              <div 
                className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ 
                  width: '30px', 
                  height: '30px', 
                  fontSize: '0.8rem',
                  backgroundColor: '#1a237e'
                }}
                title={userProfile ? `${userProfile.name} (${userRole})` : "Profil utilisateur"}
              >
                {userProfile && userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              {userRole && (
                <div className="d-flex flex-column">
                  <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                    {userProfile ? userProfile.name : 'Utilisateur'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                    {userRole}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Styles CSS pour l'animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          .code-item:hover {
            transform: translateY(-2px);
            transition: transform 0.2s ease;
          }
          
          .codes-container {
            max-height: 400px;
            overflow-y: auto;
            padding-right: 5px;
          }
          
          .codes-container::-webkit-scrollbar {
            width: 6px;
          }
          
          .codes-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          
          .codes-container::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 10px;
          }
          
          .codes-container::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
          }
          
          .new-codes-pulse {
            animation: pulse 0.5s ease-in-out 2;
          }
        `}
      </style>
    </>
  );
}