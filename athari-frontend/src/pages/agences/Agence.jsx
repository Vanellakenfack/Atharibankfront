import React, { useState, useEffect, useMemo } from 'react';
import { 
    Box, Button, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Chip, IconButton, TextField, 
    Avatar, Paper, Typography, Dialog, DialogTitle, DialogContent, 
    DialogActions, Grid, LinearProgress, CircularProgress, 
    Stack, InputAdornment, Tooltip, Divider, List, ListItem, ListItemText
} from "@mui/material";
import { 
    Add, Search, Delete, RestartAlt, InfoOutlined, 
    Domain, BusinessCenter, WarningAmber, CalendarToday, Fingerprint,
    Close, Edit
} from "@mui/icons-material";
import { indigo, red, grey, blue } from "@mui/material/colors";
import Layout from "../../components/layout/Layout";
import apiClient from '../../services/api/ApiClient';

const Agence = () => {
    const [agencies, setAgencies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Modales
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Données
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ code: '', name: '', short_name: '' });
    const [errors, setErrors] = useState({});

    const activeGradient = 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)';

    const loadAgencies = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/agencies');
            setAgencies(data.data || []);
        } catch (err) {
            console.error("Erreur chargement:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAgencies(); }, []);

    // --- LOGIQUE FORMULAIRE (CREATE & UPDATE) ---
    const handleOpenForm = (agency = null) => {
        setErrors({});
        if (agency) {
            setSelectedAgency(agency);
            setFormData({ 
                code: agency.code, 
                name: agency.agency_name, 
                short_name: agency.initials 
            });
            setIsEdit(true);
        } else {
            setFormData({ code: '', name: '', short_name: '' });
            setIsEdit(false);
        }
        setShowFormModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        try {
            if (isEdit) {
                await apiClient.put(`/agencies/${selectedAgency.id}`, formData);
            } else {
                await apiClient.post('/agencies', formData);
            }
            setShowFormModal(false);
            loadAgencies();
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- LOGIQUE SUPPRESSION ---
    const handleDelete = async () => {
        if (!selectedAgency) return;
        setIsSubmitting(true);
        try {
            await apiClient.delete(`/agencies/${selectedAgency.id}`);
            setShowDeleteConfirm(false);
            loadAgencies();
        } catch (err) {
            console.error("Erreur suppression:", err);
        } finally {
            setIsSubmitting(false);
            setSelectedAgency(null);
        }
    };

    const filteredAgencies = useMemo(() => {
        return agencies.filter(a => 
            a.agency_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [agencies, searchTerm]);

    return (
        <Layout>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
                
                {/* HEADER */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: indigo[500], background: activeGradient }}><Domain /></Avatar>
                        Réseau d'Agences
                    </Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenForm()}
                        sx={{ borderRadius: 3, background: activeGradient, fontWeight: 'bold' }}>
                        Nouvelle Agence
                    </Button>
                </Box>

                {/* FILTRES */}
                <Paper sx={{ borderRadius: 4, p: 2, mb: 4, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                    <TextField fullWidth placeholder="Rechercher..." onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                        sx: { borderRadius: 3, bgcolor: '#F1F5F9', "& fieldset": { border: 'none' } } }}
                    />
                </Paper>

                {/* TABLEAU */}
                <Paper sx={{ borderRadius: 5, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <TableContainer>
                        {loading && <LinearProgress color="primary" />}
                        <Table>
                            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', pl: 4 }}>CODE</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>NOM COMPLET</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>INITIALES</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', pr: 4 }}>ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredAgencies.map((agency) => (
                                    <TableRow key={agency.id} hover>
                                        <TableCell sx={{ pl: 4, fontWeight: 'bold', color: indigo[600] }}>{agency.code}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{agency.agency_name}</TableCell>
                                        <TableCell><Chip label={agency.initials} size="small" sx={{ bgcolor: '#EEF2FF', color: indigo[600] }} /></TableCell>
                                        <TableCell align="right" sx={{ pr: 4 }}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <IconButton onClick={() => { setSelectedAgency(agency); setShowDetails(true); }} size="small" sx={{ color: indigo[400] }}><InfoOutlined /></IconButton>
                                                <IconButton onClick={() => handleOpenForm(agency)} size="small" sx={{ color: blue[500] }}><Edit /></IconButton>
                                                <IconButton onClick={() => { setSelectedAgency(agency); setShowDeleteConfirm(true); }} size="small" sx={{ color: red[400] }}><Delete /></IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* FORM MODAL (CREATE / EDIT) */}
                <Dialog open={showFormModal} onClose={() => setShowFormModal(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 5 } }}>
                    <DialogTitle sx={{ fontWeight: 800 }}>{isEdit ? "Modifier l'agence" : "Nouvelle Agence"}</DialogTitle>
                    <form onSubmit={handleSubmit}>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}><TextField fullWidth label="CODE" value={formData.code} error={!!errors.code} helperText={errors.code?.[0]} onChange={e => setFormData({...formData, code: e.target.value})} /></Grid>
                                <Grid item xs={12}><TextField fullWidth label="NOM" value={formData.name} error={!!errors.name} helperText={errors.name?.[0]} onChange={e => setFormData({...formData, name: e.target.value})} /></Grid>
                                <Grid item xs={12}><TextField fullWidth label="INITIALES" value={formData.short_name} error={!!errors.short_name} helperText={errors.short_name?.[0]} onChange={e => setFormData({...formData, short_name: e.target.value})} /></Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <Button onClick={() => setShowFormModal(false)}>Annuler</Button>
                            <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ borderRadius: 3, background: activeGradient }}>
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Enregistrer"}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* MODALE SUPPRESSION */}
                <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} PaperProps={{ sx: { borderRadius: 5, p: 2 } }}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Avatar sx={{ bgcolor: red[50], color: red[500], width: 60, height: 60, mx: 'auto', mb: 2 }}><WarningAmber sx={{ fontSize: 40 }} /></Avatar>
                        <Typography variant="h6" fontWeight="bold">Confirmer la suppression</Typography>
                        <Typography variant="body2" color="textSecondary">Supprimer l'agence <b>{selectedAgency?.agency_name}</b> ?</Typography>
                    </Box>
                    <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
                        <Button onClick={() => setShowDeleteConfirm(false)}>Annuler</Button>
                        <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: red[500], borderRadius: 3 }}>
                            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Supprimer"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* MODALE DÉTAILS */}
                <Dialog open={showDetails} onClose={() => setShowDetails(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 5 } }}>
                    <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
                        Détails <IconButton onClick={() => setShowDetails(false)}><Close /></IconButton>
                    </DialogTitle>
                    <DialogContent>
                        {selectedAgency && (
                            <List disablePadding>
                                <ListItem sx={{ px: 0 }}><ListItemText primary="Code" secondary={selectedAgency.code} /></ListItem>
                                <Divider />
                                <ListItem sx={{ px: 0 }}><ListItemText primary="Désignation" secondary={selectedAgency.agency_name} /></ListItem>
                                <Divider />
                                <ListItem sx={{ px: 0 }}><ListItemText primary="Création" secondary={selectedAgency.created_at} /></ListItem>
                            </List>
                        )}
                    </DialogContent>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default Agence;