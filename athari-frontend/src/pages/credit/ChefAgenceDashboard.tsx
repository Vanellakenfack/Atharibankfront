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
  Tab
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
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import creditService from '../../services/creditService';
import { useAuth } from '../../context/AuthContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
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
      // Legacy statuses
      case 'en_attente': return 'warning';
      case 'approuve': return 'success';
      case 'rejette': return 'error';
      case 'EN_COURS': return 'info';
      case 'ACCEPTE': return 'success';
      case 'REFUSE': return 'error';
      case 'ANNULE': return 'default';
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
      // Legacy statuses
      'en_attente': 'En attente',
      'approuve': 'Approuvé',
      'rejette': 'Rejeté',
      'EN_COURS': 'En cours',
      'ACCEPTE': 'Accepté',
      'REFUSE': 'Refusé',
      'ANNULE': 'Annulé'
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

  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  useEffect(() => {
    checkApiStatus();
    loadApplications();
    loadCreditTypes();
  }, []);

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
      
      const response = await fetch(`${API_BASE_URL}/credit-applications`, {
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
      const response = await fetch(`${API_BASE_URL}/credit-types`, {
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

  const handleViewDetails = async (application: Application) => {
    try {
      setError(null);

      const details = await loadApplicationDetails(application.id);
      setSelectedApplication(details || application);
      setTimeout(() => calculateAmortization(), 100);
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

      // Préparer les données d'avis avec les bonnes valeurs
      const opinionData = {
        opinion: currentOpinion.opinion, // 'FAVORABLE' ou 'DEFAVORABLE'
        commentaire: currentOpinion.commentaire,
        niveau_avis: currentOpinion.niveau_avis, // 'CHEF_AGENCE'
        credit_application_id: selectedApplication.id
      };

      console.log('Soumission avis pour application:', selectedApplication.id, 'avec données:', opinionData);

      // Utiliser le service de crédit
      let result;
      
      try {
        // Essayer d'abord l'endpoint spécifique Chef d'Agence
        result = await creditService.submitAvisChefAgence(selectedApplication.id, opinionData);
      } catch (error) {
        console.log('Essai endpoint générique...');
        result = await creditService.submitAvis(selectedApplication.id, opinionData);
      }

      if (result.success) {
        console.log('✅ Avis soumis avec succès:', result.data);
        
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
          setError('success: Avis soumis avec succès!');
        }, 100);
      } else {
        console.error('❌ Erreur lors de la soumission:', result);
        
        if (result.status === 403) {
          setError('Vous n\'êtes pas autorisé à donner un avis sur cette application');
        } else if (result.status === 409) {
          setError('Vous avez déjà donné un avis sur cette application');
        } else if (result.status === 422) {
          if (result.validationErrors) {
            const errorMessages = Object.values(result.validationErrors).flat().join(', ');
            setError(`Erreurs de validation: ${errorMessages}`);
          } else {
            setError(result.error || 'Erreur de validation des données');
          }
        } else if (result.status === 401) {
          setError('Votre session a expiré. Veuillez vous reconnecter.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setError(result.error || `Erreur lors de la soumission de l'avis (Code: ${result.status})`);
        }
      }
    } catch (err: any) {
      console.error('❌ Erreur inattendue:', err);
      
      try {
        const directResult = await submitOpinionDirectly();
        if (directResult.success) {
          await loadApplications();
          setOpinionDialogOpen(false);
          setError(null);
          setTimeout(() => {
            setError('success: Avis soumis avec succès!');
          }, 100);
        }
      } catch (directError) {
        setError(`Erreur lors de la soumission: ${err.message || 'Erreur inconnue'}`);
      }
    } finally {
      setSubmittingOpinion(false);
    }
  };

  const submitOpinionDirectly = async () => {
    if (!selectedApplication) return { success: false };
    
    const opinionData = {
      opinion: currentOpinion.opinion,
      commentaire: currentOpinion.commentaire,
      niveau_avis: currentOpinion.niveau_avis,
      credit_application_id: selectedApplication.id
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const endpoints = [
      `${API_BASE_URL}/credit-applications/${selectedApplication.id}/avis`,
      `${API_BASE_URL}/avis/chef-agence`,
      `${API_BASE_URL}/avis`,
      `${API_BASE_URL}/chef-agence/avis`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(opinionData)
        });

        if (response.ok) {
          const data = await response.json();
          return { success: true, data };
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} échoué, essai suivant...`);
      }
    }

    return { success: false, error: 'Tous les endpoints ont échoué' };
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
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

  const getCreditTypeName = (typeId: number) => {
    if (!typeId) return 'Non spécifié';
    const type = creditTypes.find(t => t.id === typeId);
    return type ? type.description : `Type ${typeId}`;
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
        <Box sx={{
          mt: 2,
          p: 2,
          backgroundColor: 'grey.100',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.300'
        }}>
          <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon fontSize="small" />
            <strong>Note:</strong> Le tableau montre le plan de remboursement quotidien pour la durée du crédit sélectionné.
            Les montants sont calculés automatiquement en fonction des paramètres saisis.
          </Typography>
        </Box>
      </Box>
    );
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

      {/* Statistiques */}
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

        {/* Tabs pour filtrer */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label={`En attente (${applications.filter(app => app.statut === 'SOUMIS' || app.statut === 'EN_COURS').length})`} />
            <Tab label={`Approuvées (${applications.filter(app => app.statut === 'APPROUVE' || app.statut === 'ACCEPTE').length})`} />
            <Tab label={`Rejetées (${applications.filter(app => app.statut === 'REJETE' || app.statut === 'REFUSE').length})`} />
          </Tabs>
        </Box>

        {filteredApplications().length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>N° Demande</TableCell>
                  <TableCell>Client</TableCell>
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
                      {getClientName(app)}
                    </TableCell>
                    <TableCell>
                      {formatAmount(app.montant)}
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
                      {(app.statut === 'SOUMIS' || app.statut === 'EN_COURS') && (
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
                ? "Aucune application n'a été approuvée."
                : "Aucune application n'a été rejetée."}
            </Typography>
          </Box>
        )}
      </StyledPaper>

      {/* Dialog Détails Application */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
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
              {/* General Information */}
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                Informations Générales
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">N° Demande:</Typography>
                  <Typography variant="body1" fontWeight="medium">{selectedApplication.numero_demande || 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Statut:</Typography>
                  <StatusChip statut={selectedApplication.statut} />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Date de Demande:</Typography>
                  <Typography variant="body1">{formatDate(selectedApplication.date_demande || selectedApplication.created_at)}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Observation:</Typography>
                  <Typography variant="body1">{selectedApplication.observation || 'N/A'}</Typography>
                </Grid>
              </Grid>

              {/* Client/Account Information */}
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                Informations Client/Compte
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {selectedApplication.compte_info && (
                  <>
                    <Grid xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">N° Compte:</Typography>
                      <Typography variant="body1">{selectedApplication.compte_info.numero_compte || 'N/A'}</Typography>
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">ID Client:</Typography>
                      <Typography variant="body1">{selectedApplication.compte_info.client_id || 'N/A'}</Typography>
                    </Grid>
                  </>
                )}
                {selectedApplication.credit_type_info && (
                  <>
                    <Grid xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Type de Crédit:</Typography>
                      <Typography variant="body1">{selectedApplication.credit_type_info.description || 'N/A'}</Typography>
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Code:</Typography>
                      <Typography variant="body1">{selectedApplication.credit_type_info.code || 'N/A'}</Typography>
                    </Grid>
                    <Grid xs={12}>
                      <Typography variant="body2" color="text.secondary">Caractéristiques:</Typography>
                      <Typography variant="body1">{selectedApplication.credit_type_info.credit_characteristics || 'N/A'}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>

              {/* Financial Details */}
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                Détails Financiers
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Montant Demandé:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formatAmount(selectedApplication.montant)}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Durée:</Typography>
                  <Typography variant="body1">{selectedApplication.duree} jours</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Taux d'Intérêt:</Typography>
                  <Typography variant="body1">{selectedApplication.taux_interet ? `${selectedApplication.taux_interet}%` : 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Intérêt Total:</Typography>
                  <Typography variant="body1">{selectedApplication.interet_total ? formatAmount(selectedApplication.interet_total) : 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Frais de Dossier:</Typography>
                  <Typography variant="body1">{selectedApplication.frais_dossier ? formatAmount(selectedApplication.frais_dossier) : 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Frais d'Étude:</Typography>
                  <Typography variant="body1">{selectedApplication.frais_etude ? formatAmount(selectedApplication.frais_etude) : 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Montant Total:</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedApplication.montant_total ? formatAmount(selectedApplication.montant_total) : 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Pénalité par Jour:</Typography>
                  <Typography variant="body1">{selectedApplication.penalite_par_jour ? formatAmount(selectedApplication.penalite_par_jour) : 'N/A'}</Typography>
                </Grid>
                {selectedApplication.calcul_details && (
                  <Grid xs={12}>
                    <Typography variant="body2" color="text.secondary">Détails de Calcul:</Typography>
                    <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mt: 1 }}>
                      <Typography variant="body2">Type: {selectedApplication.calcul_details.type || 'N/A'}</Typography>
                      <Typography variant="body2">Palier: {selectedApplication.calcul_details.palier || 'N/A'}</Typography>
                      <Typography variant="body2">Formule: {selectedApplication.calcul_details.formule_interet || 'N/A'}</Typography>
                      <Typography variant="body2">Intérêt Calculé: {selectedApplication.calcul_details.interet_calcule ? formatAmount(selectedApplication.calcul_details.interet_calcule) : 'N/A'}</Typography>
                      <Typography variant="body2">Pénalité Journalière: {selectedApplication.calcul_details.penalite_journaliere ? formatAmount(selectedApplication.calcul_details.penalite_journaliere) : 'N/A'}</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Income and Debts */}
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                Revenus et Dettes
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Source de Revenus:</Typography>
                  <Typography variant="body1">{selectedApplication.source_revenus || 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Revenus Mensuels:</Typography>
                  <Typography variant="body1">{selectedApplication.revenus_mensuels ? formatAmount(selectedApplication.revenus_mensuels) : 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Autres Revenus:</Typography>
                  <Typography variant="body1">{selectedApplication.autres_revenus ? formatAmount(selectedApplication.autres_revenus) : 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Montant des Dettes:</Typography>
                  <Typography variant="body1">{selectedApplication.montant_dettes ? formatAmount(selectedApplication.montant_dettes) : 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Description des Dettes:</Typography>
                  <Typography variant="body1">{selectedApplication.description_dette || 'N/A'}</Typography>
                </Grid>
              </Grid>

              {/* Other Information */}
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                Autres Informations
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Nom de la Banque:</Typography>
                  <Typography variant="body1">{selectedApplication.nom_banque || 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Numéro de Banque:</Typography>
                  <Typography variant="body1">{selectedApplication.numero_banque || 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Code Mise en Place:</Typography>
                  <Typography variant="body1">{selectedApplication.code_mise_en_place || 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Note de Crédit:</Typography>
                  <Typography variant="body1">{selectedApplication.note_credit || 'N/A'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Plan d'Épargne:</Typography>
                  <Typography variant="body1">{selectedApplication.plan_epargne ? 'Oui' : 'Non'}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Numéro Personne Contact:</Typography>
                  <Typography variant="body1">{selectedApplication.numero_personne_contact || 'N/A'}</Typography>
                </Grid>
              </Grid>

              {/* Documents */}
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                Documents
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {selectedApplication.photo_4x4 && (
                  <Grid xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Photo 4x4:</Typography>
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={selectedApplication.photo_4x4}
                        alt="Photo 4x4"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      />
                    </Box>
                  </Grid>
                )}
                {selectedApplication.plan_localisation && (
                  <Grid xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Plan de Localisation:</Typography>
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={selectedApplication.plan_localisation}
                        alt="Plan de Localisation"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      />
                    </Box>
                  </Grid>
                )}
                {selectedApplication.facture_electricite && (
                  <Grid xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Facture d'Électricité:</Typography>
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={selectedApplication.facture_electricite}
                        alt="Facture d'Électricité"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      />
                    </Box>
                  </Grid>
                )}
                {selectedApplication.casier_judiciaire && (
                  <Grid xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Casier Judiciaire:</Typography>
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={selectedApplication.casier_judiciaire}
                        alt="Casier Judiciaire"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      />
                    </Box>
                  </Grid>
                )}
                {selectedApplication.historique_compte && (
                  <Grid xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Historique Compte:</Typography>
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={selectedApplication.historique_compte}
                        alt="Historique Compte"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      />
                    </Box>
                  </Grid>
                )}
                {selectedApplication.geolocalisation_img && (
                  <Grid xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Géolocalisation:</Typography>
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={selectedApplication.geolocalisation_img}
                        alt="Géolocalisation"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      />
                    </Box>
                  </Grid>
                )}
                {selectedApplication.plan_localisation_activite_img && (
                  <Grid xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Plan Localisation Activité:</Typography>
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={selectedApplication.plan_localisation_activite_img}
                        alt="Plan Localisation Activité"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      />
                    </Box>
                  </Grid>
                )}
                {selectedApplication.photo_activite_img && (
                  <Grid xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Photo Activité:</Typography>
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={selectedApplication.photo_activite_img}
                        alt="Photo Activité"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      />
                    </Box>
                  </Grid>
                )}
                {selectedApplication.demande_credit_img && (
                  <Grid xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Demande Crédit:</Typography>
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={selectedApplication.demande_credit_img}
                        alt="Demande Crédit"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      />
                    </Box>
                  </Grid>
                )}
                {(!selectedApplication.photo_4x4 && !selectedApplication.plan_localisation && !selectedApplication.facture_electricite &&
                  !selectedApplication.casier_judiciaire && !selectedApplication.historique_compte && !selectedApplication.geolocalisation_img &&
                  !selectedApplication.plan_localisation_activite_img && !selectedApplication.photo_activite_img && !selectedApplication.demande_credit_img) && (
                  <Grid xs={12}>
                    <Typography variant="body2" color="text.secondary">Aucun document disponible</Typography>
                  </Grid>
                )}
              </Grid>

              {/* Avis */}
              {selectedApplication.avis && selectedApplication.avis.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                    Avis ({selectedApplication.avis.length})
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
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Fermer
          </Button>
          {selectedApplication && (selectedApplication.statut === 'SOUMIS' || selectedApplication.statut === 'EN_COURS') && (
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
          Donner un Avis - {selectedApplication?.numero_demande}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedApplication && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Client: {getClientName(selectedApplication)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Montant: {formatAmount(selectedApplication.montant)}
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
                onClick={() => setCurrentOpinion({...currentOpinion, opinion: 'FAVORABLE'})}
                startIcon={<CheckCircleIcon />}
                sx={{ py: 1.5 }}
              >
                FAVORABLE
              </Button>
              <Button
                fullWidth
                variant={currentOpinion.opinion === 'DEFAVORABLE' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setCurrentOpinion({...currentOpinion, opinion: 'DEFAVORABLE'})}
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
              onChange={(e) => setCurrentOpinion({...currentOpinion, commentaire: e.target.value})}
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
            {submittingOpinion ? 'Soumission...' : 'Soumettre l\'Avis'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChefAgenceDashboard;