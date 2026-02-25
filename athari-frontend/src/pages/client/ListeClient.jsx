import React, { useState, useEffect } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TableSortLabel, TablePagination, Box,
    IconButton, Typography, TextField, InputAdornment,
    Button, Chip, Avatar, Tooltip, CircularProgress, Dialog, 
    DialogActions, DialogContent, DialogContentText, DialogTitle,
    Menu, MenuItem, ListItemIcon, ListItemText, Divider, Alert, Snackbar
} from '@mui/material';
import {
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Add as AddIcon,
    PictureAsPdf as PdfIcon,
    FileDownload as DownloadIcon,
    FilterList as FilterIcon,
    Download as DownloadIcon2,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import apiClient from '../../services/api/ApiClient';

const headCells = [
    { id: 'nom', label: 'Client / Raison Sociale' },
    { id: 'type_client', label: 'Type' },
    { id: 'num_client', label: 'N° Client' },
    { id: 'identite', label: 'N° CNI/RCCM' },
    { id: 'telephone', label: 'Contact' },
    { id: 'adresse_quartier', label: 'Localisation' },
    { id: 'actions', label: 'Actions', disableSorting: true },
];

export default function ListeClient() {
    const navigate = useNavigate();
    
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('nom');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    // États pour le menu d'export
    const [exportAnchorEl, setExportAnchorEl] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/clients');
            setClients(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error("Erreur API:", error);
            showNotification('Erreur lors du chargement des clients', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClients(); }, []);

    // Fonction pour afficher les notifications
    const showNotification = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Gestion du menu d'export
    const handleExportClick = (event) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setExportAnchorEl(null);
    };

    // Fonction utilitaire pour sauvegarder un fichier (sans file-saver)
    const saveFile = (blob, filename) => {
        // Créer un lien temporaire
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        
        // Ajouter au DOM, cliquer et nettoyer
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Libérer l'URL
        window.URL.revokeObjectURL(link.href);
    };

    // Fonction d'export PDF
    const handleExportPDF = async (type = 'standard') => {
        handleExportClose();
        
        try {
            setExportLoading(true);
            
            // Construire l'URL avec les paramètres
            let url = '/clients/export-pdf';
            const params = new URLSearchParams();
            
            if (type === 'filtered' && searchTerm) {
                params.append('search', searchTerm);
            }
            
            const queryString = params.toString();
            if (queryString) {
                url += '?' + queryString;
            }
            
            console.log("Export PDF URL:", url); // Pour debug
            
            // Effectuer la requête avec responseType blob
            const response = await apiClient.get(url, {
                responseType: 'blob'
            });
            
            // Vérifier si la réponse est un blob PDF
            if (response.data.type !== 'application/pdf') {
                // Si ce n'est pas un PDF, c'est probablement une erreur
                const text = await response.data.text();
                try {
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.message || 'Erreur lors de l\'export');
                } catch {
                    throw new Error('Réponse inattendue du serveur');
                }
            }
            
            // Générer un nom de fichier avec la date
            const date = new Date();
            const dateStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
            const typeLabel = type === 'filtered' ? 'filtres' : 'complet';
            const filename = `clients-${typeLabel}-${dateStr}.pdf`;
            
            // Sauvegarder le fichier
            saveFile(response.data, filename);
            
            showNotification(`PDF exporté avec succès (${type === 'filtered' ? 'liste filtrée' : 'liste complète'})`, 'success');
            
        } catch (error) {
            console.error("Erreur lors de l'export PDF:", error);
            
            // Gérer les erreurs
            let errorMessage = "Erreur lors de l'export PDF";
            
            if (error.response) {
                if (error.response.status === 403) {
                    errorMessage = "Vous n'avez pas la permission d'exporter le PDF";
                } else if (error.response.status === 401) {
                    errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
                } else if (error.response.status === 404) {
                    errorMessage = "La route d'export n'existe pas. Vérifiez la configuration.";
                } else if (error.response.data) {
                    // Si l'erreur est un blob (message d'erreur JSON)
                    try {
                        const text = await error.response.data.text();
                        const errorData = JSON.parse(text);
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = `Erreur ${error.response.status}: ${error.response.statusText}`;
                    }
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showNotification(errorMessage, 'error');
        } finally {
            setExportLoading(false);
        }
    };

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
            showNotification('Client supprimé avec succès', 'success');
        } catch (error) {
            console.error("Erreur suppression:", error);
            showNotification("Erreur lors de la suppression", 'error');
        } finally {
            setDeleteLoading(false);
            setSelectedClientId(null);
        }
    };

    const getDisplayName = (client) => {
        return client.type_client === 'physique' 
            ? client.physique?.nom_prenoms 
            : client.morale?.raison_sociale;
    };

    const getIdentite = (client) => {
        return client.type_client === 'physique'
            ? client.physique?.cni_numero
            : client.morale?.rccm;
    };

    const filteredData = clients.filter(client => {
        const name = getDisplayName(client)?.toLowerCase() || '';
        const identite = getIdentite(client)?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return name.includes(search) || 
               identite.includes(search) ||
               client.num_client?.toLowerCase().includes(search) ||
               client.telephone?.toLowerCase().includes(search) ||
               client.email?.toLowerCase().includes(search);
    });

    const sortedData = [...filteredData].sort((a, b) => {
        const aVal = getDisplayName(a) || '';
        const bVal = getDisplayName(b) || '';
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    const visibleRows = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
                <TopBar sidebarOpen={sidebarOpen} />

                <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
                    
                    {/* En-tête avec titre et boutons */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 4,
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                                Portefeuille Clients
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                                {loading ? 'Chargement...' : `${filteredData.length} clients dans votre base`}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {/* Menu d'export PDF */}
                            <Button
                                variant="outlined"
                                startIcon={<PdfIcon />}
                                onClick={handleExportClick}
                                disabled={exportLoading || clients.length === 0}
                                sx={{
                                    borderColor: '#e2e8f0',
                                    color: '#475569',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    borderRadius: '10px',
                                    px: 3,
                                    '&:hover': {
                                        borderColor: '#6366f1',
                                        backgroundColor: '#f8fafc'
                                    }
                                }}
                            >
                                {exportLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : <DownloadIcon2 sx={{ mr: 1, fontSize: 18 }} />}
                                Exporter
                            </Button>
                            
                            {/* Menu déroulant pour les options d'export */}
                            <Menu
                                anchorEl={exportAnchorEl}
                                open={Boolean(exportAnchorEl)}
                                onClose={handleExportClose}
                                PaperProps={{
                                    elevation: 3,
                                    sx: {
                                        borderRadius: '12px',
                                        mt: 1,
                                        minWidth: 220,
                                        overflow: 'visible',
                                        '&:before': {
                                            content: '""',
                                            display: 'block',
                                            position: 'absolute',
                                            top: 0,
                                            right: 14,
                                            width: 10,
                                            height: 10,
                                            bgcolor: 'background.paper',
                                            transform: 'translateY(-50%) rotate(45deg)',
                                            zIndex: 0,
                                        },
                                    },
                                }}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuItem disabled sx={{ opacity: 1, fontWeight: 'bold', color: '#1E293B' }}>
                                    <ListItemIcon><PdfIcon fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
                                    <ListItemText primary="Exporter en PDF" />
                                </MenuItem>
                                <Divider />
                                
                                <MenuItem onClick={() => handleExportPDF('complet')} sx={{ py: 1.5 }}>
                                    <ListItemIcon><DownloadIcon fontSize="small" sx={{ color: '#6366f1' }} /></ListItemIcon>
                                    <ListItemText 
                                        primary="Liste complète" 
                                        secondary={`${clients.length} clients`}
                                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                    />
                                </MenuItem>
                                
                                <MenuItem 
                                    onClick={() => handleExportPDF('filtered')} 
                                    disabled={filteredData.length === 0}
                                    sx={{ py: 1.5 }}
                                >
                                    <ListItemIcon><FilterIcon fontSize="small" sx={{ color: '#0ea5e9' }} /></ListItemIcon>
                                    <ListItemText 
                                        primary="Liste filtrée" 
                                        secondary={`${filteredData.length} clients`}
                                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                    />
                                </MenuItem>
                                
                                <Divider />
                                
                                <MenuItem onClick={handleExportClose} sx={{ py: 1, color: '#64748b' }}>
                                    <ListItemText primary="Annuler" />
                                </MenuItem>
                            </Menu>

                            {/* Bouton Nouveau Client */}
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/client/choix')}
                                sx={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    borderRadius: '10px', 
                                    px: 3, 
                                    py: 1.2, 
                                    textTransform: 'none', 
                                    fontWeight: 'bold',
                                    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
                                    '&:hover': { opacity: 0.9 }
                                }}
                            >
                                Nouveau Client
                            </Button>
                        </Box>
                    </Box>

                    {/* Barre de recherche */}
                    <Paper sx={{ 
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        border: '1px solid #edf2f7', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
                    }}>
                        <Box sx={{ p: 2.5, borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <TextField
                                size="small"
                                placeholder="Rechercher un client..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
                                    sx: { 
                                        borderRadius: '8px', 
                                        bgcolor: '#F1F5F9', 
                                        border: 'none', 
                                        '& fieldset': { border: 'none' },
                                        width: { xs: '100%', md: 350 }
                                    }
                                }}
                                sx={{ width: { xs: '100%', md: 350 } }}
                            />
                            
                            {/* Indicateur de filtre actif */}
                            {searchTerm && (
                                <Chip 
                                    label={`Filtre: "${searchTerm}"`} 
                                    size="small"
                                    onDelete={() => setSearchTerm('')}
                                    sx={{ ml: 2 }}
                                />
                            )}
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                                <CircularProgress />
                            </Box>
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
                                        {visibleRows.length > 0 ? (
                                            visibleRows.map((client) => {
                                                const isPhysique = client.type_client === 'physique';
                                                const nom = getDisplayName(client);
                                                const identite = getIdentite(client);
                                                return (
                                                    <TableRow key={client.id} hover>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar sx={{ 
                                                                    bgcolor: isPhysique ? '#EEF2FF' : '#F0FDF4', 
                                                                    color: isPhysique ? '#6366f1' : '#22c55e',
                                                                    fontWeight: 'bold', 
                                                                    fontSize: '14px'
                                                                }}>
                                                                    {nom?.charAt(0).toUpperCase()}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                                                        {nom}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                                                        {client.email}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={isPhysique ? 'Particulier' : 'Entreprise'} 
                                                                size="small"
                                                                sx={{ 
                                                                    fontWeight: 'bold', 
                                                                    borderRadius: '6px',
                                                                    bgcolor: isPhysique ? '#EEF2FF' : '#F0FDF4',
                                                                    color: isPhysique ? '#6366f1' : '#22c55e'
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {client.num_client}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {identite || 'Non spécifié'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>{client.telephone}</TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">{client.adresse_ville || 'N/A'}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                                                {client.adresse_quartier || ''}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <Tooltip title="Voir détails">
                                                                    <IconButton 
                                                                        onClick={() => navigate(`/clients/${client.id}`)} 
                                                                        size="small" 
                                                                        sx={{ color: '#6366f1' }}
                                                                    >
                                                                        <VisibilityIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Modifier">
                                                                    <IconButton 
                                                                        onClick={() => navigate(`/client/${client.id}/edit`)} 
                                                                        size="small" 
                                                                        sx={{ color: '#0ea5e9' }}
                                                                    >
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Supprimer">
                                                                    <IconButton 
                                                                        onClick={() => handleDeleteClick(client.id)} 
                                                                        size="small" 
                                                                        sx={{ color: '#ef4444' }}
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                                    <Typography variant="body1" sx={{ color: '#94a3b8' }}>
                                                        Aucun client trouvé
                                                    </Typography>
                                                    {searchTerm && (
                                                        <Button 
                                                            variant="text" 
                                                            onClick={() => setSearchTerm('')}
                                                            sx={{ mt: 2, color: '#6366f1' }}
                                                        >
                                                            Effacer la recherche
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                <TablePagination
                                    rowsPerPageOptions={[10, 25, 50]}
                                    component="div"
                                    count={filteredData.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={(e, p) => setPage(p)}
                                    onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                    labelRowsPerPage="Lignes par page"
                                />
                            </TableContainer>
                        )}
                    </Paper>
                </Box>
            </Box>

            {/* Dialogue de confirmation de suppression */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Voulez-vous supprimer définitivement ce client ? Cette action est irréversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setOpenConfirm(false)} 
                        sx={{ color: '#64748b' }}
                        disabled={deleteLoading}
                    >
                        Annuler
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        variant="contained" 
                        color="error"
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? <CircularProgress size={20} /> : 'Supprimer définitivement'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar pour les notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}