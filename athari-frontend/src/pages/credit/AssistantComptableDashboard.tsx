// pages/AssistantComptableDashboard.jsx
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
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalculateIcon from '@mui/icons-material/Calculate';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
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
  pv_generated?: boolean;
  movement_executed?: boolean;
  comptable_opinion_given?: boolean;
  pv_data?: any;
  movement_data?: any;
  client?: any;
  type_credit?: any;
}

const AssistantComptableDashboard = () => {
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
  const [opinionDialogOpen, setOpinionDialogOpen] = useState(false);

  // Processing states
  const [givingOpinion, setGivingOpinion] = useState(false);
  const [currentOpinion, setCurrentOpinion] = useState({
    opinion: '',
    commentaire: '',
    niveau_avis: 'ASSISTANT_COMPTABLE',
    score_risque: ''
  });

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Amortization table state
  const [amortizationData, setAmortizationData] = useState<any[]>([]);
  const [showAmortizationTable, setShowAmortizationTable] = useState(false);

  // Filter applications based on processing status and workflow
  const getFilteredApplications = () => {
    let filtered = applications;

    // Strict workflow: Only show applications in CA_VALIDE status (after Chef Agence approval)
    filtered = filtered.filter(app => app.statut === 'CA_VALIDE');

    // Filter by tab value
    switch (tabValue) {
      case 0: // En attente (ASC hasn't given opinion yet - CA_VALIDE status)
        filtered = filtered.filter(app => !app.comptable_opinion_given);
        break;
      case 1: // Approuvées (ASC has approved - ASC_VALIDE status)
        filtered = filtered.filter(app => app.statut === 'ASC_VALIDE');
        break;
      case 2: // Rejetées (ASC has rejected - REJETE status)
        filtered = filtered.filter(app => app.statut === 'REJETE');
        break;
      default:
        filtered = filtered;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.client?.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://127.0.0.1:8000/api/credit-applications', {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        // Filter applications for assistant comptable (where statut is CA_VALIDE)
        const filteredApps = (data.data || []).filter(app => {
          return app.statut === 'CA_VALIDE';
        });

        // Add flags for processing status
        const appsWithFlags = filteredApps.map(app => ({
          ...app,
          pv_generated: app.pv_generated || false,
          movement_executed: app.movement_executed || false,
          comptable_opinion_given: app.comptable_opinion_given || false,
          pv_data: app.pv_data || null,
          movement_data: app.movement_data || null
        }));

        setApplications(appsWithFlags);
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
  
  useEffect(() => {
    loadApplications();
  }, []);

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
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
      setGivingOpinion(true);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const requestBody: any = {
        opinion: currentOpinion.opinion,
        commentaire: currentOpinion.commentaire.trim(),
        niveau_avis: currentOpinion.niveau_avis || 'ASSISTANT_COMPTABLE'
      };

      // Add optional score_risque if provided
      if (currentOpinion.score_risque && currentOpinion.score_risque.trim() !== '') {
        const scoreValue = parseInt(currentOpinion.score_risque);
        if (!isNaN(scoreValue) && scoreValue >= 0 && scoreValue <= 100) {
          requestBody.score_risque = scoreValue;
        }
      }

      console.log('Envoi de l\'avis avec le corps:', requestBody);

      const response = await fetch(`http://127.0.0.1:8000/api/credit-applications/${selectedApplication.id}/avis`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la soumission';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `Erreur ${response.status}: ${response.statusText}`;
          // Log des erreurs détaillées
          if (errorData.errors) {
            console.error('Erreurs de validation:', errorData.errors);
          }
        } catch (parseError) {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Avis soumis avec succès:', data);

      // Fermer le dialog et réinitialiser le formulaire
      setOpinionDialogOpen(false);
      setCurrentOpinion({ 
        opinion: '', 
        commentaire: '', 
        niveau_avis: 'ASSISTANT_COMPTABLE', 
        score_risque: '' 
      });

      // Refresh the applications list to show updated avis
      await loadApplications();

    } catch (err: any) {
      console.error('Erreur lors de la soumission:', err);
      setError(`Erreur lors de la soumission: ${err.message}`);
    } finally {
      setGivingOpinion(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calculate amortization schedule
  const calculateAmortization = (montant: number, duree: number, interet_total: number, frais_dossier: number, frais_etude: number) => {
    const totalAmount = parseFloat(montant?.toString() || '0') + 
                       parseFloat(interet_total?.toString() || '0') + 
                       parseFloat(frais_dossier?.toString() || '0') + 
                       parseFloat(frais_etude?.toString() || '0');
    const dailyPayment = totalAmount / parseFloat(duree?.toString() || '1');
    const amortizationData = [];
    let remainingBalance = totalAmount;
    let cumulativePaid = 0;

    for (let i = 1; i <= parseFloat(duree?.toString() || '1'); i++) {
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() + i);

      cumulativePaid += dailyPayment;
      remainingBalance -= dailyPayment;

      amortizationData.push({
        numero: i,
        dateRemboursement: paymentDate.toLocaleDateString('fr-FR'),
        montantRemboursement: dailyPayment,
        soldeRestant: Math.max(0, remainingBalance),
        cumulRembourse: cumulativePaid
      });
    }

    return amortizationData;
  };

  // Render amortization table
  const renderAmortizationTable = () => {
    if (!selectedApplication || !showAmortizationTable) return null;

    const data = calculateAmortization(
      selectedApplication.montant,
      selectedApplication.duree,
      selectedApplication.interet_total,
      selectedApplication.frais_dossier || 0,
      selectedApplication.frais_etude
    );

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
          <CalculateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Tableau d'Amortissement
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>N°</TableCell>
                <TableCell>Date de Remboursement</TableCell>
                <TableCell align="right">Montant du Remboursement</TableCell>
                <TableCell align="right">Solde Restant</TableCell>
                <TableCell align="right">Cumul Remboursé</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.numero}>
                  <TableCell>{row.numero}</TableCell>
                  <TableCell>{row.dateRemboursement}</TableCell>
                  <TableCell align="right">{formatCurrency(row.montantRemboursement)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.soldeRestant)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.cumulRembourse)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      'pending': 'warning',
      'agent_credit': 'info',
      'analyste_credit': 'success',
      'chef_agence': 'success',
      'assistant_comptable': 'primary',
      'finalise': 'success',
      'rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'En attente',
      'agent_credit': 'À analyser',
      'analyste_credit': 'Analysé',
      'chef_agence': 'Validé chef',
      'assistant_comptable': 'Comptabilité',
      'finalise': 'Finalisé',
      'rejected': 'Rejeté'
    };
    return labels[status] || status;
  };

  const filteredApplications = getFilteredApplications();

  // Calculate statistics
  const stats = {
    totalApplications: applications.length,
    pendingOpinions: applications.filter(app => !app.comptable_opinion_given).length,
    opinionsGiven: applications.filter(app => app.comptable_opinion_given).length
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
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 4 }}>
            <AccountBalanceIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Tableau de Bord Assistant Comptable
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    En Attente
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.pendingOpinions}
                  </Typography>
                  <Typography variant="body2">
                    Demandes en attente d'avis comptable
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    Approuvées
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {applications.filter(app => {
                      const comptableAvis = app.avis?.find((avis: any) => avis.role === 'comptable');
                      return comptableAvis && comptableAvis.opinion === 'FAVORABLE';
                    }).length}
                  </Typography>
                  <Typography variant="body2">
                    Demandes approuvées par comptable
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    Rejetées
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {applications.filter(app => {
                      const comptableAvis = app.avis?.find((avis: any) => avis.role === 'comptable');
                      return comptableAvis && comptableAvis.opinion === 'DEFAVORABLE';
                    }).length}
                  </Typography>
                  <Typography variant="body2">
                    Demandes rejetées par comptable
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)} aria-label="application tabs">
              <Tab label={`En Attente (${stats.pendingOpinions})`} />
              <Tab label={`Approuvées (${applications.filter(app => {
                const comptableAvis = app.avis?.find((avis: any) => avis.role === 'comptable');
                return comptableAvis && comptableAvis.opinion === 'FAVORABLE';
              }).length})`} />
              <Tab label={`Rejetées (${applications.filter(app => {
                const comptableAvis = app.avis?.find((avis: any) => avis.role === 'comptable');
                return comptableAvis && comptableAvis.opinion === 'DEFAVORABLE';
              }).length})`} />
            </Tabs>
          </Box>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Rechercher par nom client, numéro demande, montant..."
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
                  <TableCell>Montant</TableCell>
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
                            {application.client?.nom_complet || 'Client-' + application.client_id}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {application.client?.num_client || `CLIENT-${application.client_id}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(parseFloat(application.montant?.toString() || '0'))}
                          </Typography>
                          {parseFloat(application.montant?.toString() || '0') > 500000 && (
                            <Chip label="> 500k" color="warning" size="small" sx={{ mt: 0.5 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(application.created_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(application.status)}
                            color={getStatusColor(application.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDetails(application)}
                            sx={{ mr: 1 }}
                          >
                            Détails
                          </Button>
                          {!application.comptable_opinion_given && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<DescriptionIcon />}
                              onClick={() => handleGiveOpinion(application)}
                            >
                              Donner avis
                            </Button>
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

          {/* Detail Dialog */}
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
                  {/* General Information */}
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
                      <Chip
                        label={getStatusLabel(selectedApplication.status)}
                        color={getStatusColor(selectedApplication.status) as any}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Date de Demande:</Typography>
                      <Typography variant="body1">{new Date(selectedApplication.created_at).toLocaleDateString('fr-FR')}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">N° Compte:</Typography>
                          <Typography variant="body1">{selectedApplication.compte_info.numero_compte || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">ID Client:</Typography>
                          <Typography variant="body1">{selectedApplication.compte_info.client_id || 'N/A'}</Typography>
                        </Grid>
                      </>
                    )}
                    {selectedApplication.client && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Nom Client:</Typography>
                          <Typography variant="body1">{selectedApplication.client.nom_complet || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Numéro Client:</Typography>
                          <Typography variant="body1">{selectedApplication.client.num_client || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Email:</Typography>
                          <Typography variant="body1">{selectedApplication.client.email || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Téléphone:</Typography>
                          <Typography variant="body1">{selectedApplication.client.telephone || 'N/A'}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>

                  {/* Financial Details */}
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                    Détails Financiers
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Montant Demandé:</Typography>
                      <Typography variant="body1" fontWeight="medium">{formatCurrency(parseFloat(selectedApplication.montant?.toString() || '0'))}</Typography>
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
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Frais de Dossier:</Typography>
                      <Typography variant="body1">{selectedApplication.frais_dossier ? formatCurrency(selectedApplication.frais_dossier) : 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Frais d'Étude:</Typography>
                      <Typography variant="body1">{selectedApplication.frais_etude ? formatCurrency(selectedApplication.frais_etude) : 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Montant Total:</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedApplication.montant_total ? formatCurrency(selectedApplication.montant_total) : 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Pénalité par Jour:</Typography>
                      <Typography variant="body1">{selectedApplication.penalite_par_jour ? formatCurrency(selectedApplication.penalite_par_jour) : 'N/A'}</Typography>
                    </Grid>
                  </Grid>

                  {/* Income and Debts */}
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                    Revenus et Dettes
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Source de Revenus:</Typography>
                      <Typography variant="body1">{selectedApplication.source_revenus || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Revenus Mensuels:</Typography>
                      <Typography variant="body1">{selectedApplication.revenus_mensuels ? formatCurrency(selectedApplication.revenus_mensuels) : 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Autres Revenus:</Typography>
                      <Typography variant="body1">{selectedApplication.autres_revenus ? formatCurrency(selectedApplication.autres_revenus) : 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Montant des Dettes:</Typography>
                      <Typography variant="body1">{selectedApplication.montant_dettes ? formatCurrency(selectedApplication.montant_dettes) : 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Description des Dettes:</Typography>
                      <Typography variant="body1">{selectedApplication.description_dette || 'N/A'}</Typography>
                    </Grid>
                  </Grid>

                  {/* Other Information */}
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, pb: 1 }}>
                    Autres Informations
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Nom de la Banque:</Typography>
                      <Typography variant="body1">{selectedApplication.nom_banque || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Numéro de Banque:</Typography>
                      <Typography variant="body1">{selectedApplication.numero_banque || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Code Mise en Place:</Typography>
                      <Typography variant="body1">{selectedApplication.code_mise_en_place || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Note de Crédit:</Typography>
                      <Typography variant="body1">{selectedApplication.note_credit || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Plan d'Épargne:</Typography>
                      <Typography variant="body1">{selectedApplication.plan_epargne ? 'Oui' : 'Non'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12}>
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
                                label={avis.opinion === 'FAVORABLE' ? 'Approuvé' : avis.opinion === 'DEFAVORABLE' ? 'Rejeté' : avis.opinion}
                                color={avis.opinion === 'FAVORABLE' ? 'success' : avis.opinion === 'DEFAVORABLE' ? 'error' : 'default'}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Commentaire: {avis.commentaire || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Date: {new Date(avis.created_at).toLocaleDateString('fr-FR')}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  )}

                  {/* Amortization Table Toggle */}
                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<CalculateIcon />}
                      onClick={() => setShowAmortizationTable(!showAmortizationTable)}
                      sx={{ mb: 2 }}
                    >
                      {showAmortizationTable ? 'Masquer' : 'Voir'} Tableau d'Amortissement
                    </Button>
                    {renderAmortizationTable()}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>
                Fermer
              </Button>
              {selectedApplication && (selectedApplication.statut === 'SOUMIS' || selectedApplication.statut === 'EN_COURS') && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    handleGiveOpinion(selectedApplication);
                  }}
                  startIcon={<DescriptionIcon />}
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
              <DescriptionIcon />
              Donner un Avis - {selectedApplication?.numero_demande}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                {selectedApplication && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Client: {selectedApplication.client?.nom_complet || 'Client-' + selectedApplication.client_id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Montant: {formatCurrency(parseFloat(selectedApplication.montant?.toString() || '0'))}
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
                    Approuver
                  </Button>
                  <Button
                    fullWidth
                    variant={currentOpinion.opinion === 'DEFAVORABLE' ? 'contained' : 'outlined'}
                    color="error"
                    onClick={() => setCurrentOpinion({...currentOpinion, opinion: 'DEFAVORABLE'})}
                    startIcon={<CancelIcon />}
                    sx={{ py: 1.5 }}
                  >
                    Rejeter
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

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                  Score de risque (optionnel):
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  value={currentOpinion.score_risque}
                  onChange={(e) => setCurrentOpinion({...currentOpinion, score_risque: e.target.value})}
                  placeholder="Score de risque (0-100)"
                  variant="outlined"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpinionDialogOpen(false)}
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
                {givingOpinion ? 'Envoi en cours...' : 'Soumettre l\'Avis'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default AssistantComptableDashboard;