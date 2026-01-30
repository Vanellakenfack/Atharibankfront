import React, { useEffect, useState, useMemo } from "react";
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, TextField, 
  InputAdornment, Avatar, Paper, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem,
  Autocomplete, CircularProgress, Alert, TablePagination,
  Snackbar
} from "@mui/material";
import { Add, Edit, Search, FilterList, AccountBalance, Download, Refresh } from "@mui/icons-material";
import { indigo } from "@mui/material/colors";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";
import { chapitreService } from "../../services/chapitreService";

export default function PlanComptableList() {
  // États principaux
  const [accounts, setAccounts] = useState([]); // Tous les comptes
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  
  // États de chargement et erreurs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Pagination côté client
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // États pour la Modale
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  
  const [newAccount, setNewAccount] = useState({
    code: '',
    libelle: '',
    categorie_id: '',
    nature_solde: 'DEBIT',
    est_actif: true
  });

  const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

  // Charger TOUS les comptes d'un coup avec le service
  const fetchAllAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Début du chargement des comptes...');
      const allChapitres = await chapitreService.getChapitres();
      console.log(`Chargement terminé: ${allChapitres.length} comptes chargés`);
      setAccounts(allChapitres);
      
      showSnackbar('Tous les comptes ont été chargés avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error);
      setError("Impossible de charger les comptes. Veuillez réessayer.");
      showSnackbar('Erreur lors du chargement des comptes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Charger les catégories
  const fetchCategories = async () => {
    try {
      const response = await ApiClient.get("/plan-comptable/categories");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      showSnackbar('Erreur lors du chargement des catégories', 'warning');
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchAllAccounts();
    fetchCategories();
  }, []);

  // Filtrer les comptes localement
  const filteredAccounts = useMemo(() => {
    if (!search.trim()) return accounts;
    
    const searchLower = search.toLowerCase();
    return accounts.filter(account => {
      return (
        (account.code && account.code.toLowerCase().includes(searchLower)) ||
        (account.libelle && account.libelle.toLowerCase().includes(searchLower)) ||
        (account.categorie?.nom && account.categorie.nom.toLowerCase().includes(searchLower)) ||
        (account.categorie?.libelle && account.categorie.libelle.toLowerCase().includes(searchLower))
      );
    });
  }, [accounts, search]);

  // Pagination des comptes filtrés
  const paginatedAccounts = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredAccounts.slice(start, end);
  }, [filteredAccounts, page, rowsPerPage]);

  // Gestionnaires de pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Gestionnaires de snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Gestionnaires Modale
  const handleOpen = () => {
    setEditMode(false);
    setOpen(true);
  };

  const handleEditOpen = (account) => {
    setEditMode(true);
    setCurrentAccountId(account.id);
    setNewAccount({
      code: account.code || '',
      libelle: account.libelle || '',
      categorie_id: account.categorie?.id || '',
      nature_solde: account.comptabilite?.nature_solde || account.nature_solde || 'DEBIT',
      est_actif: account.statut?.est_actif ?? account.est_actif ?? true
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentAccountId(null);
    setNewAccount({ 
      code: '', 
      libelle: '', 
      categorie_id: '', 
      nature_solde: 'DEBIT', 
      est_actif: true 
    });
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        // Mode Modification
        await ApiClient.put(`/plan-comptable/comptes/${currentAccountId}`, newAccount);
        showSnackbar('Compte modifié avec succès', 'success');
      } else {
        // Mode Création
        await ApiClient.post("/plan-comptable/comptes", newAccount);
        showSnackbar('Compte créé avec succès', 'success');
      }
      
      // Recharger les données après sauvegarde
      await fetchAllAccounts();
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error.response?.data || error);
      
      // Si erreur 422 (validation Laravel)
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        showSnackbar(`Erreur de validation: ${errorMessages}`, 'error');
      } else {
        showSnackbar("Erreur lors de la sauvegarde. Veuillez réessayer.", 'error');
      }
    }
  };

  // Export CSV
  const handleExport = () => {
    const csvContent = [
      ['Code', 'Libellé', 'Catégorie', 'Nature', 'Statut'],
      ...accounts.map(acc => [
        acc.code,
        acc.libelle,
        acc.categorie?.nom || acc.categorie?.libelle || '',
        acc.comptabilite?.nature_solde || acc.nature_solde || '',
        acc.statut?.est_actif || acc.est_actif ? 'Actif' : 'Inactif'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-comptable-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showSnackbar('Export CSV terminé', 'success');
  };

  // Rafraîchir les données
  const handleRefresh = () => {
    fetchAllAccounts();
    showSnackbar('Données rafraîchies', 'info');
  };

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        
        {/* HEADER SECTION */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: indigo[500], background: activeGradient }}>
                <AccountBalance />
              </Avatar>
              Plan Comptable
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              {accounts.length} comptes chargés • Recherche instantanée
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              onClick={handleExport}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}
            >
              Exporter CSV
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}
            >
              Rafraîchir
            </Button>
            
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={handleOpen}
              sx={{ borderRadius: 3, background: activeGradient, textTransform: 'none', fontWeight: 'bold', px: 3, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
            >
              Nouveau Compte
            </Button>
          </Box>
        </Box>

        <Paper sx={{ borderRadius: 5, p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
          
          {/* BARRE DE RECHERCHE ET FILTRES */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            <TextField 
              fullWidth 
              placeholder="Rechercher un code, intitulé ou catégorie..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0); // Retour à la première page lors de la recherche
              }}
              sx={{ 
                flexGrow: 1,
                minWidth: 300,
                '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#FBFDFF' } 
              }}
              InputProps={{ 
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => setSearch("")}
                      sx={{ mr: -1 }}
                    >
                      ✕
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button 
              variant="outlined" 
              startIcon={<FilterList />} 
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', height: '56px' }}
            >
              Filtres avancés
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
              <CircularProgress />
              <Typography color="text.secondary">
                Chargement de tous les comptes en cours...
              </Typography>
            </Box>
          ) : error ? (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={fetchAllAccounts}>
                  Réessayer
                </Button>
              }
            >
              {error}
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ '& th': { borderBottom: '2px solid #F1F5F9', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem' } }}>
                      <TableCell>Code</TableCell>
                      <TableCell>Intitulé du Compte</TableCell>
                      <TableCell>Catégorie</TableCell>
                      <TableCell>Type / Nature</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            {search 
                              ? `Aucun compte ne correspond à "${search}"`
                              : "Aucun compte disponible"
                            }
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedAccounts.map((acc) => (
                        <TableRow key={acc.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFF' } }}>
                          <TableCell sx={{ fontWeight: 'bold', color: '#6366f1' }}>
                            {acc.code}
                          </TableCell>
                          <TableCell sx={{ fontWeight: '600', color: '#1E293B' }}>
                            {acc.libelle}
                          </TableCell>
                          <TableCell>
                            {acc.categorie ? (
                              <Chip 
                                label={acc.categorie.nom || acc.categorie.libelle} 
                                size="small" 
                                sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                              />
                            ) : (
                              <Typography variant="caption" color="text.disabled">
                                Non classé
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={acc.comptabilite?.nature_technique || acc.nature_solde || "DEBIT"} 
                              size="small" 
                              color={
                                (acc.comptabilite?.nature_solde || acc.nature_solde) === 'CREDIT' 
                                  ? 'success' 
                                  : 'primary'
                              }
                              sx={{ fontWeight: 'bold', fontSize: '0.7rem' }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: (acc.statut?.est_actif || acc.est_actif) ? '#10B981' : '#EF4444',
                                boxShadow: (acc.statut?.est_actif || acc.est_actif) ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
                              }} />
                              <Typography variant="body2" fontWeight="600">
                                {acc.statut?.label || ((acc.statut?.est_actif || acc.est_actif) ? 'Actif' : 'Inactif')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditOpen(acc)}
                              sx={{ 
                                color: '#6366f1', 
                                bgcolor: '#EEF2FF', 
                                '&:hover': { bgcolor: '#E0E7FF' },
                                mr: 1
                              }}
                              title="Modifier"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* PAGINATION */}
              {filteredAccounts.length > 0 && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                  component="div"
                  count={filteredAccounts.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Lignes par page:"
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} sur ${count}`
                  }
                  sx={{ borderTop: '1px solid #F1F5F9', pt: 2 }}
                />
              )}
              
              {/* STATISTIQUES */}
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #F1F5F9' }}>
                <Typography variant="body2" color="text.secondary">
                  {search ? (
                    <>
                      <strong>{filteredAccounts.length}</strong> résultat{filteredAccounts.length > 1 ? 's' : ''} pour "{search}"
                      {filteredAccounts.length > 0 && (
                        <> (parmi {accounts.length} comptes au total)</>
                      )}
                    </>
                  ) : (
                    <>
                      Affichage de <strong>{paginatedAccounts.length}</strong> compte{paginatedAccounts.length > 1 ? 's' : ''} 
                      sur <strong>{accounts.length}</strong> au total
                    </>
                  )}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* MODALE */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: indigo[900] }}>
          {editMode ? "Modifier le Compte" : "Nouveau Compte"}
        </DialogTitle>      
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Code *" 
                value={newAccount.code} 
                onChange={(e) => setNewAccount({...newAccount, code: e.target.value})}
                required
                helperText="Ex: 512000"
                variant="outlined"
                error={newAccount.code === ''}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField 
                fullWidth 
                label="Intitulé *" 
                value={newAccount.libelle} 
                onChange={(e) => setNewAccount({...newAccount, libelle: e.target.value})}
                required
                variant="outlined"
                error={newAccount.libelle === ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => `${option.code} - ${option.nom || option.libelle}`}
                value={categories.find(cat => cat.id === newAccount.categorie_id) || null}
                onChange={(event, newValue) => {
                  setNewAccount({
                    ...newAccount,
                    categorie_id: newValue ? newValue.id : ''
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Catégorie"
                    placeholder="Sélectionner une catégorie..."
                    variant="outlined"
                    helperText="Optionnel"
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select 
                fullWidth 
                label="Nature *"
                value={newAccount.nature_solde}
                onChange={(e) => setNewAccount({...newAccount, nature_solde: e.target.value})}
                variant="outlined"
              >
                <MenuItem value="DEBIT">DÉBIT (Actif / Charge)</MenuItem>
                <MenuItem value="CREDIT">CRÉDIT (Passif / Produit)</MenuItem>
                <MenuItem value="MIXTE">INDETERMINE</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select 
                fullWidth 
                label="Statut *"
                value={newAccount.est_actif}
                onChange={(e) => setNewAccount({...newAccount, est_actif: e.target.value === 'true'})}
                variant="outlined"
              >
                <MenuItem value={true}>Actif</MenuItem>
                <MenuItem value={false}>Inactif</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit" sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!newAccount.code || !newAccount.libelle}
            sx={{ background: activeGradient, borderRadius: 2, px: 3 }}
          >
            {editMode ? "Mettre à jour" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR POUR LES NOTIFICATIONS */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}