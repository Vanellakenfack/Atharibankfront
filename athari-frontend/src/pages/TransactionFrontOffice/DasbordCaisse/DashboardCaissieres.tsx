import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, Button, CircularProgress, 
    Alert, Badge, Grid, Avatar, Chip, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Divider
} from '@mui/material';
import {
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
    AccountBalanceWallet as WalletIcon,
    Refresh as RefreshIcon,
    AccessTime as TimeIcon,
    History as HistoryIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';
import apiClient from '../../../services/api/ApiClient';
import compteService from '../../../services/api/compteService';

// --- Interfaces Alignées sur le Backend Laravel ---
interface Transaction {
    id: number;
    ref: string;
    type: string;
    mode: string;
    statut: string;
    compte_id: number;
    montant: number;
    heure: string;
    color: 'success' | 'error';
    is_opposition: boolean;
}

interface DashboardData {
    session: {
        caisse: string;
        code: string;
        ouvert_le: string;
        duree: string;
    };
    bilan_especes: {
        solde_ouverture: number;
        total_entrees: number;
        total_sorties: number;
        net_a_justifier_physique: number;
    };
    flux_digitaux: Array<{
        mode: string;
        entrees: number;
        sorties: number;
        nb_ops: number;
    }>;
    transactions_recentes: Transaction[];
    graphique: Array<{
        heure: string;
        entrees: number;
        sorties: number;
    }>;
    validations_en_cours: number;
}

const DashboardCaissieres = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [compteMap, setCompteMap] = useState<Record<number, string>>({}); // Map compte_id -> numero_compte

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/caisse/dashboard');
            // Correction : On cible 'dashboard' car Laravel renvoie { statut: "success", dashboard: {...} }
            setData(response.data.dashboard);
            setError(null);

            // Récupérer les numéros de compte pour toutes les transactions
            if (response.data.dashboard?.transactions_recentes) {
                const compteIds = [...new Set(response.data.dashboard.transactions_recentes.map((t: Transaction) => t.compte_id).filter(id => id))];
                const newCompteMap: Record<number, string> = {};
                
                for (const compteId of compteIds) {
                    try {
                        const compte = await compteService.getCompteById(compteId);
                        newCompteMap[compteId] = compte.numero_compte || `Compte ${compteId}`;
                    } catch (err: any) {
                        // En cas d'erreur (compte non trouvé), utiliser l'ID comme fallback
                        console.warn(`Compte ${compteId} non trouvé:`, err.message);
                        newCompteMap[compteId] = `Compte ${compteId}`;
                    }
                }
                
                setCompteMap(newCompteMap);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur de chargement des données");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';
    };

    if (loading && !data) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            <Box component="main" sx={{ 
                flexGrow: 1, 
                width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`, 
                transition: 'width 0.3s ease'
            }}>
                <TopBar sidebarOpen={sidebarOpen} />
                
                <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
                    
                    {/* EN-TÊTE DYNAMIQUE */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B' }}>
                                Ma Caisse
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                                <Chip label={data?.session.caisse} size="small" sx={{ bgcolor: '#6366f1', color: '#fff' }} />
                                <Typography variant="body2" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon sx={{ fontSize: 16 }} />
                                    Ouvert il y a {data?.session.duree}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchDashboardData}>
                                Actualiser
                            </Button>
                            <Badge badgeContent={data?.validations_en_cours} color="error">
                                <Button variant="contained" sx={{ bgcolor: '#f59e0b' }}>Validations</Button>
                            </Badge>
                        </Box>
                    </Box>

                    {/* SECTION 1 : KPIS ALIGNÉS SUR BILAN_ESPECES */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Ouverture" value={formatCurrency(data?.bilan_especes.solde_ouverture || 0)} color="#64748B" icon={<WalletIcon />} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Total Entrées" value={formatCurrency(data?.bilan_especes.total_entrees || 0)} color="#22c55e" icon={<ArrowDownIcon />} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Total Sorties" value={formatCurrency(data?.bilan_especes.total_sorties || 0)} color="#ef4444" icon={<ArrowUpIcon />} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Solde Théorique" value={formatCurrency(data?.bilan_especes.net_a_justifier_physique || 0)} color="#6366f1" icon={<TrendingIcon />} highlight />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Validations en cours" value={data?.validations_en_cours?.toString() || '0'} color="#f59e0b" icon={<WarningIcon />} highlight={data?.validations_en_cours ? true : false} />
                        </Grid>
                    </Grid>

                    {/* SECTION 2 : GRAPHIQUE D'ACTIVITÉ */}
                    <Paper sx={{ p: 3, borderRadius: '16px', mb: 4, border: '1px solid #edf2f7' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3, color: '#475569' }}>FLUX HORAIRES DE LA SESSION</Typography>
                        <Box sx={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <BarChart data={data?.graphique}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="heure" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                                    <YAxis axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar name="Entrées" dataKey="entrees" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar name="Sorties" dataKey="sorties" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>

                    <Grid container spacing={3}>
                        {/* TABLEAU DES TRANSACTIONS */}
                        <Grid item xs={12} lg={8}>
                            <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #edf2f7' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                        <TableRow>
                                            <TableCell>Heure</TableCell>
                                            <TableCell>Référence</TableCell>
                                            <TableCell>Statut</TableCell>
                                            <TableCell>N° Compte</TableCell>
                                            <TableCell>Type de flux</TableCell>
                                            <TableCell align="right">Montant</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data?.transactions_recentes.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell sx={{ color: '#94A3B8' }}>{row.heure}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                        {row.ref}
                                                        {row.is_opposition && (
                                                            <Chip label="OPPOSITION" size="small" color="error" sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} />
                                                        )}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={row.statut} 
                                                        size="small" 
                                                        color={row.statut === 'VALIDE' ? 'success' : 'warning'}
                                                        variant="filled"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {compteMap[row.compte_id] || 'Chargement...'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={row.type} 
                                                        size="small" 
                                                        color={row.type === 'ENTREE' || row.type === 'DEPOT' || row.type === 'VERSEMENT' ? 'success' : 'error'}
                                                        variant="filled"
                                                        icon={row.type === 'ENTREE' || row.type === 'DEPOT' || row.type === 'VERSEMENT' ? <ArrowUpIcon sx={{ fontSize: '16px' }} /> : <ArrowDownIcon sx={{ fontSize: '16px' }} />}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography sx={{ fontWeight: 800, color: row.color === 'success' ? '#10b981' : '#ef4444' }}>
                                                        {row.type === 'RETRAIT' || row.type === 'SORTIE' ? '-' : '+'} {formatCurrency(row.montant)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        {/* RÉSUMÉ DES FLUX DIGITAUX (OM / MTN) */}
                        <Grid item xs={12} lg={4}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>PORTEFEUILLES DIGITAUX</Typography>
                            {data?.flux_digitaux.map((flux, i) => (
                                <Paper key={i} sx={{ p: 2, mb: 2, borderRadius: '12px', border: '1px solid #edf2f7' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography sx={{ fontWeight: 800 }}>{flux.mode}</Typography>
                                        <Chip label={`${flux.nb_ops} ops`} size="small" />
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">In (Recharges)</Typography>
                                            <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 700 }}>{formatCurrency(flux.entrees)}</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" color="textSecondary">Out (Retraits)</Typography>
                                            <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 700 }}>{formatCurrency(flux.sorties)}</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

// Composant StatCard réutilisable
const StatCard = ({ title, value, color, icon, highlight }: any) => (
    <Paper sx={{ 
        p: 2, borderRadius: '16px', border: '1px solid #edf2f7',
        boxShadow: highlight ? `0 4px 20px ${color}25` : 'none',
        display: 'flex', alignItems: 'center', gap: 2
    }}>
        <Avatar sx={{ bgcolor: `${color}15`, color: color, borderRadius: '12px' }}>{icon}</Avatar>
        <Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>{title}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{value}</Typography>
        </Box>
    </Paper>
);

export default DashboardCaissieres;