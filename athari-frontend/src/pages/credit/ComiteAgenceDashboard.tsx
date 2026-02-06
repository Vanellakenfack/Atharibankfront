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
  Fab,
  Badge,
  Avatar,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel
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
  Edit as EditIcon,
  Download as DownloadIcon,
  Group as GroupIcon,
  History as HistoryIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import creditService from '../../services/creditService';
import PVGeneration from '../../components/credit/PVGeneration';
import { useNavigate } from 'react-router-dom';

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  '& .MuiTableHead-root': {
    background: `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[200]} 100%)`,
  },
}));

// Interfaces
interface Application {
  id: number;
  numero_demande: string;
  montant: number;
  duree: number;
  statut: string;
  date_demande: string;
  created_at: string;
  client_info?: {
    nom: string;
    prenom: string;
  };
  credit_type_info?: {
    description: string;
  };
  taux_interet: number;
  interet_total: number;
  frais_etude: number;
  frais_dossier?: number;
  montant_total: number;
  avis?: any[];
  documents?: any[];
  observation?: string;
}

interface Opinion {
  opinion: string;
  commentaire: string;
  niveau_avis: string;
}

const StatusChip = ({ statut }: { statut: string }) => {
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'ASSISTANT_COMPTABLE_VALIDE': return 'info';
      case 'COMITE_AGENCE': return 'secondary';
      case 'APPROUVE': return 'success';
      case 'REJETE': return 'error';
      case 'EN_COURS': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (statut: string) => {
    const labels: { [key: string]: string } = {
      'ASSISTANT_COMPTABLE_VALIDE': '✅ Assistant Comptable Validé',
      'COMITE_AGENCE': '🔄 Comité en cours',
      'APPROUVE': '✅ Approuvé',
      'REJETE': '❌ Rejeté',
      'EN_COURS': '⏳ En cours',
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
  const navigate = useNavigate();
  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  // États principaux
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // États pour la modale de détails
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // États pour la modale d'avis
  const [opinionDialogOpen, setOpinionDialogOpen] = useState(false);
  const [currentOpinion, setCurrentOpinion] = useState<Opinion>({
    opinion: '',
    commentaire: '',
    niveau_avis: 'COMITE_AGENCE'
  });
  const [submittingOpinion, setSubmittingOpinion] = useState(false);
  
  // États pour l'ajustement des termes
  const [montantAjuste, setMontantAjuste] = useState<number>(0);
  const [dureeAjustee, setDureeAjustee] = useState<number>(0);
  const [nomGarantie, setNomGarantie] = useState<string>('');
  
  // États pour les onglets et recherche
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour le PV
  const [generatedPvId, setGeneratedPvId] = useState<number | null>(null);
  const [downloadingPv, setDownloadingPv] = useState(false);
  const [pvDialogOpen, setPvDialogOpen] = useState(false);
  const [generatingPV, setGeneratingPV] = useState(false);
  
  // États pour le tableau d'amortissement
  const [amortizationData, setAmortizationData] = useState<any[]>([]);
  const [showAmortizationTable, setShowAmortizationTable] = useState(false);

  // Charger les applications au montage
  useEffect(() => {
    loadApplications();
  }, []);

  // Fonction pour charger les applications
  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

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
        // Charger toutes les applications pour permettre l'affichage dans tous les onglets
        // Les applications avec statut APPROUVE, REJETE et ASSISTANT_COMPTABLE_VALIDE
        const allApps = (data.data || []).filter((app: Application) =>
          app.statut === 'ASSISTANT_COMPTABLE_VALIDE' ||
          app.statut === 'APPROUVE' ||
          app.statut === 'REJETE'
        );
        setApplications(allApps);
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

  // Fonction pour soumettre un avis
  const handleSubmitOpinion = async () => {
    if (!selectedApplication || !currentOpinion.opinion || !currentOpinion.commentaire) {
      setError('Veuillez sélectionner une opinion et ajouter un commentaire');
      return;
    }

    try {
      setSubmittingOpinion(true);
      setError(null);
      setSuccessMessage(null);

      // Préparer les données d'avis
      const opinionData: any = {
        opinion: currentOpinion.opinion,
        commentaire: currentOpinion.commentaire,
        niveau_avis: 'COMITE_AGENCE',
        credit_application_id: selectedApplication.id,
      };

      // Ajouter les termes ajustés si modifiés
      if (montantAjuste !== selectedApplication.montant) {
        opinionData.nouveau_montant = montantAjuste;
      }
      if (dureeAjustee !== selectedApplication.duree) {
        opinionData.nouvelle_duree = dureeAjustee;
      }
      if (nomGarantie) {
        opinionData.nom_garantie = nomGarantie;
      }

      console.log('📤 Soumission avis pour application:', selectedApplication.id, 'avec données:', opinionData);

      // Appel API
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/credit-applications/${selectedApplication.id}/avis`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(opinionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ Avis soumis avec succès:', result.data);

        // Stocker l'ID du PV si généré
        if (result.data.pv_id) {
          setGeneratedPvId(result.data.pv_id);
        }

        // Mettre à jour le statut localement pour un affichage immédiat
        const newStatut = currentOpinion.opinion === 'FAVORABLE' ? 'APPROUVE' : 'REJETE';
        setApplications(prevApps =>
          prevApps.map(app =>
            app.id === selectedApplication.id
              ? { ...app, statut: newStatut }
              : app
          )
        );

        // Basculer vers l'onglet approprié
        const newTabValue = currentOpinion.opinion === 'FAVORABLE' ? 1 : 2; // 1: Approuvées, 2: Rejetées
        setTabValue(newTabValue);

        // Fermer la modale
        setOpinionDialogOpen(false);
        setCurrentOpinion({
          opinion: '',
          commentaire: '',
          niveau_avis: 'COMITE_AGENCE'
        });

        // Afficher message de succès
        const statut = currentOpinion.opinion === 'FAVORABLE' ? 'APPROUVÉ' : 'REJETÉ';
        const message = `Décision enregistrée. Le dossier #${selectedApplication.numero_demande} est désormais ${statut}.`;

        setSuccessMessage(message);

        // Recharger les applications après 2 secondes pour synchroniser avec le backend
        setTimeout(() => {
          loadApplications();
        }, 2000);

      } else {
        throw new Error(result.message || 'Erreur lors de la soumission');
      }
      
    } catch (err: any) {
      console.error('❌ Erreur lors de la soumission:', err);
      setError(`Erreur lors de la soumission: ${err.message}`);
    } finally {
      setSubmittingOpinion(false);
    }
  };

  // Fonction pour télécharger un PV
  const handleDownloadPV = async (pvId: number) => {
    try {
      setDownloadingPv(true);
      setError(null);

      const url = `${API_BASE_URL}/credit-pvs/${pvId}/download`;
      const headers = new Headers();

      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }

      // Ouvrir le PDF dans un nouvel onglet
      window.open(url, '_blank');

      setSuccessMessage('📄 PV ouvert avec succès!');

    } catch (err: any) {
      console.error('❌ Erreur téléchargement PV:', err);
      setError(`Erreur lors du téléchargement: ${err.message}`);
    } finally {
      setDownloadingPv(false);
    }
  };

  // Fonction pour voir les détails
  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setDetailsDialogOpen(true);
  };

  // Fonction pour donner un avis
  const handleGiveOpinion = (application: Application) => {
    setSelectedApplication(application);
    setMontantAjuste(application.montant);
    setDureeAjustee(application.duree);
    setNomGarantie('');
    setCurrentOpinion({
      opinion: '',
      commentaire: '',
      niveau_avis: 'COMITE_AGENCE'
    });
    setOpinionDialogOpen(true);
  };

  // Fonction pour générer un PV
  const handleGeneratePV = (application: Application) => {
    setSelectedApplication(application);
    setPvDialogOpen(true);
  };

  // Fonction appelée après génération du PV
  const handlePVGenerated = async (pvData: any) => {
    try {
      setGeneratingPV(true);
      setError(null);

      // Call API to generate PV
      const response = await creditService.generatePV(selectedApplication!.id, pvData);

      if (response.success) {
        setPvDialogOpen(false);
        setSuccessMessage('✅ PV généré avec succès!');
        setGeneratedPvId(response.data.id);

        // Recharger les applications après 2 secondes
        setTimeout(() => {
          loadApplications();
        }, 2000);
      } else {
        setError(response.error?.message || 'Erreur lors de la génération du PV');
      }
    } catch (err: any) {
      setError('Erreur lors de la génération du PV');
      console.error('PV generation error:', err);
    } finally {
      setGeneratingPV(false);
    }
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
        month: 'long',
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
    return 'Client inconnu';
  };

  // Fonction pour filtrer les applications
  const filteredApplications = () => {
    let filtered = applications;

    // Filtrer par onglet
    switch (tabValue) {
      case 0:
        filtered = filtered.filter(app => app.statut === 'ASSISTANT_COMPTABLE_VALIDE');
        break;
      case 1:
        filtered = filtered.filter(app => app.statut === 'APPROUVE');
        break;
      case 2:
        filtered = filtered.filter(app => app.statut === 'REJETE');
        break;
      default:
        filtered = filtered;
    }

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(app =>
        getClientName(app).toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.numero_demande?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.montant?.toString().includes(searchTerm)
      );
    }

    return filtered;
  };

  // Calculer les statistiques
  const stats = {
    enAttente: applications.filter(app => app.statut === 'ASSISTANT_COMPTABLE_VALIDE').length,
    approuves: applications.filter(app => app.statut === 'APPROUVE').length,
    rejetes: applications.filter(app => app.statut === 'REJETE').length,
    total: applications.length
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
      {/* Header */}
      <HeaderCard>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
              <GroupIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                Comité d'Agence
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Validation collective des dossiers approuvés par l'assistant comptable
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Fab
              color="primary"
              size="small"
              onClick={loadApplications}
              disabled={loading}
            >
              <RefreshIcon />
            </Fab>
          </Box>
        </Box>
      </HeaderCard>

      {/* Messages d'alerte */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
          {generatedPvId && (
            <Button
              variant="contained"
              size="small"
              startIcon={<PictureAsPdfIcon />}
              onClick={() => handleDownloadPV(generatedPvId)}
              sx={{
                ml: 2,
                bgcolor: currentOpinion.opinion === 'FAVORABLE' ? 'success.main' : 'grey.600',
                '&:hover': {
                  bgcolor: currentOpinion.opinion === 'FAVORABLE' ? 'success.dark' : 'grey.700',
                }
              }}
              disabled={downloadingPv}
            >
              Télécharger le Procès-Verbal (PDF)
            </Button>
          )}
        </Alert>
      )}

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon />
                En Attente
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.enAttente}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Prêtes pour décision
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon />
                Approuvées
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.approuves}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Décisions favorables
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CancelIcon />
                Rejetées
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.rejetes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Décisions défavorables
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon />
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

      {/* Tableau principal */}
      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Dossiers en attente de décision collective
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {applications.length} dossier(s)
          </Typography>
        </Box>

        {/* Onglets */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
            <Tab label={`En Attente (${stats.enAttente})`} />
            <Tab label={`Approuvées (${stats.approuves})`} />
            <Tab label={`Rejetées (${stats.rejetes})`} />
          </Tabs>
        </Box>

        {/* Barre de recherche */}
        <TextField
          fullWidth
          placeholder="Rechercher par client, numéro demande, montant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1 }}>
                🔍
              </Box>
            ),
          }}
        />

        {filteredApplications().length > 0 ? (
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>N° Demande</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Montant</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Durée</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications().map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell>{app.numero_demande}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {getClientName(app).charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {getClientName(app)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {formatAmount(app.montant)}
                    </TableCell>
                    <TableCell>{app.duree} jours</TableCell>
                    <TableCell>
                      <StatusChip statut={app.statut} />
                    </TableCell>
                    <TableCell>
                      {formatDate(app.date_demande || app.created_at)}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Voir les détails">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewDetails(app)}
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {app.statut === 'ASSISTANT_COMPTABLE_VALIDE' && (
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

                        {(app.statut === 'APPROUVE' || app.statut === 'REJETE') && (
                          <Tooltip title="Télécharger PV">
                            <IconButton
                              color="success"
                              onClick={() => handleDownloadPV(1)}
                              size="small"
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {app.statut === 'MISE_EN_PLACE' && (
                          <>
                            <Tooltip title="Générer PV">
                              <IconButton
                                color="primary"
                                onClick={() => handleGeneratePV(app)}
                                size="small"
                              >
                                <NotesIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Télécharger PV">
                              <IconButton
                                color="success"
                                onClick={async () => {
                                  try {
                                    // Récupérer le PV de l'application
                                    const response = await fetch(`${API_BASE_URL}/credit-applications/${app.id}/pv`, {
                                      headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Accept': 'application/json',
                                      }
                                    });

                                    if (response.ok) {
                                      const data = await response.json();
                                      if (data.success && data.data) {
                                        handleDownloadPV(data.data.id);
                                      } else {
                                        setError('Aucun PV trouvé pour cette application');
                                      }
                                    }
                                  } catch (err: any) {
                                    setError('Erreur lors de la récupération du PV');
                                  }
                                }}
                                size="small"
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucune application trouvée
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tabValue === 0
                ? "Aucun dossier n'est en attente de décision du comité."
                : tabValue === 1
                ? "Aucun dossier n'a été approuvé par le comité."
                : "Aucun dossier n'a été rejeté par le comité."}
            </Typography>
          </Box>
        )}
      </StyledPaper>

      {/* Modal Détails Application */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DescriptionIcon />
          Détails du Dossier #{selectedApplication?.numero_demande}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              {/* Informations Générales */}
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Informations Générales
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Client:</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getClientName(selectedApplication)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Statut:</Typography>
                  <StatusChip statut={selectedApplication.statut} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Montant:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {formatAmount(selectedApplication.montant)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Durée:</Typography>
                  <Typography variant="body1">{selectedApplication.duree} jours</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Observation:</Typography>
                  <Typography variant="body1">
                    {selectedApplication.observation || 'Aucune observation'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Détails Financiers */}
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Détails Financiers
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Taux d'intérêt:</Typography>
                  <Typography variant="body1">{selectedApplication.taux_interet}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Intérêt total:</Typography>
                  <Typography variant="body1">{formatAmount(selectedApplication.interet_total)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Frais d'étude:</Typography>
                  <Typography variant="body1">{formatAmount(selectedApplication.frais_etude)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Frais de dossier:</Typography>
                  <Typography variant="body1">{formatAmount(selectedApplication.frais_dossier || 0)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Montant total:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {formatAmount(selectedApplication.montant_total)}
                  </Typography>
                </Grid>
              </Grid>

              {/* Historique des Avis */}
              {selectedApplication.avis && selectedApplication.avis.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    Historique des Avis ({selectedApplication.avis.length})
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {selectedApplication.avis.map((avis: any, index: number) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            Niveau: {avis.niveau_avis}
                          </Typography>
                          <Chip
                            label={avis.opinion}
                            color={avis.opinion === 'FAVORABLE' ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {avis.commentaire}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(avis.created_at)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Fermer
          </Button>
          {selectedApplication && selectedApplication.statut === 'ASSISTANT_COMPTABLE_VALIDE' && (
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

      {/* Modal Avis du Comité */}
      <Dialog
        open={opinionDialogOpen}
        onClose={() => !submittingOpinion && setOpinionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ThumbUpIcon />
          Donner un Avis - Dossier #{selectedApplication?.numero_demande}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              {/* Informations du dossier */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Client: {getClientName(selectedApplication)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Montant initial: {formatAmount(selectedApplication.montant)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Durée initiale: {selectedApplication.duree} jours
                </Typography>
              </Box>

              {/* Section ajustement des termes */}
              <Box sx={{ mb: 3, p: 2, border: '1px dashed', borderColor: 'primary.main', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  ⚙️ Ajustement des termes (optionnel)
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Montant ajusté"
                      type="number"
                      value={montantAjuste}
                      onChange={(e) => setMontantAjuste(Number(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Durée ajustée"
                      type="number"
                      value={dureeAjustee}
                      onChange={(e) => setDureeAjustee(Number(e.target.value))}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">jours</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nom de la garantie"
                      value={nomGarantie}
                      onChange={(e) => setNomGarantie(e.target.value)}
                      placeholder="Ex: Hypothèque, Nantissement, Caution..."
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Sélection de l'opinion */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                👥 Sélectionnez votre opinion:
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={currentOpinion.opinion === 'FAVORABLE' ? 'contained' : 'outlined'}
                    color="success"
                    onClick={() => setCurrentOpinion({...currentOpinion, opinion: 'FAVORABLE'})}
                    startIcon={<CheckCircleIcon />}
                    sx={{ py: 2 }}
                  >
                    FAVORABLE
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    Approuver la demande
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={currentOpinion.opinion === 'DEFAVORABLE' ? 'contained' : 'outlined'}
                    color="error"
                    onClick={() => setCurrentOpinion({...currentOpinion, opinion: 'DEFAVORABLE'})}
                    startIcon={<CancelIcon />}
                    sx={{ py: 2 }}
                  >
                    DÉFAVORABLE
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    Rejeter la demande
                  </Typography>
                </Grid>
              </Grid>

              {/* Commentaire */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                💬 Commentaire (obligatoire):
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={currentOpinion.commentaire}
                onChange={(e) => setCurrentOpinion({...currentOpinion, commentaire: e.target.value})}
                placeholder="Justifiez votre décision avec un commentaire détaillé..."
                variant="outlined"
              />
            </Box>
          )}
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
            disabled={!currentOpinion.opinion || !currentOpinion.commentaire.trim() || submittingOpinion}
            startIcon={submittingOpinion ? <CircularProgress size={20} /> : <ThumbUpIcon />}
          >
            {submittingOpinion ? 'Soumission...' : 'Soumettre la Décision'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Génération PV */}
      <Dialog
        open={pvDialogOpen}
        onClose={() => !generatingPV && setPvDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotesIcon />
          Génération du PV - Demande {selectedApplication?.numero_demande}
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
          <Button
            onClick={() => setPvDialogOpen(false)}
            disabled={generatingPV}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComiteAgenceDashboard;
