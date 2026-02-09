
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
  Divider,
  CircularProgress,
  TextField,
  Tabs,
  Tab,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Backdrop,
  Fade
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  ThumbUp as ThumbUpIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  Notes as NotesIcon,
  Calculate as CalculateIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  AccountBalance as AccountBalanceIcon,
  MonetizationOn as MonetizationOnIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Photo as PhotoIcon,
  LocationOn as LocationOnIcon,
  Description as DescriptionIcon2,
  Receipt as ReceiptIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  ContactPhone as ContactPhoneIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Apartment as ApartmentIcon,
  CreditCard as CreditCardIcon,
  Assignment as AssignmentIcon,
  LocalAtm as LocalAtmIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: '1200px',
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

interface StatusChipProps {
  statut: string;
}

const StatusChip: React.FC<StatusChipProps> = ({ statut }) => {
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'SOUMIS': return 'warning';
      case 'CA_VALIDE': return 'info';
      case 'ASC_VALIDE': return 'primary';
      case 'COMITE': return 'secondary';
      case 'APPROUVE': return 'success';
      case 'REJETE': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (statut: string) => {
    const labels: { [key: string]: string } = {
      'SOUMIS': '⏳ En attente CA',
      'CA_VALIDE': '✅ CA Validé - En attente ASC',
      'ASC_VALIDE': '✅ ASC Validé - Comité',
      'COMITE': '🔄 Comité en cours',
      'APPROUVE': '✅ Approuvé',
      'REJETE': '❌ Rejeté',
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

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  profession: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: number;
  client_code: string;
  full_name: string;
  cin: string;
  phone: string;
  email: string;
  address: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  profession: string;
  monthly_income: number;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: number;
  name: string;
  file_path: string;
  document_type: string;
  created_at: string;
  url?: string;
}

interface Application {
  id: number;
  numero_demande: string;
  user_id: number;
  client_id: number;
  compte_id: string;
  credit_type_id: string;
  montant: string;
  duree: string;
  taux_interet: number;
  interet_total: number;
  frais_dossier: number;
  frais_etude: number;
  montant_total: number;
  penalite_par_jour: number;
  calcul_details: string;
  date_demande: string;
  source_revenus: string;
  revenus_mensuels: string;
  autres_revenus: string;
  montant_dettes: string;
  description_dette: string;
  nom_banque: string;
  numero_banque: string;
  numero_personne_contact: string;
  observation: string;
  urgence: string;
  garantie: string;
  plan_epargne: boolean;
  statut: string;
  
  // Nested data
  user?: User;
  client?: Client;
  documents?: Document[];
  file_urls?: { [key: string]: string };
  
  // For backward compatibility
  [key: string]: any;
}

interface CreditType {
  id: number;
  description: string;
}

interface Opinion {
  opinion: string;
  commentaire: string;
  niveau_avis: string;
}

interface DocumentItem {
  label: string;
  url: string | null;
  icon: React.ReactNode;
  fieldName: string;
  type: 'field' | 'document';
  document?: Document;
}

const ChefAgenceDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [creditTypes, setCreditTypes] = useState<CreditType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [opinionDialogOpen, setOpinionDialogOpen] = useState(false);
  const [currentOpinion, setCurrentOpinion] = useState<Opinion>({
    opinion: '',
    commentaire: '',
    niveau_avis: 'CHEF_AGENCE'
  });
  const [tabValue, setTabValue] = useState(0);
  const [amortizationData, setAmortizationData] = useState<any[]>([]);
  const [showAmortizationTable, setShowAmortizationTable] = useState(false);
  const [submittingOpinion, setSubmittingOpinion] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('infoGenerale');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  // Liste des champs de documents potentiels dans l'application
  const documentFields = [
    // Documents personnels
    { field: 'demande_credit_img', label: 'Demande de crédit', icon: <AssignmentIcon /> },
    { field: 'photocopie_cni', label: 'Photocopie CNI', icon: <PersonIcon /> },
    { field: 'lettre_non_remboursement', label: 'Lettre de non remboursement', icon: <ReceiptIcon /> },
    
    // Documents domicile
    { field: 'plan_localisation_domicile', label: 'Plan localisation domicile', icon: <LocationOnIcon /> },
    { field: 'description_domicile', label: 'Description domicile', icon: <DescriptionIcon2 /> },
    { field: 'geolocalisation_domicile', label: 'Géolocalisation domicile', icon: <LocationOnIcon /> },
    { field: 'photo_domicile_1', label: 'Photo domicile 1', icon: <PhotoIcon /> },
    { field: 'photo_domicile_2', label: 'Photo domicile 2', icon: <PhotoIcon /> },
    { field: 'photo_domicile_3', label: 'Photo domicile 3', icon: <PhotoIcon /> },
    
    // Documents activité
    { field: 'description_activite', label: 'Description activité', icon: <WorkIcon /> },
    { field: 'geolocalisation_img', label: 'Géolocalisation activité', icon: <LocationOnIcon /> },
    { field: 'photo_activite_1', label: 'Photo activité 1', icon: <PhotoIcon /> },
    { field: 'photo_activite_2', label: 'Photo activité 2', icon: <PhotoIcon /> },
    { field: 'photo_activite_3', label: 'Photo activité 3', icon: <PhotoIcon /> },
    
    // Documents supplémentaires du file_urls
    { field: 'photo_4x4', label: 'Photo 4x4', icon: <PersonIcon /> },
    { field: 'plan_localisation', label: 'Plan localisation', icon: <LocationOnIcon /> },
    { field: 'facture_electricite', label: 'Facture électricité', icon: <ReceiptIcon /> },
    { field: 'casier_judiciaire', label: 'Casier judiciaire', icon: <SecurityIcon /> },
    { field: 'historique_compte', label: 'Historique compte', icon: <HistoryIcon /> },
    { field: 'plan_localisation_activite_img', label: 'Plan localisation activité', icon: <LocationOnIcon /> },
    { field: 'photo_activite_img', label: 'Photo activité', icon: <PhotoIcon /> },
  ];

  // Fonction pour construire l'URL correcte des documents
  const getDocumentUrl = (path: string | null | undefined): string | null => {
    if (!path || path === 'N/A' || path === 'null' || path === 'undefined' || path.trim() === '') {
      return null;
    }
    
    // Si l'URL commence déjà par http ou https, la retourner telle quelle
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Si c'est un chemin de stockage Laravel (commence par storage/)
    if (path.startsWith('storage/')) {
      return `${API_BASE_URL}/${path}`;
    }
    
    // Si c'est un chemin relatif (commence par /storage)
    if (path.startsWith('/storage')) {
      return `${API_BASE_URL}${path}`;
    }
    
    // Pour les autres chemins, on suppose que c'est un chemin dans storage
    return `${API_BASE_URL}/storage/${path.replace(/^\/+/, '')}`;
  };

  // Fonction pour récupérer tous les documents disponibles
  const getAvailableDocuments = (application: Application | null): DocumentItem[] => {
    if (!application) return [];

    const documents: DocumentItem[] = [];

    // 1. Récupérer les documents du tableau documents (si existant)
    if (application.documents && Array.isArray(application.documents)) {
      application.documents.forEach((doc: Document) => {
        if (doc.file_path && getDocumentUrl(doc.file_path)) {
          documents.push({
            label: doc.name || doc.document_type || 'Document',
            url: doc.file_path,
            icon: getIconForDocumentType(doc.document_type || doc.name),
            fieldName: doc.document_type || 'document',
            type: 'document',
            document: doc
          });
        }
      });
    }

    // 2. Récupérer tous les documents des champs principaux
    documentFields.forEach(docField => {
      let url: string | null = null;
      
      // Vérifier d'abord dans file_urls si c'est un champ de file_urls
      if (application.file_urls && application.file_urls[docField.field as keyof typeof application.file_urls]) {
        url = application.file_urls[docField.field as keyof typeof application.file_urls] as string;
      }
      // Sinon vérifier dans les champs principaux de l'application
      else if (application[docField.field]) {
        url = application[docField.field];
      }
      
      const fullUrl = getDocumentUrl(url);
      if (fullUrl) {
        // Vérifier si ce document n'a pas déjà été ajouté via documents[]
        const alreadyAdded = documents.some(doc => 
          doc.type === 'document' && doc.url === url
        );
        
        if (!alreadyAdded) {
          documents.push({
            label: docField.label,
            url: url,
            icon: docField.icon,
            fieldName: docField.field,
            type: 'field'
          });
        }
      }
    });

    // 3. Rechercher dynamiquement d'autres champs qui pourraient être des documents
    Object.keys(application).forEach(key => {
      // Si c'est un champ qui contient "img", "photo", "image", "plan", "cni", "facture", etc.
      if (key.toLowerCase().includes('img') || 
          key.toLowerCase().includes('photo') || 
          key.toLowerCase().includes('image') ||
          key.toLowerCase().includes('plan') ||
          key.toLowerCase().includes('cni') ||
          key.toLowerCase().includes('facture') ||
          key.toLowerCase().includes('casier') ||
          key.toLowerCase().includes('historique') ||
          key.toLowerCase().includes('lettre') ||
          key.toLowerCase().includes('description')) {
        
        const value = application[key];
        if (typeof value === 'string' && value && getDocumentUrl(value)) {
          // Vérifier si ce document n'a pas déjà été ajouté
          const alreadyAdded = documents.some(doc => 
            (doc.type === 'field' && doc.fieldName === key) ||
            (doc.type === 'document' && doc.url === value)
          );
          
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

  // Fonction pour obtenir l'icône appropriée selon le type de document
  const getIconForDocumentType = (fieldName: string): React.ReactNode => {
    const lowerField = fieldName.toLowerCase();
    
    if (lowerField.includes('photo') || lowerField.includes('img') || lowerField.includes('image')) {
      return <PhotoIcon />;
    }
    if (lowerField.includes('plan') || lowerField.includes('localisation')) {
      return <LocationOnIcon />;
    }
    if (lowerField.includes('cni') || lowerField.includes('identite')) {
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
    if (lowerField.includes('description')) {
      return <DescriptionIcon2 />;
    }
    if (lowerField.includes('activite') || lowerField.includes('work')) {
      return <WorkIcon />;
    }
    if (lowerField.includes('demande') || lowerField.includes('credit')) {
      return <AssignmentIcon />;
    }
    
    return <FileIcon />;
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

  useEffect(() => {
    checkApiStatus();
    loadApplications();
    loadCreditTypes();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        setApiStatus('success');
      } else {
        setApiStatus('error');
      }
    } catch (err) {
      setApiStatus('error');
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/credit-applications`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setApplications(data.data || []);
      } else {
        setApplications([]);
      }

      setApiStatus('success');

    } catch (err: any) {
      console.error('Erreur lors du chargement des applications:', err);
      setError(`Impossible de charger les applications: ${err.message}`);
      setApiStatus('error');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCreditTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/credit-types`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCreditTypes(data.data || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des types de crédit:', err);
    }
  };

  const loadApplicationDetails = async (id: number) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/credit-applications/${id}`, {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Application details response:', data);
        
        // Handle different response structures
        if (data.data) {
          // Case 1: Data is in data.data
          const appData = data.data;
          
          // Include user information if available
          if (data.user) {
            appData.user = data.user;
          }
          
          // Include client information if available
          if (data.client) {
            appData.client = data.client;
          }
          
          // Include documents if available
          if (data.documents) {
            appData.documents = data.documents;
          }
          
          // Include file_urls if available
          if (data.file_urls) {
            appData.file_urls = data.file_urls;
          }
          
          return appData;
        } else if (data.application) {
          // Case 2: Data is in data.application
          return data.application;
        } else {
          // Case 3: Data is directly in response
          return data;
        }
      } else {
        console.error('Failed to load application details:', response.status);
        return null;
      }
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
      return null;
    }
  };

  const handleViewDetails = async (application: Application) => {
    try {
      setError(null);

      const details = await loadApplicationDetails(application.id);
      
      console.log('Loaded details:', details);
      
      if (details) {
        // Merge the details with the existing application data
        const mergedDetails: Application = {
          ...application,
          ...details,
          // Preserve any arrays/objects properly
          user: details.user || application.user,
          client: details.client || application.client,
          documents: details.documents || application.documents,
          file_urls: details.file_urls || application.file_urls,
        };
        
        setSelectedApplication(mergedDetails);
      } else {
        setSelectedApplication(application);
      }
      
      setDetailsDialogOpen(true);

    } catch (err: any) {
      console.error('Erreur lors du chargement des détails:', err);
      setError(`Impossible de charger les détails: ${err.message}`);
      setSelectedApplication(application);
      setDetailsDialogOpen(true);
    }
  };

  const handleGiveOpinion = (application: Application) => {
    setSelectedApplication(application);
    setCurrentOpinion({
      opinion: '',
      commentaire: '',
      niveau_avis: 'CHEF_AGENCE'
    });
    setOpinionDialogOpen(true);
  };

  const handleSubmitOpinion = async () => {
    if (!selectedApplication || !currentOpinion.opinion || !currentOpinion.commentaire) {
      setError('Veuillez sélectionner une opinion et ajouter un commentaire');
      return;
    }

    try {
      setSubmittingOpinion(true);
      setError(null);

      const preAvisData = {
        opinion: currentOpinion.opinion,
        commentaire: currentOpinion.commentaire
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/credit-applications/${selectedApplication.id}/pre-avis`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(preAvisData)
      });

      const result = await response.json();

      if (response.ok) {
        await loadApplications();
        setOpinionDialogOpen(false);
        setCurrentOpinion({
          opinion: '',
          commentaire: '',
          niveau_avis: 'CHEF_AGENCE'
        });
        setSelectedApplication(null);

        setError(null);
        setTimeout(() => {
          setError('success: Pré-avis soumis avec succès!');
        }, 100);
      } else {
        if (response.status === 403) {
          setError('Vous n\'êtes pas autorisé à donner un pré-avis sur cette application');
        } else if (response.status === 409) {
          setError('Un pré-avis a déjà été donné sur cette application');
        } else if (response.status === 422) {
          if (result.errors) {
            const errorMessages = Object.values(result.errors).flat().join(', ');
            setError(`Erreurs de validation: ${errorMessages}`);
          } else {
            setError(result.message || 'Erreur de validation des données');
          }
        } else if (response.status === 401) {
          setError('Votre session a expiré. Veuillez vous reconnecter.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setError(result.message || `Erreur lors de la soumission du pré-avis (Code: ${response.status})`);
        }
      }
    } catch (err: any) {
      console.error('❌ Erreur inattendue:', err);
      setError(`Erreur réseau: ${err.message || 'Impossible de se connecter au serveur'}`);
    } finally {
      setSubmittingOpinion(false);
    }
  };

  const formatAmount = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getCreditTypeName = (typeId: string) => {
    if (!typeId) return 'Non spécifié';
    const type = creditTypes.find(t => t.id.toString() === typeId.toString());
    return type ? type.description : `Type ${typeId}`;
  };

  const filteredApplications = () => {
    switch (tabValue) {
      case 0:
        return applications.filter(app =>
          app.statut === 'SOUMIS'
        );
      case 1:
        return applications.filter(app =>
          app.statut === 'CA_VALIDE'
        );
      case 2:
        return applications.filter(app =>
          app.statut === 'REJETE'
        );
      default:
        return applications;
    }
  };

  const calculateAmortization = () => {
    if (!selectedApplication) return;

    const montant = parseFloat(selectedApplication.montant);
    const duree = parseInt(selectedApplication.duree);
    const totalInteret = selectedApplication.interet_total;
    const fraisDossier = selectedApplication.frais_dossier;
    const fraisEtude = selectedApplication.frais_etude;

    const totalARembourser = montant + totalInteret + fraisDossier + fraisEtude;
    const remboursementQuotidien = totalARembourser / duree;

    const amortizationData = [];
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
            {doc.document && (
              <Typography variant="caption" color="text.secondary" display="block">
                Type: {doc.document.document_type}
              </Typography>
            )}
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
                  const filename = doc.document?.name || `${doc.label.replace(/\s+/g, '_')}.jpg`;
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

  const renderDocumentSection = () => {
    if (!selectedApplication) return null;

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

  const renderUserInfoSection = () => {
    if (!selectedApplication) return null;

    const user = selectedApplication.user;
    const client = selectedApplication.client;

    if (!user && !client) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          Aucune information utilisateur disponible
        </Alert>
      );
    }

    return (
      <Accordion expanded={expandedAccordion === 'userInfo'} onChange={handleAccordionChange('userInfo')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon color="primary" />
            <Typography variant="h6">Informations Utilisateur</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {user && (
              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ p: 2, backgroundColor: 'primary.50' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon />
                    Informations de l'utilisateur
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Nom" 
                        secondary={user.name || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Email" 
                        secondary={user.email || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Téléphone" 
                        secondary={user.phone || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Adresse" 
                        secondary={user.address || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Date de naissance" 
                        secondary={formatDate(user.date_of_birth)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Genre" 
                        secondary={user.gender || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Statut marital" 
                        secondary={user.marital_status || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Profession" 
                        secondary={user.profession || 'N/A'}
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>
            )}
            
            {client && (
              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ p: 2, backgroundColor: 'success.50' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon />
                    Informations du client
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Code client" 
                        secondary={client.client_code || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Nom complet" 
                        secondary={client.full_name || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="CIN" 
                        secondary={client.cin || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Téléphone" 
                        secondary={client.phone || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Email" 
                        secondary={client.email || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Revenu mensuel" 
                        secondary={formatAmount(client.monthly_income)}
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 3 }}>
          Chargement des applications...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BusinessIcon />
            Dashboard Chef d'Agence
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Validez les applications de crédit analysées par l'analyste.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={apiStatus === 'success' ? 'API Connectée' : 'API Hors ligne'}
            color={apiStatus === 'success' ? 'success' : 'error'}
            size="small"
            variant="outlined"
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadApplications}
            disabled={loading}
          >
            Rafraîchir
          </Button>
        </Box>
      </Box>

      {error && error.startsWith('success:') ? (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error.replace('success:', '')}
        </Alert>
      ) : error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
          action={
            <Button color="inherit" size="small" onClick={loadApplications}>
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon />
                En Attente CA
              </Typography>
              <Typography variant="h4" color="warning.main">
                {applications.filter(app => app.statut === 'SOUMIS').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Prêtes pour validation Chef d'Agence
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon />
                CA Validé
              </Typography>
              <Typography variant="h4" color="success.main">
                {applications.filter(app => app.statut === 'CA_VALIDE').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Validées par Chef d'Agence
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CancelIcon />
                Rejetées CA
              </Typography>
              <Typography variant="h4" color="error.main">
                {applications.filter(app => app.statut === 'REJETE').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejetées par Chef d'Agence
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyIcon />
                Total
              </Typography>
              <Typography variant="h4">
                {applications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toutes les applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Applications de Crédit
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {applications.length} application(s)
            </Typography>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label={`En attente (${applications.filter(app => app.statut === 'SOUMIS').length})`} />
            <Tab label={`CA Validé (${applications.filter(app => app.statut === 'CA_VALIDE').length})`} />
            <Tab label={`Rejetées (${applications.filter(app => app.statut === 'REJETE').length})`} />
          </Tabs>
        </Box>

        {filteredApplications().length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>N° Demande</TableCell>
                  <TableCell>Client ID</TableCell>
                  <TableCell>Montant</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Durée</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications().map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell>{app.numero_demande}</TableCell>
                    <TableCell>
                      {app.client_id}
                    </TableCell>
                    <TableCell>
                      {formatAmount(parseFloat(app.montant))}
                    </TableCell>
                    <TableCell>
                      {getCreditTypeName(app.credit_type_id)}
                    </TableCell>
                    <TableCell>
                      {app.duree} jours
                    </TableCell>
                    <TableCell>
                      <StatusChip statut={app.statut} />
                    </TableCell>
                    <TableCell>
                      {formatDate(app.date_demande || app.created_at)}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Voir les détails">
                        <IconButton
                          color="primary"
                          onClick={() => handleViewDetails(app)}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {app.statut === 'SOUMIS' && (
                        <Tooltip title="Donner un avis">
                          <IconButton
                            color="secondary"
                            onClick={() => handleGiveOpinion(app)}
                            size="small"
                          >
                            <ThumbUpIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucune application trouvée
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tabValue === 0
                ? "Aucune application n'est en attente de validation."
                : tabValue === 1
                  ? "Aucune application n'a été validée par CA."
                  : "Aucune application n'a été rejetée."}
            </Typography>
          </Box>
        )}
      </StyledPaper>

      {/* Dialog Détails Application */}
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
          {selectedApplication && (
            <Box sx={{ p: 3 }}>
              {/* Informations Utilisateur */}
              {renderUserInfoSection()}

              <Accordion expanded={expandedAccordion === 'infoGenerale'} onChange={handleAccordionChange('infoGenerale')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <InfoIcon color="primary" />
                    <Typography variant="h6">Informations Générales de la Demande</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <List dense>
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
                            <PersonIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Client ID" 
                            secondary={selectedApplication.client_id || 'N/A'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CreditCardIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Compte ID" 
                            secondary={selectedApplication.compte_id || 'N/A'}
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
                            <WarningIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Urgence" 
                            secondary={selectedApplication.urgence || 'N/A'}
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
                              secondary={formatAmount(parseFloat(selectedApplication.montant))}
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
                              secondary={formatAmount(selectedApplication.frais_dossier)}
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
                              secondary={formatAmount(selectedApplication.penalite_par_jour)}
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
                              secondary={formatAmount(parseFloat(selectedApplication.revenus_mensuels))}
                              secondaryTypographyProps={{ fontWeight: 'bold' }}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Autres revenus" 
                              secondary={formatAmount(parseFloat(selectedApplication.autres_revenus))}
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
                              secondary={formatAmount(parseFloat(selectedApplication.montant_dettes))}
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

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (!showAmortizationTable) {
                      calculateAmortization();
                    }
                    setShowAmortizationTable(!showAmortizationTable);
                  }}
                  startIcon={<CalculateIcon />}
                >
                  {showAmortizationTable ? 'Masquer' : 'Afficher'} Tableau d'Amortissement
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Fermer
          </Button>
          {selectedApplication && selectedApplication.statut === 'SOUMIS' && (
            <Button
              variant="contained"
              onClick={() => {
                setDetailsDialogOpen(false);
                handleGiveOpinion(selectedApplication);
              }}
              startIcon={<ThumbUpIcon />}
            >
              Donner un avis
            </Button>
          )}
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

      {/* Dialog Avis */}
      <Dialog
        open={opinionDialogOpen}
        onClose={() => setOpinionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ThumbUpIcon />
          Donner un Avis - {selectedApplication?.numero_demande}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedApplication && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Client ID: {selectedApplication.client_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Montant: {formatAmount(parseFloat(selectedApplication.montant))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Durée: {selectedApplication.duree} jours
                </Typography>
              </Box>
            )}

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Sélectionnez votre opinion:
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                fullWidth
                variant={currentOpinion.opinion === 'FAVORABLE' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setCurrentOpinion({ ...currentOpinion, opinion: 'FAVORABLE' })}
                startIcon={<CheckCircleIcon />}
                sx={{ py: 1.5 }}
              >
                FAVORABLE
              </Button>
              <Button
                fullWidth
                variant={currentOpinion.opinion === 'DEFAVORABLE' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setCurrentOpinion({ ...currentOpinion, opinion: 'DEFAVORABLE' })}
                startIcon={<CancelIcon />}
                sx={{ py: 1.5 }}
              >
                DÉFAVORABLE
              </Button>
            </Box>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Commentaire:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={currentOpinion.commentaire}
              onChange={(e) => setCurrentOpinion({ ...currentOpinion, commentaire: e.target.value })}
              placeholder="Ajoutez un commentaire pour justifier votre opinion..."
              variant="outlined"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpinionDialogOpen(false)}
            disabled={submittingOpinion}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmitOpinion}
            variant="contained"
            color="primary"
            disabled={!currentOpinion.opinion || !currentOpinion.commentaire || submittingOpinion}
            startIcon={<ThumbUpIcon />}
          >
            {submittingOpinion ? 'Soumission...' : 'Soumettre le Pré-Avis'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChefAgenceDashboard