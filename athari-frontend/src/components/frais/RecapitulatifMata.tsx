import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button,
  Divider,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';

// Interface pour les statistiques
interface Statistiques {
  totalMouvements: number;
  montantTotal: number;
  moyenneMensuelle: number;
  evolutionMensuelle: number;
  tendance: 'up' | 'down';
  categories: Array<{
    nom: string;
    montant: number;
    pourcentage: number;
  }>;
}

// Interface pour le récapitulatif
interface Recapitulatif {
  soldeActuel: number;
  soldePrecedent: number;
  variation: number;
  mouvementsRecents: Array<{
    id: string;
    date: string;
    libelle: string;
    montant: number;
    type: 'credit' | 'debit';
  }>;
}

const RecapitulatifMata: React.FC<{ compteId?: string }> = ({ compteId: propCompteId }) => {
  const params = useParams<{ compteId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Utiliser la prop compteId si fournie, sinon utiliser le paramètre d'URL
  const compteId = propCompteId || params.compteId;
  
  // États pour les données
  const [recapitulatif, setRecapitulatif] = useState<Recapitulatif | null>(null);
  const [statistiques, setStatistiques] = useState<Statistiques | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fonction pour charger les données
  const loadRecapitulatif = async () => {
    try {
      setLoading(true);
      // Implémentez la logique de chargement ici
      // Exemple : const data = await api.getRecapitulatifMata(compteId);
      // setRecapitulatif(data);
    } catch (error) {
      console.error('Erreur lors du chargement du récapitulatif:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadStatistiques = async (params: { annee: number; mois: number }) => {
    try {
      setLoading(true);
      // Implémentez la logique de chargement ici
      // Exemple : const data = await api.getStatistiquesMata(compteId, params);
      // setStatistiques(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données
  useEffect(() => {
    if (compteId) {
      loadRecapitulatif();
      loadStatistiques({
        annee: moment().year(),
        mois: moment().month() + 1
      });
    }
  }, [compteId]);

  // Gestion des exports
  const handleExportPDF = () => {
    // Logique d'export PDF
    console.log('Export PDF');
  };

  const handleExportExcel = () => {
    // Logique d'export Excel
    console.log('Export Excel');
  };

  const handlePrint = () => {
    window.print();
  };

  // Fonction pour formater les montants
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Fonction pour obtenir la couleur en fonction de la variation
  const getVariationColor = (variation: number) => {
    return variation >= 0 ? 'success.main' : 'error.main';
  };

  // Données factices pour le développement
  const mockRecapitulatif: Recapitulatif = {
    soldeActuel: 1250000,
    soldePrecedent: 980000,
    variation: 27.55,
    mouvementsRecents: [
      {
        id: '1',
        date: '2023-11-15',
        libelle: 'Virement client',
        montant: 150000,
        type: 'credit'
      },
      {
        id: '2',
        date: '2023-11-10',
        libelle: 'Frais de gestion',
        montant: 5000,
        type: 'debit'
      },
      {
        id: '3',
        date: '2023-11-05',
        libelle: 'Dépôt espèce',
        montant: 200000,
        type: 'credit'
      },
      {
        id: '4',
        date: '2023-11-01',
        libelle: 'Retrait DAB',
        montant: 100000,
        type: 'debit'
      },
      {
        id: '5',
        date: '2023-10-28',
        libelle: 'Virement reçu',
        montant: 500000,
        type: 'credit'
      }
    ]
  };

  const mockStatistiques: Statistiques = {
    totalMouvements: 24,
    montantTotal: 2785000,
    moyenneMensuelle: 928333.33,
    evolutionMensuelle: 12.5,
    tendance: 'up',
    categories: [
      { nom: 'Virements', montant: 1500000, pourcentage: 54 },
      { nom: 'Dépôts', montant: 850000, pourcentage: 30 },
      { nom: 'Retraits', montant: 300000, pourcentage: 11 },
      { nom: 'Frais', montant: 100000, pourcentage: 4 },
      { nom: 'Autres', montant: 35000, pourcentage: 1 }
    ]
  };

  // Utiliser les données factices si les données réelles ne sont pas encore chargées
  const dataRecapitulatif = recapitulatif || mockRecapitulatif;
  const dataStatistiques = statistiques || mockStatistiques;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 0, sm: 2 } }}>
      {/* En-tête avec boutons d'action */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3
        }}
      >
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          size={isMobile ? 'small' : 'medium'}
        >
          Retour
        </Button>
        
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button 
            variant="outlined" 
            startIcon={<PdfIcon />} 
            onClick={handleExportPDF}
            size={isMobile ? 'small' : 'medium'}
          >
            {!isMobile && 'PDF'}
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<ExcelIcon />} 
            onClick={handleExportExcel}
            size={isMobile ? 'small' : 'medium'}
          >
            {!isMobile && 'Excel'}
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />} 
            onClick={handlePrint}
            size={isMobile ? 'small' : 'medium'}
          >
            {!isMobile && 'Imprimer'}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            size={isMobile ? 'small' : 'medium'}
          >
            {!isMobile && 'Télécharger'}
          </Button>
        </Stack>
      </Box>

      {/* Carte de récapitulatif */}
      <Card 
        sx={{ 
          mb: 3,
          '& .MuiCardContent-root': {
            p: { xs: 1, sm: 2 }
          }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2
          }}
        >
          <Typography variant="h6" component="h2">
            Récapitulatif MATA
          </Typography>
          <Chip 
            label={`Compte: ${compteId}`} 
            color="primary" 
            size={isMobile ? 'small' : 'medium'}
            variant="outlined"
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Solde actuel
              </Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                {formatMontant(dataRecapitulatif.soldeActuel)}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" mt={1}>
                vs {formatMontant(dataRecapitulatif.soldePrecedent)} (mois précédent)
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2">
                  Variation:
                </Typography>
                <Box 
                  component="span" 
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    ml: 1,
                    color: getVariationColor(dataRecapitulatif.variation)
                  }}
                >
                  {dataRecapitulatif.variation > 0 ? (
                    <ArrowUpIcon fontSize="small" />
                  ) : (
                    <ArrowDownIcon fontSize="small" />
                  )}
                  <Typography variant="body2" component="span" ml={0.5}>
                    {Math.abs(dataRecapitulatif.variation)}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2,
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Statistiques mensuelles
              </Typography>
              
              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total mouvements
                    </Typography>
                    <Typography variant="h6">
                      {dataStatistiques.totalMouvements}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Montant total
                    </Typography>
                    <Typography variant="h6">
                      {formatMontant(dataStatistiques.montantTotal)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Moyenne mensuelle
                    </Typography>
                    <Typography variant="h6">
                      {formatMontant(dataStatistiques.moyenneMensuelle)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Évolution mensuelle
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      color: getVariationColor(dataStatistiques.evolutionMensuelle)
                    }}
                  >
                    {dataStatistiques.tendance === 'up' ? (
                      <TrendingUpIcon fontSize="small" />
                    ) : (
                      <TrendingDownIcon fontSize="small" />
                    )}
                    <Typography variant="body2" component="span" ml={0.5}>
                      {Math.abs(dataStatistiques.evolutionMensuelle)}%
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(Math.abs(dataStatistiques.evolutionMensuelle), 100)}
                  color={dataStatistiques.tendance === 'up' ? 'success' : 'error'}
                  sx={{
                    height: 8,
                    borderRadius: 4
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{
              height: '100%',
              '& .MuiCardContent-root': {
                p: { xs: 1, sm: 2 }
              }
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography variant="subtitle1">
                Répartition par catégorie
              </Typography>
              <Tooltip title="Afficher les détails">
                <IconButton size="small" onClick={() => console.log('Afficher détails')}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ '& > div:not(:last-child)': { mb: 2 } }}>
              {dataStatistiques.categories.map((categorie, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">
                      {categorie.nom}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatMontant(categorie.montant)} ({categorie.pourcentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={categorie.pourcentage}
                    color={index % 2 === 0 ? 'primary' : 'secondary'}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'action.hover'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card 
            sx={{
              height: '100%',
              '& .MuiCardContent-root': {
                p: 0,
                '&:last-child': {
                  pb: 0
                }
              }
            }}
          >
            <Box 
              sx={{ 
                p: 2,
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="subtitle1">
                Derniers mouvements
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate(`/comptes/${compteId}/mouvements`)}
              >
                Voir tout
              </Button>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Libellé</TableCell>
                    <TableCell align="right">Montant</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataRecapitulatif.mouvementsRecents.map((mouvement) => (
                    <TableRow 
                      key={mouvement.id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        {moment(mouvement.date).format('DD/MM/YYYY')}
                      </TableCell>
                      <TableCell>{mouvement.libelle}</TableCell>
                      <TableCell 
                        align="right"
                        sx={{
                          color: mouvement.type === 'credit' ? 'success.main' : 'error.main',
                          fontWeight: 'medium'
                        }}
                      >
                        {mouvement.type === 'credit' ? '+' : '-'} {formatMontant(mouvement.montant)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecapitulatifMata;
