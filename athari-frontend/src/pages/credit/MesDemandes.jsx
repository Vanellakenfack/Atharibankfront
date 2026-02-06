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
  Card,
  CardContent,
  Container,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';


const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const MesDemandes = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
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
        // Filter applications for statut SOUMIS
        const filteredApps = (data.data || []).filter((app) => {
          return app.statut === 'SOUMIS';
        });

        setApplications(filteredApps);
      } else {
        setApplications([]);
      }

    } catch (err) {
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

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
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
      'SOUMIS': 'warning',
      'CA_VALIDE': 'info',
      'ASC_VALIDE': 'primary',
      'COMITE': 'secondary',
      'APPROUVE': 'success',
      'REJETE': 'error',
      'en_attente': 'warning',
      'approuve': 'success',
      'rejette': 'error',
      'EN_COURS': 'info',
      'ACCEPTE': 'success',
      'REFUSE': 'error',
      'ANNULE': 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'SOUMIS': 'Soumis',
      'CA_VALIDE': 'CA Validé',
      'ASC_VALIDE': 'ASC Validé',
      'COMITE': 'Comité',
      'APPROUVE': 'Approuvé',
      'REJETE': 'Rejeté',
      'en_attente': 'En attente',
      'approuve': 'Approuvé',
      'rejette': 'Rejeté',
      'EN_COURS': 'En cours',
      'ACCEPTE': 'Accepté',
      'REFUSE': 'Refusé',
      'ANNULE': 'Annulé'
    };
    return labels[status] || status;
  };

  const filteredApplications = applications.filter(app =>
    app.client?.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.numero_demande?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.montant?.toString().includes(searchTerm)
  );

  // Calculate statistics
  const stats = {
    totalApplications: applications.length,
    totalAmount: applications.reduce((sum, app) => sum + parseFloat(app.montant || 0), 0)
  };

  if (loading) {
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
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DescriptionIcon />
              Mes Demandes de Crédit
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Consultez l'état de vos demandes de crédit soumises.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Statistics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceIcon />
                    Total Demandes
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {stats.totalApplications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toutes vos demandes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoneyIcon />
                    Montant Total
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(stats.totalAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valeur de vos demandes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon />
                    En Cours
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {applications.filter(app => app.statut === 'SOUMIS').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Demandes en traitement
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Liste de vos Demandes
              </Typography>
              <TextField
                size="small"
                placeholder="Rechercher..."
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
            </Box>

            {filteredApplications.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>N° Demande</TableCell>
                      <TableCell>Montant</TableCell>
                      <TableCell>Durée</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredApplications
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((app) => (
                        <TableRow key={app.id} hover>
                          <TableCell>{app.numero_demande}</TableCell>
                          <TableCell>{formatCurrency(app.montant)}</TableCell>
                          <TableCell>{app.duree} jours</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(app.statut)}
                              color={getStatusColor(app.statut)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(app.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewDetails(app)}
                            >
                              Détails
                            </Button>
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
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} sur ${count}`
                  }
                />
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucune demande trouvée
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vous n'avez pas encore soumis de demande de crédit.
                </Typography>
              </Box>
            )}
          </StyledPaper>

          {/* Details Dialog */}
          <Dialog
            open={detailDialogOpen}
            onClose={() => setDetailDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VisibilityIcon />
              Détails de la Demande #{selectedApplication?.numero_demande}
            </DialogTitle>
            <DialogContent>
              {selectedApplication && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">N° Demande:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedApplication.numero_demande}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Statut:</Typography>
                      <Chip
                        label={getStatusLabel(selectedApplication.statut)}
                        color={getStatusColor(selectedApplication.statut)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Montant:</Typography>
                      <Typography variant="body1">{formatCurrency(selectedApplication.montant)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Durée:</Typography>
                      <Typography variant="body1">{selectedApplication.duree} jours</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Date de Soumission:</Typography>
                      <Typography variant="body1">
                        {new Date(selectedApplication.created_at).toLocaleDateString('fr-FR')}
                      </Typography>
                    </Grid>
                    {selectedApplication.client && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Client:</Typography>
                        <Typography variant="body1">{selectedApplication.client.nom_complet}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Fermer</Button>
            </DialogActions>
          </Dialog>
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
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DescriptionIcon />
              Mes Demandes de Crédit
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Consultez l'état de vos demandes de crédit soumises.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Statistics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceIcon />
                    Total Demandes
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {stats.totalApplications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toutes vos demandes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoneyIcon />
                    Montant Total
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(stats.totalAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valeur de vos demandes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon />
                    En Cours
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {applications.filter(app => app.statut === 'SOUMIS').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Demandes en traitement
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Liste de vos Demandes
              </Typography>
              <TextField
                size="small"
                placeholder="Rechercher..."
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
            </Box>

            {filteredApplications.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>N° Demande</TableCell>
                      <TableCell>Montant</TableCell>
                      <TableCell>Durée</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredApplications
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((app) => (
                        <TableRow key={app.id} hover>
                          <TableCell>{app.numero_demande}</TableCell>
                          <TableCell>{formatCurrency(app.montant)}</TableCell>
                          <TableCell>{app.duree} jours</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(app.statut)}
                              color={getStatusColor(app.statut)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(app.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewDetails(app)}
                            >
                              Détails
                            </Button>
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
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} sur ${count}`
                  }
                />
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucune demande trouvée
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vous n'avez pas encore soumis de demande de crédit.
                </Typography>
              </Box>
            )}
          </StyledPaper>

          {/* Details Dialog */}
          <Dialog
            open={detailDialogOpen}
            onClose={() => setDetailDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VisibilityIcon />
              Détails de la Demande #{selectedApplication?.numero_demande}
            </DialogTitle>
            <DialogContent>
              {selectedApplication && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">N° Demande:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedApplication.numero_demande}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Statut:</Typography>
                      <Chip
                        label={getStatusLabel(selectedApplication.statut)}
                        color={getStatusColor(selectedApplication.statut)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Montant:</Typography>
                      <Typography variant="body1">{formatCurrency(selectedApplication.montant)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Durée:</Typography>
                      <Typography variant="body1">{selectedApplication.duree} jours</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Date de Soumission:</Typography>
                      <Typography variant="body1">
                        {new Date(selectedApplication.created_at).toLocaleDateString('fr-FR')}
                      </Typography>
                    </Grid>
                    {selectedApplication.client && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Client:</Typography>
                        <Typography variant="body1">{selectedApplication.client.nom_complet}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Fermer</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default MesDemandes;
