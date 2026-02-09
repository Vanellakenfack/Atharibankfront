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
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardContent,
  Container,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Calculate as CalculateIcon,
  VerifiedUser as VerifiedUserIcon,
  Refresh as RefreshIcon,
  AttachMoney as AttachMoneyIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  ThumbUp as ThumbUpIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const StatusChip = ({ statut }: { statut: string }) => {
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'SOUMIS': return 'warning';
      case 'CA_VALIDE': return 'info';
      case 'ASSISTANT_COMPTABLE_VALIDE': return 'primary';
      case 'VERIFICATION_DOCUMENTS': return 'warning';
      case 'APPROUVE': return 'success';
      case 'REJETE': return 'error';
      case 'MIS_EN_PLACE': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (statut: string) => {
    const labels: { [key: string]: string } = {
      'SOUMIS': '⏳ Soumis - À valider',
      'CA_VALIDE': '✅ CA Validé - À traiter',
      'ASSISTANT_COMPTABLE_VALIDE': '✅ Assistant Comptable Validé',
      'VERIFICATION_DOCUMENTS': '📋 Vérification physique',
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
  avis?: any[];
  pvs?: any[];
  pre_avis?: any[];
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

const AssistantComptableDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [apiStatus, setApiStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Dialog states
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [opinionDialogOpen, setOpinionDialogOpen] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [preOpinionDialogOpen, setPreOpinionDialogOpen] = useState(false);
  const [miseEnPlaceDialogOpen, setMiseEnPlaceDialogOpen] = useState(false);

  // Processing states
  const [givingOpinion, setGivingOpinion] = useState(false);
  const [givingPreOpinion, setGivingPreOpinion] = useState(false);
  const [finalizingMiseEnPlace, setFinalizingMiseEnPlace] = useState(false);
  const [currentOpinion, setCurrentOpinion] = useState({
    opinion: '',
    commentaire: '',
    niveau_avis: 'ASSISTANT_COMPTABLE',
    score_risque: ''
  });

  const [currentPreOpinion, setCurrentPreOpinion] = useState({
    opinion: '',
    commentaire: '',
    niveau_avis: 'ASSISTANT_COMPTABLE',
    score_risque: ''
  });

  const [miseEnPlaceData, setMiseEnPlaceData] = useState({
    date_mise_en_place: new Date().toISOString().split('T')[0],
    commentaire: '',
    numero_contrat: '',
    compte_debit: '701000',
    compte_credit: '',
    mode_paiement: 'VIREMENT'
  });

  const [verificationData, setVerificationData] = useState({
    observation: '',
    documents_verifies: [] as string[],
    pv_signe: false,
    garanties_verifiees: false
  });
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAmortizationTable, setShowAmortizationTable] = useState(false);
  const [amortizationData, setAmortizationData] = useState<any[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  // Fonction pour diagnostiquer l'authentification
  const diagnoseAuth = (): string => {
    const info = [];
    
    // Vérifier le token dans localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      info.push('❌ Aucun token trouvé dans localStorage');
    } else {
      info.push(`✅ Token trouvé: ${token.substring(0, 30)}...`);
      
      // Vérifier le format
      if (token.startsWith('"') && token.endsWith('"')) {
        info.push('⚠️ Token contient des guillemets (peut causer des problèmes)');
      }
      
      // Vérifier la longueur
      if (token.length < 50) {
        info.push('⚠️ Token trop court (devrait être un JWT long)');
      }
    }
    
    // Vérifier d'autres emplacements
    const sessionToken = sessionStorage.getItem('authToken');
    if (sessionToken) {
      info.push(`✅ Token trouvé dans sessionStorage`);
    }
    
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      info.push(`✅ access_token trouvé dans localStorage`);
    }
    
    return info.join('\n');
  };

  // Fonction pour nettoyer et récupérer le token
  const getAuthToken = (): string | null => {
    // Chercher dans plusieurs emplacements
    const tokenSources = [
      localStorage.getItem('authToken'),
      sessionStorage.getItem('authToken'),
      localStorage.getItem('access_token'),
      sessionStorage.getItem('access_token'),
      localStorage.getItem('token'),
      sessionStorage.getItem('token')
    ];

    for (const token of tokenSources) {
      if (token) {
        // Nettoyer le token
        const cleanToken = token.replace(/"/g, '').trim();
        if (cleanToken && cleanToken !== 'null' && cleanToken !== 'undefined') {
          console.log('Token JWT utilisé:', cleanToken.substring(0, 30) + '...');
          return cleanToken;
        }
      }
    }
    
    console.warn('Aucun token JWT valide trouvé');
    return null;
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Headers avec token:', headers);
    } else {
      console.warn('Headers sans token');
    }

    return headers;
  };

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
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

  const getFilteredApplications = () => {
    let filtered = applications;

    switch (tabValue) {
      case 0:
        filtered = filtered.filter(app => app.statut === 'SOUMIS');
        break;
      case 1:
        filtered = filtered.filter(app => app.statut === 'CA_VALIDE');
        break;
      case 2:
        filtered = filtered.filter(app => app.statut === 'VERIFICATION_DOCUMENTS');
        break;
      case 3:
        filtered = filtered.filter(app => app.statut === 'APPROUVE');
        break;
      case 4:
        filtered = filtered.filter(app => app.statut === 'REJETE');
        break;
      case 5:
        filtered = filtered.filter(app => app.statut === 'MIS_EN_PLACE');
        break;
      default:
        filtered = filtered;
    }

    if (searchTerm) {
      filtered = filtered.filter(app =>
        (app.client_info?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.client_info?.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.numero_demande?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.montant?.toString().includes(searchTerm)
      );
    }

    return filtered;
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setDebugInfo('');

      // Diagnostiquer l'authentification
      const authInfo = diagnoseAuth();
      setDebugInfo(authInfo);
      console.log('Diagnostic auth:', authInfo);

      const token = getAuthToken();
      if (!token) {
        setAuthDialogOpen(true);
        setError('Veuillez vous connecter pour accéder au tableau de bord');
        return;
      }

      const headers = getAuthHeaders();

      console.log('Tentative de chargement des applications depuis:', `${API_BASE_URL}/credit-applications`);
      console.log('Headers envoyés:', headers);

      const response = await fetch(`${API_BASE_URL}/credit-applications`, {
        method: 'GET',
        headers: headers
      });

      console.log('Réponse du serveur:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        if (response.status === 401) {
          const errorText = await response.text();
          console.error('Erreur 401 détaillée:', errorText);
          setAuthDialogOpen(true);
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        console.error('Données d\'erreur:', errorData);
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Données reçues:', data);

      if (data.status === 'success' || data.success) {
        const applicationsData = data.data || data.applications || [];

        const filteredApps = applicationsData.filter((app: Application) => {
          return app.statut === 'SOUMIS' ||
            app.statut === 'CA_VALIDE' ||
            app.statut === 'VERIFICATION_DOCUMENTS' ||
            app.statut === 'APPROUVE' ||
            app.statut === 'REJETE' ||
            app.statut === 'MIS_EN_PLACE';
        });

        setApplications(filteredApps);
        setSuccess(`Chargement réussi: ${filteredApps.length} applications trouvées`);
      } else {
        setApplications([]);
        throw new Error(data.message || 'Erreur lors du chargement des données');
      }

    } catch (err: any) {
      console.error('Erreur complète lors du chargement des applications:', err);
      
      const errorMessage = err.message || 'Erreur inconnue';
      setError(`Impossible de charger les applications: ${errorMessage}`);
      
      if (errorMessage.includes('Session expirée') || errorMessage.includes('Veuillez vous connecter')) {
        setAuthDialogOpen(true);
      }
      
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationDetails = async (id: number) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/credit-applications/${id}`, {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
      return null;
    }
  };

  const calculateAmortization = () => {
    if (!selectedApplication) return;

    const montant = parseFloat(selectedApplication.montant.toString());
    const duree = parseInt(selectedApplication.duree.toString());
    const totalInteret = parseFloat(selectedApplication.interet_total?.toString() || '0');
    const fraisDossier = parseFloat(selectedApplication.frais_dossier?.toString() || '0');
    const fraisEtude = parseFloat(selectedApplication.frais_etude?.toString() || '0');

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
        montantRemboursement: remboursementQuotidien.toFixed(2),
        soldeRestant: soldeRestant.toFixed(2),
        cumulRembourse: cumulRembourse.toFixed(2)
      });
    }

    setAmortizationData(amortizationData);
  };

  useEffect(() => {
    checkApiStatus();
    loadApplications();
  }, [tabValue]);

  const handleViewDetails = async (application: Application) => {
    try {
      setError('');
      const details = await loadApplicationDetails(application.id);
      setSelectedApplication(details || application);
      setDetailDialogOpen(true);
      setTimeout(() => calculateAmortization(), 100);
    } catch (err: any) {
      console.error('Erreur lors du chargement des détails:', err);
      setError(`Impossible de charger les détails: ${err.message}`);
      setSelectedApplication(application);
      setDetailDialogOpen(true);
    }
  };

  const handleGiveOpinion = (application: Application) => {
    setSelectedApplication(application);
    setCurrentOpinion({
      opinion: '',
      commentaire: '',
      niveau_avis: 'ASSISTANT_COMPTABLE',
      score_risque: ''
    });
    setOpinionDialogOpen(true);
  };

  const handleGivePreOpinion = (application: Application) => {
    setSelectedApplication(application);
    setCurrentPreOpinion({
      opinion: '',
      commentaire: '',
      niveau_avis: 'ASSISTANT_COMPTABLE',
      score_risque: ''
    });
    setPreOpinionDialogOpen(true);
  };

const handleStartMiseEnPlace = (application: Application) => {
  setSelectedApplication(application);

  // LOG de diagnostic : Vérifiez si 'id' apparaît dans la console
  console.log("Détails du compte au clic :", application.compte_info);

  setMiseEnPlaceData({
    application_id: application.id,
    // On essaie l'ID, sinon le client_id, sinon le numéro de compte (en dernier recours)
    compte_credit_id: application.compte_info?.id || application.compte_info?.client_id || '', 
    montant: application.montant || 0,
    
    date_mise_en_place: new Date().toISOString().split('T')[0],
    commentaire: `Mise en place dossier ${application.numero_demande}`,
    numero_contrat: `CONTRACT-${application.id}-${Date.now()}`,
    compte_debit: '32229000',
    compte_credit: application.compte_info?.numero_compte || '',
    mode_paiement: 'VIREMENT'
  });

  setMiseEnPlaceDialogOpen(true);
};
  const handleValidateVerification = (application: Application) => {
    setSelectedApplication(application);
    setVerificationData({
      observation: '',
      documents_verifies: [],
      pv_signe: false,
      garanties_verifiees: false
    });
    setVerificationDialogOpen(true);
  };

  const handleSubmitOpinion = async () => {
    if (!currentOpinion.opinion) {
      setError('Veuillez sélectionner une opinion');
      return;
    }

    if (!currentOpinion.commentaire.trim()) {
      setError('Le commentaire est obligatoire');
      return;
    }

    if (!selectedApplication) {
      setError('Aucune application sélectionnée');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setGivingOpinion(true);

      const headers = getAuthHeaders();

      const requestBody: any = {
        opinion: currentOpinion.opinion,
        commentaire: currentOpinion.commentaire.trim(),
        niveau_avis: currentOpinion.niveau_avis
      };

      if (currentOpinion.score_risque && currentOpinion.score_risque.trim() !== '') {
        const scoreValue = parseInt(currentOpinion.score_risque);
        if (!isNaN(scoreValue) && scoreValue >= 0 && scoreValue <= 100) {
          requestBody.score_risque = scoreValue;
        }
      }

      const response = await fetch(`${API_BASE_URL}/credit-applications/${selectedApplication.id}/pre-avis`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthDialogOpen(true);
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setOpinionDialogOpen(false);
      setCurrentOpinion({
        opinion: '',
        commentaire: '',
        niveau_avis: 'ASSISTANT_COMPTABLE',
        score_risque: ''
      });

      await loadApplications();

      setSuccess('Validation soumise avec succès!');

    } catch (err: any) {
      console.error('Erreur lors de la soumission:', err);
      setError(`Erreur lors de la soumission: ${err.message}`);
    } finally {
      setGivingOpinion(false);
    }
  };

  const handleSubmitPreOpinion = async () => {
    if (!currentPreOpinion.opinion) {
      setError('Veuillez sélectionner une opinion pour le pré-avis');
      return;
    }

    if (!currentPreOpinion.commentaire.trim()) {
      setError('Le commentaire du pré-avis est obligatoire');
      return;
    }

    if (!selectedApplication) {
      setError('Aucune application sélectionnée');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setGivingPreOpinion(true);

      const headers = getAuthHeaders();

      const requestBody = {
        opinion: currentPreOpinion.opinion,
        commentaire: currentPreOpinion.commentaire.trim()
      };

      const response = await fetch(`${API_BASE_URL}/credit-applications/${selectedApplication.id}/pre-avis`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setAuthDialogOpen(true);
          throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
        }
        throw new Error(data.message || `Erreur ${response.status}`);
      }

      setPreOpinionDialogOpen(false);
      setSuccess(data.message || 'Pré-avis enregistré avec succès !');
      await loadApplications();

    } catch (err: any) {
      console.error('Erreur lors de la soumission du pré-avis:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setGivingPreOpinion(false);
    }
  };

 const handleFinalizeMiseEnPlace = async () => {
  if (!selectedApplication) return;

  try {
    setError('');
    setSuccess('');
    setFinalizingMiseEnPlace(true);

    const headers = getAuthHeaders();

    // On prépare le payload avec TOUS les champs requis par le backend
    const payload = {
      application_id: miseEnPlaceData.application_id, // Obligatoire
      compte_credit_id: miseEnPlaceData.compte_credit_id, // Obligatoire
      montant: miseEnPlaceData.montant, // Obligatoire
      date_mise_en_place: miseEnPlaceData.date_mise_en_place,
      commentaire: miseEnPlaceData.commentaire.trim(),
      numero_contrat: miseEnPlaceData.numero_contrat.trim()
    };

    console.log("Envoi du payload final :", payload);

    const response = await fetch(`${API_BASE_URL}/credit-applications/${selectedApplication.id}/finaliser-mise-en-place`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload) // On envoie l'objet complet
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 422) {
        // Affiche précisément quel champ manque selon le serveur
        console.error("Erreurs de validation :", data.errors);
        throw new Error("Données de mise en place incomplètes.");
      }
      if (response.status === 401) {
        setAuthDialogOpen(true);
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw new Error(data.message || "Erreur lors de la mise en place.");
    }

    setMiseEnPlaceDialogOpen(false);
    await loadApplications();
    setSuccess('Félicitations ! Les fonds ont été débloqués et le dossier est clôturé.');

  } catch (err: any) {
    setError(err.message);
    console.error("Erreur détaillée :", err);
  } finally {
    setFinalizingMiseEnPlace(false);
  }
};

  const handleSubmitVerification = async () => {
    if (!selectedApplication) {
      setError('Aucun dossier sélectionné');
      return;
    }

    if (!verificationData.pv_signe || !verificationData.garanties_verifiees) {
      setError('Le PV signé et les garanties vérifiées sont requis');
      return;
    }

    try {
      setSubmittingVerification(true);
      setError('');
      setSuccess('');

      const headers = getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/credits/applications/${selectedApplication.id}/valider-physique`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(verificationData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthDialogOpen(true);
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success || result.status === 'success') {
        setVerificationDialogOpen(false);
        setVerificationData({
          observation: '',
          documents_verifies: [],
          pv_signe: false,
          garanties_verifiees: false
        });

        await loadApplications();

        setSuccess('Vérification physique validée! Le dossier est maintenant en mise en place.');

        setTimeout(() => setSuccess(''), 5000);
      } else {
        throw new Error(result.message || 'Erreur lors de la validation');
      }

    } catch (err: any) {
      setError(`Erreur lors de la validation: ${err.message}`);
    } finally {
      setSubmittingVerification(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getClientName = (application: Application) => {
    if (application.client_info) {
      return `${application.client_info.nom || ''} ${application.client_info.prenom || ''}`.trim();
    }
    if (application.compte_info?.client_id) {
      return `Client ${application.compte_info.client_id}`;
    }
    return 'Client inconnu';
  };

  const isMontantSmall = (montant: number) => {
    return montant <= 500000;
  };

  const filteredApplications = getFilteredApplications();

  const stats = {
    soumis: applications.filter(app => app.statut === 'SOUMIS').length,
    caValide: applications.filter(app => app.statut === 'CA_VALIDE').length,
    verificationPhysique: applications.filter(app => app.statut === 'VERIFICATION_DOCUMENTS').length,
    approuves: applications.filter(app => app.statut === 'APPROUVE').length,
    rejetes: applications.filter(app => app.statut === 'REJETE').length,
    miseEnPlace: applications.filter(app => app.statut === 'MIS_EN_PLACE').length,
    total: applications.length
  };

  const handleRefresh = () => {
    loadApplications();
  };

  const handleDocumentsVerifiesChange = (event: any) => {
    setVerificationData({
      ...verificationData,
      documents_verifies: event.target.value as string[]
    });
  };

  const handleValidateSoumis = async (application: Application, opinion: string, commentaire: string) => {
    try {
        setError('');
        // Utilisation UNIQUE de la fonction centralisée
        const headers = getAuthHeaders(); 

        console.log("Headers envoyés :", headers); // <--- Vérifiez dans la console si Authorization: Bearer ... est présent

        const response = await fetch(`${API_BASE_URL}/credit-applications/${application.id}/pre-avis`, {
            method: 'POST',
            headers: headers, // Utilisez l'objet complet ici
            body: JSON.stringify({
                opinion: opinion,
                commentaire: commentaire,
                niveau_avis: 'ASSISTANT_COMPTABLE'
            })
        });

      

      if (!response.ok) {
        if (response.status === 401) {
          setAuthDialogOpen(true);
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      await loadApplications();

      setSuccess(opinion === 'FAVORABLE' ? 'Demande validée avec succès!' : 'Demande rejetée avec succès!');

      setTimeout(() => setSuccess(''), 5000);

    } catch (err: any) {
      console.error('Erreur lors de la validation:', err);
      setError(`Erreur lors de la validation: ${err.message}`);
    }
  };

  const handleLoginRedirect = () => {
    // Nettoyer tous les tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('access_token');
    
    // Rediriger vers la page de login
    navigate('/login');
  };

  const handleTryAgain = async () => {
    setAuthDialogOpen(false);
    setError('');
    await loadApplications();
  };

  const handleManualTokenCheck = () => {
    const token = getAuthToken();
    if (token) {
      alert(`Token JWT trouvé:\n${token.substring(0, 100)}...\n\nLongueur: ${token.length} caractères`);
    } else {
      alert('Aucun token JWT trouvé dans le stockage');
    }
  };

  const renderAmortizationTable = () => {
    if (!amortizationData || amortizationData.length === 0) return null;

    return (
      <Box sx={{ mt: 4 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          p: 2,
          backgroundColor: 'primary.light',
          borderRadius: 2,
          color: 'white'
        }}>
          <CalculateIcon />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Tableau d'Amortissement
          </Typography>
        </Box>
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            maxHeight: 700,
            borderRadius: 2,
            overflow: 'hidden',
            '& .MuiTable-root': { borderCollapse: 'separate', borderSpacing: '0 4px' }
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #1976d2',
                '& .MuiTableCell-head': {
                  color: '#1976d2',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  border: 'none',
                  py: 2.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }
              }}>
                <TableCell sx={{ borderTopLeftRadius: 8 }}>Numéro</TableCell>
                <TableCell>Date de remboursement</TableCell>
                <TableCell align="right">Montant du remboursement</TableCell>
                <TableCell align="right">Solde restant</TableCell>
                <TableCell align="right" sx={{ borderTopRightRadius: 8 }}>Cumul remboursé</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {amortizationData.map((row, index) => (
                <TableRow
                  key={row.numero}
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'grey.50' : 'white',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      opacity: 0.8,
                      transform: 'scale(1.01)',
                      transition: 'all 0.2s ease-in-out'
                    },
                    '& .MuiTableCell-body': {
                      border: 'none',
                      py: 1.5,
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  <TableCell>
                    <Chip
                      label={row.numero}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {row.dateRemboursement}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {parseFloat(row.montantRemboursement).toLocaleString('fr-FR')} FCFA
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500, color: 'warning.main' }}>
                    {parseFloat(row.soldeRestant).toLocaleString('fr-FR')} FCFA
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {parseFloat(row.cumulRembourse).toLocaleString('fr-FR')} FCFA
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
            <Typography variant="h6" sx={{ ml: 2 }}>
              Chargement des demandes de crédit...
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountBalanceIcon />
                Tableau de Bord Assistant Comptable
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Validez les demandes après le Chef d'Agence et gérez la vérification physique
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={apiStatus === 'success' ? 'API Connectée' : 'API Hors ligne'}
                color={apiStatus === 'success' ? 'success' : 'error'}
                size="small"
                variant="outlined"
              />
              <Tooltip title="Rafraîchir">
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Vérifier le token">
                <IconButton onClick={handleManualTokenCheck}>
                  <KeyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {debugInfo && (
            <Alert severity="info" sx={{ mb: 3 }} onClose={() => setDebugInfo('')}>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                {debugInfo}
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon />
                    À Valider
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.soumis}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Demandes soumises
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
                    {stats.caValide}
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
                    <VerifiedUserIcon />
                    Vérification
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.verificationPhysique}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vérification physique
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
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toutes les applications
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)} aria-label="application tabs">
              <Tab label={`À Valider (${stats.soumis})`} />
              <Tab label={`À Traiter (${stats.caValide})`} />
              <Tab label={`Vérification (${stats.verificationPhysique})`} />
              <Tab label={`Approuvées (${stats.approuves})`} />
              <Tab label={`Rejetées (${stats.rejetes})`} />
              <Tab label={`Mise en Place (${stats.miseEnPlace})`} />
            </Tabs>
          </Box>

          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom client, numéro demande, montant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
            />
            {loading && <CircularProgress size={24} />}
          </Box>

          <StyledPaper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>N° Demande</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                          <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            Aucune application trouvée
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {tabValue === 0
                              ? "Aucune application n'est en attente de validation."
                              : tabValue === 1
                                ? "Aucune application validée par le Chef d'Agence."
                                : "Aucune application disponible."}
                          </Typography>
                        </Box>
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
                              {getClientName(application)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight="bold" color="primary">
                                {formatCurrency(parseFloat(application.montant?.toString() || '0'))}
                              </Typography>
                              {isMontantSmall(application.montant) && (
                                <Chip
                                  label="≤ 500k"
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                />
                              )}
                            </Box>
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
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Tooltip title="Voir les détails">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<VisibilityIcon />}
                                  onClick={() => handleViewDetails(application)}
                                >
                                  Détails
                                </Button>
                              </Tooltip>

                              {application.statut === 'SOUMIS' && (
                                <>
                                  <Tooltip title="Valider la demande">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      startIcon={<CheckCircleIcon />}
                                      onClick={() => {
                                        const commentaire = prompt('Veuillez saisir un commentaire de validation:');
                                        if (commentaire && commentaire.trim()) {
                                          handleValidateSoumis(application, 'FAVORABLE', commentaire);
                                        }
                                      }}
                                    >
                                      Valider
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Rejeter la demande">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="error"
                                      startIcon={<CancelIcon />}
                                      onClick={() => {
                                        const commentaire = prompt('Veuillez saisir un commentaire de rejet:');
                                        if (commentaire && commentaire.trim()) {
                                          handleValidateSoumis(application, 'DEFAVORABLE', commentaire);
                                        }
                                      }}
                                    >
                                      Rejeter
                                    </Button>
                                  </Tooltip>
                                </>
                              )}

                              {application.statut === 'CA_VALIDE' && (
                                <>
                                  <Tooltip title="Donner un pré-avis">
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="secondary"
                                      startIcon={<DescriptionIcon />}
                                      onClick={() => handleGivePreOpinion(application)}
                                    >
                                      Pré-avis
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Valider la demande">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="primary"
                                      startIcon={<CheckCircleIcon />}
                                      onClick={() => handleGiveOpinion(application)}
                                    >
                                      Valider
                                    </Button>
                                  </Tooltip>
                                </>
                              )}

                              {application.statut === 'VERIFICATION_DOCUMENTS' && (
                                <Tooltip title="Valider la vérification physique">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="warning"
                                    startIcon={<VerifiedUserIcon />}
                                    onClick={() => handleValidateVerification(application)}
                                  >
                                    Vérifier
                                  </Button>
                                </Tooltip>
                              )}

                              {application.statut === 'APPROUVE' && isMontantSmall(application.montant) && (
                                <Tooltip title="Finaliser la mise en place">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<PlayCircleOutlineIcon />}
                                    onClick={() => handleStartMiseEnPlace(application)}
                                  >
                                    Mise en place
                                  </Button>
                                </Tooltip>
                              )}
                            </Box>
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
          </StyledPaper>

          {/* Dialog Authentification 
          <Dialog
            open={authDialogOpen}
            onClose={() => {}}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'error.main' }}>
              <ErrorIcon />
              Problème d'authentification
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                Votre session a expiré ou votre token d'authentification est invalide.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Le backend indique: "Utilisateur non authentifié. Assurez-vous d'envoyer le Bearer Token valide"
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Veuillez vous reconnecter pour continuer à utiliser l'application.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleTryAgain} color="primary">
                Réessayer
              </Button>
              <Button onClick={handleLoginRedirect} variant="contained" color="primary">
                Se reconnecter
              </Button>
            </DialogActions>
          </Dialog>*/}

          {/* Dialog Détails Application */}
          <Dialog
            open={detailDialogOpen}
            onClose={() => setDetailDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DescriptionIcon />
              Détails de l'Application #{selectedApplication?.numero_demande}
            </DialogTitle>
            <DialogContent>
              {selectedApplication && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                    Informations Générales
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">N° Demande:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedApplication.numero_demande || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Statut:</Typography>
                      <StatusChip statut={selectedApplication.statut} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Date de Demande:</Typography>
                      <Typography variant="body1">{formatDate(selectedApplication.created_at)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Garantie:</Typography>
                      <Typography variant="body1">{selectedApplication.garantie || 'Non spécifiée'}</Typography>
                    </Grid>
                  </Grid>

                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                    Détails Financiers
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Montant:</Typography>
                      <Typography variant="body1" fontWeight="bold">{formatCurrency(selectedApplication.montant)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Durée:</Typography>
                      <Typography variant="body1">{selectedApplication.duree} jours</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Taux d'Intérêt:</Typography>
                      <Typography variant="body1">{selectedApplication.taux_interet ? `${selectedApplication.taux_interet}%` : 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Intérêt Total:</Typography>
                      <Typography variant="body1">{selectedApplication.interet_total ? formatCurrency(selectedApplication.interet_total) : 'N/A'}</Typography>
                    </Grid>
                  </Grid>

                  {selectedApplication.avis && selectedApplication.avis.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                        Historique des Avis ({selectedApplication.avis.length})
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        {selectedApplication.avis.map((avis: any, index: number) => (
                          <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" fontWeight="medium">
                                Avis #{avis.id || (index + 1)}
                              </Typography>
                              <Chip
                                label={avis.opinion === 'FAVORABLE' ? 'Favorable' : avis.opinion === 'DEFAVORABLE' ? 'Défavorable' : avis.opinion}
                                color={avis.opinion === 'FAVORABLE' ? 'success' : avis.opinion === 'DEFAVORABLE' ? 'error' : 'default'}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Commentaire: {avis.commentaire || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Date: {formatDate(avis.created_at)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  )}

                  {/* Bouton Tableau d'Amortissement */}
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
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
                      sx={{ minWidth: 200 }}
                    >
                      {showAmortizationTable ? 'Masquer' : 'Voir'} Tableau d'Amortissement
                    </Button>
                  </Box>

                  {/* Tableau d'Amortissement */}
                  {showAmortizationTable && renderAmortizationTable()}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Fermer
              </Button>
              {selectedApplication && selectedApplication.statut === 'CA_VALIDE' && (
                <>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setDetailDialogOpen(false);
                      handleGivePreOpinion(selectedApplication);
                    }}
                    startIcon={<DescriptionIcon />}
                  >
                    Pré-avis
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setDetailDialogOpen(false);
                      handleGiveOpinion(selectedApplication);
                    }}
                    startIcon={<CheckCircleIcon />}
                  >
                    Donner un avis
                  </Button>
                </>
              )}
            </DialogActions>
          </Dialog>

          {/* Dialog Pré-Avis */}
          <Dialog
            open={preOpinionDialogOpen}
            onClose={() => setPreOpinionDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DescriptionIcon color="secondary" />
              Pré-avis - #{selectedApplication?.numero_demande}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                {selectedApplication && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'secondary.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Client: {getClientName(selectedApplication)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Montant: {formatCurrency(selectedApplication.montant)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Durée: {selectedApplication.duree} jours
                    </Typography>
                  </Box>
                )}

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Sélectionnez votre pré-avis:
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    fullWidth
                    variant={currentPreOpinion.opinion === 'FAVORABLE' ? 'contained' : 'outlined'}
                    color="success"
                    onClick={() => setCurrentPreOpinion({ ...currentPreOpinion, opinion: 'FAVORABLE' })}
                    startIcon={<CheckCircleIcon />}
                    sx={{ py: 1.5 }}
                  >
                    FAVORABLE
                  </Button>
                  <Button
                    fullWidth
                    variant={currentPreOpinion.opinion === 'DEFAVORABLE' ? 'contained' : 'outlined'}
                    color="error"
                    onClick={() => setCurrentPreOpinion({ ...currentPreOpinion, opinion: 'DEFAVORABLE' })}
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
                  value={currentPreOpinion.commentaire}
                  onChange={(e) => setCurrentPreOpinion({ ...currentPreOpinion, commentaire: e.target.value })}
                  placeholder="Commentaire sur votre pré-avis..."
                  variant="outlined"
                  required
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setPreOpinionDialogOpen(false)}
                disabled={givingPreOpinion}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmitPreOpinion}
                variant="contained"
                color="secondary"
                disabled={!currentPreOpinion.opinion || !currentPreOpinion.commentaire.trim() || givingPreOpinion}
                startIcon={<DescriptionIcon />}
              >
                {givingPreOpinion ? 'Envoi en cours...' : 'Soumettre le pré-avis'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog Avis */}
          <Dialog
            open={opinionDialogOpen}
            onClose={() => setOpinionDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ThumbUpIcon />
              Valider la Demande - #{selectedApplication?.numero_demande}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                {selectedApplication && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Client: {getClientName(selectedApplication)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Montant: {formatCurrency(selectedApplication.montant)}
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
                    VALIDER
                  </Button>
                  <Button
                    fullWidth
                    variant={currentOpinion.opinion === 'DEFAVORABLE' ? 'contained' : 'outlined'}
                    color="error"
                    onClick={() => setCurrentOpinion({ ...currentOpinion, opinion: 'DEFAVORABLE' })}
                    startIcon={<CancelIcon />}
                    sx={{ py: 1.5 }}
                  >
                    REJETER
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
                  placeholder="Commentaire sur votre validation..."
                  variant="outlined"
                  required
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpinionDialogOpen(false)}
                disabled={givingOpinion}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmitOpinion}
                variant="contained"
                color="primary"
                disabled={!currentOpinion.opinion || !currentOpinion.commentaire.trim() || givingOpinion}
                startIcon={<DescriptionIcon />}
              >
                {givingOpinion ? 'Envoi en cours...' : 'Soumettre'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog Mise en Place */}
          <Dialog
            open={miseEnPlaceDialogOpen}
            onClose={() => !finalizingMiseEnPlace && setMiseEnPlaceDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PlayCircleOutlineIcon color="success" />
              Finaliser la Mise en Place - #{selectedApplication?.numero_demande}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Cette action est disponible uniquement pour les montants ≤ 500 000 FCFA.
                  Elle va finaliser la mise en place du crédit.
                </Alert>

                {selectedApplication && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Client: {getClientName(selectedApplication)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Montant: {formatCurrency(selectedApplication.montant)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Durée: {selectedApplication.duree} jours
                    </Typography>
                  </Box>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Date de mise en place"
                      type="date"
                      value={miseEnPlaceData.date_mise_en_place}
                      onChange={(e) => setMiseEnPlaceData({ ...miseEnPlaceData, date_mise_en_place: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Numéro de contrat"
                      value={miseEnPlaceData.numero_contrat}
                      onChange={(e) => setMiseEnPlaceData({ ...miseEnPlaceData, numero_contrat: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Compte de débit"
                      value={miseEnPlaceData.compte_debit}
                      onChange={(e) => setMiseEnPlaceData({ ...miseEnPlaceData, compte_debit: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Compte de crédit"
                      value={miseEnPlaceData.compte_credit}
                      onChange={(e) => setMiseEnPlaceData({ ...miseEnPlaceData, compte_credit: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Mode de paiement</InputLabel>
                      <Select
                        value={miseEnPlaceData.mode_paiement}
                        label="Mode de paiement"
                        onChange={(e) => setMiseEnPlaceData({ ...miseEnPlaceData, mode_paiement: e.target.value })}
                      >
                        <MenuItem value="VIREMENT">Virement</MenuItem>
                        <MenuItem value="CHEQUE">Chèque</MenuItem>
                        <MenuItem value="ESPECES">Espèces</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Commentaire"
                      multiline
                      rows={3}
                      value={miseEnPlaceData.commentaire}
                      onChange={(e) => setMiseEnPlaceData({ ...miseEnPlaceData, commentaire: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setMiseEnPlaceDialogOpen(false)}
                disabled={finalizingMiseEnPlace}
              >
                Annuler
              </Button>
              <Button
                onClick={handleFinalizeMiseEnPlace}
                variant="contained"
                color="success"
                disabled={finalizingMiseEnPlace || !miseEnPlaceData.numero_contrat || !miseEnPlaceData.compte_debit || !miseEnPlaceData.compte_credit}
                startIcon={finalizingMiseEnPlace ? <CircularProgress size={20} /> : <PlayCircleOutlineIcon />}
              >
                {finalizingMiseEnPlace ? 'Finalisation...' : 'Finaliser la mise en place'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog Vérification */}
          <Dialog
            open={verificationDialogOpen}
            onClose={() => !submittingVerification && setVerificationDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VerifiedUserIcon />
              Vérification Physique - #{selectedApplication?.numero_demande}
            </DialogTitle>
            <DialogContent>
              {selectedApplication && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Vérifiez les documents physiques avant de valider la mise en place.
                  </Alert>

                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    📋 Liste des documents à vérifier:
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Documents vérifiés</InputLabel>
                      <Select
                        multiple
                        value={verificationData.documents_verifies}
                        onChange={handleDocumentsVerifiesChange}
                        label="Documents vérifiés"
                      >
                        <MenuItem value="PV_Signe">PV Signé</MenuItem>
                        <MenuItem value="Garantie_Hypotheque">Garantie Hypothèque</MenuItem>
                        <MenuItem value="Contrat_Credit">Contrat de Crédit</MenuItem>
                        <MenuItem value="Plan_Paiement">Plan de Paiement</MenuItem>
                        <MenuItem value="Piece_Identite">Pièce d'Identité</MenuItem>
                        <MenuItem value="Autres_Documents">Autres Documents</MenuItem>
                      </Select>
                    </FormControl>

                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={verificationData.pv_signe}
                            onChange={(e) => setVerificationData({
                              ...verificationData,
                              pv_signe: e.target.checked
                            })}
                          />
                        }
                        label="PV signé présent et conforme"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={verificationData.garanties_verifiees}
                            onChange={(e) => setVerificationData({
                              ...verificationData,
                              garanties_verifiees: e.target.checked
                            })}
                          />
                        }
                        label="Garanties vérifiées et acceptées"
                      />
                    </FormGroup>

                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={verificationData.observation}
                      onChange={(e) => setVerificationData({
                        ...verificationData,
                        observation: e.target.value
                      })}
                      placeholder="Observations sur la vérification..."
                      variant="outlined"
                      sx={{ mt: 2 }}
                    />
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setVerificationDialogOpen(false)}
                disabled={submittingVerification}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmitVerification}
                variant="contained"
                color="success"
                disabled={submittingVerification || !verificationData.pv_signe || !verificationData.garanties_verifiees}
                startIcon={submittingVerification ? <CircularProgress size={20} /> : <VerifiedUserIcon />}
              >
                {submittingVerification ? 'Validation...' : 'Valider la Vérification'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default AssistantComptableDashboard;