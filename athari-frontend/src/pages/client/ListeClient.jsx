import React, { useState, useEffect } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TableSortLabel, TablePagination, Box,
    IconButton, Typography, TextField, InputAdornment, useTheme,
    Button, Chip, Avatar, Tooltip, CircularProgress,Dialog, DialogActions, DialogContent, 
    DialogContentText, DialogTitle
} from '@mui/material';
import Header from '../../components/layout/TopBar';
import {
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api/ApiClient'; // Import de votre config axios

const headCells = [
    { id: 'nom', label: 'Client / Raison Sociale' },
    { id: 'type_client', label: 'Type' },
    { id: 'num_client', label: 'N° Cni/rccm' },
    { id: 'telephone', label: 'Contact' },
    { id: 'adresse_quartier', label: 'Localisation' },
    { id: 'actions', label: 'Actions', disableSorting: true },
];

export default function ListeClient() {
    const theme = useTheme();
    const navigate = useNavigate();

    // --- États ---
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('nom');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openConfirm, setOpenConfirm] = useState(false); // Pour ouvrir/fermer la boîte de dialogue
        const [selectedClientId, setSelectedClientId] = useState(null); // Pour stocker l'ID du client à supprimer
        const [deleteLoading, setDeleteLoading] = useState(false); // Pour l'animation de chargement du bouton supprimer

    // --- Récupération des données ---
    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/clients');
            // On s'assure que c'est bien un tableau
            setClients(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error("Erreur API:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);


    //suppression 
    const handleDeleteClick = (id) => {
    setSelectedClientId(id);
    setOpenConfirm(true);
};

const handleConfirmDelete = async () => {
    try {
        setDeleteLoading(true);
        await apiClient.delete(`/clients/${selectedClientId}`);
        
        // Mettre à jour la liste locale sans recharger la page
        setClients(clients.filter(c => c.id !== selectedClientId));
        
        setOpenConfirm(false);
        // Optionnel : ajouter une notification de succès ici
    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Une erreur est survenue lors de la suppression.");
    } finally {
        setDeleteLoading(false);
        setSelectedClientId(null);
    }
};
    // --- Fonctions de Tri & Filtrage ---
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => { setPage(newPage); };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getDisplayName = (client) => {
        return client.type_client === 'physique' 
            ? client.physique?.nom_prenoms 
            : client.morale?.raison_sociale;
    };

    const filteredData = clients.filter(client => {
        const name = getDisplayName(client)?.toLowerCase() || '';
        return name.includes(searchTerm.toLowerCase()) || 
               client.num_client.includes(searchTerm) ||
               client.telephone.includes(searchTerm);
    });

    // Tri manuel simplifié pour l'exemple
    const sortedData = [...filteredData].sort((a, b) => {
        const aVal = getDisplayName(a) || '';
        const bVal = getDisplayName(b) || '';
        return order === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
    });

    const visibleRows = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', pb: 4 }}>
            <Header />
            {/* Boîte de dialogue de confirmation */}
<Dialog
    open={openConfirm}
    onClose={() => setOpenConfirm(false)}
    PaperProps={{ 
        sx: { 
            borderRadius: 3, 
            width: '100%', 
            maxWidth: 400,
            p: 1 
        } 
    }}
>
            <DialogTitle sx={{ fontWeight: 800, color: '#1E293B', pb: 1 }}>
                Confirmer la suppression
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: '#64748B' }}>
                    Êtes-vous sûr de vouloir retirer ce client du portefeuille ? 
                    Cette action supprimera également les données associées.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button 
                    onClick={() => setOpenConfirm(false)} 
                    sx={{ 
                        color: '#64748B', 
                        textTransform: 'none', 
                        fontWeight: 'bold' 
                    }}
                >
                    Annuler
                </Button>
                <Button 
                    onClick={handleConfirmDelete} 
                    variant="contained" 
                    color="error"
                    disabled={deleteLoading}
                    sx={{ 
                        borderRadius: 2, 
                        textTransform: 'none', 
                        fontWeight: 'bold',
                        px: 3,
                        boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                    }}
                >
                    {deleteLoading ? <CircularProgress size={20} color="inherit" /> : 'Oui, supprimer'}
                </Button>
            </DialogActions>
        </Dialog>
            <Box sx={{ px: { xs: 2, md: 6 }, py: 4 }}>
                {/* Header Section */}
                <Box sx={{ 
                    display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' },
                    mb: 4, gap: 2
                }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B' }}>
                            Portefeuille Clients
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748B' }}>
                            {loading ? 'Chargement...' : `${filteredData.length} clients identifiés`}
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/client/choix')}
                        sx={{
                            bgcolor: '#303f9f', borderRadius: 2, px: 3, py: 1.2,
                            textTransform: 'none', fontWeight: 'bold',
                            boxShadow: '0 10px 15px -3px rgba(48, 63, 159, 0.3)',
                            '&:hover': { bgcolor: '#1a237e' }
                        }}
                    >
                        Nouveau Client
                    </Button>
                </Box>

                {/* Barre de Recherche */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <TextField
                        fullWidth size="small"
                        placeholder="Rechercher un nom, un numéro client ou téléphone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#94A3B8' }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2, bgcolor: '#F1F5F9', '& fieldset': { border: 'none' } }
                        }}
                        sx={{ maxWidth: 500 }}
                    />
                </Paper>

                {/* Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                            <CircularProgress sx={{ color: '#303f9f' }} />
                        </Box>
                    ) : (
                        <>
                            <Table>
                                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                    <TableRow>
                                        {headCells.map((headCell) => (
                                            <TableCell
                                                key={headCell.id}
                                                sortDirection={orderBy === headCell.id ? order : false}
                                                sx={{ py: 2.5, color: '#475569', fontWeight: 'bold' }}
                                            >
                                                {!headCell.disableSorting ? (
                                                    <TableSortLabel
                                                        active={orderBy === headCell.id}
                                                        direction={orderBy === headCell.id ? order : 'asc'}
                                                        onClick={() => handleRequestSort(headCell.id)}
                                                    >
                                                        {headCell.label}
                                                    </TableSortLabel>
                                                ) : headCell.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {visibleRows.map((client) => {
                                        const isPhysique = client.type_client === 'physique';
                                        const nom = getDisplayName(client);
                                        const document = isPhysique ? client.physique?.cni_numero : client.morale?.rccm;

                                        return (
                                            <TableRow key={client.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ 
                                                            bgcolor: isPhysique ? '#E0E7FF' : '#F0FDF4', 
                                                            color: isPhysique ? '#4338CA' : '#166534',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {nom?.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>{nom}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                                                                ID: {client.num_client}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={isPhysique ? 'Particulier' : 'Entreprise'} 
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: isPhysique ? '#E0F2FE' : '#F0FDF4',
                                                            color: isPhysique ? '#0369A1' : '#166534',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#475569' }}>
                                                    {document || '---'}
                                                </TableCell>
                                                <TableCell sx={{ color: '#475569' }}>
                                                    {client.telephone}
                                                </TableCell>
                                                <TableCell sx={{ color: '#475569' }}>
                                                    <Typography variant="body2">{client.adresse_ville}</Typography>
                                                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>{client.adresse_quartier}</Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                        <Tooltip title="Détails">
                                                            <IconButton size="small" sx={{ color: '#6366F1', bgcolor: '#EEF2FF' }}
                                                            onClick={() => navigate(`/clients/${client.id}`)}>
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Modifier">
                                                            <IconButton size="small" sx={{ color: '#0EA5E9', bgcolor: '#F0F9FF' }}
                                                            onClick={() => navigate(`/client/${client.id}/edit`)}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Supprimer">
                                                            <IconButton 
                                                                size="small" 
                                                                sx={{ color: '#EF4444', bgcolor: '#FEF2F2' }}
                                                                onClick={() => handleDeleteClick(client.id)} // Appel ici
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {visibleRows.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                                <Typography color="textSecondary">Aucun client trouvé</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredData.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Lignes par page"
                            />
                        </>
                    )}
                </TableContainer>
            </Box>
        </Box>
    );
}