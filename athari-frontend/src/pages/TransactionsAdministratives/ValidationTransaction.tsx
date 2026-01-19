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
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Avatar,
  TablePagination,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Lock,
  AttachMoney,
  Assignment,
  Security,
  Refresh,
  AccountBalance,
  Person,
  CreditCard,
  Receipt,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import ApiClient from '../../services/api/ApiClient';

// --- INTERFACES ---
interface TiersInfo {
  nom_complet?: string;
  type_piece?: string;
  numero_piece?: string;
}

interface CaisseInfo {
  id?: number;
  guichet_session_id?: number;
  caissier_id?: number;
  caisse_id?: number;
  agence?: string;
  guichet?: string;
  caisse?: string;
  caissiere?: string;
}

interface DemandeValidation {
  id: number;
  type_operation: string;
  montant: number;
  statut: string;
  code_validation?: string;
  payload_data: {
    type?: string;
    montant_brut?: number;
    compte_id?: number;
    compte?: string;
    origine_fonds?: string;
    numero_bordereau?: string;
    tiers?: TiersInfo;
    billetage?: Array<{ valeur: number; quantite: number }>;
    caisse_active?: CaisseInfo;
    caissiere?: {
      id: number;
      name: string;
      email?: string;
    };
    porteur_nom?: string;
    porteur_piece?: string;
    agence?: string;
    guichet?: string;
    caisse?: string;
    motif?: string;
  };
  caissiere_id: number;
  caissiere?: {
    id: number;
    name: string;
    email?: string;
  };
  created_at: string;
  updated_at: string;
  date_approbation?: string;
  motif_rejet?: string;
}

interface ApiResponse {
  success?: boolean;
  data?: DemandeValidation[];
  message?: string;
}

// --- COMPOSANTS STYLISÉS ---
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  ...(status === 'EN_ATTENTE' && {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  }),
  ...(status === 'APPROUVE' && {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  }),
  ...(status === 'REJETE' && {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  }),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 100,
  margin: theme.spacing(0.5),
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const DetailSection = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

