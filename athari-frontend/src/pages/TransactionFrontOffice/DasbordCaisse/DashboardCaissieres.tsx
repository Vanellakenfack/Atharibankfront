import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Button,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Download as DownloadIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
    People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Components
import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';

interface Transaction {
    id: number;
    type: 'deposit' | 'withdrawal';
    clientName: string;
    accountType: string;
    time: string;
    amount: number;
}

interface StatCard {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    icon: React.ReactNode;
    subtitle: string;
}

const DashboardCaissieres = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    // État de la sidebar
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    // Données statiques (à remplacer par des données réelles)
    const [stats] = useState<StatCard[]>([
        {
            title: 'Total des Dépôts',
            value: '2 450 750',
            change: '+12.5% ce mois',
            changeType: 'positive',
            icon: <ArrowDownIcon />,
            subtitle: 'FCFA'
        },
        {
            title: 'Total des Retraits',
            value: '1 890 250',
            change: '-3.2% ce mois',
            changeType: 'negative',
            icon: <ArrowUpIcon />,
            subtitle: 'FCFA'
        },
        {
            title: 'Clients Servis',
            value: '148',
            change: '+8.1% ce mois',
            changeType: 'positive',
            icon: <PeopleIcon />,
            subtitle: 'Cette semaine'
        }
    ]);
    
    const [transactions] = useState<Transaction[]>([
        {
            id: 1,
            type: 'deposit',
            clientName: 'Versement Client - Jean Dupont',
            accountType: 'Compte Épargne',
            time: '09:30 AM',
            amount: 450000
        },
        {
            id: 2,
            type: 'withdrawal',
            clientName: 'Retrait - Marie Koné',
            accountType: 'Compte Courant',
            time: '10:15 AM',
            amount: 120000
        },
        {
            id: 3,
            type: 'deposit',
            clientName: 'Versement AC - Microfinance',
            accountType: 'Compte DAT',
            time: '11:45 AM',
            amount: 750000
        },
        {
            id: 4,
            type: 'withdrawal',
            clientName: 'Retrait - Ahmed Diallo',
            accountType: 'Compte Épargne',
            time: '02:20 PM',
            amount: 85000
        },
        {
            id: 5,
            type: 'deposit',
            clientName: 'Versement Client - Fatou Sow',
            accountType: 'Compte Courant',
            time: '03:45 PM',
            amount: 320000
        }
    ]);

    // Format monétaire
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            {/* Contenu principal */}
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
                {/* TopBar */}
                <TopBar sidebarOpen={sidebarOpen} />
                
                {/* Contenu du dashboard */}
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    
                    {/* En-tête de page */}
                    <Paper 
                        sx={{ 
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEF9E7 100%)',
                            borderRadius: 4,
                            p: 3,
                            mb: 3,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            border: '1px solid #E5E5E5'
                        }}
                    >
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 700, 
                                color: '#2C3E50',
                                mb: 1
                            }}
                        >
                            Tableau de Bord des Caissières
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: '#7F8C8D'
                            }}
                        >
                            Gérez vos transactions et suivez vos performances en temps réel
                        </Typography>
                    </Paper>
                    
                    {/* Grille des statistiques */}
                    <Box 
                        sx={{ 
                            display: 'grid',
                            gridTemplateColumns: { 
                                xs: '1fr', 
                                sm: 'repeat(2, 1fr)', 
                                lg: 'repeat(3, 1fr)' 
                            },
                            gap: 2,
                            mb: 3
                        }}
                    >
                        {stats.map((stat, index) => (
                            <Paper
                                key={index}
                                sx={{
                                    position: 'relative',
                                    borderRadius: 4,
                                    p: 2.5,
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                    border: '1px solid #E5E5E5',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #D4AF37, #FF8C00)',
                                        borderRadius: '4px 4px 0 0'
                                    }
                                }}
                            >
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'flex-start',
                                        mb: 2
                                    }}
                                >
                                    <Box>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                fontWeight: 600, 
                                                color: '#7F8C8D',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5
                                            }}
                                        >
                                            {stat.title}
                                        </Typography>
                                        <Typography 
                                            variant="h4" 
                                            sx={{ 
                                                fontWeight: 700, 
                                                color: '#2C3E50',
                                                mt: 0.5
                                            }}
                                        >
                                            {stat.value}
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: stat.changeType === 'positive' ? '#28a745' : '#dc3545',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}
                                        >
                                            {stat.changeType === 'positive' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />}
                                            {stat.change}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            color: '#FFFFFF',
                                            background: index === 0 
                                                ? 'linear-gradient(135deg, #28a745, #20c997)' 
                                                : index === 1
                                                ? 'linear-gradient(135deg, #dc3545, #fd7e14)'
                                                : 'linear-gradient(135deg, #007bff, #6610f2)'
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                                    {stat.subtitle}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                    
                    {/* Transactions récentes */}
                    <Paper 
                        sx={{ 
                            borderRadius: 4,
                            p: 2.5,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            border: '1px solid #E5E5E5'
                        }}
                    >
                        {/* En-tête du tableau */}
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                mb: 2.5,
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: { xs: 2, sm: 0 }
                            }}
                        >
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 600, 
                                    color: '#2C3E50'
                                }}
                            >
                                Transactions Récentes
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<FilterIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        color: '#2C3E50',
                                        borderColor: '#E5E5E5',
                                        '&:hover': {
                                            borderColor: '#D4AF37',
                                            backgroundColor: 'rgba(212, 175, 55, 0.04)'
                                        }
                                    }}
                                >
                                    Filtrer
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        background: 'linear-gradient(135deg, #D4AF37, #B7950B)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #B7950B, #D4AF37)'
                                        }
                                    }}
                                >
                                    Exporter
                                </Button>
                            </Box>
                        </Box>
                        
                        {/* Liste des transactions */}
                        {transactions.map((transaction) => (
                            <Box
                                key={transaction.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2,
                                    borderBottom: '1px solid #E5E5E5',
                                    transition: 'background-color 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: '#FEF9E7'
                                    },
                                    '&:last-child': {
                                        borderBottom: 'none'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            background: transaction.type === 'deposit' 
                                                ? 'linear-gradient(135deg, #d4edda, #c3e6cb)' 
                                                : 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
                                            color: transaction.type === 'deposit' ? '#155724' : '#721c24'
                                        }}
                                    >
                                        {transaction.type === 'deposit' ? <ArrowDownIcon /> : <ArrowUpIcon />}
                                    </Box>
                                    <Box>
                                        <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                                fontWeight: 600, 
                                                color: '#2C3E50',
                                                mb: 0.25
                                            }}
                                        >
                                            {transaction.clientName}
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: '#7F8C8D'
                                            }}
                                        >
                                            {transaction.accountType} • {transaction.time}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography 
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        color: transaction.type === 'deposit' ? '#28a745' : '#dc3545'
                                    }}
                                >
                                    {transaction.type === 'deposit' ? '+ ' : '- '}
                                    {formatCurrency(transaction.amount)}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardCaissieres;