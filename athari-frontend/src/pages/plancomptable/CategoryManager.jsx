import React, { useEffect, useState } from "react";
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, TextField, 
  InputAdornment, Avatar, Paper, Typography, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem, CircularProgress 
} from "@mui/material";
import { Add, Edit, Search, AccountTree } from "@mui/icons-material";
import { indigo } from "@mui/material/colors";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    libelle: '',
    niveau: 2,
    type_compte: 'ACTIF',
    parent_id: ''
  });

  const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

  // SOLUTION : Correction de l'URL (underscore -> tiret)
  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Changement de /plan_comptable en /plan-comptable
      const response = await ApiClient.get("/plan-comptable/categories");
      // On s'assure de récupérer le tableau même si l'API est paginée
      setCategories(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Erreur de chargement des catégories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = () => {
    setEditMode(false);
    setCurrentCategoryId(null);
    setFormData({ code: '', libelle: '', niveau: 2, type_compte: 'ACTIF', parent_id: '' });
    setOpen(true);
  };

  const handleEditOpen = (category) => {
    setEditMode(true);
    setCurrentCategoryId(category.id);
    setFormData({
      code: category.code || '',
      libelle: category.libelle || '',
      niveau: category.niveau || 2,
      type_compte: category.type_compte || 'ACTIF',
      parent_id: category.parent_id || ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentCategoryId(null);
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        // Changement de l'URL ici aussi
        await ApiClient.put(`/plan-comptable/categories/${currentCategoryId}`, formData);
      } else {
        await ApiClient.post("/plan-comptable/categories", formData);
      }
      fetchCategories(); 
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error.response?.data || error);
      alert(error.response?.data?.message || "Erreur de validation.");
    }
  };

  const filteredCategories = categories.filter(c => 
    (c.code?.toString().includes(search)) || 
    (c.libelle?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: indigo[500], background: activeGradient }}>
                <AccountTree />
              </Avatar>
              Catégories (Chapitres)
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Structure hiérarchique du plan comptable
            </Typography>
          </Box>
          <Button 
            variant="contained"
            onClick={handleOpen}
            startIcon={<Add />}
            sx={{ background: activeGradient, borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', px: 3 }}
          >
            Nouveau Chapitre
          </Button>
        </Box>

        <Paper sx={{ borderRadius: 5, p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <Box sx={{ mb: 4 }}>
            <TextField 
              fullWidth 
              placeholder="Rechercher par code (ex: 1, 10...) ou libellé..."
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search color="primary" /></InputAdornment> }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { color: '#64748B', fontWeight: '800', fontSize: '0.75rem' } }}>
                  <TableCell>Code</TableCell>
                  <TableCell>Libellé</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Niveau</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={30} sx={{ my: 2 }} /></TableCell></TableRow>
                ) : filteredCategories
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((cat) => (
                    <TableRow key={cat.id} hover>
                      <TableCell sx={{ fontWeight: 'bold', color: '#6366f1' }}>{cat.code}</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>{cat.libelle}</TableCell>
                      <TableCell>
                        <Chip label={cat.type_compte} size="small" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell>Niveau {cat.niveau}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleEditOpen(cat)} sx={{ color: '#6366f1' }} size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25]}
            component="div"
            count={filteredCategories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Paper>
      </Box>

      {/* MODALE DE SAISIE */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>{editMode ? "Modifier" : "Créer"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField fullWidth label="Code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} /></Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Niveau" value={formData.niveau} onChange={(e) => setFormData({...formData, niveau: e.target.value})}>
                <MenuItem value={1}>1 (Classe)</MenuItem>
                <MenuItem value={2}>2 (Rubrique)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Libellé" value={formData.libelle} onChange={(e) => setFormData({...formData, libelle: e.target.value})} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose}>Annuler</Button>
          <Button variant="contained" onClick={handleSave} sx={{ background: activeGradient }}>Valider</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}