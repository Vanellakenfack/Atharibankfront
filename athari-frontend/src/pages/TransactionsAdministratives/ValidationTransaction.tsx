import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Avatar,
  Pagination,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Lock,
  AttachMoney,
  Assignment,
  Security,
  Refresh,
  AccountBalance,
  Person,
  CreditCard,
  Receipt,
  ContentCopy,
  Send,
  AccountCircle,
  VerifiedUser,
  GppGood,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import ApiClient from '../../services/api/ApiClient';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface TiersInfo {
  nom_complet?: string;
  type_piece?: string;
  numero_piece?: string;
}

interface CaisseInfo {
  id?: number;
  guichet_session_id?: number;
  caissier_id?: number;
  caisse_id?: number;
  agence?: string;
  guichet?: string;
  caisse?: string;
  caissiere?: string;
}

interface DemandeValidation {
  id: number;
  type_operation: string;
  montant: number;
  statut: string;
  code_validation?: string;
  payload_data: {
    type?: string;
    montant_brut?: number;
    compte_id?: number;
    compte?: string;
    origine_fonds?: string;
    numero_bordereau?: string;
    tiers?: TiersInfo;
    billetage?: Array<{ valeur: number; quantite: number }>;
    caisse_active?: CaisseInfo;
    caissiere?: {
      id: number;
      name: string;
      email?: string;
    };
    porteur_nom?: string;
    porteur_piece?: string;
    agence?: string;
    guichet?: string;
    caisse?: string;
    motif?: string;
  };
  caissiere_id: number;
  caissiere?: {
    id: number;
    name: string;
    email?: string;
  };
  created_at: string;
  updated_at: string;
  date_approbation?: string;
  motif_rejet?: string;
}

interface ApiResponse {
  success?: boolean;
  data?: DemandeValidation[];
  message?: string;
}

interface ValidationCodeNotification {
  id: string;
  code: string;
  demandeId: number;
  type: string;
  montant: number;
  date: string;
  read: boolean;
  sent: boolean;
  caissiereName?: string;
  caissiereId?: number;
}

