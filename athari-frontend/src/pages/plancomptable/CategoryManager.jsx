import React, { useEffect, useState } from "react";
import { 
  Box, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, TextField, 
  InputAdornment, Avatar, Paper, Typography, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem 
} from "@mui/material";
import { Add, Edit, Search, AccountTree } from "@mui/icons-material";
import { indigo } from "@mui/material/colors";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modale
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

  // Chargement des données
  const fetchCategories = async () => {
    try {
      const response = await ApiClient.get("/plan_comptable/categories");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Erreur de chargement des catégories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Ouvrir pour création
  const handleOpen = () => {
    setEditMode(false);
    setCurrentCategoryId(null);
    setFormData({ code: '', libelle: '', niveau: 2, type_compte: 'ACTIF', parent_id: '' });
    setOpen(true);
  };

  // Ouvrir pour modification
  const handleEditOpen = (category) => {
    setEditMode(true);
    setCurrentCategoryId(category.id); // Stockage crucial de l'ID
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

  // Sauvegarde (POST ou PUT)
  const handleSave = async () => {
    try {
      if (editMode) {
        // Envoi vers l'ID stocké dans currentCategoryId
        await ApiClient.put(`/plan_comptable/categories/${currentCategoryId}`, formData);
      } else {
        await ApiClient.post("/plan_comptable/categories", formData);
      }
      fetchCategories(); 
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error.response?.data || error);
      alert(error.response?.data?.message || "Erreur de validation. Vérifiez les données.");
    }
  };

  const filteredCategories = categories.filter(c => 
    c.code.toString().includes(search) || 
    c.libelle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        
        {/* HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: indigo[500], background: activeGradient }}>
                <AccountTree />
              </Avatar>
              Catégories Comptables
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Configuration des rubriques et classes du plan comptable
            </Typography>
          </Box>
          <Button 
            variant="contained"
            onClick={handleOpen}
            startIcon={<Add />}
            sx={{ 
                background: activeGradient, borderRadius: '12px', textTransform: 'none', 
                fontWeight: 'bold', px: 3, py: 1.2, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' 
            }}
          >
            Nouvelle Catégorie
          </Button>
        </Box>

        <Paper sx={{ borderRadius: 5, p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField 
              fullWidth 
              placeholder="Rechercher par code ou libellé..."
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#FBFDFF' } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search color="primary" /></InputAdornment> }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { color: '#64748B', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', borderBottom: '2px solid #F1F5F9' } }}>
                  <TableCell>Code</TableCell>
                  <TableCell>Libellé</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Niveau</TableCell>
                  <TableCell>Parent</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((cat) => (
                    <TableRow key={cat.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFF' } }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#6366f1' }}>{cat.code}</TableCell>
                      <TableCell sx={{ fontWeight: '600', color: '#1E293B' }}>{cat.libelle}</TableCell>
                      <TableCell>
                        <Chip 
                          label={cat.type_compte} 
                          size="small" 
                          sx={{ 
                            fontWeight: 'bold', fontSize: '0.7rem',
                            bgcolor: cat.type_compte === 'ACTIF' ? '#DCFCE7' : cat.type_compte === 'PASSIF' ? '#FFEDD5' : '#F1F5F9',
                            color: cat.type_compte === 'ACTIF' ? '#166534' : cat.type_compte === 'PASSIF' ? '#9A3412' : '#475569'
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Niveau {cat.niveau}</Typography>
                      </TableCell>
                      <TableCell>
                        {cat.parent ? (
                          <Typography variant="body2" sx={{ color: '#64748B' }}>
                            {cat.parent.code} - {cat.parent.libelle}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">Racine</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          onClick={() => handleEditOpen(cat)} 
                          sx={{ color: '#6366f1', bgcolor: '#EEF2FF', '&:hover': { bgcolor: '#E0E7FF' } }}
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredCategories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            labelRowsPerPage="Lignes par page:"
          />
        </Paper>
      </Box>

      {/* MODALE */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: indigo[900] }}>
          {editMode ? "Modifier la Catégorie" : "Nouvelle Catégorie"}
        </DialogTitle>       
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField 
                fullWidth label="Code" 
                variant="outlined"
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value})} 
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select fullWidth label="Niveau"
                value={formData.niveau}
                onChange={(e) => setFormData({...formData, niveau: e.target.value})}
              >
                <MenuItem value={1}>1 (Classe)</MenuItem>
                <MenuItem value={2}>2 (Rubrique)</MenuItem>
                <MenuItem value={3}>3 (Sous-Rubrique)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Libellé" 
                value={formData.libelle} 
                onChange={(e) => setFormData({...formData, libelle: e.target.value})} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select fullWidth label="Type de compte"
                value={formData.type_compte}
                onChange={(e) => setFormData({...formData, type_compte: e.target.value})}
              >
                <MenuItem value="ACTIF">ACTIF</MenuItem>
                <MenuItem value="PASSIF">PASSIF</MenuItem>
                <MenuItem value="CHARGE">CHARGE</MenuItem>
                <MenuItem value="PRODUIT">PRODUIT</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select fullWidth label="Catégorie Parente"
                value={formData.parent_id}
                onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                helperText="Sélectionnez le parent direct dans la hiérarchie"
              >
                <MenuItem value="">
                  <em>Aucune (Niveau 1 / Racine)</em>
                </MenuItem>
                {categories.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Typography variant="body2">{p.code} - {p.libelle}</Typography>
                      <Chip label={`Niv.${p.niveau}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 'bold' }}>Annuler</Button>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            sx={{ background: activeGradient, borderRadius: 2, px: 3, fontWeight: 'bold' }}
          >
            {editMode ? "Mettre à jour" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}