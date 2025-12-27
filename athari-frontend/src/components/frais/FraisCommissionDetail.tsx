import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Event as EventIcon,
  Update as UpdateIcon,
  Info as InfoIcon,
  AttachMoney as DollarIcon,
  Percent as PercentIcon,
  ShowChart as ShowChartIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { fraisService } from '../../services/fraisService';

const FraisCommissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [frais, setFrais] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFraisDetail = async () => {
      console.log('[FraisCommissionDetail] ID from URL:', id);
      console.log('[FraisCommissionDetail] Parsed ID:', id ? parseInt(id) : 'No ID');
      
      if (!id || id === '*' || isNaN(parseInt(id, 10))) {
        console.error('[FraisCommissionDetail] Invalid ID format:', id);
        setError('Aucune configuration sélectionnée. Veuillez sélectionner une configuration valide depuis la liste.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const fraisId = parseInt(id);
        console.log('[FraisCommissionDetail] Fetching frais with ID:', fraisId);
        const response = await fraisService.getFraisCommission(fraisId);
        console.log('[FraisCommissionDetail] API Response:', response);
        
        const payload = (response as any)?.data ?? (response as any)?.data?.data ?? response;
        const normalized = payload
          ? {
              ...payload,
              typeCompte: payload.typeCompte ?? payload.type_compte,
            }
          : null;

        if (normalized) {
          setFrais(normalized);
          console.log('[FraisCommissionDetail] Frais data set:', normalized);
        } else {
          console.warn('[FraisCommissionDetail] Configuration non trouvée pour ID:', fraisId);
          setError('Configuration non trouvée');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des détails:', err);
        if (axios.isAxiosError(err)) {
          const message = (err.response?.data as any)?.message;
          setError(message || 'Erreur lors du chargement des détails de la configuration');
        } else {
          setError('Erreur lors du chargement des détails de la configuration');
        }
      } finally {
        setLoading(false);
      }
    };

    loadFraisDetail();
  }, [id]);

  if (error) {
    return (
      <Alert 
        severity="error"
        action={
          <Button 
            color="inherit" 
            size="small"
            onClick={() => navigate('/frais/commissions')}
          >
            Retour à la liste
          </Button>
        }
        sx={{ mb: 2 }}
      >
        <AlertTitle>Erreur</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (loading || !frais) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const toNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'string') {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const formatCurrency = (value: unknown) => {
    const n = toNumber(value);
    return n !== null ? `${n.toLocaleString()} FCFA` : '-';
  };

  const formatPercentage = (value: unknown) => {
    const n = toNumber(value);
    return n !== null ? `${n}%` : '-';
  };

  const getStatusChip = (active: unknown) => (
    <Chip 
      label={Boolean(active) ? 'Actif' : 'Inactif'}
      color={Boolean(active) ? 'success' : 'error'}
      size="small"
      variant="outlined"
    />
  );

  const details = [
    { label: 'Type de compte', value: frais.typeCompte?.libelle || '-', icon: <AccountBalanceIcon /> },
    { label: 'Statut', value: getStatusChip(frais.actif), icon: frais.actif ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" /> },
    { label: 'Date de création', value: frais.created_at ? new Date(frais.created_at).toLocaleString() : '-', icon: <EventIcon /> },
    { label: 'Dernière modification', value: frais.updated_at ? new Date(frais.updated_at).toLocaleString() : '-', icon: <UpdateIcon /> }
  ];

  const fraisFixes = [
    { label: "Frais d'ouverture", value: formatCurrency(frais.frais_ouverture) },
    { label: 'Frais de tenue de compte', value: formatCurrency(frais.frais_tenue_compte) },
    { label: 'Minimum compte', value: formatCurrency(frais.minimum_compte) },
    { label: 'Seuil commission mensuelle', value: formatCurrency(frais.seuil_commission_mensuelle) }
  ];

  const commissions = [
    { label: 'Commission mouvement', value: formatCurrency(frais.commission_mouvement) },
    { label: 'Commission retrait', value: formatCurrency(frais.commission_retrait) },
    { label: 'Commission SMS', value: formatCurrency(frais.commission_sms) },
    { label: 'Commission mensuelle élevée', value: formatCurrency(frais.commission_mensuelle_elevee) },
    { label: 'Commission mensuelle basse', value: formatCurrency(frais.commission_mensuelle_basse) }
  ];

  const tauxInteret = [
    { label: "Taux d'intérêt annuel", value: formatPercentage(frais.taux_interet_annuel) }
  ];

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 1400, mx: 'auto' }}>
      {/* En-tête de la page */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              textTransform: 'none',
              color: '#4F46E5',
              mb: 2,
              '&:hover': {
                backgroundColor: 'rgba(79, 70, 229, 0.04)'
              }
            }}
          >
            Retour
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B' }}>
              Configuration des frais - {frais?.typeCompte?.libelle}
            </Typography>
            <Chip
              label={frais?.actif ? 'Actif' : 'Inactif'}
              color={frais?.actif ? 'success' : 'error'}
              size="small"
              variant="outlined"
              sx={{ height: 24, fontWeight: 500 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#64748B', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
              <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'inherit' }} />
              <span>Créé le {frais ? new Date(frais.created_at).toLocaleDateString() : ''}</span>
            </Box>
            {frais?.updated_at !== frais?.created_at && (
              <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                <UpdateIcon fontSize="small" sx={{ mr: 0.5, color: 'inherit' }} />
                <span>Modifié le {frais ? new Date(frais.updated_at).toLocaleDateString() : ''}</span>
              </Box>
            )}
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => frais && navigate(`/frais/commissions/edit/${frais.id}`)}
          disabled={!frais}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            borderRadius: '8px',
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
            '&:hover': {
              opacity: 0.9,
              boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
              transform: 'translateY(-1px)'
            },
            '&:active': {
              transform: 'translateY(0)'
            },
            '&.Mui-disabled': {
              background: '#e2e8f0',
              color: '#94a3b8',
              boxShadow: 'none'
            }
          }}
        >
          Modifier la configuration
        </Button>
      </Box>

      {/* Section Informations de base */}
      <Paper sx={{ 
        mb: 4, 
        borderRadius: '12px', 
        overflow: 'hidden', 
        border: '1px solid #e2e8f0', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
      }}>
        <Box sx={{ 
          p: 2.5, 
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <InfoIcon sx={{ color: '#4f46e5', fontSize: '1.5rem' }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#1e293b',
            m: 0,
            lineHeight: 1.4
          }}>
            Informations de base
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableBody>
              {details.map((detail, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:nth-of-type(odd)': { bgcolor: '#f8fafc' },
                    '&:hover': { 
                      bgcolor: '#f1f5f9',
                    },
                    '&:last-child td': {
                      borderBottom: 0
                    }
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{
                      width: '35%',
                      fontWeight: 500,
                      color: '#475569',
                      borderRight: '1px solid #e2e8f0',
                      py: 2.5,
                      pl: 4,
                      position: 'relative',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        bgcolor: 'primary.main',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out'
                      },
                      '&:hover:before': {
                        opacity: 1
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Box sx={{ 
                        mr: 1.5, 
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {detail.icon}
                      </Box>
                      {detail.label}
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      py: 2.5, 
                      color: '#1e293b', 
                      fontWeight: 500,
                      pr: 4
                    }}
                  >
                    {detail.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Section Frais fixes */}
      <Paper sx={{ 
        mb: 3, 
        borderRadius: '12px', 
        overflow: 'hidden', 
        border: '1px solid #edf2f7', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <Box sx={{ 
          p: 2.5, 
          borderBottom: '1px solid #edf2f7',
          bgcolor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            m: 0
          }}>
            <DollarIcon color="primary" sx={{ mr: 1.5, fontSize: '1.5rem' }} />
            Frais fixes
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableBody>
              {fraisFixes.map((item, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:nth-of-type(odd)': { bgcolor: '#F8FAFC' },
                    '&:hover': { bgcolor: '#F1F5F9' }
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      width: '35%', 
                      fontWeight: 500, 
                      color: '#475569',
                      borderRight: '1px solid #edf2f7',
                      py: 2
                    }}
                  >
                    {item.label}
                  </TableCell>
                  <TableCell sx={{ py: 2, color: '#1E293B', fontWeight: 500 }}>
                    {item.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Section Commissions */}
      <Paper sx={{ 
        mb: 3, 
        borderRadius: '12px', 
        overflow: 'hidden', 
        border: '1px solid #edf2f7', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <Box sx={{ 
          p: 2.5, 
          borderBottom: '1px solid #edf2f7',
          bgcolor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            m: 0
          }}>
            <PercentIcon color="secondary" sx={{ mr: 1.5, fontSize: '1.5rem' }} />
            Commissions
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableBody>
              {commissions.map((item, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:nth-of-type(odd)': { bgcolor: '#F8FAFC' },
                    '&:hover': { bgcolor: '#F1F5F9' }
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      width: '35%', 
                      fontWeight: 500, 
                      color: '#475569',
                      borderRight: '1px solid #edf2f7',
                      py: 2
                    }}
                  >
                    {item.label}
                  </TableCell>
                  <TableCell sx={{ py: 2, color: '#1E293B', fontWeight: 500 }}>
                    {item.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Section Taux d'intérêt */}
      <Paper sx={{ 
        mb: 3,
        borderRadius: '12px', 
        overflow: 'hidden', 
        border: '1px solid #edf2f7', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <Box sx={{ 
          p: 2.5, 
          borderBottom: '1px solid #edf2f7',
          bgcolor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            m: 0
          }}>
            <ShowChartIcon color="success" sx={{ mr: 1.5, fontSize: '1.5rem' }} />
            Taux d'intérêt
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableBody>
              {tauxInteret.map((item, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:nth-of-type(odd)': { bgcolor: '#F8FAFC' },
                    '&:hover': { bgcolor: '#F1F5F9' }
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ 
                      width: '35%', 
                      fontWeight: 500, 
                      color: '#475569',
                      borderRight: '1px solid #edf2f7',
                      py: 2
                    }}
                  >
                    {item.label}
                  </TableCell>
                  <TableCell sx={{ py: 2, color: '#1E293B', fontWeight: 500 }}>
                    {item.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default FraisCommissionDetail;
