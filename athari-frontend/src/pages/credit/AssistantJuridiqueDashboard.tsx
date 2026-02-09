// pages/AssistantJuridiqueDashboard.tsx
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
  TablePagination,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Divider,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Backdrop,
  Fade,
  CardMedia
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PhotoIcon from '@mui/icons-material/Photo';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon2 from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningIcon from '@mui/icons-material/Warning';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CalculateIcon from '@mui/icons-material/Calculate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NotesIcon from '@mui/icons-material/Notes';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ApartmentIcon from '@mui/icons-material/Apartment';
import creditService from '../../services/creditService';
import WorkflowStatus from '../../components/credit/WorkflowStatus';
import PVGeneration from '../../components/credit/PVGeneration';
import AccountMovement from '../../components/credit/AccountMovement';

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
  created_at: string;
  
  // Nested data
  user?: User;
  client?: Client;
  documents?: Document[];
  file_urls?: { [key: string]: string };
  
  // For backward compatibility
  [key: string]: any;
}

interface DocumentItem {
  label: string;
  url: string | null;
  icon: React.ReactNode;
  fieldName: string;
  type: 'field' | 'document';
  document?: Document;
}

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
      case 'MISE_EN_PLACE': return 'success';
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
      'MISE_EN_PLACE': '✅ Mise en place',
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

const AssistantJuridiqueDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Dialog states
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [pvDialogOpen, setPvDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);

  // Processing states
  const [generatingPV, setGeneratingPV] = useState(false);
  const [executingMovement, setExecutingMovement] = useState(false);

  // Document viewer states
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('infoGenerale');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  // Liste des champs de documents potentiels dans l'application
  const documentFields = [
    { field: 'demande_credit_img', label: 'Demande de crédit', icon: <AssignmentIcon /> },
    { field: 'photocopie_cni', label: 'Photocopie CNI', icon: <PersonIcon /> },
    { field: 'lettre_non_remboursement', label: 'Lettre de non remboursement', icon: <ReceiptIcon /> },
    { field: 'plan_localisation_domicile', label: 'Plan localisation domicile', icon: <LocationOnIcon /> },
    { field: 'description_domicile', label: 'Description domicile', icon: <DescriptionIcon2 /> },
    { field: 'geolocalisation_domicile', label: 'Géolocalisation domicile', icon: <LocationOnIcon /> },
    { field: 'photo_domicile_1', label: 'Photo domicile 1', icon: <PhotoIcon /> },
    { field: 'photo_domicile_2', label: 'Photo domicile 2', icon: <PhotoIcon /> },
    { field: 'photo_domicile_3', label: 'Photo domicile 3', icon: <PhotoIcon /> },
    { field: 'description_activite', label: 'Description activité', icon: <WorkIcon /> },
    { field: 'geolocalisation_img', label: 'Géolocalisation activité', icon: <LocationOnIcon /> },
    { field: 'photo_activite_1', label: 'Photo activité 1', icon: <PhotoIcon /> },
    { field: 'photo_activite_2', label: 'Photo activité 2', icon: <PhotoIcon /> },
    { field: 'photo_activite_3', label: 'Photo activité 3', icon: <PhotoIcon /> },
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
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    if (path.startsWith('storage/')) {
      return `${API_BASE_URL}/${path}`;
    }
    
    if (path.startsWith('/storage')) {
      return `${API_BASE_URL}${path}`;
    }
    
    return `${API_BASE_URL}/storage/${path.replace(/^\/+/, '')}`;
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
      
      if (application.file_urls && application.file_urls[docField.field as keyof typeof application.file_urls]) {
        url = application.file_urls[docField.field as keyof typeof application.file_urls] as string;
      }
      else if (application[docField.field]) {
        url = application[docField.field];
      }
      
      const fullUrl = getDocumentUrl(url);
      if (fullUrl) {
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

  // Filter applications based on search term
  const getFilteredApplications = () => {
    let filtered = Array.isArray(applications) ? applications : [];

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.numero_demande?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.montant?.toString().includes(searchTerm) ||
        app.client?.client_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');

      // Get all credit applications
      const response = await creditService.getCreditApplications();
      console.log('DEBUG - API Response:', response); // AJOUTEZ CETTE LIGNE
    console.log('DEBUG - Data structure:', response.data); // AJOUTEZ CETTE LIGNE

      if (response.success) {
        // Filter applications where statut is MISE_EN_PLACE or APPROUVE
        const filteredApps = (response.data || []).filter(app => 
          app.statut === 'MISE_EN_PLACE' || app.statut === 'APPROUVE'
        );
        console.log('DEBUG - Filtered apps:', filteredApps);
        setApplications(filteredApps);
      } else {
        setError(response.error?.message || 'Erreur lors du chargement des demandes');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur chargement demandes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationDetails = async (id: number): Promise<Application | null> => {
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
        
        if (data.data) {
          const appData = data.data;
          
          if (data.user) {
            appData.user = data.user;
          }
          
          if (data.client) {
            appData.client = data.client;
          }
          
          if (data.documents) {
            appData.documents = data.documents;
          }
          
          if (data.file_urls) {
            appData.file_urls = data.file_urls;
          }
          
          return appData;
        } else if (data.application) {
          return data.application;
        } else {
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

  useEffect(() => {
    loadApplications();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleViewDetails = async (application: Application) => {
    try {
      setError('');

      const details = await loadApplicationDetails(application.id);
      
      console.log('Loaded details:', details);
      
      if (details) {
        const mergedDetails: Application = {
          ...application,
          ...details,
          user: details.user || application.user,
          client: details.client || application.client,
          documents: details.documents || application.documents,
          file_urls: details.file_urls || application.file_urls,
        };
        
        setSelectedApplication(mergedDetails);
      } else {
        setSelectedApplication(application);
      }
      
      setDetailDialogOpen(true);

    } catch (err: any) {
      console.error('Erreur lors du chargement des détails:', err);
      setError(`Impossible de charger les détails: ${err.message}`);
      setSelectedApplication(application);
      setDetailDialogOpen(true);
    }
  };

  const handleGeneratePV = (application: Application) => {
    setSelectedApplication(application);
    setPvDialogOpen(true);
  };

  const handleExecuteMovement = (application: Application) => {
    setSelectedApplication(application);
    setMovementDialogOpen(true);
  };

  const handlePVGenerated = async (pvData: any) => {
    try {
      setGeneratingPV(true);
      
      // Call API to generate PV
      const response = await creditService.generatePV(selectedApplication!.id, pvData);
      
      if (response.success) {
        // Update local state
        setApplications(prev =>
          prev.map(app =>
            app.id === selectedApplication!.id
              ? { ...app, pv_generated: true, pv_data: response.data }
              : app
          )
        );

        setPvDialogOpen(false);
        setSelectedApplication(null);
        
        // Show success message
        setError('');
      } else {
        setError(response.error?.message || 'Erreur lors de la génération du PV');
      }
    } catch (err) {
      setError('Erreur lors de la génération du PV');
      console.error('PV generation error:', err);
    } finally {
      setGeneratingPV(false);
    }
  };

  const handleMovementExecuted = async (movementData: any) => {
    try {
      setExecutingMovement(true);
      
      // Call API to execute movement
      const response = await creditService.executeAccountMovement(selectedApplication!.id, movementData);
      
      if (response.success) {
        // Update local state
        setApplications(prev =>
          prev.map(app =>
            app.id === selectedApplication!.id
              ? { 
                  ...app, 
                  movement_executed: true, 
                  movement_data: response.data,
                  statut: 'finalise' 
                }
              : app
          )
        );

        setMovementDialogOpen(false);
        setSelectedApplication(null);
        
        // Show success message
        setError('');
      } else {
        setError(response.error?.message || 'Erreur lors de l\'exécution du mouvement');
      }
    } catch (err) {
      setError('Erreur lors de l\'exécution du mouvement');
      console.error('Movement execution error:', err);
    } finally {
      setExecutingMovement(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
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

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
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
                        secondary={formatCurrency(client.monthly_income)}
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

  const filteredApplications = getFilteredApplications();

  // Calculate statistics
  const safeApplications = Array.isArray(applications) ? applications : [];
  const stats = {
    pvToGenerate: safeApplications.filter(app =>
      app.statut === 'APPROUVE' &&
      parseFloat(app.montant || 0) <= 500000 &&
      !app.pv_generated
    ).length,
    movementsToExecute: safeApplications.filter(app =>
      app.statut === 'APPROUVE' &&
      parseFloat(app.montant || 0) <= 500000 &&
      app.pv_generated &&
      !app.movement_executed
    ).length,
    finalized: safeApplications.filter(app =>
      app.statut === 'finalise' &&
      parseFloat(app.montant || 0) <= 500000
    ).length
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Chargement des demandes de crédit...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 4 }}>
        <GavelIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Tableau de Bord Assistant Juridique
      </Typography>

      {error && !error.startsWith('success:') && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon />
                Demandes en Mise en Place
              </Typography>
              <Typography variant="h4" color="info.main">
                {applications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Prêtes pour validation juridique
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon />
                PV à Générer
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pvToGenerate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Procès-verbaux à générer
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceIcon />
                Mouvements à Exécuter
              </Typography>
              <Typography variant="h4" color="primary.main">
                {stats.movementsToExecute}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comptabilité en attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon />
                Finalisées
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.finalized}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Demandes complétées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Rechercher par nom client, numéro demande, montant, code client..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
        }}
        sx={{ mb: 3 }}
      />

      {/* Applications Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N° Demande</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Code Client</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Durée</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    Aucune demande trouvée
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((application) => (
                  <TableRow key={application.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {application.numero_demande || `CREDIT-${application.id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {application.client?.full_name || application.client?.nom_complet || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {application.client?.client_code || application.client?.num_client || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatCurrency(parseFloat(application.montant || 0))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {application.duree} jours
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(application.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip statut={application.statut} />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(application)}
                      >
                        Détails
                      </Button>
                      {application.statut === 'APPROUVE' && (
                        <>
                          {!application.pv_generated && (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              startIcon={<DescriptionIcon />}
                              onClick={() => handleGeneratePV(application)}
                              sx={{ ml: 1 }}
                            >
                              PV
                            </Button>
                          )}
                          {application.pv_generated && !application.movement_executed && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<AccountBalanceIcon />}
                              onClick={() => handleExecuteMovement(application)}
                              sx={{ ml: 1 }}
                            >
                              Mouvement
                            </Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        {filteredApplications.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredApplications.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Lignes par page"
          />
        )}
      </TableContainer>

      {/* Detail Dialog - Like ChefAgenceDashboard */}
      <StyledDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
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
                            secondary={formatDate(selectedApplication.date_demande || selectedApplication.created_at)}
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
                              secondary={formatCurrency(parseFloat(selectedApplication.montant))}
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
                              secondary={formatCurrency(selectedApplication.interet_total)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Frais de dossier" 
                              secondary={formatCurrency(selectedApplication.frais_dossier)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Frais d'étude" 
                              secondary={formatCurrency(selectedApplication.frais_etude)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Montant total" 
                              secondary={formatCurrency(selectedApplication.montant_total)}
                              secondaryTypographyProps={{ fontWeight: 'bold', color: 'success.main' }}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Pénalité par jour" 
                              secondary={formatCurrency(selectedApplication.penalite_par_jour)}
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
                              secondary={formatCurrency(parseFloat(selectedApplication.revenus_mensuels))}
                              secondaryTypographyProps={{ fontWeight: 'bold' }}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Autres revenus" 
                              secondary={formatCurrency(parseFloat(selectedApplication.autres_revenus))}
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
                              secondary={formatCurrency(parseFloat(selectedApplication.montant_dettes))}
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

              {/* PV Information */}
              {selectedApplication.pv_data && (
                <Box sx={{ mt: 3, p: 3, bgcolor: 'info.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon />
                    Informations PV
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Numéro PV:</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedApplication.pv_data.numero_pv}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Date:</Typography>
                      <Typography variant="body1">{new Date(selectedApplication.pv_data.date_pv).toLocaleDateString('fr-FR')}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Montant total:</Typography>
                      <Typography variant="body1" fontWeight="bold">{formatCurrency(parseFloat(selectedApplication.pv_data.montant_total || 0))}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Statut:</Typography>
                      <Chip label="Généré" color="success" size="small" />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Movement Information */}
              {selectedApplication.movement_data && (
                <Box sx={{ mt: 3, p: 3, bgcolor: 'success.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceIcon />
                    Informations Mouvement
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Type:</Typography>
                      <Typography variant="body1">{selectedApplication.movement_data.type_mouvement === 'debit' ? 'Décaissement' : 'Remboursement'}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Montant:</Typography>
                      <Typography variant="body1" fontWeight="bold">{formatCurrency(parseFloat(selectedApplication.movement_data.montant || 0))}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Compte:</Typography>
                      <Typography variant="body1">{selectedApplication.movement_data.compte_destination}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Statut:</Typography>
                      <Chip label="Exécuté" color="success" size="small" icon={<CheckCircleIcon />} />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Fermer
          </Button>
          {selectedApplication && selectedApplication.statut === 'APPROUVE' && (
            <>
              {!selectedApplication.pv_generated && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    handleGeneratePV(selectedApplication);
                  }}
                  startIcon={<DescriptionIcon />}
                >
                  Générer PV
                </Button>
              )}
              {selectedApplication.pv_generated && !selectedApplication.movement_executed && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    handleExecuteMovement(selectedApplication);
                  }}
                  startIcon={<AccountBalanceIcon />}
                >
                  Exécuter Mouvement
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </StyledDialog>

      {/* PV Generation Dialog */}
      <Dialog
        open={pvDialogOpen}
        onClose={() => setPvDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Génération du PV - Demande {selectedApplication?.numero_demande || selectedApplication?.id}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <PVGeneration
              creditApplication={selectedApplication}
              onPVGenerated={handlePVGenerated}
              disabled={generatingPV}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPvDialogOpen(false)} disabled={generatingPV}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Account Movement Dialog */}
      <Dialog
        open={movementDialogOpen}
        onClose={() => setMovementDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Exécution du Mouvement - Demande {selectedApplication?.numero_demande || selectedApplication?.id}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <AccountMovement
              creditApplication={selectedApplication}
              pvData={selectedApplication.pv_data}
              onMovementExecuted={handleMovementExecuted}
              disabled={executingMovement}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMovementDialogOpen(false)} disabled={executingMovement}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default AssistantJuridiqueDashboard;