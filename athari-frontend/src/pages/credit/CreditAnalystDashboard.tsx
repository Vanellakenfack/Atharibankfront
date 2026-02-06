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
  List,
  ListItem,
  ListItemText,
  Divider,
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import creditService from '../../services/creditService';
import OpinionForm from '../../components/credit/OpinionForm';
import WorkflowStatus from '../../components/credit/WorkflowStatus';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const CreditAnalystDashboard = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Dialog states
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [opinionDialogOpen, setOpinionDialogOpen] = useState(false);
  const [submittingOpinion, setSubmittingOpinion] = useState(false);

  // Filter applications based on status
  const getFilteredApplications = () => {
    let filtered = applications;

    // Filter by tab
    if (tabValue === 0) {
      // Pending applications for analyst
      filtered = filtered.filter(app => app.status === 'agent_credit');
    } else if (tabValue === 1) {
      // Applications already analyzed by analyst
      filtered = filtered.filter(app => app.status === 'analyste_credit');
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

      // Get applications for analyst role - UPDATED ENDPOINT
      // Check what endpoint your backend actually provides
      const response = await creditService.getApplicationsByRole('analyst');

      if (response.success) {
        setApplications(response.data || []);
      } else {
        setError(response.error || 'Erreur lors du chargement des demandes');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur. Vérifiez que l\'API backend est en cours d\'exécution.');
      console.error('Erreur chargement demandes:', err);
      
      // For development/demo purposes, you can use mock data
      // setApplications(mockApplications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
  };

  const handleGiveOpinion = (application: any) => {
    setSelectedApplication(application);
    setOpinionDialogOpen(true);
  };

  const handleSubmitOpinion = async (creditId: number, avisData: any) => {
    setSubmittingOpinion(true);

    try {
      const response = await creditService.submitAvis(creditId, avisData);

      if (response.success) {
        // Update local state
        setApplications(prev =>
          prev.map(app =>
            app.id === creditId
              ? { ...app, status: 'analyste_credit', last_opinion: avisData }
              : app
          )
        );

        setOpinionDialogOpen(false);
        setSelectedApplication(null);

        // Reload applications to get updated data
        await loadApplications();
      } else {
        throw new Error(response.error || 'Erreur lors de la soumission de l\'avis');
      }
    } catch (err) {
      throw err;
    } finally {
      setSubmittingOpinion(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'warning',
      'agent_credit': 'info',
      'analyste_credit': 'success',
      'rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'agent_credit': 'À analyser',
      'analyste_credit': 'Analysé',
      'rejected': 'Rejeté'
    };
    return labels[status] || status;
  };

  const getOpinionIcon = (opinion: string) => {
    return opinion === 'approuver' ? <ThumbUpIcon color="success" /> : <ThumbDownIcon color="error" />;
  };

  const filteredApplications = getFilteredApplications();

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
        <BusinessIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Tableau de Bord Analyste de Crédit
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Demandes à analyser
              </Typography>
              <Typography variant="h4" color="info.main">
                {applications.filter(app => app.status === 'agent_credit').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Demandes analysées
              </Typography>
              <Typography variant="h4" color="success.main">
                {applications.filter(app => app.status === 'analyste_credit').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Montant total en attente
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(
                  applications
                    .filter(app => app.status === 'agent_credit')
                    .reduce((sum, app) => sum + parseFloat(app.montant || 0), 0)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label={`À analyser (${applications.filter(app => app.status === 'agent_credit').length})`} />
          <Tab label={`Analysées (${applications.filter(app => app.status === 'analyste_credit').length})`} />
        </Tabs>
      </Paper>

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
      {filteredApplications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            {tabValue === 0 ? 'Aucune demande à analyser' : 'Aucune demande analysée'}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {searchTerm ? 'Aucun résultat pour votre recherche' : 'Toutes les demandes sont traitées'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N° Demande</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Type Crédit</TableCell>
                <TableCell>Risque</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications
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
                        {formatCurrency(application.montant)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {application.type_credit?.nom || application.type_credit_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={application.risk_level || 'Moyen'}
                        color={
                          application.risk_level === 'Faible' ? 'success' :
                          application.risk_level === 'Élevé' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(application.created_at).toLocaleDateString('fr-FR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(application.status)}
                        color={getStatusColor(application.status) as 'success' | 'error' | 'warning' | 'info' | 'default'}
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
                      {tabValue === 0 && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleGiveOpinion(application)}
                        >
                          Analyser
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
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
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Analyse de la demande de crédit
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
                <Grid item size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>Informations client</Typography>
                  <Typography><strong>Nom:</strong> {selectedApplication.client?.nom_complet}</Typography>
                  <Typography><strong>Numéro client:</strong> {selectedApplication.client?.num_client}</Typography>
                  <Typography><strong>Email:</strong> {selectedApplication.client?.email}</Typography>
                  <Typography><strong>Téléphone:</strong> {selectedApplication.client?.telephone}</Typography>
                </Grid>
                <Grid item size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>Détails du crédit</Typography>
                  <Typography><strong>Montant:</strong> {formatCurrency(selectedApplication.montant)}</Typography>
                  <Typography><strong>Durée:</strong> {selectedApplication.duree} mois</Typography>
                  <Typography><strong>Taux:</strong> {selectedApplication.taux_interet}%</Typography>
                  <Typography><strong>Type:</strong> {selectedApplication.type_credit?.nom}</Typography>
                </Grid>
              </Grid>

              {/* Risk Analysis Section */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Analyse de risque</Typography>
                <Grid container spacing={2}>
                  <Grid item size={{ xs: 12, md: 4 }}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary">Niveau de risque</Typography>
                      <Chip
                        label={selectedApplication.risk_level || 'Moyen'}
                        color={
                          selectedApplication.risk_level === 'Faible' ? 'success' :
                          selectedApplication.risk_level === 'Élevé' ? 'error' : 'warning'
                        }
                        size="medium"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item size={{ xs: 12, md: 4 }}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary">Ratio dette/revenus</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {selectedApplication.debt_ratio ? `${selectedApplication.debt_ratio}%` : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item size={{ xs: 12, md: 4 }}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary">Score crédit</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {selectedApplication.credit_score || 'N/A'}/1000
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Financial Information */}
              {selectedApplication.financial_info && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Informations financières</Typography>
                  <Grid container spacing={2}>
                    <Grid item size={{ xs: 12, md: 6 }}>
                      <Typography><strong>Source de revenus:</strong> {selectedApplication.financial_info.source_revenus}</Typography>
                      <Typography><strong>Revenus mensuels:</strong> {formatCurrency(selectedApplication.financial_info.revenus_mensuels)}</Typography>
                      <Typography><strong>Dépenses mensuelles:</strong> {formatCurrency(selectedApplication.financial_info.depenses_mensuelles)}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, md: 6 }}>
                      <Typography><strong>Montant dettes:</strong> {formatCurrency(selectedApplication.financial_info.montant_dettes || 0)}</Typography>
                      <Typography><strong>Nom banque:</strong> {selectedApplication.financial_info.nom_banque}</Typography>
                      <Typography><strong>Numéro compte:</strong> {selectedApplication.financial_info.numero_compte}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Previous Opinions */}
              {selectedApplication.avis && selectedApplication.avis.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Avis précédents</Typography>
                  <List>
                    {selectedApplication.avis.map((avis: any, index: number) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getOpinionIcon(avis.opinion)}
                                <Typography variant="subtitle2">
                                  Agent de Crédit - {avis.opinion === 'approuver' ? 'Approuvé' : 'Rejeté'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {new Date(avis.created_at).toLocaleDateString('fr-FR')}
                                </Typography>
                              </Box>
                            }
                            secondary={avis.comment}
                          />
                        </ListItem>
                        {index < selectedApplication.avis.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Opinion Dialog */}
      <Dialog
        open={opinionDialogOpen}
        onClose={() => setOpinionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Donner votre avis d'analyse - Demande {selectedApplication?.numero_demande || selectedApplication?.id}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <OpinionForm
              creditId={selectedApplication.id}
              role="analyste"
              onSubmit={handleSubmitOpinion}
              loading={submittingOpinion}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpinionDialogOpen(false)} disabled={submittingOpinion}>
            Annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreditAnalystDashboard;