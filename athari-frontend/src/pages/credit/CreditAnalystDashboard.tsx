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
  RadioGroup,
  Radio,
  FormLabel,
  LinearProgress,
  CardHeader,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CardMedia,
  Backdrop,
  Fade,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
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
  Event as EventIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Comment as CommentIcon,
  Speed as SpeedIcon,
  Send as SendIcon,
  Close as CloseIcon,
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
  ZoomIn as ZoomInIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Balance as BalanceIcon,
  Scale as ScaleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  CorporateFare as CorporateFareIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  TrendingFlat as TrendingFlatIcon,
  ShowChart as ShowChartIcon,
  AccountTree as AccountTreeIcon,
  Policy as PolicyIcon,
  Verified as VerifiedIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUpAlt as ThumbUpAltIcon,
  ThumbDownAlt as ThumbDownAltIcon,
  NoteAdd as NoteAddIcon,
  Summarize as SummarizeIcon,
  Approval as ApprovalIcon,
  Block as BlockIcon,
  Checklist as ChecklistIcon,
  RequestQuote as RequestQuoteIcon
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
  backgroundColor: theme.palette.background.paper,
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: '1400px',
    width: '95%',
  },
}));

const VoteCard = styled(Card)(({ theme, color }) => ({
  borderLeft: `6px solid ${color || theme.palette.primary.main}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
  backgroundColor: theme.palette.background.default,
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

const StatCard = styled(Card)(({ theme, color }) => ({
  borderTop: `4px solid ${color || theme.palette.primary.main}`,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
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
  agence_info?: {
    nom: string;
    code: string;
    ville: string;
  };
  client_info?: {
    nom: string;
    prenom: string;
    email?: string;
    telephone?: string;
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
  
  // Documents spécifiques DG
  etude_juridique?: string;
  analyse_comptable?: string;
  rapport_risque?: string;
  recommandation_dg?: string;
  
  // Décisions comités précédents
  decision_comite_agence?: string;
  date_decision_comite_agence?: string;
  avis_comite_agence?: any[];
  
  // Avis DG
  avis_dg?: VoteDG[];
  
  // Nouveaux champs
  documents?: any[];
  file_urls?: { [key: string]: string };
  agence?: any;
  user?: any;
  client?: any;
}

interface VoteDG {
  id?: number;
  opinion: 'APPROUVE' | 'REJETE' | 'AJOURNE';
  commentaire: string;
  niveau_avis: 'ASSISTANT_JURIDIQUE' | 'CHEF_COMPTABLE' | 'DIRECTEUR_GENERAL';
  created_at?: string;
  user_info?: {
    name: string;
    role: string;
  };
  montant_accorde?: number;
  date_deblocage?: string;
  score_risque?: number;
  conditions?: string[];
  recommendations?: string;
  delai_revision?: string;
}

interface DocumentItem {
  label: string;
  url: string | null;
  icon: React.ReactNode;
  fieldName: string;
  type: 'field' | 'document';
}

interface RiskIndicator {
  niveau: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'TRES_ELEVE';
  score: number;
  facteurs: string[];
  recommandations: string[];
}

const StatusChip = ({ statut }: { statut: string }) => {
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE_DG': return 'warning';
      case 'EN_COMITE_DG': return 'info';
      case 'APPROUVE_DG': return 'success';
      case 'REJETE_DG': return 'error';
      case 'AJOURNE': return 'secondary';
      case 'MIS_EN_PLACE': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (statut: string) => {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE_DG': '⏳ En attente DG',
      'EN_COMITE_DG': '👨‍💼 En comité DG',
      'APPROUVE_DG': '✅ Approuvé DG',
      'REJETE_DG': '❌ Rejeté DG',
      'AJOURNE': '📅 Ajourné',
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
      sx={{ fontWeight: 600 }}
    />
  );
};

const ComiteDirectionGeneralDashboard = () => {
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
  
  // État pour le vote DG
  const [voteData, setVoteData] = useState({
    opinion: 'APPROUVE' as 'APPROUVE' | 'REJETE' | 'AJOURNE',
    commentaire: '',
    montant_accorde: 0,
    date_deblocage: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    score_risque: 50,
    conditions: [''],
    recommendations: '',
    delai_revision: ''
  });

  // État pour suivre le rôle qui vote
  const [votingRole, setVotingRole] = useState<'ASSISTANT_JURIDIQUE' | 'CHEF_COMPTABLE' | 'DIRECTEUR_GENERAL' | null>(null);

  // États pour les onglets et recherche
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedAgence, setSelectedAgence] = useState<string>('all');
  const [selectedMontant, setSelectedMontant] = useState<string>('all');

  // État pour les décisions récentes
  const [recentDecisions, setRecentDecisions] = useState<Array<{
    applicationId: number;
    applicationNumber: string;
    role: string;
    opinion: string;
    timestamp: string;
    agence: string;
  }>>([]);

  // Nouveaux états pour les détails
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('infoGenerale');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [riskIndicators, setRiskIndicators] = useState<RiskIndicator[]>([]);

  // Fonction pour obtenir les permissions de l'utilisateur
  const getUserPermissions = () => {
    if (!user || !user.roles) {
      return {
        isDirecteurGeneral: false,
        isChefComptable: false,
        isAssistantJuridique: false,
        roles: [] as string[],
        currentUserRole: '',
        userRoleCode: ''
      };
    }

    const userRoles = user.roles || [];
    return {
      isDirecteurGeneral: userRoles.includes("Directeur Général") || userRoles.includes('directeur_general'),
      isChefComptable: userRoles.includes("Chef Comptable") || userRoles.includes('chef_comptable'),
      isAssistantJuridique: userRoles.includes("Assistant Juridique") || userRoles.includes('assistant_juridique'),
      roles: userRoles,
      currentUserRole: userRoles.includes("Directeur Général") ? 'DG' :
        userRoles.includes('Chef Comptable') ? 'CC' :
          userRoles.includes('Assistant Juridique') ? 'AJ' : '',
      userRoleCode: userRoles.includes("Directeur Général") ? 'DIRECTEUR_GENERAL' :
        userRoles.includes('Chef Comptable') ? 'CHEF_COMPTABLE' :
          userRoles.includes('Assistant Juridique') ? 'ASSISTANT_JURIDIQUE' : ''
    };
  };

  const permissions = getUserPermissions();

  // Charger les applications
  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
      const interval = setInterval(loadApplications, 30000); // Rafraîchir toutes les 30 secondes
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, tabValue]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE_URL}/credit-applications/dg`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
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

        // Filtrer selon l'onglet sélectionné
        if (tabValue === 0) {
          filteredApps = allApps.filter((app: Application) =>
            app.statut === 'EN_COMITE_DG' || app.statut === 'EN_ATTENTE_DG'
          );
        } else if (tabValue === 1) {
          filteredApps = allApps.filter((app: Application) =>
            app.statut === 'APPROUVE_DG'
          );
        } else if (tabValue === 2) {
          filteredApps = allApps.filter((app: Application) =>
            app.statut === 'REJETE_DG'
          );
        } else if (tabValue === 3) {
          filteredApps = allApps.filter((app: Application) =>
            app.statut === 'AJOURNE'
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

  // Charger les détails d'une application
  const loadApplicationDetails = async (applicationId: number) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE_URL}/credit-applications/${applicationId}/dg-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (err: any) {
      console.error('Erreur lors du chargement des détails:', err);
      throw err;
    } finally {
      setLoadingDetails(false);
    }
  };

  // Voir les détails
  const handleViewDetails = async (application: Application) => {
    try {
      setError(null);
      setLoadingDetails(true);

      const details = await loadApplicationDetails(application.id);
      
      const mergedDetails: Application = {
        ...application,
        ...details,
      };
      
      setSelectedApplication(mergedDetails);
      setDetailsDialogOpen(true);
      
      // Calculer les indicateurs de risque
      calculateRiskIndicators(mergedDetails);

    } catch (err: any) {
      console.error('Erreur lors du chargement des détails:', err);
      setError(`Impossible de charger les détails: ${err.message}`);
      setSelectedApplication(application);
      setDetailsDialogOpen(true);
    }
  };

  // Vérifier si un utilisateur a déjà voté
  const hasUserGivenOpinion = (application: Application, roleCode: string) => {
    if (!application || !application.avis_dg || !Array.isArray(application.avis_dg)) {
      return false;
    }
    return application.avis_dg.some((avis: VoteDG) => avis.niveau_avis === roleCode);
  };

  // Obtenir le nom du rôle
  const getRoleName = (roleCode: string) => {
    switch (roleCode) {
      case 'DIRECTEUR_GENERAL': return 'Directeur Général';
      case 'CHEF_COMPTABLE': return 'Chef Comptable';
      case 'ASSISTANT_JURIDIQUE': return 'Assistant Juridique';
      default: return roleCode;
    }
  };

  // Obtenir l'icône du rôle
  const getRoleIcon = (roleCode: string) => {
    switch (roleCode) {
      case 'DIRECTEUR_GENERAL': return <AdminPanelSettingsIcon />;
      case 'CHEF_COMPTABLE': return <BalanceIcon />;
      case 'ASSISTANT_JURIDIQUE': return <ScaleIcon />;
      default: return <PersonIcon />;
    }
  };

  // Obtenir la couleur du rôle
  const getRoleColor = (roleCode: string) => {
    switch (roleCode) {
      case 'DIRECTEUR_GENERAL': return 'error';
      case 'CHEF_COMPTABLE': return 'warning';
      case 'ASSISTANT_JURIDIQUE': return 'info';
      default: return 'default';
    }
  };

  // Ouvrir le dialogue de vote
  const handleOpenVoteDialog = (application: Application, roleCode: 'ASSISTANT_JURIDIQUE' | 'CHEF_COMPTABLE' | 'DIRECTEUR_GENERAL') => {
    if (hasUserGivenOpinion(application, roleCode)) {
      setError(`Vous avez déjà donné votre avis pour ce dossier en tant que ${getRoleName(roleCode)}.`);
      return;
    }

    setSelectedApplication(application);
    setVotingRole(roleCode);
    
    setVoteData({
      opinion: 'APPROUVE',
      commentaire: '',
      montant_accorde: application.montant,
      date_deblocage: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      score_risque: 50,
      conditions: [''],
      recommendations: '',
      delai_revision: ''
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
      setError(`Vous avez déjà voté pour ce dossier.`);
      return;
    }

    if (voteData.opinion === 'APPROUVE') {
      if (!voteData.montant_accorde || voteData.montant_accorde <= 0) {
        setError('Pour une approbation, le montant doit être supérieur à 0');
        return;
      }
      if (!voteData.date_deblocage) {
        setError('Pour une approbation, la date de déblocage est requise');
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
        date_deblocage: voteData.date_deblocage || '',
        score_risque: voteData.score_risque,
        recommendations: voteData.recommendations,
        delai_revision: voteData.delai_revision || null
      };

      if (voteData.conditions && voteData.conditions.length > 0 && voteData.conditions[0] !== '') {
        votePayload.conditions = voteData.conditions.filter(c => c.trim() !== '');
      }

      const response = await fetch(`${API_BASE_URL}/credit-applications/${selectedApplication.id}/vote-dg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(votePayload)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Erreur lors de la soumission');
      }

      setRecentDecisions(prev => [{
        applicationId: selectedApplication.id,
        applicationNumber: selectedApplication.numero_demande,
        role: getRoleName(votingRole),
        opinion: voteData.opinion,
        timestamp: new Date().toISOString(),
        agence: selectedApplication.agence_info?.nom || 'Agence'
      }, ...prev.slice(0, 4)]);

      setSuccess(`✅ Avis ${getRoleName(votingRole)} enregistré avec succès!`);
      
      await loadApplications();
      setVoteDialogOpen(false);
      setVotingRole(null);
      setVoteData({
        opinion: 'APPROUVE',
        commentaire: '',
        montant_accorde: 0,
        date_deblocage: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        score_risque: 50,
        conditions: [''],
        recommendations: '',
        delai_revision: ''
      });

      setTimeout(() => setSuccess(null), 5000);

    } catch (err: any) {
      console.error('Erreur lors de la soumission du vote:', err);
      setError(`Erreur: ${err.message}`);
    }
  };

  // Calculer la progression des votes
  const getVoteProgress = (application: Application) => {
    const votes = application.avis_dg || [];
    const required = 3; // Assistant Juridique + Chef Comptable + DG
    return {
      progress: (votes.length / required) * 100,
      votes: votes.length,
      required: required,
      approbations: votes.filter(v => v.opinion === 'APPROUVE').length,
      rejets: votes.filter(v => v.opinion === 'REJETE').length,
      ajournements: votes.filter(v => v.opinion === 'AJOURNE').length,
      hasAssistantJuridique: votes.some(v => v.niveau_avis === 'ASSISTANT_JURIDIQUE'),
      hasChefComptable: votes.some(v => v.niveau_avis === 'CHEF_COMPTABLE'),
      hasDirecteurGeneral: votes.some(v => v.niveau_avis === 'DIRECTEUR_GENERAL')
    };
  };

  // Vérifier si tous les votes sont terminés
  const isVotingComplete = (application: Application) => {
    const progress = getVoteProgress(application);
    return progress.votes >= progress.required;
  };

  // Formater les montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Formater les dates
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

  // Obtenir le nom du client
  const getClientName = (application: Application) => {
    if (application.client_info) {
      return `${application.client_info.nom || ''} ${application.client_info.prenom || ''}`.trim();
    }
    if (application.client) {
      return application.client.full_name || application.client.name || 'Client inconnu';
    }
    return 'Client inconnu';
  };

  // Rafraîchir
  const handleRefresh = () => {
    loadApplications();
  };

  // Calculer les indicateurs de risque
  const calculateRiskIndicators = (application: Application) => {
    const indicators: RiskIndicator[] = [];
    
    // Indicateur financier
    const ratioDette = application.montant_dettes ? (application.montant_dettes / (application.revenus_mensuels || 1)) : 0;
    let scoreFinancier = 100 - Math.min(100, ratioDette * 100);
    
    indicators.push({
      niveau: scoreFinancier > 70 ? 'FAIBLE' : scoreFinancier > 40 ? 'MOYEN' : scoreFinancier > 20 ? 'ELEVE' : 'TRES_ELEVE',
      score: Math.round(scoreFinancier),
      facteurs: [
        `Ratio dette/revenus: ${ratioDette.toFixed(2)}`,
        `Montant demande: ${formatAmount(application.montant)}`,
        `Durée: ${application.duree} jours`
      ],
      recommandations: [
        ratioDette > 1 ? 'Réduire le montant demandé' : 'Niveau acceptable',
        'Vérifier la stabilité des revenus'
      ]
    });
    
    // Indicateur juridique
    const hasGarantie = !!application.garantie && application.garantie !== 'N/A';
    const scoreJuridique = hasGarantie ? 80 : 30;
    
    indicators.push({
      niveau: hasGarantie ? 'FAIBLE' : 'ELEVE',
      score: scoreJuridique,
      facteurs: [
        `Garantie: ${application.garantie || 'Aucune'}`,
        `Plan épargne: ${application.plan_epargne ? 'Oui' : 'Non'}`
      ],
      recommandations: [
        hasGarantie ? 'Garantie acceptable' : 'Exiger une garantie supplémentaire',
        'Vérifier les documents juridiques'
      ]
    });
    
    setRiskIndicators(indicators);
  };

  // Obtenir la couleur du niveau de risque
  const getRiskColor = (niveau: string) => {
    switch (niveau) {
      case 'FAIBLE': return 'success';
      case 'MOYEN': return 'warning';
      case 'ELEVE': return 'error';
      case 'TRES_ELEVE': return 'error';
      default: return 'default';
    }
  };

  // Filtrer les applications
  const filteredApplications = applications.filter(app => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        app.numero_demande.toLowerCase().includes(term) ||
        getClientName(app).toLowerCase().includes(term) ||
        app.agence_info?.nom.toLowerCase().includes(term) ||
        formatAmount(app.montant).toLowerCase().includes(term)
      );
    }
    
    if (selectedAgence !== 'all' && app.agence_info?.code !== selectedAgence) {
      return false;
    }
    
    if (selectedMontant !== 'all') {
      const montant = app.montant;
      switch (selectedMontant) {
        case 'small': return montant <= 5000000;
        case 'medium': return montant > 5000000 && montant <= 20000000;
        case 'large': return montant > 20000000;
        default: return true;
      }
    }
    
    return true;
  });

  // Statistiques
  const stats = {
    enComite: applications.filter(app => app.statut === 'EN_COMITE_DG' || app.statut === 'EN_ATTENTE_DG').length,
    approuves: applications.filter(app => app.statut === 'APPROUVE_DG').length,
    rejetes: applications.filter(app => app.statut === 'REJETE_DG').length,
    ajournes: applications.filter(app => app.statut === 'AJOURNE').length,
    total: applications.length
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
          <Container maxWidth="xl" sx={{ py: 4, flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={60} />
            <Typography sx={{ mt: 3 }}>
              Chargement des dossiers...
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
        <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
          {/* En-tête */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CorporateFareIcon fontSize="large" />
                Comité Direction Générale
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {permissions.currentUserRole === 'DG' && "👑 Directeur Général"}
                {permissions.currentUserRole === 'CC' && "💰 Chef Comptable"}
                {permissions.currentUserRole === 'AJ' && "⚖️ Assistant Juridique"}
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

          {/* Cartes de statistiques */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard color="#2196F3">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" color="info.main" sx={{ mb: 1 }}>
                    {stats.enComite}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En comité DG
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard color="#4CAF50">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" color="success.main" sx={{ mb: 1 }}>
                    {stats.approuves}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approuvés DG
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard color="#F44336">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" color="error.main" sx={{ mb: 1 }}>
                    {stats.rejetes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejetés DG
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard color="#9E9E9E">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" color="text.secondary" sx={{ mb: 1 }}>
                    {stats.ajournes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajournés
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Décisions récentes */}
          {recentDecisions.length > 0 && (
            <StyledPaper sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon /> Décisions Récentes
              </Typography>
              <Grid container spacing={2}>
                {recentDecisions.map((decision, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <VoteCard 
                      color={decision.opinion === 'APPROUVE' ? '#4caf50' : decision.opinion === 'REJETE' ? '#f44336' : '#9e9e9e'}
                      sx={{ height: '100%' }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {decision.opinion === 'APPROUVE' ? 
                              <ThumbUpIcon color="success" fontSize="small" /> : 
                              decision.opinion === 'REJETE' ?
                              <ThumbDownIcon color="error" fontSize="small" /> :
                              <ScheduleIcon color="disabled" fontSize="small" />
                            }
                            <Typography variant="subtitle2" fontWeight="bold">
                              {decision.role}
                            </Typography>
                          </Box>
                          <IconButton 
                            size="small" 
                            onClick={() => setRecentDecisions(prev => prev.filter((_, i) => i !== index))}
                            sx={{ mt: -1, mr: -1 }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Dossier: {decision.applicationNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Agence: {decision.agence}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {formatDate(decision.timestamp)}
                        </Typography>
                        <Chip 
                          label={decision.opinion === 'APPROUVE' ? 'Approuvé' : decision.opinion === 'REJETE' ? 'Rejeté' : 'Ajourné'}
                          color={decision.opinion === 'APPROUVE' ? 'success' : decision.opinion === 'REJETE' ? 'error' : 'default'}
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

          {/* Filtres */}
          <StyledPaper sx={{ mb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  placeholder="Rechercher dossier, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filtrer par agence</InputLabel>
                  <Select
                    value={selectedAgence}
                    label="Filtrer par agence"
                    onChange={(e) => setSelectedAgence(e.target.value)}
                  >
                    <MenuItem value="all">Toutes les agences</MenuItem>
                    {/* Les options d'agence seraient chargées dynamiquement */}
                    <MenuItem value="AG001">Agence Principale</MenuItem>
                    <MenuItem value="AG002">Agence Secondaire</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filtrer par montant</InputLabel>
                  <Select
                    value={selectedMontant}
                    label="Filtrer par montant"
                    onChange={(e) => setSelectedMontant(e.target.value)}
                  >
                    <MenuItem value="all">Tous les montants</MenuItem>
                    <MenuItem value="small">≤ 5M FCFA</MenuItem>
                    <MenuItem value="medium">5M - 20M FCFA</MenuItem>
                    <MenuItem value="large">≥ 20M FCFA</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedAgence('all');
                    setSelectedMontant('all');
                  }}
                >
                  Réinitialiser filtres
                </Button>
              </Grid>
            </Grid>

            {/* Onglets */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
                <Tab label={`En Comité DG (${stats.enComite})`} />
                <Tab label={`Approuvés DG (${stats.approuves})`} />
                <Tab label={`Rejetés DG (${stats.rejetes})`} />
                <Tab label={`Ajournés (${stats.ajournes})`} />
              </Tabs>
            </Box>

            {/* Tableau principal */}
            {filteredApplications.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>N° Demande</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Client</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Agence</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Montant</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Décision Comité Agence</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Progression DG</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center" width="500">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredApplications.map((app) => {
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
                              <Box>
                                <Typography variant="body2">
                                  {getClientName(app)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {app.client_info?.telephone || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <BusinessIcon fontSize="small" color="primary" />
                              <Typography variant="body2">
                                {app.agence_info?.nom || 'Agence'}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {app.agence_info?.ville || ''}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {formatAmount(app.montant)}
                            <Typography variant="caption" color="text.secondary" display="block">
                              {app.duree} jours
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {app.decision_comite_agence ? (
                              <Chip
                                label={app.decision_comite_agence}
                                color={app.decision_comite_agence === 'APPROUVE' ? 'success' : 'error'}
                                size="small"
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Non disponible
                              </Typography>
                            )}
                            {app.date_decision_comite_agence && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {formatDate(app.date_decision_comite_agence)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ width: '100%' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={progress.progress} 
                                color={progress.approbations >= 2 ? 'success' : progress.progress > 66 ? 'warning' : 'primary'}
                                sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {progress.votes}/3 votes • {progress.approbations} approbation(s)
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <StatusChip statut={app.statut} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                              {/* Bouton Voir détails */}
                              <Tooltip title="Voir les détails complets">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleViewDetails(app)}
                                  size="small"
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>

                              {/* Boutons de vote pour chaque rôle */}
                              {tabValue === 0 && (
                                <>
                                  {/* Assistant Juridique */}
                                  {!progress.hasAssistantJuridique && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="info"
                                      onClick={() => handleOpenVoteDialog(app, 'ASSISTANT_JURIDIQUE')}
                                      startIcon={<ScaleIcon />}
                                      sx={{ minWidth: 160 }}
                                    >
                                      Avis Juridique
                                    </Button>
                                  )}

                                  {/* Chef Comptable */}
                                  {!progress.hasChefComptable && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="warning"
                                      onClick={() => handleOpenVoteDialog(app, 'CHEF_COMPTABLE')}
                                      startIcon={<BalanceIcon />}
                                      sx={{ minWidth: 160 }}
                                    >
                                      Avis Comptable
                                    </Button>
                                  )}

                                  {/* Directeur Général */}
                                  {!progress.hasDirecteurGeneral && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="error"
                                      onClick={() => handleOpenVoteDialog(app, 'DIRECTEUR_GENERAL')}
                                      startIcon={<AdminPanelSettingsIcon />}
                                      sx={{ minWidth: 160 }}
                                    >
                                      Décision DG
                                    </Button>
                                  )}
                                </>
                              )}

                              {/* Afficher les avis déjà donnés */}
                              {progress.hasAssistantJuridique && (
                                <Chip
                                  icon={<ScaleIcon />}
                                  label="Juridique: ✅"
                                  color="info"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              {progress.hasChefComptable && (
                                <Chip
                                  icon={<BalanceIcon />}
                                  label="Comptable: ✅"
                                  color="warning"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              {progress.hasDirecteurGeneral && (
                                <Chip
                                  icon={<AdminPanelSettingsIcon />}
                                  label="DG: ✅"
                                  color="error"
                                  variant="outlined"
                                  size="small"
                                />
                              )}

                              {/* Bouton Télécharger PV pour les dossiers terminés */}
                              {isComplete && (
                                <Tooltip title="Télécharger procès-verbal">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<PictureAsPdfIcon />}
                                    onClick={() => console.log('Download PV DG', app.id)}
                                    sx={{ minWidth: 160 }}
                                  >
                                    PV DG
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
                <CorporateFareIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucun dossier trouvé
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || selectedAgence !== 'all' || selectedMontant !== 'all'
                    ? "Aucun dossier ne correspond à vos critères de recherche."
                    : "Aucun dossier n'est actuellement en attente de décision."}
                </Typography>
              </Box>
            )}
          </StyledPaper>

          {/* Modal Détails Application */}
          <StyledDialog
            open={detailsDialogOpen}
            onClose={() => setDetailsDialogOpen(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, backgroundColor: 'primary.main', color: 'white' }}>
              <DescriptionIcon />
              Détails Complet - Dossier #{selectedApplication?.numero_demande}
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
                  {/* Section Décision Comité Agence */}
                  {selectedApplication.decision_comite_agence && (
                    <Card sx={{ mb: 3, borderLeft: '6px solid', borderColor: 'primary.main' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon />
                          Décision du Comité d'Agence
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Décision:</Typography>
                            <Chip
                              label={selectedApplication.decision_comite_agence}
                              color={selectedApplication.decision_comite_agence === 'APPROUVE' ? 'success' : 'error'}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Date:</Typography>
                            <Typography variant="body1">
                              {formatDate(selectedApplication.date_decision_comite_agence || '')}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}

                  {/* Section Progression Comité DG */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        État des Avis - Comité Direction Générale
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Progression
                        </Typography>
                        <Chip 
                          label={`${getVoteProgress(selectedApplication).votes}/3 avis`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getVoteProgress(selectedApplication).progress} 
                        color={getVoteProgress(selectedApplication).approbations >= 2 ? 'success' : 'primary'}
                        sx={{ height: 10, borderRadius: 5, mb: 3 }}
                      />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Chip 
                              icon={<ScaleIcon />}
                              label="Juridique"
                              color={getVoteProgress(selectedApplication).hasAssistantJuridique ? 'info' : 'default'}
                              variant={getVoteProgress(selectedApplication).hasAssistantJuridique ? 'filled' : 'outlined'}
                              size="medium"
                              sx={{ mb: 1 }}
                            />
                            {getVoteProgress(selectedApplication).hasAssistantJuridique && (
                              <Typography variant="caption" color="text.secondary">
                                Avis donné
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Chip 
                              icon={<BalanceIcon />}
                              label="Comptable"
                              color={getVoteProgress(selectedApplication).hasChefComptable ? 'warning' : 'default'}
                              variant={getVoteProgress(selectedApplication).hasChefComptable ? 'filled' : 'outlined'}
                              size="medium"
                              sx={{ mb: 1 }}
                            />
                            {getVoteProgress(selectedApplication).hasChefComptable && (
                              <Typography variant="caption" color="text.secondary">
                                Avis donné
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Chip 
                              icon={<AdminPanelSettingsIcon />}
                              label="Direction Générale"
                              color={getVoteProgress(selectedApplication).hasDirecteurGeneral ? 'error' : 'default'}
                              variant={getVoteProgress(selectedApplication).hasDirecteurGeneral ? 'filled' : 'outlined'}
                              size="medium"
                              sx={{ mb: 1 }}
                            />
                            {getVoteProgress(selectedApplication).hasDirecteurGeneral && (
                              <Typography variant="caption" color="text.secondary">
                                Décision prise
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Avis DG enregistrés */}
                  {selectedApplication.avis_dg && selectedApplication.avis_dg.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Avis du Comité DG Enregistrés
                      </Typography>
                      <Stack spacing={2}>
                        {selectedApplication.avis_dg.map((vote: VoteDG, index: number) => (
                          <VoteCard 
                            key={index} 
                            color={
                              vote.opinion === 'APPROUVE' ? '#4caf50' : 
                              vote.opinion === 'REJETE' ? '#f44336' : '#9e9e9e'
                            }
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
                                  label={vote.opinion === 'APPROUVE' ? 'Approuvé' : vote.opinion === 'REJETE' ? 'Rejeté' : 'Ajourné'}
                                  color={vote.opinion === 'APPROUVE' ? 'success' : vote.opinion === 'REJETE' ? 'error' : 'default'}
                                  size="small"
                                />
                              </Box>
                              <Typography variant="body2" color="text.primary" paragraph>
                                {vote.commentaire}
                              </Typography>
                              
                              {vote.score_risque !== undefined && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <ShowChartIcon fontSize="small" />
                                  <Typography variant="caption">
                                    Score risque: <strong>{vote.score_risque}/100</strong>
                                  </Typography>
                                </Box>
                              )}
                              
                              {vote.montant_accorde !== undefined && vote.montant_accorde > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <AttachMoneyIcon fontSize="small" />
                                  <Typography variant="caption">
                                    Montant accordé: <strong>{formatAmount(vote.montant_accorde)}</strong>
                                  </Typography>
                                </Box>
                              )}
                              
                              {vote.date_deblocage && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <EventIcon fontSize="small" />
                                  <Typography variant="caption">
                                    Date déblocage: <strong>{vote.date_deblocage}</strong>
                                  </Typography>
                                </Box>
                              )}
                              
                              {vote.delai_revision && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <ScheduleIcon fontSize="small" />
                                  <Typography variant="caption">
                                    Délai révision: <strong>{vote.delai_revision}</strong>
                                  </Typography>
                                </Box>
                              )}
                              
                              {vote.conditions && vote.conditions.length > 0 && vote.conditions[0] !== '' && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="caption" fontWeight="bold" display="block">
                                    Conditions:
                                  </Typography>
                                  <List dense>
                                    {vote.conditions.map((condition, idx) => (
                                      <ListItem key={idx} sx={{ py: 0 }}>
                                        <ListItemIcon sx={{ minWidth: 30 }}>
                                          <ChecklistIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={condition} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}
                              
                              {vote.created_at && (
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(vote.created_at)}
                                </Typography>
                              )}
                            </CardContent>
                          </VoteCard>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Indicateurs de risque */}
                  {riskIndicators.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssessmentIcon />
                        Analyse de Risque
                      </Typography>
                      <Grid container spacing={2}>
                        {riskIndicators.map((indicator, index) => (
                          <Grid item xs={12} md={4} key={index}>
                            <Card elevation={2}>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {index === 0 ? 'Risque Financier' : 
                                     index === 1 ? 'Risque Juridique' : 'Risque Global'}
                                  </Typography>
                                  <Chip
                                    label={indicator.niveau}
                                    color={getRiskColor(indicator.niveau) as any}
                                    size="small"
                                  />
                                </Box>
                                
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Score: {indicator.score}/100
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={indicator.score}
                                    color={getRiskColor(indicator.niveau) as any}
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                                
                                <Typography variant="body2" fontWeight="bold" gutterBottom>
                                  Facteurs:
                                </Typography>
                                <List dense>
                                  {indicator.facteurs.map((facteur, idx) => (
                                    <ListItem key={idx} sx={{ py: 0.5 }}>
                                      <ListItemText 
                                        primary={facteur}
                                        primaryTypographyProps={{ variant: 'caption' }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                                
                                <Typography variant="body2" fontWeight="bold" gutterBottom sx={{ mt: 1 }}>
                                  Recommandations:
                                </Typography>
                                <List dense>
                                  {indicator.recommandations.map((recommandation, idx) => (
                                    <ListItem key={idx} sx={{ py: 0.5 }}>
                                      <ListItemIcon sx={{ minWidth: 30 }}>
                                        <PolicyIcon fontSize="small" />
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary={recommandation}
                                        primaryTypographyProps={{ variant: 'caption' }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Informations principales */}
                  <Accordion expanded={expandedAccordion === 'infoGenerale'} onChange={(e, expanded) => setExpandedAccordion(expanded ? 'infoGenerale' : false)}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <InfoIcon color="primary" />
                        <Typography variant="h6">Informations Générales</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Informations Client
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Nom complet:</Typography>
                                  <Typography variant="body1">{getClientName(selectedApplication)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Téléphone:</Typography>
                                  <Typography variant="body1">{selectedApplication.client_info?.telephone || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                                  <Typography variant="body1">{selectedApplication.client_info?.email || 'N/A'}</Typography>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Informations Agence
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Agence:</Typography>
                                  <Typography variant="body1">{selectedApplication.agence_info?.nom || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Ville:</Typography>
                                  <Typography variant="body1">{selectedApplication.agence_info?.ville || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary">Code agence:</Typography>
                                  <Typography variant="body1">{selectedApplication.agence_info?.code || 'N/A'}</Typography>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Détails du Crédit
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6} md={3}>
                                  <Typography variant="body2" color="text.secondary">Type crédit:</Typography>
                                  <Typography variant="body1">{selectedApplication.credit_type_info?.description || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Typography variant="body2" color="text.secondary">Montant:</Typography>
                                  <Typography variant="body1" fontWeight="bold" color="primary.main">
                                    {formatAmount(selectedApplication.montant)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Typography variant="body2" color="text.secondary">Durée:</Typography>
                                  <Typography variant="body1">{selectedApplication.duree} jours</Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Typography variant="body2" color="text.secondary">Taux intérêt:</Typography>
                                  <Typography variant="body1">{selectedApplication.taux_interet}%</Typography>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDetailsDialogOpen(false)}>
                Fermer
              </Button>
            </DialogActions>
          </StyledDialog>

          {/* Modal de Vote DG */}
          <Dialog open={voteDialogOpen} onClose={() => setVoteDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {votingRole === 'DIRECTEUR_GENERAL' ? <AdminPanelSettingsIcon /> : 
                 votingRole === 'CHEF_COMPTABLE' ? <BalanceIcon /> : <ScaleIcon />}
                {votingRole ? `Avis ${getRoleName(votingRole)}` : 'Avis'} - Dossier #{selectedApplication?.numero_demande}
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
                        onChange={(e) => setVoteData({...voteData, opinion: e.target.value as 'APPROUVE' | 'REJETE' | 'AJOURNE'})}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Paper 
                              sx={{ 
                                p: 2, 
                                cursor: 'pointer',
                                border: 2,
                                borderColor: voteData.opinion === 'APPROUVE' ? 'success.main' : 'transparent',
                                bgcolor: voteData.opinion === 'APPROUVE' ? 'success.50' : 'inherit'
                              }}
                              onClick={() => setVoteData({...voteData, opinion: 'APPROUVE'})}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon color="success" />
                                <Typography fontWeight="bold">Approuver</Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Accorder le crédit
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={4}>
                            <Paper 
                              sx={{ 
                                p: 2, 
                                cursor: 'pointer',
                                border: 2,
                                borderColor: voteData.opinion === 'REJETE' ? 'error.main' : 'transparent',
                                bgcolor: voteData.opinion === 'REJETE' ? 'error.50' : 'inherit'
                              }}
                              onClick={() => setVoteData({...voteData, opinion: 'REJETE'})}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CancelIcon color="error" />
                                <Typography fontWeight="bold">Rejeter</Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Refuser le crédit
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={4}>
                            <Paper 
                              sx={{ 
                                p: 2, 
                                cursor: 'pointer',
                                border: 2,
                                borderColor: voteData.opinion === 'AJOURNE' ? 'warning.main' : 'transparent',
                                bgcolor: voteData.opinion === 'AJOURNE' ? 'warning.50' : 'inherit'
                              }}
                              onClick={() => setVoteData({...voteData, opinion: 'AJOURNE'})}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ScheduleIcon color="warning" />
                                <Typography fontWeight="bold">Ajourner</Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Demander plus d'informations
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </RadioGroup>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Commentaire détaillé (obligatoire)"
                        multiline
                        rows={4}
                        value={voteData.commentaire}
                        onChange={(e) => setVoteData({...voteData, commentaire: e.target.value})}
                        placeholder={`Justifiez votre décision en tant que ${getRoleName(votingRole)}...`}
                        required
                        error={!voteData.commentaire}
                        helperText={!voteData.commentaire ? "Ce champ est obligatoire" : ""}
                      />
                    </Grid>

                    {/* Champs spécifiques selon le rôle */}
                    {votingRole === 'CHEF_COMPTABLE' && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Analyse comptable détaillée"
                          multiline
                          rows={3}
                          value={voteData.recommendations}
                          onChange={(e) => setVoteData({...voteData, recommendations: e.target.value})}
                          placeholder="Analyse des ratios financiers, capacité de remboursement..."
                        />
                      </Grid>
                    )}

                    {votingRole === 'ASSISTANT_JURIDIQUE' && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Conditions juridiques (une par ligne)"
                          multiline
                          rows={3}
                          value={voteData.conditions.join('\n')}
                          onChange={(e) => setVoteData({...voteData, conditions: e.target.value.split('\n')})}
                          placeholder="Exiger une garantie supplémentaire...\nVérifier les documents originaux..."
                        />
                      </Grid>
                    )}

                    {/* Score de risque */}
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Score de risque (0-100)"
                        type="number"
                        inputProps={{ min: 0, max: 100 }}
                        value={voteData.score_risque}
                        onChange={(e) => setVoteData({...voteData, score_risque: Number(e.target.value)})}
                        helperText="Évaluation du risque global"
                      />
                    </Grid>

                    {/* Champs pour approbation */}
                    {voteData.opinion === 'APPROUVE' && (
                      <>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Montant accordé (FCFA)"
                            type="number"
                            value={voteData.montant_accorde}
                            onChange={(e) => setVoteData({...voteData, montant_accorde: Number(e.target.value)})}
                            required
                            error={!voteData.montant_accorde || voteData.montant_accorde <= 0}
                            helperText="Montant définitif à accorder"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Date de déblocage"
                            type="date"
                            value={voteData.date_deblocage}
                            onChange={(e) => setVoteData({...voteData, date_deblocage: e.target.value})}
                            InputLabelProps={{ shrink: true }}
                            required
                            error={!voteData.date_deblocage}
                            helperText="Date effective de déblocage des fonds"
                          />
                        </Grid>
                      </>
                    )}

                    {/* Délai de révision pour ajournement */}
                    {voteData.opinion === 'AJOURNE' && (
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Délai de révision"
                          type="date"
                          value={voteData.delai_revision}
                          onChange={(e) => setVoteData({...voteData, delai_revision: e.target.value})}
                          InputLabelProps={{ shrink: true }}
                          helperText="Date limite pour la révision du dossier"
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setVoteDialogOpen(false)}>Annuler</Button>
              <Button 
                variant="contained" 
                color={
                  voteData.opinion === 'APPROUVE' ? 'success' : 
                  voteData.opinion === 'REJETE' ? 'error' : 'warning'
                }
                onClick={handleSubmitVote}
                disabled={
                  !voteData.commentaire || 
                  (voteData.opinion === 'APPROUVE' && 
                    (!voteData.montant_accorde || voteData.montant_accorde <= 0 || !voteData.date_deblocage))
                }
                startIcon={<SendIcon />}
              >
                {votingRole === 'DIRECTEUR_GENERAL' ? 'Prendre décision' : 'Soumettre avis'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default ComiteDirectionGeneralDashboard;