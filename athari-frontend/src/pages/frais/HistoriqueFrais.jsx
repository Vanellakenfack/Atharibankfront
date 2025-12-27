import React, { useState } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, Typography,
    TextField, InputAdornment, Button, IconButton, Chip
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

const headCells = [
    { id: 'reference', label: 'Référence' },
    { id: 'type', label: 'Type de frais' },
    { id: 'montant', label: 'Montant' },
    { id: 'statut', label: 'Statut' },
    { id: 'date_application', label: 'Date application' },
    { id: 'compte', label: 'Compte client' },
];

const HistoriqueFrais = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateDebut, setDateDebut] = useState(null);
    const [dateFin, setDateFin] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Données factices pour l'exemple
    const fraisData = [];

    const handleReset = () => {
        setSearchTerm('');
        setDateDebut(null);
        setDateFin(null);
    };

    const handleExport = () => {
        // Logique d'export
        console.log('Export des données...');
    };

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4, flexGrow: 1 }}>
            {/* En-tête de la page */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                    Historique des frais appliqués
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Consultation des frais facturés aux clients
                </Typography>
            </Box>

            {/* Barre de recherche et filtres */}
            <Paper sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: '16px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #edf2f7'
            }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="N° compte, client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#94A3B8' }} />
                                </InputAdornment>
                            ),
                            sx: { 
                                borderRadius: '8px', 
                                bgcolor: '#F1F5F9', 
                                '& fieldset': { border: 'none' },
                                minWidth: '300px'
                            }
                        }}
                    />
                    
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                        <DatePicker
                            label="Du"
                            value={dateDebut}
                            onChange={(newValue) => setDateDebut(newValue)}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    size="small"
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': { 
                                            borderRadius: '8px',
                                            bgcolor: '#F1F5F9',
                                        },
                                        '& fieldset': { border: 'none' },
                                        minWidth: '180px'
                                    }}
                                />
                            )}
                        />
                        
                        <DatePicker
                            label="Au"
                            value={dateFin}
                            onChange={(newValue) => setDateFin(newValue)}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    size="small"
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': { 
                                            borderRadius: '8px',
                                            bgcolor: '#F1F5F9',
                                        },
                                        '& fieldset': { border: 'none' },
                                        minWidth: '180px'
                                    }}
                                />
                            )}
                        />
                    </LocalizationProvider>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleReset}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            borderColor: '#E2E8F0',
                            color: '#475569',
                            '&:hover': {
                                borderColor: '#CBD5E1',
                                backgroundColor: 'rgba(226, 232, 240, 0.2)'
                            }
                        }}
                    >
                        Réinitialiser
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => {}}
                        sx={{
                            bgcolor: '#4F46E5',
                            borderRadius: '8px',
                            textTransform: 'none',
                            px: 3,
                            '&:hover': {
                                bgcolor: '#4338CA',
                            }
                        }}
                    >
                        Rechercher
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExport}
                        sx={{
                            ml: 'auto',
                            borderRadius: '8px',
                            textTransform: 'none',
                            borderColor: '#E2E8F0',
                            color: '#475569',
                            '&:hover': {
                                borderColor: '#CBD5E1',
                                backgroundColor: 'rgba(226, 232, 240, 0.2)'
                            }
                        }}
                    >
                        Exporter
                    </Button>
                </Box>
            </Paper>

            {/* Tableau des frais */}
            <Paper sx={{ 
                borderRadius: '16px', 
                overflow: 'hidden', 
                border: '1px solid #edf2f7', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
            }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                            <TableRow>
                                {headCells.map((headCell) => (
                                    <TableCell 
                                        key={headCell.id}
                                        sx={{ 
                                            py: 2, 
                                            fontWeight: '600', 
                                            color: '#475569',
                                            fontSize: '0.875rem',
                                            borderBottom: '1px solid #E2E8F0'
                                        }}
                                    >
                                        {headCell.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fraisData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={headCells.length} align="center" sx={{ py: 4 }}>
                                        <Box sx={{ color: '#64748B' }}>
                                            Aucune donnée disponible
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fraisData
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{row.reference}</TableCell>
                                            <TableCell>{row.type}</TableCell>
                                            <TableCell>{row.montant}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.statut}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: row.statut === 'Payé' ? '#DCFCE7' : '#FEE2E2',
                                                        color: row.statut === 'Payé' ? '#166534' : '#991B1B',
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{row.date_application}</TableCell>
                                            <TableCell>{row.compte}</TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={fraisData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="Lignes par page :"
                    labelDisplayedRows={({ from, to, count }) => 
                        `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                    }
                    sx={{
                        borderTop: '1px solid #E2E8F0',
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontSize: '0.875rem',
                            color: '#64748B'
                        },
                        '& .MuiSelect-select': {
                            fontSize: '0.875rem'
                        }
                    }}
                />
            </Paper>
        </Box>
    );
};

export default HistoriqueFrais;