// --- SERVICE DE NOTIFICATIONS ---
const NotificationService = {
  STORAGE_KEY: 'validation_codes_v2',
  
  loadAll: (): ValidationCodeNotification[] => {
    try {
      const stored = localStorage.getItem(NotificationService.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return Object.values(parsed);
      }
      return [];
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      return [];
    }
  },
  
  saveAll: (notifications: ValidationCodeNotification[]): void => {
    try {
      localStorage.setItem(
        NotificationService.STORAGE_KEY, 
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error('Erreur sauvegarde notifications:', error);
    }
  },
  
  addNotification: (notification: ValidationCodeNotification): void => {
    const notifications = NotificationService.loadAll();
    notifications.unshift(notification);
    NotificationService.saveAll(notifications);
  },
  
  markAsRead: (id: string): void => {
    const notifications = NotificationService.loadAll();
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    NotificationService.saveAll(updated);
  },
  
  markAsSent: (id: string): void => {
    const notifications = NotificationService.loadAll();
    const updated = notifications.map(n => 
      n.id === id ? { ...n, sent: true } : n
    );
    NotificationService.saveAll(updated);
  },
  
  deleteNotification: (id: string): void => {
    const notifications = NotificationService.loadAll();
    const updated = notifications.filter(n => n.id !== id);
    NotificationService.saveAll(updated);
  },
  
  getUnreadCount: (): number => {
    const notifications = NotificationService.loadAll();
    return notifications.filter(n => !n.read).length;
  },
  
  clearAll: (): void => {
    localStorage.removeItem(NotificationService.STORAGE_KEY);
  }
};

// --- COMPOSANTS STYLISÉS ---
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  ...(status === 'EN_ATTENTE' && {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  }),
  ...(status === 'APPROUVE' && {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  }),
  ...(status === 'REJETE' && {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  }),
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const DetailSection = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

// --- COMPOSANT PRINCIPAL ---
const ValidationTransaction: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [demandes, setDemandes] = useState<DemandeValidation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedDemande, setSelectedDemande] = useState<DemandeValidation | null>(null);
  const [detailDialog, setDetailDialog] = useState<boolean>(false);
  const [approvalDialog, setApprovalDialog] = useState<boolean>(false);
  const [rejectionDialog, setRejectionDialog] = useState<boolean>(false);
  const [rejectionMotif, setRejectionMotif] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [generatedCodeInfo, setGeneratedCodeInfo] = useState<ValidationCodeNotification | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });
  
  const [notifications, setNotifications] = useState<ValidationCodeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10); // 10 éléments par page comme demandé
  
  // États utilisateur
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [autoSendEnabled, setAutoSendEnabled] = useState<boolean>(true);

  // Calcul des données paginées
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedDemandes = demandes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(demandes.length / itemsPerPage);

  // Charger les notifications
  const loadNotifications = () => {
    const loadedNotifications = NotificationService.loadAll();
    setNotifications(loadedNotifications);
    setUnreadCount(NotificationService.getUnreadCount());
  };

  // Sauvegarder une notification
  const saveNotification = (notification: ValidationCodeNotification) => {
    NotificationService.addNotification(notification);
    loadNotifications();
  };

  // Marquer comme lu
  const markAsRead = (id: string) => {
    NotificationService.markAsRead(id);
    loadNotifications();
  };

  // Supprimer notification
  const deleteNotification = (id: string) => {
    NotificationService.deleteNotification(id);
    loadNotifications();
    showSnackbar('Notification supprimée', 'success');
  };

  // Marquer comme envoyé
  const markAsSent = (id: string) => {
    NotificationService.markAsSent(id);
    loadNotifications();
  };

  // Fonction pour récupérer le profil utilisateur
  const fetchUserProfile = async () => {
    try {
      setLoadingUser(true);
      console.log('Chargement du profil utilisateur...');
      
      const tokenData = localStorage.getItem('token_data');
      if (tokenData) {
        try {
          const parsed = JSON.parse(tokenData);
          console.log('Données localStorage:', parsed);
          
          if (parsed && parsed.role) {
            console.log('Rôle trouvé dans localStorage:', parsed.role);
            setUserProfile(parsed);
            setUserRole(parsed.role);
            setLoadingUser(false);
            return;
          }
        } catch (error) {
          console.error('Erreur parsing localStorage:', error);
        }
      }
      
      const response = await ApiClient.get<UserProfile>('/me');
      console.log('Réponse API /me:', response.data);
      
      if (response.data && response.data.role) {
        setUserProfile(response.data);
        setUserRole(response.data.role);
        localStorage.setItem('token_data', JSON.stringify(response.data));
      } else {
        console.error('Rôle non trouvé dans la réponse');
        showSnackbar('Erreur: Rôle utilisateur non défini', 'error');
      }
    } catch (error: any) {
      console.error('Erreur chargement profil:', error);
      showSnackbar('Erreur chargement profil utilisateur', 'error');
    } finally {
      setLoadingUser(false);
    }
  };

  // Charger les demandes
  const loadDemandes = async () => {
    try {
      setRefreshing(true);
      const response = await ApiClient.get<ApiResponse>('/assistant/demandes-en-attente');
      
      let demandesData: DemandeValidation[] = [];
      
      if (Array.isArray(response.data)) {
        demandesData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray((response.data as ApiResponse).data)) {
          demandesData = (response.data as ApiResponse).data!;
        } else if (Array.isArray(response.data)) {
          demandesData = response.data as DemandeValidation[];
        }
      }
      
      setDemandes(demandesData);
      setCurrentPage(1); // Reset à la première page après chargement
      
      if (demandesData.length > 0) {
        showSnackbar(`${demandesData.length} demande(s) chargée(s)`, 'success');
      }
    } catch (error: any) {
      console.error('Erreur chargement demandes:', error);
      showSnackbar(
        error.response?.data?.message || 
        'Erreur lors du chargement des demandes', 
        'error'
      );
      setDemandes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour déterminer si un rôle peut valider un montant
  const canUserValidateAmount = (montant: number, role: string): boolean => {
    const montantNum = Number(montant);
    
    switch (role) {
      case 'Assistant Comptable (AC)':
        return montantNum >= 500000 && montantNum <= 5000000;
      case 'Chef Comptable':
        return montantNum > 5000000 && montantNum <= 10000000;
      case 'DG':
        return montantNum > 10000000;
      default:
        return false;
    }
  };

  // Obtenir le libellé du rôle
  const getRoleLabel = (roleCode: string): string => {
    const roles: { [key: string]: string } = {
      'AC': 'Assistant Comptable (AC)',
      'CC': 'Chef Comptable',
      'DG': 'Directeur Général'
    };
    return roles[roleCode] || roleCode;
  };

  // Obtenir la plage de validation pour un rôle
  const getRoleValidationRange = (role: string): string => {
    switch (role) {
      case 'AC':
        return '500.000 - 5.000.000 FCFA';
      case 'CC':
        return '5.000.000 - 10.000.000 FCFA';
      case 'DG':
        return '> 10.000.000 FCFA';
      default:
        return 'Non autorisé';
    }
  };

  // Vérifier si l'utilisateur peut valider une demande spécifique
  const canUserValidateDemande = (demande: DemandeValidation): boolean => {
    if (!userRole) return false;
    if (demande.statut !== 'EN_ATTENTE') return false;
    return canUserValidateAmount(demande.montant, userRole);
  };

  useEffect(() => {
    fetchUserProfile();
    loadDemandes();
    loadNotifications();
    
    const interval = setInterval(() => {
      if (!detailDialog && !approvalDialog && !rejectionDialog) {
        loadDemandes();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    // Optionnel: scroll vers le haut de la table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (demande: DemandeValidation) => {
    setSelectedDemande(demande);
    setDetailDialog(true);
  };

  // Fonction pour envoyer automatiquement le code
  const sendCodeAutomatically = async (code: string, demandeId: number, caissiereId?: number) => {
    try {
      console.log(`Envoi du code ${code} pour la demande ${demandeId} à la caissière ${caissiereId}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Erreur envoi automatique:', error);
      return false;
    }
  };

  const handleApprove = async () => {
    if (!selectedDemande) return;

    try {
      const response = await ApiClient.post(`/supervision-caisse/approuver/${selectedDemande.id}`);
      
      if (response.data.success) {
        const code = response.data.code;
        setGeneratedCode(code);
        
        const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const notification: ValidationCodeNotification = {
          id: notificationId,
          code,
          demandeId: selectedDemande.id,
          type: selectedDemande.type_operation,
          montant: selectedDemande.montant,
          date: new Date().toISOString(),
          read: false,
          sent: false,
          caissiereName: selectedDemande.caissiere?.name,
          caissiereId: selectedDemande.caissiere_id,
        };
        
        setGeneratedCodeInfo(notification);
        saveNotification(notification);
        
        if (autoSendEnabled) {
          const sent = await sendCodeAutomatically(
            code, 
            selectedDemande.id, 
            selectedDemande.caissiere_id
          );
          
          if (sent) {
            markAsSent(notificationId);
            showSnackbar('Code généré et envoyé automatiquement à la caissière', 'success');
          } else {
            showSnackbar('Code généré mais erreur lors de l\'envoi automatique', 'warning');
          }
        } else {
          showSnackbar('Code généré avec succès', 'success');
        }
        
        await loadDemandes();
      }
    } catch (error: any) {
      console.error('Erreur approbation:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de l\'approbation', 'error');
    } finally {
      setApprovalDialog(false);
      setDetailDialog(false);
    }
  };

  const handleSendCode = async () => {
    if (generatedCodeInfo) {
      try {
        const sent = await sendCodeAutomatically(
          generatedCodeInfo.code,
          generatedCodeInfo.demandeId,
          generatedCodeInfo.caissiereId
        );
        
        if (sent) {
          markAsSent(generatedCodeInfo.id);
          setGeneratedCode('');
          setGeneratedCodeInfo(null);
          showSnackbar('Code envoyé avec succès à la caissière', 'success');
        } else {
          showSnackbar('Erreur lors de l\'envoi du code', 'error');
        }
      } catch (error) {
        console.error('Erreur envoi manuel:', error);
        showSnackbar('Erreur lors de l\'envoi du code', 'error');
      }
    }
  };

  const handleReject = async () => {
    if (!selectedDemande || !rejectionMotif.trim()) {
      showSnackbar('Veuillez saisir un motif de rejet', 'error');
      return;
    }

    try {
      const response = await ApiClient.post(`/supervision-caisse/rejeter/${selectedDemande.id}`, {
        motif: rejectionMotif,
      });

      if (response.data.success) {
        showSnackbar('Demande rejetée avec succès', 'success');
        await loadDemandes();
      }
    } catch (error: any) {
      console.error('Erreur rejet:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors du rejet', 'error');
    } finally {
      setRejectionDialog(false);
      setRejectionMotif('');
      setDetailDialog(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      showSnackbar('Code copié dans le presse-papier', 'success');
    }
  };

  const stats = {
    total: demandes.length,
    enAttente: demandes.filter(d => d.statut === 'EN_ATTENTE').length,
    approuvees: demandes.filter(d => d.statut === 'APPROUVE').length,
    rejetees: demandes.filter(d => d.statut === 'REJETE').length,
  };

  const formatDate = (dateString: string) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAccountInfo = (demande: DemandeValidation) => {
    return {
      compte: demande.payload_data?.compte || `COMPTE-${demande.payload_data?.compte_id || 'N/A'}`,
      origineFonds: demande.payload_data?.origine_fonds || 'Non spécifié',
      numeroBordereau: demande.payload_data?.numero_bordereau || 'N/A',
    };
  };

  const getPorteurInfo = (demande: DemandeValidation) => {
    if (demande.payload_data?.tiers) {
      return {
        nom: demande.payload_data.tiers.nom_complet || 'N/A',
        piece: demande.payload_data.tiers.numero_piece || 'N/A',
        typePiece: demande.payload_data.tiers.type_piece || 'N/A',
      };
    }
    return {
      nom: demande.payload_data?.porteur_nom || 'N/A',
      piece: demande.payload_data?.porteur_piece || 'N/A',
      typePiece: 'N/A',
    };
  };

  const getLocalisationInfo = (demande: DemandeValidation) => {
    if (demande.payload_data?.caisse_active) {
      return {
        agence: demande.payload_data.caisse_active.agence || 'N/A',
        guichet: demande.payload_data.caisse_active.guichet || `GUICHET-${demande.payload_data.caisse_active.guichet_session_id || 'N/A'}`,
        caisse: demande.payload_data.caisse_active.caisse || `CAISSE-${demande.payload_data.caisse_active.caisse_id || 'N/A'}`,
        caissiere: demande.payload_data.caisse_active.caissiere || 'N/A',
      };
    }
    return {
      agence: demande.payload_data?.agence || 'N/A',
      guichet: demande.payload_data?.guichet || 'N/A',
      caisse: demande.payload_data?.caisse || 'N/A',
      caissiere: demande.caissiere?.name || 'N/A',
    };
  };

  if (loadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Chargement du profil utilisateur...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`,
          transition: 'width 0.3s ease',
        }}
      >
        <TopBar 
          sidebarOpen={sidebarOpen} 
          notifications={notifications} 
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onDeleteNotification={deleteNotification}
          onMarkAsSent={markAsSent}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          loadNotifications={loadNotifications}
        />

        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          {/* Bannière info utilisateur */}
          {userProfile && (
            <Paper sx={{ mb: 3, p: 2, bgcolor: '#1a237e', color: 'white', borderRadius: 2 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Avatar sx={{ bgcolor: 'white', color: '#1a237e', width: 56, height: 56 }}>
                    {userRole === 'DG' ? <GppGood /> : 
                     userRole === 'CC' ? <VerifiedUser /> : 
                     <AccountCircle />}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6" fontWeight={600}>
                    {userProfile.name}
                  </Typography>
                </Grid>
                <Grid item>
                  <Tooltip title="Activer/désactiver l'envoi automatique">
                    <Chip
                      label={autoSendEnabled ? "Auto-envoi: ACTIF" : "Auto-envoi: INACTIF"}
                      color={autoSendEnabled ? "success" : "default"}
                      variant="outlined"
                      onClick={() => setAutoSendEnabled(!autoSendEnabled)}
                      sx={{ cursor: 'pointer', bgcolor: 'white' }}
                    />
                  </Tooltip>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
                  <Security sx={{ mr: 2, verticalAlign: 'middle' }} />
                  Validation des Transactions
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Interface de supervision et validation des opérations
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadDemandes}
                disabled={refreshing}
              >
                Actualiser
              </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      TOTAL
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Demandes
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard sx={{ borderLeftColor: '#ff9800' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      EN ATTENTE
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {stats.enAttente}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      À traiter
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard sx={{ borderLeftColor: '#4caf50' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      APPROUVÉES
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {stats.approuvees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Validées
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard sx={{ borderLeftColor: '#f44336' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      REJETÉES
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                      {stats.rejetees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Refusées
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>
          </Box>

          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#1a237e', color: 'white' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ mr: 1 }} />
                Demandes en attente de validation
              </Typography>
              {userRole && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  Vous pouvez valider les montants entre {getRoleValidationRange(userRole)}
                </Typography>
              )}
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : demandes.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Lock sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Aucune demande en attente
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toutes les transactions ont été traitées
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>ID</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Montant</strong></TableCell>
                        <TableCell><strong>Caissière</strong></TableCell>
                        <TableCell><strong>Porteur</strong></TableCell>
                        <TableCell><strong>Compte</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Statut</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedDemandes.map((demande) => {
                        const porteurInfo = getPorteurInfo(demande);
                        const accountInfo = getAccountInfo(demande);
                        const canValidate = canUserValidateDemande(demande);
                        
                        return (
                          <StyledTableRow key={demande.id} hover onClick={() => handleViewDetails(demande)}>
                            <TableCell>#{demande.id}</TableCell>
                            <TableCell>
                              <Chip 
                                label={demande.type_operation || demande.payload_data?.type || 'N/A'} 
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" fontWeight={600} color="#1a237e">
                                {formatCurrency(demande.montant)} FCFA
                              </Typography>
                              {!canValidate && demande.statut === 'EN_ATTENTE' && (
                                <Typography variant="caption" color="error" display="block">
                                  Hors de votre plage
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#1a237e' }}>
                                  {demande.caissiere?.name?.charAt(0) || 'C'}
                                </Avatar>
                                <Typography variant="body2">
                                  {demande.caissiere?.name || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {porteurInfo.nom}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {porteurInfo.piece}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {accountInfo.compte}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {formatDate(demande.created_at)}
                            </TableCell>
                            <TableCell>
                              <StatusChip 
                                label={demande.statut} 
                                status={demande.statut}
                                size="small"
                              />
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Voir détails">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleViewDetails(demande)}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                                {demande.statut === 'EN_ATTENTE' && (
                                  <>
                                    <Tooltip title={canValidate ? "Approuver" : "Montant hors de votre plage de validation"}>
                                      <span>
                                        <IconButton
                                          size="small"
                                          color="success"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (canValidate) {
                                              setSelectedDemande(demande);
                                              setApprovalDialog(true);
                                            }
                                          }}
                                          disabled={!canValidate}
                                        >
                                          <CheckCircle />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    <Tooltip title={canValidate ? "Rejeter" : "Montant hors de votre plage de validation"}>
                                      <span>
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (canValidate) {
                                              setSelectedDemande(demande);
                                              setRejectionDialog(true);
                                            }
                                          }}
                                          disabled={!canValidate}
                                        >
                                          <Cancel />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          </StyledTableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Pagination MUI - Affichage conditionnel */}
                {totalPages > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2, 
                    borderTop: '1px solid #e0e0e0',
                    bgcolor: '#fafafa',
                    gap: 2
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Affichage {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, demandes.length)} sur {demandes.length} demandes
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Pagination 
                        count={totalPages} 
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="medium"
                        showFirstButton
                        showLastButton
                        siblingCount={1}
                        boundaryCount={1}
                        sx={{
                          '& .MuiPaginationItem-root': {
                            fontSize: '0.875rem',
                            '&.Mui-selected': {
                              backgroundColor: '#1a237e',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: '#0e1a4f',
                              }
                            }
                          }
                        }}
                      />
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Dialog de détails */}
      <Dialog 
        open={detailDialog} 
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment color="primary" />
            Détails de la demande #{selectedDemande?.id}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDemande && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                {selectedDemande.statut === 'EN_ATTENTE' && (
                  <Alert 
                    severity={canUserValidateDemande(selectedDemande) ? "info" : "warning"}
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="subtitle2">
                      {canUserValidateDemande(selectedDemande) 
                        ? `Vous pouvez valider cette transaction (${getRoleLabel(userRole)})`
                        : `Vous ne pouvez pas valider cette transaction. Seul ${(() => {
                            const montant = selectedDemande.montant;
                            if (montant <= 5000000) return "l'Assistant Comptable";
                            if (montant <= 10000000) return "le Chef Comptable";
                            return "le Directeur Général";
                          })()} peut valider ${formatCurrency(selectedDemande.montant)} FCFA`
                      }
                    </Typography>
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <DetailSection>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Receipt /> Informations Opération
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Type d'opération
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {selectedDemande.type_operation || selectedDemande.payload_data?.type || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Montant
                        </Typography>
                        <Typography variant="body2" fontWeight={500} color="#1a237e">
                          {formatCurrency(selectedDemande.montant)} FCFA
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Date création
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(selectedDemande.created_at)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Statut
                        </Typography>
                        <StatusChip 
                          label={selectedDemande.statut} 
                          status={selectedDemande.statut}
                          size="small"
                        />
                      </Grid>
                      {selectedDemande.payload_data?.origine_fonds && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Origine des fonds
                          </Typography>
                          <Typography variant="body2">
                            {selectedDemande.payload_data.origine_fonds}
                          </Typography>
                        </Grid>
                      )}
                      {selectedDemande.payload_data?.numero_bordereau && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Numéro bordereau
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {selectedDemande.payload_data.numero_bordereau}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </DetailSection>

                <DetailSection>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalance /> Localisation
                    </Typography>
                    <Grid container spacing={2}>
                      {(() => {
                        const localisation = getLocalisationInfo(selectedDemande);
                        return (
                          <>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Agence
                              </Typography>
                              <Typography variant="body2">
                                {localisation.agence}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Guichet
                              </Typography>
                              <Typography variant="body2">
                                {localisation.guichet}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Caisse
                              </Typography>
                              <Typography variant="body2">
                                {localisation.caisse}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Caissière
                              </Typography>
                              <Typography variant="body2">
                                {localisation.caissiere}
                              </Typography>
                            </Grid>
                          </>
                        );
                      })()}
                    </Grid>
                  </CardContent>
                </DetailSection>
              </Grid>

              <Grid item xs={12} md={6}>
                <DetailSection>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCard /> Informations Compte
                    </Typography>
                    <Grid container spacing={2}>
                      {(() => {
                        const accountInfo = getAccountInfo(selectedDemande);
                        return (
                          <>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Numéro compte
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {accountInfo.compte}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Origine des fonds
                              </Typography>
                              <Typography variant="body2">
                                {accountInfo.origineFonds}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Numéro bordereau
                              </Typography>
                              <Typography variant="body2">
                                {accountInfo.numeroBordereau}
                              </Typography>
                            </Grid>
                          </>
                        );
                      })()}
                    </Grid>
                  </CardContent>
                </DetailSection>

                <DetailSection>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person /> Informations Porteur
                    </Typography>
                    <Grid container spacing={2}>
                      {(() => {
                        const porteurInfo = getPorteurInfo(selectedDemande);
                        return (
                          <>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Nom complet
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {porteurInfo.nom}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Type pièce
                              </Typography>
                              <Typography variant="body2">
                                {porteurInfo.typePiece}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Numéro pièce
                              </Typography>
                              <Typography variant="body2">
                                {porteurInfo.piece}
                              </Typography>
                            </Grid>
                          </>
                        );
                      })()}
                    </Grid>
                  </CardContent>
                </DetailSection>

                {selectedDemande.payload_data?.billetage && selectedDemande.payload_data.billetage.length > 0 && (
                  <DetailSection>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney /> Billetage
                      </Typography>
                      <Grid container spacing={1}>
                        {selectedDemande.payload_data.billetage.map((billet, index) => (
                          <Grid item xs={6} key={index}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                              <Typography variant="body2">
                                {formatCurrency(billet.valeur)} FCFA
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                × {billet.quantite}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </DetailSection>
                )}
              </Grid>

              {selectedDemande.statut === 'APPROUVE' && selectedDemande.code_validation && (
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Code de validation généré: {selectedDemande.code_validation}
                    </Typography>
                    <Typography variant="body2">
                      Ce code a été communiqué à la caissière pour finaliser l'opération
                    </Typography>
                  </Alert>
                </Grid>
              )}

              {selectedDemande.statut === 'REJETE' && selectedDemande.motif_rejet && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Motif du rejet
                    </Typography>
                    <Typography variant="body2">
                      {selectedDemande.motif_rejet}
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Fermer</Button>
          {selectedDemande?.statut === 'EN_ATTENTE' && canUserValidateDemande(selectedDemande) && (
            <>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => {
                  setDetailDialog(false);
                  setRejectionDialog(true);
                }}
              >
                Rejeter
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  setDetailDialog(false);
                  setApprovalDialog(true);
                }}
              >
                Approuver
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog d'approbation */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)}>
        <DialogTitle>
          <CheckCircle color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Confirmer l'approbation
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir approuver cette opération ?
          </Alert>
          {selectedDemande && (
            <>
              <Typography>
                Vous allez générer un code de validation pour la demande #{selectedDemande.id}
                <br />
                <strong>Montant: {formatCurrency(selectedDemande.montant)} FCFA</strong>
                <br />
                <strong>Porteur: {getPorteurInfo(selectedDemande).nom}</strong>
              </Typography>
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Mode d'envoi:</strong> {autoSendEnabled ? 
                    '📤 Le code sera envoyé automatiquement à la caissière' : 
                    '📝 Le code sera affiché pour envoi manuel'}
                </Typography>
                {autoSendEnabled && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    L'envoi automatique peut être désactivé dans la bannière en haut
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleApprove} variant="contained" color="success" autoFocus>
            Générer et {autoSendEnabled ? 'Envoyer' : 'Afficher'} le code
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)}>
        <DialogTitle>
          <Cancel color="error" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Motif du rejet
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Veuillez indiquer le motif du rejet
          </Alert>
          <TextField
            autoFocus
            margin="dense"
            label="Motif du rejet *"
            fullWidth
            multiline
            rows={4}
            value={rejectionMotif}
            onChange={(e) => setRejectionMotif(e.target.value)}
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            disabled={!rejectionMotif.trim()}
          >
            Confirmer le rejet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de code généré */}
      <Dialog open={!!generatedCode} onClose={() => setGeneratedCode('')}>
        <DialogTitle>
          <Lock color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Code de validation généré
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            L'opération a été approuvée avec succès !
          </Alert>
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 800, 
              letterSpacing: 3,
              color: '#1a237e',
              bgcolor: '#e8eaf6',
              p: 3,
              borderRadius: 2,
              border: '2px dashed #1a237e'
            }}>
              {generatedCode}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Communiquez ce code à la caissière pour qu'elle puisse finaliser l'opération
            </Typography>
            
            {generatedCodeInfo && generatedCodeInfo.sent && (
              <Alert severity="success" sx={{ mt: 2 }}>
                 Code envoyé automatiquement à la caissière
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleCopyCode}
            startIcon={<ContentCopy />}
          >
            Copier
          </Button>
          {(!generatedCodeInfo?.sent) && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSendCode}
              startIcon={<Send />}
            >
              Envoyer maintenant
            </Button>
          )}
          <Button 
            onClick={() => {
              setGeneratedCode('');
              setGeneratedCodeInfo(null);
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ValidationTransaction;