// --- COMPOSANT PRINCIPAL ---
const ValidationTransaction: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [demandes, setDemandes] = useState<DemandeValidation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedDemande, setSelectedDemande] = useState<DemandeValidation | null>(null);
  const [detailDialog, setDetailDialog] = useState<boolean>(false);
  const [approvalDialog, setApprovalDialog] = useState<boolean>(false);
  const [rejectionDialog, setRejectionDialog] = useState<boolean>(false);
  const [rejectionMotif, setRejectionMotif] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });
  
  // Pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);

  // Charger les demandes
  const loadDemandes = async () => {
    try {
      setRefreshing(true);
      const response = await ApiClient.get<ApiResponse>('/assistant/demandes-en-attente');
      
      let demandesData: DemandeValidation[] = [];
      
      if (Array.isArray(response.data)) {
        demandesData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray((response.data as ApiResponse).data)) {
          demandesData = (response.data as ApiResponse).data!;
        } else if (Array.isArray(response.data)) {
          demandesData = response.data as DemandeValidation[];
        }
      }
      
      setDemandes(demandesData);
      showSnackbar(`${demandesData.length} demande(s) chargée(s)`, 'success');
    } catch (error: any) {
      console.error('Erreur chargement demandes:', error);
      showSnackbar(
        error.response?.data?.message || 
        'Erreur lors du chargement des demandes', 
        'error'
      );
      setDemandes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDemandes();
    
    const interval = setInterval(() => {
      if (!detailDialog && !approvalDialog && !rejectionDialog) {
        loadDemandes();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calcul des demandes pour la page actuelle
  const paginatedDemandes = demandes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleViewDetails = (demande: DemandeValidation) => {
    setSelectedDemande(demande);
    setDetailDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedDemande) return;

    try {
      const response = await ApiClient.post(`/supervision-caisse/approuver/${selectedDemande.id}`);
      
      if (response.data.success) {
        const code = response.data.code;
        setGeneratedCode(code);
        
        const codes = JSON.parse(localStorage.getItem('validation_codes') || '{}');
        codes[selectedDemande.id] = {
          code,
          demandeId: selectedDemande.id,
          type: selectedDemande.type_operation,
          montant: selectedDemande.montant,
          date: new Date().toISOString(),
        };
        localStorage.setItem('validation_codes', JSON.stringify(codes));
        
        showSnackbar('Demande approuvée avec succès', 'success');
        await loadDemandes();
      }
    } catch (error: any) {
      console.error('Erreur approbation:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de l\'approbation', 'error');
    } finally {
      setApprovalDialog(false);
      setDetailDialog(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDemande || !rejectionMotif.trim()) {
      showSnackbar('Veuillez saisir un motif de rejet', 'error');
      return;
    }

    try {
      const response = await ApiClient.post(`/supervision-caisse/rejeter/${selectedDemande.id}`, {
        motif: rejectionMotif,
      });

      if (response.data.success) {
        showSnackbar('Demande rejetée avec succès', 'success');
        await loadDemandes();
      }
    } catch (error: any) {
      console.error('Erreur rejet:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors du rejet', 'error');
    } finally {
      setRejectionDialog(false);
      setRejectionMotif('');
      setDetailDialog(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      showSnackbar('Code copié dans le presse-papier', 'success');
    }
  };

  // Statistiques
  const stats = {
    total: demandes.length,
    enAttente: demandes.filter(d => d.statut === 'EN_ATTENTE').length,
    approuvees: demandes.filter(d => d.statut === 'APPROUVE').length,
    rejetees: demandes.filter(d => d.statut === 'REJETE').length,
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Fonction pour extraire les informations du payload_data
  const getAccountInfo = (demande: DemandeValidation) => {
    return {
      compte: demande.payload_data?.compte || `COMPTE-${demande.payload_data?.compte_id || 'N/A'}`,
      origineFonds: demande.payload_data?.origine_fonds || 'Non spécifié',
      numeroBordereau: demande.payload_data?.numero_bordereau || 'N/A',
    };
  };

  const getPorteurInfo = (demande: DemandeValidation) => {
    if (demande.payload_data?.tiers) {
      return {
        nom: demande.payload_data.tiers.nom_complet || 'N/A',
        piece: demande.payload_data.tiers.numero_piece || 'N/A',
        typePiece: demande.payload_data.tiers.type_piece || 'N/A',
      };
    }
    return {
      nom: demande.payload_data?.porteur_nom || 'N/A',
      piece: demande.payload_data?.porteur_piece || 'N/A',
      typePiece: 'N/A',
    };
  };

  const getLocalisationInfo = (demande: DemandeValidation) => {
    if (demande.payload_data?.caisse_active) {
      return {
        agence: demande.payload_data.caisse_active.agence || 'N/A',
        guichet: demande.payload_data.caisse_active.guichet || `GUICHET-${demande.payload_data.caisse_active.guichet_session_id || 'N/A'}`,
        caisse: demande.payload_data.caisse_active.caisse || `CAISSE-${demande.payload_data.caisse_active.caisse_id || 'N/A'}`,
        caissiere: demande.payload_data.caisse_active.caissiere || 'N/A',
      };
    }
    return {
      agence: demande.payload_data?.agence || 'N/A',
      guichet: demande.payload_data?.guichet || 'N/A',
      caisse: demande.payload_data?.caisse || 'N/A',
      caissiere: demande.caissiere?.name || 'N/A',
    };
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`,
          transition: 'width 0.3s ease',
        }}
      >
        <TopBar sidebarOpen={sidebarOpen} />

        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
                  <Security sx={{ mr: 2, verticalAlign: 'middle' }} />
                  Validation des Transactions
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Interface de supervision et validation des opérations
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadDemandes}
                disabled={refreshing}
              >
                Actualiser
              </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      TOTAL
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Demandes
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard sx={{ borderLeftColor: '#ff9800' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      EN ATTENTE
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {stats.enAttente}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      À traiter
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard sx={{ borderLeftColor: '#4caf50' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      APPROUVÉES
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {stats.approuvees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Validées
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard sx={{ borderLeftColor: '#f44336' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      REJETÉES
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                      {stats.rejetees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Refusées
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>
          </Box>

          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#1a237e', color: 'white' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ mr: 1 }} />
                Demandes en attente de validation
              </Typography>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : demandes.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Lock sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Aucune demande en attente
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toutes les transactions ont été traitées
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>ID</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Montant</strong></TableCell>
                        <TableCell><strong>Caissière</strong></TableCell>
                        <TableCell><strong>Porteur</strong></TableCell>
                        <TableCell><strong>Compte</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Statut</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedDemandes.map((demande) => {
                        const porteurInfo = getPorteurInfo(demande);
                        const accountInfo = getAccountInfo(demande);
                        
                        return (
                          <StyledTableRow key={demande.id} hover onClick={() => handleViewDetails(demande)}>
                            <TableCell>#{demande.id}</TableCell>
                            <TableCell>
                              <Chip 
                                label={demande.type_operation || demande.payload_data?.type || 'N/A'} 
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" fontWeight={600} color="#1a237e">
                                {formatCurrency(demande.montant)} FCFA
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#1a237e' }}>
                                  {demande.caissiere?.name?.charAt(0) || 'C'}
                                </Avatar>
                                <Typography variant="body2">
                                  {demande.caissiere?.name || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {porteurInfo.nom}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {porteurInfo.piece}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {accountInfo.compte}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {formatDate(demande.created_at)}
                            </TableCell>
                            <TableCell>
                              <StatusChip 
                                label={demande.statut} 
                                status={demande.statut}
                                size="small"
                              />
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Voir détails">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleViewDetails(demande)}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                                {demande.statut === 'EN_ATTENTE' && (
                                  <>
                                    <Tooltip title="Approuver">
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedDemande(demande);
                                          setApprovalDialog(true);
                                        }}
                                      >
                                        <CheckCircle />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Rejeter">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedDemande(demande);
                                          setRejectionDialog(true);
                                        }}
                                      >
                                        <Cancel />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          </StyledTableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Pied de page avec pagination */}
                <TablePagination
                  rowsPerPageOptions={[10, 15, 25, 50]}
                  component="div"
                  count={demandes.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Lignes par page:"
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} sur ${count}`
                  }
                  sx={{
                    borderTop: '1px solid #e0e0e0',
                    bgcolor: '#fafafa',
                  }}
                />
              </>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Dialog de détails */}
      <Dialog 
        open={detailDialog} 
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment color="primary" />
            Détails de la demande #{selectedDemande?.id}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDemande && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Colonne gauche */}
              <Grid item xs={12} md={6}>
                <DetailSection>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Receipt /> Informations Opération
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Type d'opération
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {selectedDemande.type_operation || selectedDemande.payload_data?.type || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Montant
                        </Typography>
                        <Typography variant="body2" fontWeight={500} color="#1a237e">
                          {formatCurrency(selectedDemande.montant)} FCFA
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Date création
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(selectedDemande.created_at)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Statut
                        </Typography>
                        <StatusChip 
                          label={selectedDemande.statut} 
                          status={selectedDemande.statut}
                          size="small"
                        />
                      </Grid>
                      {selectedDemande.payload_data?.origine_fonds && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Origine des fonds
                          </Typography>
                          <Typography variant="body2">
                            {selectedDemande.payload_data.origine_fonds}
                          </Typography>
                        </Grid>
                      )}
                      {selectedDemande.payload_data?.numero_bordereau && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Numéro bordereau
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {selectedDemande.payload_data.numero_bordereau}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </DetailSection>

                <DetailSection>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalance /> Localisation
                    </Typography>
                    <Grid container spacing={2}>
                      {(() => {
                        const localisation = getLocalisationInfo(selectedDemande);
                        return (
                          <>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Agence
                              </Typography>
                              <Typography variant="body2">
                                {localisation.agence}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Guichet
                              </Typography>
                              <Typography variant="body2">
                                {localisation.guichet}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Caisse
                              </Typography>
                              <Typography variant="body2">
                                {localisation.caisse}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Caissière
                              </Typography>
                              <Typography variant="body2">
                                {localisation.caissiere}
                              </Typography>
                            </Grid>
                          </>
                        );
                      })()}
                    </Grid>
                  </CardContent>
                </DetailSection>
              </Grid>

              {/* Colonne droite */}
              <Grid item xs={12} md={6}>
                <DetailSection>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCard /> Informations Compte
                    </Typography>
                    <Grid container spacing={2}>
                      {(() => {
                        const accountInfo = getAccountInfo(selectedDemande);
                        return (
                          <>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Numéro compte
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {accountInfo.compte}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Origine des fonds
                              </Typography>
                              <Typography variant="body2">
                                {accountInfo.origineFonds}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Numéro bordereau
                              </Typography>
                              <Typography variant="body2">
                                {accountInfo.numeroBordereau}
                              </Typography>
                            </Grid>
                          </>
                        );
                      })()}
                    </Grid>
                  </CardContent>
                </DetailSection>

                <DetailSection>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person /> Informations Porteur
                    </Typography>
                    <Grid container spacing={2}>
                      {(() => {
                        const porteurInfo = getPorteurInfo(selectedDemande);
                        return (
                          <>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Nom complet
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {porteurInfo.nom}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Type pièce
                              </Typography>
                              <Typography variant="body2">
                                {porteurInfo.typePiece}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Numéro pièce
                              </Typography>
                              <Typography variant="body2">
                                {porteurInfo.piece}
                              </Typography>
                            </Grid>
                          </>
                        );
                      })()}
                    </Grid>
                  </CardContent>
                </DetailSection>

                {/* Billetage */}
                {selectedDemande.payload_data?.billetage && selectedDemande.payload_data.billetage.length > 0 && (
                  <DetailSection>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney /> Billetage
                      </Typography>
                      <Grid container spacing={1}>
                        {selectedDemande.payload_data.billetage.map((billet, index) => (
                          <Grid item xs={6} key={index}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                              <Typography variant="body2">
                                {formatCurrency(billet.valeur)} FCFA
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                × {billet.quantite}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </DetailSection>
                )}
              </Grid>

              {/* Code de validation si approuvé */}
              {selectedDemande.statut === 'APPROUVE' && selectedDemande.code_validation && (
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Code de validation généré: {selectedDemande.code_validation}
                    </Typography>
                    <Typography variant="body2">
                      Ce code a été communiqué à la caissière pour finaliser l'opération
                    </Typography>
                  </Alert>
                </Grid>
              )}

              {/* Motif de rejet si rejeté */}
              {selectedDemande.statut === 'REJETE' && selectedDemande.motif_rejet && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Motif du rejet
                    </Typography>
                    <Typography variant="body2">
                      {selectedDemande.motif_rejet}
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Fermer</Button>
          {selectedDemande?.statut === 'EN_ATTENTE' && (
            <>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => {
                  setDetailDialog(false);
                  setRejectionDialog(true);
                }}
              >
                Rejeter
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  setDetailDialog(false);
                  setApprovalDialog(true);
                }}
              >
                Approuver
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog d'approbation */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)}>
        <DialogTitle>
          <CheckCircle color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Confirmer l'approbation
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir approuver cette opération ?
          </Alert>
          {selectedDemande && (
            <Typography>
              Vous allez générer un code de validation pour la demande #{selectedDemande.id}
              <br />
              <strong>Montant: {formatCurrency(selectedDemande.montant)} FCFA</strong>
              <br />
              <strong>Porteur: {getPorteurInfo(selectedDemande).nom}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleApprove} variant="contained" color="success" autoFocus>
            Générer le code
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)}>
        <DialogTitle>
          <Cancel color="error" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Motif du rejet
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Veuillez indiquer le motif du rejet
          </Alert>
          <TextField
            autoFocus
            margin="dense"
            label="Motif du rejet *"
            fullWidth
            multiline
            rows={4}
            value={rejectionMotif}
            onChange={(e) => setRejectionMotif(e.target.value)}
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            disabled={!rejectionMotif.trim()}
          >
            Confirmer le rejet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de code généré */}
      <Dialog open={!!generatedCode} onClose={() => setGeneratedCode('')}>
        <DialogTitle>
          <Lock color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Code de validation généré
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            L'opération a été approuvée avec succès !
          </Alert>
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 800, 
              letterSpacing: 3,
              color: '#1a237e',
              bgcolor: '#e8eaf6',
              p: 3,
              borderRadius: 2,
              border: '2px dashed #1a237e'
            }}>
              {generatedCode}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Communiquez ce code à la caissière pour qu'elle puisse finaliser l'opération
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={handleCopyCode}
            startIcon={<Assignment />}
          >
            Copier le code
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setGeneratedCode('')}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ValidationTransaction;