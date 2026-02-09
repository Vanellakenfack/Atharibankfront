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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  Tabs,
  Tab,
  Container,
  InputAdornment,
  Avatar,
  Stack,
  Divider,
  RadioGroup,
  Radio,
  FormLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CardHeader,
  Badge,
  Snackbar,
  Alert as MuiAlert,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemIcon,
  CardMedia,
  Backdrop,
  Fade,
  Modal
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  ThumbUp as ThumbUpIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Download as DownloadIcon,
  VerifiedUser as VerifiedUserIcon,
  Search as SearchIcon,
  PictureAsPdf as PictureAsPdfIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon,
  RateReview as RateReviewIcon,
  Security as SecurityIcon,
  Gavel as GavelIcon,
  HowToVote as HowToVoteIcon,
  FactCheck as FactCheckIcon,
  ListAlt as ListAltIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Event as EventIcon,
  Timer as TimerIcon,
  EmojiEvents as EmojiEventsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Comment as CommentIcon,
  Speed as SpeedIcon,
  PersonAdd as PersonAddIcon,
  ThumbUpAlt as ThumbUpAltIcon,
  ThumbDownAlt as ThumbDownAltIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Notes as NotesIcon,
  Calculate as CalculateIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  MonetizationOn as MonetizationOnIcon,
  Photo as PhotoIcon,
  LocationOn as LocationOnIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon,
  ContactPhone as ContactPhoneIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CreditCard as CreditCardIcon,
  LocalAtm as LocalAtmIcon,
  ZoomIn as ZoomInIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import { useAuth } from '../../context/AuthContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: '1200px',
  },
}));

const VoteCard = styled(Card)(({ theme, color }) => ({
  borderLeft: `6px solid ${color || theme.palette.primary.main}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const ImageModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ModalContent = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: 'none',
  boxShadow: theme.shadows[24],
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  outline: 'none',
  maxWidth: '90vw',
  maxHeight: '90vh',
  position: 'relative',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  zIndex: 10,
  backgroundColor: 'rgba(0,0,0,0.5)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
}));

const DownloadButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(6),
  top: theme.spacing(1),
  zIndex: 10,
  backgroundColor: 'rgba(0,0,0,0.5)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
}));

interface Application {
  id: number;
  numero_demande: string;
  montant: number;
  duree: number;
  statut: string;
  date_demande: string;
  created_at: string;
  credit_type_id: number;
  client_info?: {
    nom: string;
    prenom: string;
    email?: string;
    telephone?: string;
  };
  compte_info?: {
    numero_compte: string;
    client_id: number;
  };
  credit_type_info?: {
    description: string;
    credit_characteristics?: string;
    code?: string;
  };
  taux_interet: number;
  interet_total: number;
  frais_etude: number;
  frais_dossier?: number;
  montant_total: number;
  penalite_par_jour?: number;
  calcul_details?: any;
  source_revenus?: string;
  revenus_mensuels?: number;
  autres_revenus?: number;
  montant_dettes?: number;
  description_dette?: string;
  nom_banque?: string;
  numero_banque?: string;
  code_mise_en_place?: string;
  note_credit?: string;
  plan_epargne?: number;
  garantie?: string;
  photo_4x4?: string;
  plan_localisation?: string;
  facture_electricite?: string;
  casier_judiciaire?: string;
  historique_compte?: string;
  geolocalisation_img?: string;
  plan_localisation_activite_img?: string;
  photo_activite_img?: string;
  numero_personne_contact?: string;
  demande_credit_img?: string;
  observation?: string;
  avis?: Vote[];
  pvs?: any[];
  decision_finale?: string;
  date_decision_finale?: string;
  comite_status?: string;
  votes_count?: number;
  votes_required?: number;
  
  // Nouveaux champs pour les détails complets
  user?: any;
  client?: any;
  documents?: any[];
  file_urls?: { [key: string]: string };
}

interface Vote {
  id?: number;
  opinion: 'FAVORABLE' | 'DEFAVORABLE';
  commentaire: string;
  niveau_avis: 'AGENT_CREDIT' | 'ASSISTANT_COMPTABLE' | 'CHEF_AGENCE';
  created_at?: string;
  user_info?: {
    name: string;
    role: string;
  };
  montant_accorde?: number;
  date_deblocage?: string;
  score_risque?: number;
}

interface DocumentItem {
  label: string;
  url: string | null;
  icon: React.ReactNode;
  fieldName: string;
  type: 'field' | 'document';
}

interface AmortizationRow {
  numero: number;
  dateRemboursement: string;
  montantRemboursement: string;
  soldeRestant: string;
  cumulRembourse: string;
}

const StatusChip = ({ statut }: { statut: string }) => {
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'CA_VALIDE': return 'warning';
      case 'EN_COMITE': return 'info';
      case 'APPROUVE': return 'success';
      case 'REJETE': return 'error';
      case 'MIS_EN_PLACE': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (statut: string) => {
    const labels: { [key: string]: string } = {
      'CA_VALIDE': '📋 À traiter par le comité',
      'EN_COMITE': '👥 En cours de vote',
      'APPROUVE': '✅ Approuvé',
      'REJETE': '❌ Rejeté',
      'MIS_EN_PLACE': '🚀 Mis en place',
    };
    return labels[statut] || statut;
  };

  return (
    <Chip
      label={getStatusLabel(statut)}
      color={getStatusColor(statut) as any}
      size="small"
      variant="outlined"
    />
  );
};

const ComiteAgenceDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  // États principaux
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États pour les modales
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  
  // État pour le vote
  const [voteData, setVoteData] = useState({
    opinion: 'FAVORABLE' as 'FAVORABLE' | 'DEFAVORABLE',
    commentaire: '',
    montant_accorde: 0,
    date_deblocage: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    score_risque: 50
  });

  // État pour suivre le rôle qui vote
  const [votingRole, setVotingRole] = useState<'AGENT_CREDIT' | 'ASSISTANT_COMPTABLE' | 'CHEF_AGENCE' | null>(null);

  // États pour les onglets et recherche
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // État pour les votes récents (affichés en haut)
  const [recentVotes, setRecentVotes] = useState<Array<{
    applicationId: number;
    applicationNumber: string;
    role: string;
    opinion: string;
    timestamp: string;
  }>>([]);

  // Nouveaux états pour les détails
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('infoGenerale');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [amortizationData, setAmortizationData] = useState<AmortizationRow[]>([]);
  const [showAmortizationTable, setShowAmortizationTable] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Liste des champs de documents potentiels
  const documentFields = [
    { field: 'photo_4x4', label: 'Photo 4x4', icon: <PersonIcon /> },
    { field: 'plan_localisation', label: 'Plan localisation', icon: <LocationOnIcon /> },
    { field: 'facture_electricite', label: 'Facture électricité', icon: <ReceiptIcon /> },
    { field: 'casier_judiciaire', label: 'Casier judiciaire', icon: <SecurityIcon /> },
    { field: 'historique_compte', label: 'Historique compte', icon: <HistoryIcon /> },
    { field: 'geolocalisation_img', label: 'Géolocalisation', icon: <LocationOnIcon /> },
    { field: 'plan_localisation_activite_img', label: 'Plan localisation activité', icon: <LocationOnIcon /> },
    { field: 'photo_activite_img', label: 'Photo activité', icon: <PhotoIcon /> },
    { field: 'demande_credit_img', label: 'Demande de crédit', icon: <AssignmentIcon /> },
  ];

  // Charger les applications au montage
  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
      const interval = setInterval(loadApplications, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, tabValue]);

  // Fonction pour vérifier les permissions de l'utilisateur
  const getUserPermissions = () => {
    if (!user || !user.roles) {
      return {
        isChefAgence: false,
        isAssistantComptable: false,
        isAgentCredit: false,
        roles: [] as string[],
        currentUserRole: '',
        userRoleCode: ''
      };
    }

    const userRoles = user.roles || [];
    return {
      isChefAgence: userRoles.includes("Chef d'Agence (CA)") || userRoles.includes('chef_agence'),
      isAssistantComptable: userRoles.includes('Assistant Comptable (AC)') || userRoles.includes('assistant_comptable'),
      isAgentCredit: userRoles.includes('Agent de Crédit') || userRoles.includes('agent_credit'),
      roles: userRoles,
      currentUserRole: userRoles.includes("Chef d'Agence (CA)") ? 'CA' :
        userRoles.includes('Assistant Comptable (AC)') ? 'AC' :
          userRoles.includes('Agent de Crédit') ? 'Agent' : '',
      userRoleCode: userRoles.includes("Chef d'Agence (CA)") ? 'CHEF_AGENCE' :
        userRoles.includes('Assistant Comptable (AC)') ? 'ASSISTANT_COMPTABLE' :
          userRoles.includes('Agent de Crédit') ? 'AGENT_CREDIT' : ''
    };
  };
  const permissions = getUserPermissions();

  // Fonction pour charger les applications
  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_BASE_URL}/credit-applications`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        let filteredApps: Application[] = [];
        const allApps = data.data || [];

        if (tabValue === 0) {
          filteredApps = allApps.filter((app: Application) =>
            app.statut === 'EN_COMITE' || app.statut === 'CA_VALIDE'
          );
        } else if (tabValue === 1) {
          filteredApps = allApps.filter((app: Application) =>
            app.statut === 'APPROUVE'
          );
        } else if (tabValue === 2) {
          filteredApps = allApps.filter((app: Application) =>
            app.statut === 'REJETE'
          );
        }

        setApplications(filteredApps);
      } else {
        setApplications([]);
      }

    } catch (err: any) {
      console.error('Erreur lors du chargement des applications:', err);
      setError(`Impossible de charger les applications: ${err.message}`);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les détails complets d'une application
  const loadApplicationDetails = async (applicationId: number) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_BASE_URL}/credit-applications/${applicationId}`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Retourner les données dans le format approprié
      if (data.data) {
        return data.data;
      } else if (data.application) {
        return data.application;
      } else {
        return data;
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des détails:', err);
      throw err;
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fonction pour gérer le clic sur "Voir les détails"
  const handleViewDetails = async (application: Application) => {
    try {
      setError(null);
      setLoadingDetails(true);

      // Charger les détails complets
      const details = await loadApplicationDetails(application.id);
      
      // Fusionner les données
      const mergedDetails: Application = {
        ...application,
        ...details,
        // Préserver les données existantes
        user: details.user || application.user,
        client: details.client || application.client,
        documents: details.documents || application.documents,
        file_urls: details.file_urls || application.file_urls,
      };
      
      setSelectedApplication(mergedDetails);
      setDetailsDialogOpen(true);
      
      // Calculer le tableau d'amortissement
      calculateAmortization(mergedDetails);

    } catch (err: any) {
      console.error('Erreur lors du chargement des détails:', err);
      setError(`Impossible de charger les détails: ${err.message}`);
      // Afficher quand même les informations de base
      setSelectedApplication(application);
      setDetailsDialogOpen(true);
      calculateAmortization(application);
    }
  };

  // Fonction pour vérifier si un utilisateur a déjà voté
  const hasUserGivenOpinion = (application: Application, roleCode: string) => {
    if (!application || !application.avis || !Array.isArray(application.avis)) {
      return false;
    }
    return application.avis.some((avis: Vote) => avis.niveau_avis === roleCode);
  };

  // Fonction pour obtenir l'avis d'un utilisateur
  const getUserOpinion = (application: Application, roleCode: string) => {
    if (!application || !application.avis || !Array.isArray(application.avis)) {
      return null;
    }
    return application.avis.find((avis: Vote) => avis.niveau_avis === roleCode);
  };

  // Fonction pour obtenir le rôle d'un vote
  const getRoleName = (roleCode: string) => {
    switch (roleCode) {
      case 'CHEF_AGENCE': return "Chef d'Agence";
      case 'ASSISTANT_COMPTABLE': return 'Assistant Comptable';
      case 'AGENT_CREDIT': return 'Agent de Crédit';
      default: return roleCode;
    }
  };

  // Fonction pour obtenir l'icône d'un rôle
  const getRoleIcon = (roleCode: string) => {
    switch (roleCode) {
      case 'CHEF_AGENCE': return <BusinessIcon />;
      case 'ASSISTANT_COMPTABLE': return <AccountBalanceIcon />;
      case 'AGENT_CREDIT': return <AssignmentIcon />;
      default: return <PersonIcon />;
    }
  };

  // Fonction pour télécharger le PV
 const handleDownloadPV = async (creditId: number) => {
    try {
        // 1. Vérifier l'URL de votre backend
        const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
        
        // 2. Ajouter le token d'authentification si nécessaire
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // 3. Faire la requête avec les bons headers
        const response = await fetch(`${apiUrl}/api/credits/${creditId}/download-pv`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf',
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important pour les cookies/sessions
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Créer le blob et télécharger le PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Extraire le nom de fichier de l'en-tête Content-Disposition
        const contentDisposition = response.headers.get('content-disposition');
        let fileName = `PV_CREDIT_${creditId}.pdf`;
        
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
            if (fileNameMatch && fileNameMatch.length > 1) {
                fileName = fileNameMatch[1];
            }
        }
        
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
        // 5. Nettoyer
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        console.log('PDF téléchargé avec succès');
        
    } catch (error) {
        console.error('Erreur lors du téléchargement du PV:', error);
        // Afficher un message d'erreur à l'utilisateur
        alert('Erreur lors du téléchargement. Vérifiez votre connexion et réessayez.');
    }
};

  // Ouvrir le dialogue de vote pour un rôle spécifique
  const handleOpenVoteDialog = (application: Application, roleCode: 'AGENT_CREDIT' | 'ASSISTANT_COMPTABLE' | 'CHEF_AGENCE') => {
    if (hasUserGivenOpinion(application, roleCode)) {
      setError(`Vous avez déjà voté pour ce dossier en tant que ${getRoleName(roleCode)}. Vous ne pouvez voter qu'une seule fois.`);
      return;
    }

    setSelectedApplication(application);
    setVotingRole(roleCode);
    
    setVoteData({
      opinion: 'FAVORABLE',
      commentaire: '',
      montant_accorde: application.montant,
      date_deblocage: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      score_risque: 50
    });
    
    setVoteDialogOpen(true);
  };

  // Soumettre un vote
  const handleSubmitVote = async () => {
    if (!selectedApplication || !voteData.commentaire || !votingRole) {
      setError('Veuillez remplir le commentaire');
      return;
    }

    if (hasUserGivenOpinion(selectedApplication, votingRole)) {
      setError(`Vous avez déjà voté pour ce dossier en tant que ${getRoleName(votingRole)}. Vous ne pouvez voter qu'une seule fois.`);
      return;
    }

    if (voteData.opinion === 'FAVORABLE') {
      if (!voteData.montant_accorde || voteData.montant_accorde <= 0) {
        setError('Pour un vote favorable, le montant doit être supérieur à 0');
        return;
      }
      if (!voteData.date_deblocage) {
        setError('Pour un vote favorable, la date de déblocage est requise');
        return;
      }
    }

    try {
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const votePayload: any = {
        opinion: voteData.opinion,
        commentaire: voteData.commentaire,
        niveau_avis: votingRole,
        montant_accorde: voteData.montant_accorde || 0,
        date_deblocage: voteData.date_deblocage || ''
      };

      if (votingRole === 'CHEF_AGENCE' && voteData.score_risque !== undefined) {
        votePayload.score_risque = voteData.score_risque;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_BASE_URL}/credit-applications/${selectedApplication.id}/vote-comite`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(votePayload)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        if (responseData.errors?.montant_accorde || responseData.errors?.date_deblocage) {
          setError('Pour un vote favorable, le montant (supérieur à 0) et la date de déblocage sont obligatoires');
        } else {
          setError(`Erreur: ${responseData.message || 'Erreur lors de la soumission'}`);
        }
        return;
      }

      setRecentVotes(prev => [{
        applicationId: selectedApplication.id,
        applicationNumber: selectedApplication.numero_demande,
        role: getRoleName(votingRole),
        opinion: voteData.opinion,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 4)]);

      setSuccess(`✅ Vote ${getRoleName(votingRole)} enregistré avec succès!`);
      
      await loadApplications();
      setVoteDialogOpen(false);
      setVotingRole(null);
      setVoteData({
        opinion: 'FAVORABLE',
        commentaire: '',
        montant_accorde: 0,
        date_deblocage: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        score_risque: 50
      });

      setTimeout(() => setSuccess(null), 5000);

    } catch (err: any) {
      console.error('Erreur lors de la soumission du vote:', err);
      setError(`Erreur: ${err.message}`);
    }
  };

  // Calculer la progression des votes
  const getVoteProgress = (application: Application) => {
    const votes = application.avis || [];
    const required = 3;
    return {
      progress: (votes.length / required) * 100,
      votes: votes.length,
      required: required,
      favorable: votes.filter(v => v.opinion === 'FAVORABLE').length,
      hasAgent: votes.some(v => v.niveau_avis === 'AGENT_CREDIT'),
      hasAC: votes.some(v => v.niveau_avis === 'ASSISTANT_COMPTABLE'),
      hasCA: votes.some(v => v.niveau_avis === 'CHEF_AGENCE')
    };
  };

  // Vérifier si tous les votes sont terminés
  const isVotingComplete = (application: Application) => {
    const progress = getVoteProgress(application);
    return progress.votes >= progress.required;
  };

  // Fonction pour formater les montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir le nom du client
  const getClientName = (application: Application) => {
    if (application.client_info) {
      return `${application.client_info.nom || ''} ${application.client_info.prenom || ''}`.trim();
    }
    if (application.client) {
      return application.client.full_name || application.client.name || 'Client inconnu';
    }
    return 'Client inconnu';
  };

  // Fonction pour rafraîchir
  const handleRefresh = () => {
    loadApplications();
  };

  // Supprimer un vote récent
  const handleRemoveRecentVote = (index: number) => {
    setRecentVotes(prev => prev.filter((_, i) => i !== index));
  };

  // Calcul des statistiques
  const stats = {
    enComite: applications.filter(app => app.statut === 'EN_COMITE' || app.statut === 'CA_VALIDE').length,
    approuves: applications.filter(app => app.statut === 'APPROUVE').length,
    rejetes: applications.filter(app => app.statut === 'REJETE').length,
    total: applications.length
  };

  // Fonction pour construire l'URL correcte des documents
  const getDocumentUrl = (path: string | null | undefined): string | null => {
    if (!path || path === 'N/A' || path === 'null' || path === 'undefined' || path.trim() === '') {
      return null;
    }
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    if (path.startsWith('storage/')) {
      return `${API_BASE_URL.replace('/api', '')}/${path}`;
    }
    
    if (path.startsWith('/storage')) {
      return `${API_BASE_URL.replace('/api', '')}${path}`;
    }
    
    return `${API_BASE_URL.replace('/api', '')}/storage/${path.replace(/^\/+/, '')}`;
  };

  // Fonction pour obtenir l'icône appropriée
  const getIconForDocumentType = (fieldName: string): React.ReactNode => {
    const lowerField = fieldName.toLowerCase();
    
    if (lowerField.includes('photo') || lowerField.includes('img') || lowerField.includes('image')) {
      return <PhotoIcon />;
    }
    if (lowerField.includes('plan') || lowerField.includes('localisation')) {
      return <LocationOnIcon />;
    }
    if (lowerField.includes('cni') || lowerField.includes('identite') || lowerField.includes('4x4')) {
      return <PersonIcon />;
    }
    if (lowerField.includes('facture') || lowerField.includes('receipt') || lowerField.includes('lettre')) {
      return <ReceiptIcon />;
    }
    if (lowerField.includes('casier') || lowerField.includes('judiciaire')) {
      return <SecurityIcon />;
    }
    if (lowerField.includes('historique') || lowerField.includes('compte')) {
      return <HistoryIcon />;
    }
    if (lowerField.includes('activite') || lowerField.includes('work')) {
      return <WorkIcon />;
    }
    if (lowerField.includes('demande') || lowerField.includes('credit')) {
      return <AssignmentIcon />;
    }
    
    return <FileIcon />;
  };

  // Fonction pour récupérer tous les documents disponibles
  const getAvailableDocuments = (application: Application | null): DocumentItem[] => {
    if (!application) return [];

    const documents: DocumentItem[] = [];

    // Récupérer les documents des champs principaux
    documentFields.forEach(docField => {
      const url = application[docField.field as keyof Application] as string;
      const fullUrl = getDocumentUrl(url);
      
      if (fullUrl) {
        documents.push({
          label: docField.label,
          url: url,
          icon: docField.icon,
          fieldName: docField.field,
          type: 'field'
        });
      }
    });

    // Rechercher dynamiquement d'autres champs
    Object.keys(application).forEach(key => {
      if (key.toLowerCase().includes('img') || 
          key.toLowerCase().includes('photo') || 
          key.toLowerCase().includes('image') ||
          key.toLowerCase().includes('plan') ||
          key.toLowerCase().includes('facture') ||
          key.toLowerCase().includes('casier') ||
          key.toLowerCase().includes('historique')) {
        
        const value = application[key as keyof Application] as string;
        if (typeof value === 'string' && value && getDocumentUrl(value)) {
          const alreadyAdded = documents.some(doc => doc.fieldName === key);
          
          if (!alreadyAdded) {
            documents.push({
              label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              url: value,
              icon: getIconForDocumentType(key),
              fieldName: key,
              type: 'field'
            });
          }
        }
      }
    });

    return documents;
  };

  // Fonction pour ouvrir l'image en plein écran
  const handleOpenImage = (url: string) => {
    const fullUrl = getDocumentUrl(url);
    if (fullUrl) {
      setSelectedImage(fullUrl);
      setImageModalOpen(true);
    }
  };

  // Fonction pour télécharger l'image
  const handleDownloadImage = (url: string, filename: string) => {
    const fullUrl = getDocumentUrl(url);
    if (fullUrl) {
      fetch(fullUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename || 'document.jpg';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        })
        .catch(err => console.error('Erreur de téléchargement:', err));
    }
  };

  // Fonction pour gérer l'accordéon
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  // Fonction pour calculer le tableau d'amortissement
  const calculateAmortization = (application: Application) => {
    if (!application) return;

    const montant = application.montant;
    const duree = application.duree;
    const totalInteret = application.interet_total;
    const fraisDossier = application.frais_dossier || 0;
    const fraisEtude = application.frais_etude || 0;

    const totalARembourser = montant + totalInteret + fraisDossier + fraisEtude;
    const remboursementQuotidien = totalARembourser / duree;

    const amortizationData: AmortizationRow[] = [];
    let soldeRestant = montant;
    let cumulRembourse = 0;
    const startDate = new Date();

    for (let jour = 1; jour <= duree; jour++) {
      const dateRemboursement = new Date(startDate);
      dateRemboursement.setDate(startDate.getDate() + jour);

      const interetQuotidien = totalInteret / duree;
      const capitalRembourse = remboursementQuotidien - interetQuotidien;

      soldeRestant = Math.max(0, soldeRestant - capitalRembourse);
      cumulRembourse += remboursementQuotidien;

      amortizationData.push({
        numero: jour,
        dateRemboursement: dateRemboursement.toLocaleDateString('fr-FR'),
        montantRemboursement: remboursementQuotidien.toFixed(0),
        soldeRestant: soldeRestant.toFixed(0),
        cumulRembourse: cumulRembourse.toFixed(0)
      });
    }

    setAmortizationData(amortizationData);
  };

  // Fonction pour rendre le tableau d'amortissement
  const renderAmortizationTable = () => {
    if (!amortizationData || amortizationData.length === 0) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculateIcon />
          Tableau d'Amortissement
        </Typography>
        <TableContainer component={Paper} elevation={2} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Jour</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date de remboursement</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Montant</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Solde restant</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Cumul remboursé</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {amortizationData.map((row, index) => (
                <TableRow key={row.numero} hover>
                  <TableCell>
                    <Chip label={row.numero} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{row.dateRemboursement}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {formatAmount(parseFloat(row.montantRemboursement))}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'warning.main' }}>
                    {formatAmount(parseFloat(row.soldeRestant))}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {formatAmount(parseFloat(row.cumulRembourse))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Fonction pour rendre une carte de document
  const renderDocumentCard = (doc: DocumentItem) => {
    const fullUrl = getDocumentUrl(doc.url);
    
    if (!fullUrl) {
      return null;
    }

    return (
      <Grid item xs={12} sm={6} md={4} key={doc.fieldName}>
        <Card 
          elevation={2} 
          sx={{ 
            height: '100%',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6,
            }
          }}
          onClick={() => handleOpenImage(doc.url!)}
        >
          <Box sx={{ position: 'relative', height: 200 }}>
            <CardMedia
              component="img"
              height="200"
              image={fullUrl}
              alt={doc.label}
              sx={{ 
                objectFit: 'cover',
                backgroundColor: 'grey.100'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNNjAgODBIMTQwVjEyMEg2MFY4MFoiIGZpbGw9IiNDQ0NDQ0MiLz48cGF0aCBkPSJNODAgNjBIMTIwVjE0MEg4MFY2MFoiIGZpbGw9IiNFMEUwRTAiLz48dGV4dCB4PSIxMDAiIHk9IjE3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjODg4ODg4Ij5Eb2N1bWVudDwvdGV4dD48L3N2Zz4=';
              }}
            />
            <Box sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: '50%',
              padding: '4px',
              color: 'white'
            }}>
              <ZoomInIcon fontSize="small" />
            </Box>
          </Box>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {doc.icon}
              <Typography variant="subtitle2" noWrap>
                {doc.label}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {doc.type === 'document' ? 'Document uploadé' : `Champ: ${doc.fieldName}`}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenImage(doc.url!);
                }}
              >
                Voir
              </Button>
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  const filename = `${doc.label.replace(/\s+/g, '_')}.jpg`;
                  handleDownloadImage(doc.url!, filename);
                }}
              >
                Télécharger
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  // Fonction pour rendre la section documents
  const renderDocumentSection = () => {
    const documents = getAvailableDocuments(selectedApplication);
    
    if (documents.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucun document disponible
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette demande de crédit ne contient pas de documents joints.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <FolderIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h6">
              Documents ({documents.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tous les documents joints à cette demande de crédit
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          {documents.map((doc, index) => renderDocumentCard(doc))}
        </Grid>
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> Cliquez sur une image pour l'agrandir. Utilisez les boutons "Voir" pour afficher en plein écran et "Télécharger" pour sauvegarder le document.
          </Typography>
        </Box>
      </Box>
    );
  };

  if (loading && applications.length === 0) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: `calc(100% - ${sidebarOpen ? '280px' : '80px'})`,
            transition: 'width 0.3s ease'
          }}
        >
          <TopBar sidebarOpen={sidebarOpen} />
          <Container maxWidth="lg" sx={{ py: 4, flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={60} />
            <Typography sx={{ mt: 3 }}>
              Chargement des applications...
            </Typography>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: `calc(100% - ${sidebarOpen ? '280px' : '80px'})`,
          transition: 'width 0.3s ease'
        }}
      >
        <TopBar sidebarOpen={sidebarOpen} />
        <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
          {/* En-tête */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HowToVoteIcon />
                Comité d'Agence - Votes
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {permissions.currentUserRole === 'CA' && "👑 Vous êtes Chef d'Agence"}
                {permissions.currentUserRole === 'AC' && "💼 Vous êtes Assistant Comptable"}
                {permissions.currentUserRole === 'Agent' && "📊 Vous êtes Agent de Crédit"}
              </Typography>
            </Box>
            <Tooltip title="Rafraîchir">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Messages d'alerte */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Section des votes récents */}
          {recentVotes.length > 0 && (
            <StyledPaper sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon /> Votes Récents
              </Typography>
              <Grid container spacing={2}>
                {recentVotes.map((vote, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <VoteCard 
                      color={vote.opinion === 'FAVORABLE' ? '#4caf50' : '#f44336'}
                      sx={{ height: '100%' }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {vote.opinion === 'FAVORABLE' ? 
                              <ThumbUpIcon color="success" fontSize="small" /> : 
                              <ThumbDownIcon color="error" fontSize="small" />
                            }
                            <Typography variant="subtitle2" fontWeight="bold">
                              {vote.role}
                            </Typography>
                          </Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveRecentVote(index)}
                            sx={{ mt: -1, mr: -1 }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Dossier: {vote.applicationNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(vote.timestamp)}
                        </Typography>
                        <Chip 
                          label={vote.opinion === 'FAVORABLE' ? 'Favorable' : 'Défavorable'}
                          color={vote.opinion === 'FAVORABLE' ? 'success' : 'error'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </VoteCard>
                  </Grid>
                ))}
              </Grid>
            </StyledPaper>
          )}

          {/* Cartes de statistiques */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {stats.enComite}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En comité
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {stats.approuves}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approuvés
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {stats.rejetes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejetés
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total dossiers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tableau principal */}
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Dossiers en Comité
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {applications.length} dossier(s)
              </Typography>
            </Box>

            {/* Onglets */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
                <Tab label={`En Comité (${stats.enComite})`} />
                <Tab label={`Approuvés (${stats.approuves})`} />
                <Tab label={`Rejetés (${stats.rejetes})`} />
              </Tabs>
            </Box>

            {/* Barre de recherche */}
            <TextField
              fullWidth
              placeholder="Rechercher par client, numéro demande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {applications.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>N° Demande</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Montant</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Progression</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center" width="450">Actions de Vote</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map((app) => {
                      const progress = getVoteProgress(app);
                      const isComplete = isVotingComplete(app);

                      return (
                        <TableRow key={app.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {app.numero_demande}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Typography variant="body2">
                                {getClientName(app)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {formatAmount(app.montant)}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ width: '100%' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={progress.progress} 
                                color={progress.favorable >= 2 ? 'success' : progress.progress > 66 ? 'warning' : 'primary'}
                                sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {progress.votes}/3 votes • {progress.favorable} favorable(s)
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <StatusChip statut={app.statut} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                              {/* Bouton Voir détails */}
                              <Tooltip title="Voir les détails">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleViewDetails(app)}
                                  size="small"
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>

                              {/* Boutons de vote pour chaque rôle - SEULEMENT si pas déjà voté */}
                              {tabValue === 0 && (
                                <>
                                  {/* Agent de Crédit - seulement si pas déjà voté */}
                                  {!progress.hasAgent && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="primary"
                                      onClick={() => handleOpenVoteDialog(app, 'AGENT_CREDIT')}
                                      startIcon={<AssignmentIcon />}
                                      sx={{ minWidth: 150 }}
                                    >
                                      Voter (Agent)
                                    </Button>
                                  )}

                                  {/* Assistant Comptable - seulement si pas déjà voté */}
                                  {!progress.hasAC && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="info"
                                      onClick={() => handleOpenVoteDialog(app, 'ASSISTANT_COMPTABLE')}
                                      startIcon={<AccountBalanceIcon />}
                                      sx={{ minWidth: 150 }}
                                    >
                                      Voter (Assistant)
                                    </Button>
                                  )}

                                  {/* Chef d'Agence - seulement si pas déjà voté */}
                                  {!progress.hasCA && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="warning"
                                      onClick={() => handleOpenVoteDialog(app, 'CHEF_AGENCE')}
                                      startIcon={<BusinessIcon />}
                                      sx={{ minWidth: 150 }}
                                    >
                                      Voter (Chef)
                                    </Button>
                                  )}
                                </>
                              )}

                              {/* Afficher les votes déjà donnés */}
                              {progress.hasAgent && (
                                <Chip
                                  icon={<AssignmentIcon />}
                                  label="Agent: ✅"
                                  color="success"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              {progress.hasAC && (
                                <Chip
                                  icon={<AccountBalanceIcon />}
                                  label="Assistant: ✅"
                                  color="info"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              {progress.hasCA && (
                                <Chip
                                  icon={<BusinessIcon />}
                                  label="Chef: ✅"
                                  color="warning"
                                  variant="outlined"
                                  size="small"
                                />
                              )}

                              {/* Bouton Télécharger PV pour les dossiers terminés */}
                              {(isComplete || app.statut === 'APPROUVE' || app.statut === 'REJETE') && (
                                <Tooltip title="Télécharger PV">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<PictureAsPdfIcon />}
                                    onClick={() => handleDownloadPV(app.id, app.numero_demande)}
                                    sx={{ minWidth: 150 }}
                                  >
                                    Télécharger PV
                                  </Button>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <HowToVoteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucune application trouvée
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tabValue === 0
                    ? "Aucun dossier n'est en cours de traitement par le comité."
                    : tabValue === 1
                      ? "Aucun dossier n'a été approuvé."
                      : "Aucun dossier n'a été rejeté."}
                </Typography>
              </Box>
            )}
          </StyledPaper>

          {/* Modal Détails Application - Version complète */}
          <StyledDialog
            open={detailsDialogOpen}
            onClose={() => setDetailsDialogOpen(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, backgroundColor: 'primary.main', color: 'white' }}>
              <DescriptionIcon />
              Détails de l'Application #{selectedApplication?.numero_demande}
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              {loadingDetails ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>
                    Chargement des détails...
                  </Typography>
                </Box>
              ) : selectedApplication && (
                <Box sx={{ p: 3 }}>
                  {/* Progression des votes */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      État des Votes
                    </Typography>
                    <VoteCard color="primary" sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Progression du Comité
                          </Typography>
                          <Chip 
                            label={`${getVoteProgress(selectedApplication).votes}/3 votes`}
                            color="primary"
                            size="small"
                          />
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={getVoteProgress(selectedApplication).progress} 
                          color={getVoteProgress(selectedApplication).favorable >= 2 ? 'success' : 'primary'}
                          sx={{ height: 10, borderRadius: 5, mb: 2 }}
                        />
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Chip 
                                icon={<AssignmentIcon />}
                                label="Agent"
                                color={getVoteProgress(selectedApplication).hasAgent ? 'success' : 'default'}
                                variant={getVoteProgress(selectedApplication).hasAgent ? 'filled' : 'outlined'}
                                size="small"
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Chip 
                                icon={<AccountBalanceIcon />}
                                label="Assistant"
                                color={getVoteProgress(selectedApplication).hasAC ? 'info' : 'default'}
                                variant={getVoteProgress(selectedApplication).hasAC ? 'filled' : 'outlined'}
                                size="small"
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Chip 
                                icon={<BusinessIcon />}
                                label="Chef"
                                color={getVoteProgress(selectedApplication).hasCA ? 'warning' : 'default'}
                                variant={getVoteProgress(selectedApplication).hasCA ? 'filled' : 'outlined'}
                                size="small"
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </VoteCard>
                  </Box>

                  {/* Liste des votes */}
                  {selectedApplication.avis && selectedApplication.avis.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Votes Enregistrés
                      </Typography>
                      <Stack spacing={2} sx={{ mb: 3 }}>
                        {selectedApplication.avis.map((vote: Vote, index: number) => (
                          <VoteCard 
                            key={index} 
                            color={vote.opinion === 'FAVORABLE' ? '#4caf50' : '#f44336'}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getRoleIcon(vote.niveau_avis)}
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {getRoleName(vote.niveau_avis)}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={vote.opinion}
                                  color={vote.opinion === 'FAVORABLE' ? 'success' : 'error'}
                                  size="small"
                                />
                              </Box>
                              <Typography variant="body2" color="text.primary" paragraph>
                                {vote.commentaire}
                              </Typography>
                              {vote.score_risque !== undefined && (
                                <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                                  <SpeedIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                  Score risque: <strong>{vote.score_risque}/100</strong>
                                </Typography>
                              )}
                              {vote.montant_accorde !== undefined && (
                                <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                                  <AttachMoneyIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                  Montant accordé: <strong>{formatAmount(vote.montant_accorde)}</strong>
                                </Typography>
                              )}
                              {vote.date_deblocage && (
                                <Typography variant="caption" sx={{ display: 'block' }}>
                                  <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                  Date déblocage: <strong>{vote.date_deblocage}</strong>
                                </Typography>
                              )}
                              {vote.created_at && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                  {formatDate(vote.created_at)}
                                </Typography>
                              )}
                            </CardContent>
                          </VoteCard>
                        ))}
                      </Stack>
                    </>
                  )}

                  {/* NOUVELLE SECTION: Accordéon pour les informations détaillées */}
                  <Accordion expanded={expandedAccordion === 'infoGenerale'} onChange={handleAccordionChange('infoGenerale')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <InfoIcon color="primary" />
                        <Typography variant="h6">Informations Générales</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <PersonIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Client" 
                                secondary={getClientName(selectedApplication)}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <AssignmentIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="N° Demande" 
                                secondary={selectedApplication.numero_demande || 'N/A'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <CreditCardIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="N° Compte" 
                                secondary={selectedApplication.compte_info?.numero_compte || 'N/A'}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <SpeedIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Statut" 
                                secondary={<StatusChip statut={selectedApplication.statut} />}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <ScheduleIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Date de Demande" 
                                secondary={formatDate(selectedApplication.date_demande)}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <BusinessIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Type de Crédit" 
                                secondary={selectedApplication.credit_type_info?.description || 'N/A'}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <NotesIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Observation" 
                                secondary={selectedApplication.observation || 'N/A'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <SecurityIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Garantie" 
                                secondary={selectedApplication.garantie || 'N/A'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <AccountBalanceIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Plan d'Épargne" 
                                secondary={selectedApplication.plan_epargne ? 'Oui' : 'Non'}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion expanded={expandedAccordion === 'financier'} onChange={handleAccordionChange('financier')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <MonetizationOnIcon color="primary" />
                        <Typography variant="h6">Informations Financières</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Card elevation={2} sx={{ p: 2, backgroundColor: 'primary.50' }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Montant du Crédit
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText 
                                  primary="Montant demandé" 
                                  secondary={formatAmount(selectedApplication.montant)}
                                  secondaryTypographyProps={{ fontWeight: 'bold', color: 'primary.main' }}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Durée" 
                                  secondary={`${selectedApplication.duree} jours`}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Taux d'intérêt" 
                                  secondary={`${selectedApplication.taux_interet}%`}
                                />
                              </ListItem>
                            </List>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Card elevation={2} sx={{ p: 2, backgroundColor: 'success.50' }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Frais et Totaux
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText 
                                  primary="Intérêt total" 
                                  secondary={formatAmount(selectedApplication.interet_total)}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Frais de dossier" 
                                  secondary={formatAmount(selectedApplication.frais_dossier || 0)}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Frais d'étude" 
                                  secondary={formatAmount(selectedApplication.frais_etude)}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Montant total" 
                                  secondary={formatAmount(selectedApplication.montant_total)}
                                  secondaryTypographyProps={{ fontWeight: 'bold', color: 'success.main' }}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Pénalité par jour" 
                                  secondary={formatAmount(selectedApplication.penalite_par_jour || 0)}
                                />
                              </ListItem>
                            </List>
                          </Card>
                        </Grid>
                      </Grid>
                      
                      {selectedApplication.calcul_details && (
                        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalculateIcon />
                            Détails de Calcul
                          </Typography>
                          {(() => {
                            try {
                              const calculDetails = typeof selectedApplication.calcul_details === 'string' 
                                ? JSON.parse(selectedApplication.calcul_details) 
                                : selectedApplication.calcul_details;
                              
                              return (
                                <Grid container spacing={2}>
                                  <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">Type:</Typography>
                                    <Typography variant="body1">{calculDetails.type || 'N/A'}</Typography>
                                  </Grid>
                                  <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">Palier:</Typography>
                                    <Typography variant="body1">{calculDetails.palier || 'N/A'}</Typography>
                                  </Grid>
                                </Grid>
                              );
                            } catch {
                              return (
                                <Typography variant="body2" color="text.secondary">
                                  {selectedApplication.calcul_details}
                                </Typography>
                              );
                            }
                          })()}
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>

                  <Accordion expanded={expandedAccordion === 'revenus'} onChange={handleAccordionChange('revenus')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LocalAtmIcon color="primary" />
                        <Typography variant="h6">Revenus et Dettes</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Card elevation={2} sx={{ p: 2, backgroundColor: 'info.50' }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Sources de Revenus
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText 
                                  primary="Source principale" 
                                  secondary={selectedApplication.source_revenus || 'N/A'}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Revenus mensuels" 
                                  secondary={formatAmount(selectedApplication.revenus_mensuels || 0)}
                                  secondaryTypographyProps={{ fontWeight: 'bold' }}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Autres revenus" 
                                  secondary={formatAmount(selectedApplication.autres_revenus || 0)}
                                />
                              </ListItem>
                            </List>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Card elevation={2} sx={{ p: 2, backgroundColor: 'warning.50' }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Dettes existantes
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText 
                                  primary="Montant des dettes" 
                                  secondary={formatAmount(selectedApplication.montant_dettes || 0)}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Description des dettes" 
                                  secondary={selectedApplication.description_dette || 'N/A'}
                                />
                              </ListItem>
                            </List>
                          </Card>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion expanded={expandedAccordion === 'banque'} onChange={handleAccordionChange('banque')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AccountBalanceIcon color="primary" />
                        <Typography variant="h6">Informations Bancaires</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <List dense>
                            <ListItem>
                              <ListItemText 
                                primary="Nom de la banque" 
                                secondary={selectedApplication.nom_banque || 'N/A'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Numéro de banque" 
                                secondary={selectedApplication.numero_banque || 'N/A'}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <ContactPhoneIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Contact d'urgence" 
                                secondary={selectedApplication.numero_personne_contact || 'N/A'}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion expanded={expandedAccordion === 'documents'} onChange={handleAccordionChange('documents')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PictureAsPdfIcon color="primary" />
                        <Typography variant="h6">Documents</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {renderDocumentSection()}
                    </AccordionDetails>
                  </Accordion>

                  {/* Tableau d'amortissement */}
                  {showAmortizationTable && (
                    <Accordion expanded={expandedAccordion === 'amortissement'} onChange={handleAccordionChange('amortissement')}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CalculateIcon color="primary" />
                          <Typography variant="h6">Tableau d'Amortissement</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {renderAmortizationTable()}
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {/* Boutons d'action */}
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        if (!showAmortizationTable) {
                          calculateAmortization(selectedApplication);
                        }
                        setShowAmortizationTable(!showAmortizationTable);
                      }}
                      startIcon={<CalculateIcon />}
                    >
                      {showAmortizationTable ? 'Masquer' : 'Afficher'} Tableau d'Amortissement
                    </Button>
                  </Box>

                  {/* Bouton Télécharger PV dans le modal */}
                  {(selectedApplication.statut === 'APPROUVE' || selectedApplication.statut === 'REJETE') && (
                    <Box sx={{ mb: 3, mt: 3 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => handleDownloadPV(selectedApplication.id, selectedApplication.numero_demande)}
                        size="large"
                      >
                        Télécharger le PV Complet
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDetailsDialogOpen(false)}>
                Fermer
              </Button>
            </DialogActions>
          </StyledDialog>

          {/* Modal pour afficher l'image en plein écran */}
          <ImageModal
            open={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={imageModalOpen}>
              <ModalContent>
                <CloseButton onClick={() => setImageModalOpen(false)}>
                  <CloseIcon />
                </CloseButton>
                <DownloadButton onClick={() => {
                  if (selectedImage) {
                    const filename = selectedImage.split('/').pop() || 'document.jpg';
                    handleDownloadImage(selectedImage, filename);
                  }
                }}>
                  <DownloadIcon />
                </DownloadButton>
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="Document agrandi"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '85vh',
                      objectFit: 'contain',
                      display: 'block',
                      margin: '0 auto'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNMjQwIDI0MEg1NjBWNDQwSDI0MFYyNDBaIiBmaWxsPSIjQ0NDQ0NDIi8+PHBhdGggZD0iTTMyMCAyNDBINDgwVjQ0MEgzMjBWMjQwWiIgZmlsbD0iI0UwRTBFMCIvPjx0ZXh0IHg9IjQwMCIgeT0iNTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM4ODg4ODgiPkRvY3VtZW50IG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                )}
              </ModalContent>
            </Fade>
          </ImageModal>

          {/* Modal de Vote */}
          <Dialog open={voteDialogOpen} onClose={() => setVoteDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HowToVoteIcon /> 
                {votingRole ? `Vote ${getRoleName(votingRole)}` : 'Vote'} - Dossier #{selectedApplication?.numero_demande}
              </Typography>
              <Typography variant="body2" color="warning.main">
                ⚠️ Vous ne pouvez voter qu'une seule fois par dossier
              </Typography>
            </DialogTitle>
            <DialogContent>
              {selectedApplication && votingRole && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormLabel>Votre décision:</FormLabel>
                      <RadioGroup
                        value={voteData.opinion}
                        onChange={(e) => setVoteData({...voteData, opinion: e.target.value as 'FAVORABLE' | 'DEFAVORABLE'})}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Paper 
                              sx={{ 
                                p: 2, 
                                cursor: 'pointer',
                                border: 2,
                                borderColor: voteData.opinion === 'FAVORABLE' ? 'success.main' : 'transparent',
                                bgcolor: voteData.opinion === 'FAVORABLE' ? 'success.50' : 'inherit'
                              }}
                              onClick={() => setVoteData({...voteData, opinion: 'FAVORABLE'})}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon color="success" />
                                <Typography fontWeight="bold">Favorable</Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Recommander l'approbation
                              </Typography>
                              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                                Montant & Date requis
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={6}>
                            <Paper 
                              sx={{ 
                                p: 2, 
                                cursor: 'pointer',
                                border: 2,
                                borderColor: voteData.opinion === 'DEFAVORABLE' ? 'error.main' : 'transparent',
                                bgcolor: voteData.opinion === 'DEFAVORABLE' ? 'error.50' : 'inherit'
                              }}
                              onClick={() => setVoteData({...voteData, opinion: 'DEFAVORABLE'})}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CancelIcon color="error" />
                                <Typography fontWeight="bold">Défavorable</Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Recommander le rejet
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </RadioGroup>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Commentaire (obligatoire)"
                        multiline
                        rows={3}
                        value={voteData.commentaire}
                        onChange={(e) => setVoteData({...voteData, commentaire: e.target.value})}
                        placeholder={`Justifiez votre vote en tant que ${getRoleName(votingRole)}...`}
                        required
                        error={!voteData.commentaire}
                        helperText={!voteData.commentaire ? "Ce champ est obligatoire" : ""}
                      />
                    </Grid>

                    {/* Score de risque - seulement pour Chef d'Agence */}
                    {votingRole === 'CHEF_AGENCE' && (
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Score de risque (0-100)"
                          type="number"
                          inputProps={{ min: 0, max: 100 }}
                          value={voteData.score_risque}
                          onChange={(e) => setVoteData({...voteData, score_risque: Number(e.target.value)})}
                          helperText="0 = risque faible, 100 = risque élevé"
                        />
                      </Grid>
                    )}
                    
                    {/* Montant accordé - POUR TOUS LES RÔLES */}
                    <Grid item xs={votingRole === 'CHEF_AGENCE' ? 6 : 12}>
                      <TextField
                        fullWidth
                        label="Montant accordé (FCFA)"
                        type="number"
                        value={voteData.montant_accorde}
                        onChange={(e) => setVoteData({...voteData, montant_accorde: Number(e.target.value)})}
                        required={voteData.opinion === 'FAVORABLE'}
                        error={voteData.opinion === 'FAVORABLE' && (!voteData.montant_accorde || voteData.montant_accorde <= 0)}
                        helperText={
                          voteData.opinion === 'FAVORABLE'
                            ? "Montant obligatoire (supérieur à 0) pour vote favorable"
                            : "Montant (uniquement pour vote favorable)"
                        }
                        InputProps={{
                          startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    {/* Date de déblocage - POUR TOUS LES RÔLES */}
                    <Grid item xs={votingRole === 'CHEF_AGENCE' ? 6 : 12}>
                      <TextField
                        fullWidth
                        label="Date de déblocage"
                        type="date"
                        value={voteData.date_deblocage}
                        onChange={(e) => setVoteData({...voteData, date_deblocage: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                        required={voteData.opinion === 'FAVORABLE'}
                        error={voteData.opinion === 'FAVORABLE' && !voteData.date_deblocage}
                        helperText={
                          voteData.opinion === 'FAVORABLE'
                            ? "Date obligatoire pour vote favorable"
                            : "Date (uniquement pour vote favorable)"
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setVoteDialogOpen(false)}>Annuler</Button>
              <Button 
                variant="contained" 
                color={voteData.opinion === 'FAVORABLE' ? 'success' : 'error'}
                onClick={handleSubmitVote}
                disabled={
                  !voteData.commentaire || 
                  (voteData.opinion === 'FAVORABLE' && 
                    (!voteData.montant_accorde || voteData.montant_accorde <= 0 || !voteData.date_deblocage))
                }
                startIcon={<SendIcon />}
              >
                {votingRole === 'CHEF_AGENCE' ? 'Voter & Générer PV' : 'Soumettre le vote'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default ComiteAgenceDashboard;