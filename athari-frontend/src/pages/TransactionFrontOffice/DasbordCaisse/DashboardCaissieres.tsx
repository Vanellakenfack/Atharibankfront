import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, Button, CircularProgress, 
    Alert, Badge, Grid, Divider, Avatar, useTheme,Chip
} from '@mui/material';
import {
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
    People as PeopleIcon,
    NotificationsActive as AlertIcon,
    AccountBalanceWallet as WalletIcon,
    Refresh as RefreshIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';

// --- IMPORT DES COMPOSANTS LOGICIELS ---
import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';
import apiClient from '../../../services/api/ApiClient';

// --- Interfaces ---
interface DigitalFlux {
    type_versement: string;
    type_flux: string;
    total: string | number;
}

interface DashboardData {
    session: {
        caisse: string;
        code: string;
        ouvert_le: string;
    };
    bilan_especes: {
        solde_ouverture: number;
        total_entrees: number;
        total_sorties: number;
        net_a_justifier_physique: number;
    };
    flux_digitaux: {
        [key: string]: DigitalFlux[];
    };
    validations_en_cours: number;
}

const DashboardCaissieres = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/caisse/dashboard');
            setData(response.data.dashboard || response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur de connexion aux services de caisse");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const formatCurrency = (amount: number | string) => {
        const value = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('fr-FR').format(value || 0) + ' FCFA';
    };

    if (loading && !data) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC' }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            <Box component="main" sx={{ 
                flexGrow: 1, 
                width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`, 
                transition: 'width 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <TopBar sidebarOpen={sidebarOpen} />
                
                <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
                    
                    {/* EN-TÊTE : Style identique à ListeClient */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                                Tableau de Bord Caisse
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Chip 
                                    label={data?.session.caisse} 
                                    size="small" 
                                    sx={{ bgcolor: '#E2E8F0', fontWeight: 'bold', color: '#475569' }} 
                                />
                                <Typography variant="body2" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon sx={{ fontSize: 16 }} />
                                    Ouvert le {data?.session.ouvert_le ? new Date(data.session.ouvert_le).toLocaleString() : '---'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={fetchDashboardData}
                                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, borderColor: '#E2E8F0', color: '#475569' }}
                            >
                                Actualiser
                            </Button>
                            <Badge badgeContent={data?.validations_en_cours} color="error" overlap="rectangular">
                                <Button
                                    variant="contained"
                                    startIcon={<AlertIcon />}
                                    sx={{
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        borderRadius: '10px', px: 3, textTransform: 'none', fontWeight: 'bold',
                                        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)',
                                        '&:hover': { opacity: 0.9 }
                                    }}
                                >
                                    Validations
                                </Button>
                            </Badge>
                        </Box>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

                    {/* SECTION 1 : BILAN ESPÈCES (CARTES) */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#475569', mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Bilan des Espèces (Coffre)
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mb: 5 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Ouverture" value={formatCurrency(data?.bilan_especes.solde_ouverture || 0)} color="#6366f1" icon={<WalletIcon />} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Total Entrées" value={formatCurrency(data?.bilan_especes.total_entrees || 0)} color="#22c55e" icon={<ArrowDownIcon />} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Total Sorties" value={formatCurrency(data?.bilan_especes.total_sorties || 0)} color="#ef4444" icon={<ArrowUpIcon />} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard 
                                title="Net à Justifier" 
                                value={formatCurrency(data?.bilan_especes.net_a_justifier_physique || 0)} 
                                color="#a855f7" 
                                icon={<PeopleIcon />} 
                                highlight 
                            />
                        </Grid>
                    </Grid>

                    {/* SECTION 2 : FLUX DIGITAUX (TABLEAU/LISTE) */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#475569', mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Flux Digitaux & Virtuels
                    </Typography>

                    <Grid container spacing={3}>
                        {data && Object.entries(data.flux_digitaux).length > 0 ? (
                            Object.entries(data.flux_digitaux).map(([key, transactions]) => (
                                <Grid item xs={12} md={6} key={key}>
                                    <Paper sx={{ 
                                        borderRadius: '16px', 
                                        border: '1px solid #edf2f7',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                        overflow: 'hidden'
                                    }}>
                                        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: key.includes('ORANGE') ? '#ff660020' : '#ffcc0020', color: key.includes('ORANGE') ? '#ff6600' : '#d97706', fontSize: '14px', fontWeight: 'bold' }}>
                                                {key.charAt(0)}
                                            </Avatar>
                                            <Typography sx={{ fontWeight: 'bold', color: '#1E293B' }}>
                                                {key.replace('_', ' ')}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ p: 2 }}>
                                            {transactions.map((t, idx) => (
                                                <Box key={idx} sx={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    py: 1.5,
                                                    borderBottom: idx !== transactions.length - 1 ? '1px dashed #E2E8F0' : 'none'
                                                }}>
                                                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>{t.type_flux}</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>{formatCurrency(t.total)}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '16px', border: '1px dashed #CBD5E1', bgcolor: 'transparent' }}>
                                    <Typography sx={{ color: '#94A3B8' }}>Aucune transaction digitale pour cette session.</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

// --- Sous-composant StatCard (Style ListeClient) ---
const StatCard = ({ title, value, color, icon, highlight = false }: any) => (
    <Paper sx={{ 
        p: 2.5, 
        borderRadius: '16px', 
        border: '1px solid #edf2f7',
        boxShadow: highlight ? `0 10px 15px -3px ${color}20` : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        background: highlight ? `linear-gradient(135deg, #FFFFFF 0%, ${color}05 100%)` : '#FFFFFF',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 2
    }}>
        <Avatar sx={{ 
            bgcolor: `${color}15`, 
            color: color,
            width: 48,
            height: 48,
            borderRadius: '12px'
        }}>
            {icon}
        </Avatar>
        <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                {title}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B' }}>
                {value}
            </Typography>
        </Box>
        {highlight && (
            <Box sx={{ 
                position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', 
                bgcolor: color, borderTopRightRadius: '16px', borderBottomRightRadius: '16px' 
            }} />
        )}
    </Paper>
);

export default DashboardCaissieres;