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
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import creditService from '../../services/creditService';
import WorkflowStatus from '../../components/credit/WorkflowStatus';
import PVGeneration from '../../components/credit/PVGeneration';
import AccountMovement from '../../components/credit/AccountMovement';

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
  created_at: string;
  client?: {
    nom_complet?: string;
    num_client?: string;
    email?: string;
    telephone?: string;
  };
  status?: string;
  pv_generated?: boolean;
  movement_executed?: boolean;
  pv_data?: any;
  movement_data?: any;
  workflow_history?: any[];
  taux_interet?: number;
  type_credit?: {
    nom?: string;
  };
}

const AssistantJuridiqueDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Dialog states
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [pvDialogOpen, setPvDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);

  // Processing states
  const [generatingPV, setGeneratingPV] = useState(false);
  const [executingMovement, setExecutingMovement] = useState(false);

  // Filter applications based on search term
  const getFilteredApplications = () => {
    let filtered = Array.isArray(applications) ? applications : [];

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

      // Get all credit applications
      const response = await creditService.getCreditApplications();

      if (response.success) {
      // Filter applications where statut is MISE_EN_PLACE or APPROUVE
      const filteredApps = (response.data || []).filter(app => app.statut === 'MISE_EN_PLACE' || app.statut === 'APPROUVE');
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

  useEffect(() => {
    loadApplications();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
  };

  const handleGeneratePV = (application) => {
    setSelectedApplication(application);
    setPvDialogOpen(true);
  };

  const handleExecuteMovement = (application) => {
    setSelectedApplication(application);
    setMovementDialogOpen(true);
  };

  const handlePVGenerated = async (pvData) => {
    try {
      setGeneratingPV(true);
      
      // Call API to generate PV
      const response = await creditService.generatePV(selectedApplication.id, pvData);
      
      if (response.success) {
        // Update local state
        setApplications(prev =>
          prev.map(app =>
            app.id === selectedApplication.id
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

  const handleMovementExecuted = async (movementData) => {
    try {
      setExecutingMovement(true);
      
      // Call API to execute movement
      const response = await creditService.executeAccountMovement(selectedApplication.id, movementData);
      
      if (response.success) {
        // Update local state
        setApplications(prev =>
          prev.map(app =>
            app.id === selectedApplication.id
              ? { 
                  ...app, 
                  movement_executed: true, 
                  movement_data: response.data,
                  status: 'finalise' 
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
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

  const getStatusLabel = (status) => {
    const labels = {
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
  const safeApplications = Array.isArray(applications) ? applications : [];
  const stats = {
    pvToGenerate: safeApplications.filter(app =>
      app.status === 'chef_agence' &&
      parseFloat(app.montant || 0) <= 500000 &&
      !app.pv_generated
    ).length,
    movementsToExecute: safeApplications.filter(app =>
      app.status === 'chef_agence' &&
      parseFloat(app.montant || 0) <= 500000 &&
      app.pv_generated &&
      !app.movement_executed
    ).length,
    finalized: safeApplications.filter(app =>
      app.status === 'finalise' &&
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
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
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Statut
              </Typography>
              <Typography variant="h4" color="success.main">
                MISE_EN_PLACE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Applications validées par le comité
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
              <TableCell>Durée</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
                        {application.client?.nom_complet || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {application.client?.num_client || ''}
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
                        {new Date(application.created_at).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={application.statut}
                        color={application.statut === 'APPROUVE' ? 'success' : 'info'}
                        size="small"
                      />
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
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Détails de la demande de crédit
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <WorkflowStatus
                currentStatus={selectedApplication.status}
                workflowHistory={selectedApplication.workflow_history || []}
                compact
              />

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Informations client</Typography>
                  <Typography><strong>Nom:</strong> {selectedApplication.client?.nom_complet}</Typography>
                  <Typography><strong>Numéro client:</strong> {selectedApplication.client?.num_client}</Typography>
                  <Typography><strong>Email:</strong> {selectedApplication.client?.email}</Typography>
                  <Typography><strong>Téléphone:</strong> {selectedApplication.client?.telephone}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Détails du crédit</Typography>
                  <Typography><strong>Montant:</strong> {formatCurrency(parseFloat(selectedApplication.montant || 0))}</Typography>
                  <Typography><strong>Durée:</strong> {selectedApplication.duree} mois</Typography>
                  <Typography><strong>Taux:</strong> {selectedApplication.taux_interet}%</Typography>
                  <Typography><strong>Type:</strong> {selectedApplication.type_credit?.nom}</Typography>
                </Grid>
              </Grid>

              {/* PV Information */}
              {selectedApplication.pv_data && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Informations PV</Typography>
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
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Informations Mouvement</Typography>
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
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default AssistantJuridiqueDashboard;
