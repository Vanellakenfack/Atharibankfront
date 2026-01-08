import React, { useState, useEffect } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TableSortLabel, TablePagination, Box,
    IconButton, Typography, TextField, InputAdornment,
    Button, Chip, Avatar, Tooltip, CircularProgress, Dialog, 
    DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import {
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// --- IMPORT DES COMPOSANTS LOGICIELS ---
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import apiClient from '../../services/api/ApiClient';

const headCells = [
    { id: 'nom', label: 'Client / Raison Sociale' },
    { id: 'type_client', label: 'Type' },
    { id: 'num_client', label: 'N° Cni/rccm' },
    { id: 'telephone', label: 'Contact' },
    { id: 'adresse_quartier', label: 'Localisation' },
    { id: 'actions', label: 'Actions', disableSorting: true },
];

export default function ListeClient() {
    const navigate = useNavigate();
    
    // --- États pour le Layout ---
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // --- États pour les données ---
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('nom');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // --- Logique API ---
    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/clients');
            setClients(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error("Erreur API:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClients(); }, []);

    const handleDeleteClick = (id) => {
        setSelectedClientId(id);
        setOpenConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setDeleteLoading(true);
            await apiClient.delete(`/clients/${selectedClientId}`);
            setClients(clients.filter(c => c.id !== selectedClientId));
            setOpenConfirm(false);
        } catch (error) {
            alert("Une erreur est survenue.");
        } finally {
            setDeleteLoading(false);
            setSelectedClientId(null);
        }
    };

    // --- Tri & Filtrage ---
    const getDisplayName = (client) => {
        return client.type_client === 'physique' 
            ? client.physique?.nom_prenoms 
            : client.morale?.raison_sociale;
    };

    const filteredData = clients.filter(client => {
        const name = getDisplayName(client)?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return name.includes(search) || 
               client.num_client?.includes(search) ||
               client.telephone?.includes(search);
    });

    const sortedData = [...filteredData].sort((a, b) => {
        const aVal = getDisplayName(a) || '';
        const bVal = getDisplayName(b) || '';
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    const visibleRows = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            
            {/* 1. SIDEBAR */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* 2. CONTENU PRINCIPAL */}
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`,
                    transition: 'width 0.3s ease'
                }}
            >
                {/* 3. TOPBAR */}
                <TopBar sidebarOpen={sidebarOpen} />

                {/* 4. ZONE DE TRAVAIL (Tableau) */}
                <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
                    
                    {/* Header de la page */}
                    <Box sx={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 
                    }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                                Portefeuille Clients
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                                {loading ? 'Chargement...' : `${filteredData.length} clients dans votre base`}
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/client/choix')}
                            sx={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                borderRadius: '10px', px: 3, py: 1.2, textTransform: 'none', fontWeight: 'bold',
                                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
                                '&:hover': { opacity: 0.9 }
                            }}
                        >
                            Nouveau Client
                        </Button>
                    </Box>

                    {/* Barre de Recherche et Table */}
                    <Paper sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <Box sx={{ p: 2.5, borderBottom: '1px solid #edf2f7' }}>
                            <TextField
                                size="small"
                                placeholder="Rechercher un client..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
                                    sx: { borderRadius: '8px', bgcolor: '#F1F5F9', border: 'none', '& fieldset': { border: 'none' } }
                                }}
                                sx={{ width: 350 }}
                            />
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                        <TableRow>
                                            {headCells.map((headCell) => (
                                                <TableCell key={headCell.id} sx={{ py: 2, fontWeight: 'bold', color: '#475569' }}>
                                                    {headCell.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {visibleRows.map((client) => {
                                            const isPhysique = client.type_client === 'physique';
                                            const nom = getDisplayName(client);
                                            return (
                                                <TableRow key={client.id} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar sx={{ 
                                                                bgcolor: isPhysique ? '#EEF2FF' : '#F0FDF4', 
                                                                color: isPhysique ? '#6366f1' : '#22c55e',
                                                                fontWeight: 'bold', fontSize: '14px'
                                                            }}>
                                                                {nom?.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{nom}</Typography>
                                                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>{client.num_client}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={isPhysique ? 'Particulier' : 'Entreprise'} 
                                                            size="small"
                                                            sx={{ fontWeight: 'bold', borderRadius: '6px' }} 
                                                            color={isPhysique ? "primary" : "success"} 
                                                            variant="soft"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{isPhysique ? client.physique?.cni_numero : client.morale?.rccm}</TableCell>
                                                    <TableCell>{client.telephone}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{client.adresse_ville}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>{client.adresse_quartier}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <IconButton onClick={() => navigate(`/clients/${client.id}`)} size="small" sx={{ color: '#6366f1' }}><VisibilityIcon fontSize="small" /></IconButton>
                                                            <IconButton onClick={() => navigate(`/client/${client.id}/edit`)} size="small" sx={{ color: '#0ea5e9' }}><EditIcon fontSize="small" /></IconButton>
                                                            <IconButton onClick={() => handleDeleteClick(client.id)} size="small" sx={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                <TablePagination
                                    rowsPerPageOptions={[10, 25]}
                                    component="div"
                                    count={filteredData.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={(e, p) => setPage(p)}
                                    onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                />
                            </TableContainer>
                        )}
                    </Paper>
                </Box>
            </Box>

            {/* Dialog suppression reste identique mais avec un style bouton dégradé possible */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Confirmer la suppression</DialogTitle>
                <DialogContent><DialogContentText>Voulez-vous supprimer ce client ? Cette action est irréversible.</DialogContentText></DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenConfirm(false)} sx={{ color: '#64748b' }}>Annuler</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={deleteLoading}>
                        {deleteLoading ? <CircularProgress size={20} /> : 'Supprimer définitivement'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}