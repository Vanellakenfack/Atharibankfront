import React, { useState } from "react";
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  useTheme,
  Chip,
  Alert,
  Divider,
  Tabs,
  Tab
} from "@mui/material";
import { 
  AccountBalance, 
  Savings, 
  AttachMoney, 
  Payment, 
  ArrowForward, 
  Receipt, 
  CompareArrows,
  ShowChart,
  TrendingUp,
  Lock,
  LockOpen,
  ElectricBolt,
  WaterDrop,
  Wifi,
  Build,
  Description,
  History,
  Checklist
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";

export default function OperationDiverseChoicePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Types d'opérations diverses
  const operationTypes = [
    {
      id: 'mata-boost',
      title: 'MATA BOOST',
      subtitle: 'Collecte MATA BOOST',
      description: 'Versement des collectes MATA BOOST (journalier ou bloqué)',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      iconColor: '#4caf50',
      iconBg: '#e8f5e9',
      status: 'actif',
      path: '/CreatePageMataboost',
      details: {
        compteCollecteur: '468 - Compte collecteur agent',
        compteMataBoost: '37225000 (à vue) / 37226000 (bloqué)',
        validation: 'Validation chef agence + chef comptable'
      }
    },
    {
      id: 'epargne-journaliere',
      title: 'Épargne Journalière',
      subtitle: 'Collecte Épargne Journalière',
      description: 'Versement des collectes d\'épargne journalière',
      icon: <Savings sx={{ fontSize: 40 }} />,
      iconColor: '#2196f3',
      iconBg: '#e3f2fd',
      status: 'actif',
      path: '/CreatePageEpargneJournaliere',
      details: {
        compteCollecteur: '468 - Compte collecteur agent',
        compteEpargne: '37224000 à 37224012',
        validation: 'Validation chef agence + chef comptable'
      }
    },
    {
      id: 'charges',
      title: 'Règlement de Charges',
      subtitle: 'Opérations de charges',
      description: 'Paiement des charges (électricité, eau, communication, entretien...)',
      icon: <Receipt sx={{ fontSize: 40 }} />,
      iconColor: '#ff9800',
      iconBg: '#fff3e0',
      status: 'actif',
      path: '/Creation-od-charge',
      details: {
        compteCharge: 'Classe 6 - Comptes de charges',
        comptePassage: '47 - Compte de passage',
        validation: 'Validation chef agence + chef comptable + DG'
      }
    },
    {
      id: 'generique',
      title: 'Opération Diverse Générique',
      subtitle: 'Opérations diverses',
      description: 'Opérations diverses, régularisations, virements, frais...',
      icon: <CompareArrows sx={{ fontSize: 40 }} />,
      iconColor: '#9c27b0',
      iconBg: '#f3e5f5',
      status: 'actif',
      path: '/Creation-od-generique',
      details: {
        flexibilite: 'Débit/Crédit multiples',
        validation: 'Selon type d\'opération'
      }
    },
    {
      id: 'differe',
      title: 'Différé Ordinateur',
      subtitle: 'Régularisation comptable',
      description: 'Rattrapage des soldes clients et autres soldes',
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      iconColor: '#f44336',
      iconBg: '#ffebee',
      status: 'actif',
      path: '/Creation-od-generique',
      details: {
        compte: '478 - Différé ordinateur',
        validation: 'Validation chef agence'
      }
    },
    {
      id: 'avec-modele',
      title: 'OD avec Modèle',
      subtitle: 'Saisie suivant modèle prédéfini',
      description: 'Utiliser un modèle préconfiguré pour les OD récurrentes',
      icon: <Description sx={{ fontSize: 40 }} />,
      iconColor: '#607d8b',
      iconBg: '#eceff1',
      status: 'actif',
      path: '/CreerOdModelesPage',
      details: {
        avantage: 'Gain de temps pour les opérations récurrentes',
        validation: 'Selon modèle'
      }
    }
  ];

  // Catégories pour les tabs
  const categories = [
    { label: 'Toutes', icon: <Checklist /> },
    { label: 'Collectes', icon: <TrendingUp /> },
    { label: 'Charges', icon: <Receipt /> },
    { label: 'Régularisations', icon: <CompareArrows /> },
  ];

  // Filtrer par catégorie
  const filteredOperations = activeTab === 0 ? operationTypes : 
    activeTab === 1 ? operationTypes.filter(op => ['mata-boost', 'epargne-journaliere'].includes(op.id)) :
    activeTab === 2 ? operationTypes.filter(op => ['charges'].includes(op.id)) :
    operationTypes.filter(op => ['generique', 'differe', 'avec-modele'].includes(op.id));

  const getStatusColor = (status) => {
    switch(status) {
      case 'actif': return 'success';
      case 'inactif': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#F8FAFC',
        py: { xs: 3, md: 5 }
      }}>
        <Container maxWidth="lg">
          {/* En-tête */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              fontWeight="800" 
              gutterBottom 
              sx={{ 
                color: '#1a237e', 
                letterSpacing: '-0.5px',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Opérations Diverses
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 800, 
                mx: 'auto', 
                fontWeight: 400,
                mb: 3
              }}
            >
              Sélectionnez le type d'opération diverse que vous souhaitez créer.
              Les opérations diverses sont des opérations non traitées à la caisse, 
              incluant les opérations de charges et les régularisations.
            </Typography>
            
            <Alert 
              severity="info" 
              sx={{ 
                maxWidth: 800, 
                mx: 'auto', 
                borderRadius: 2,
                textAlign: 'left'
              }}
            >
              <Typography variant="body2" fontWeight="500">
                💡 Rappel important :
              </Typography>
              <Typography variant="body2">
                Après saisie, les comptes ne sont pas encore mouvementés. 
                Il faut la validation du chef d'agence et du chef comptable 
                pour que les comptes soient mouvementés.
              </Typography>
            </Alert>
          </Box>

          {/* Tabs de catégories */}
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 6, 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  py: 2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }
              }}
            >
              {categories.map((category, index) => (
                <Tab 
                  key={index}
                  icon={category.icon}
                  iconPosition="start"
                  label={category.label}
                  sx={{ minWidth: { xs: 120, sm: 150 } }}
                />
              ))}
            </Tabs>
          </Paper>

          {/* Grid des options */}
          <Grid container spacing={3}>
            {filteredOperations.map((operation) => (
              <Grid item xs={12} sm={6} lg={4} key={operation.id}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    p: 4, 
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 32px rgba(0,0,0,0.08)',
                      borderColor: operation.iconColor,
                      '& .icon-wrapper': { 
                        transform: 'scale(1.1)',
                        backgroundColor: operation.iconColor,
                        color: '#fff' 
                      }
                    }
                  }}
                >
                  {/* En-tête de la carte */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Box 
                      className="icon-wrapper"
                      sx={{ 
                        width: 70, 
                        height: 70, 
                        borderRadius: '18px', 
                        backgroundColor: operation.iconBg, 
                        color: operation.iconColor,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        mr: 3,
                        transition: '0.3s',
                        flexShrink: 0
                      }}
                    >
                      {operation.icon}
                    </Box>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h5" fontWeight="700" gutterBottom>
                          {operation.title}
                        </Typography>
                        <Chip 
                          label={operation.status === 'actif' ? 'Disponible' : operation.status}
                          color={getStatusColor(operation.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      <Typography 
                        variant="subtitle2" 
                        color="primary" 
                        fontWeight="600"
                        sx={{ mb: 1 }}
                      >
                        {operation.subtitle}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 3, flexGrow: 1 }}
                  >
                    {operation.description}
                  </Typography>

                  {/* Détails spécifiques */}
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mb: 3, 
                      borderRadius: 2,
                      bgcolor: '#f8f9fa',
                      border: '1px dashed',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="caption" fontWeight="600" color="text.secondary" display="block" gutterBottom>
                      ⚙️ Configuration :
                    </Typography>
                    {Object.entries(operation.details).map(([key, value]) => (
                      <Typography key={key} variant="caption" color="text.secondary" display="block">
                        • {value}
                      </Typography>
                    ))}
                  </Paper>

                  {/* Footer avec bouton */}
                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button 
                      variant="contained"
                      fullWidth 
                      endIcon={<ArrowForward />}
                      onClick={() => navigate(operation.path)}
                      sx={{ 
                        borderRadius: '12px', 
                        py: 1.5, 
                        fontWeight: 'bold',
                        backgroundColor: operation.iconColor,
                        '&:hover': {
                          backgroundColor: operation.iconColor,
                          opacity: 0.9
                        }
                      }}
                    >
                      Créer cette OD
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Section d'information */}
          <Box sx={{ mt: 8 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: 4,
                bgcolor: '#e3f2fd',
                border: '1px solid #bbdefb'
              }}
            >
              <Typography variant="h6" fontWeight="700" gutterBottom color="#1565c0">
                📋 Journal des Opérations Diverses
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Le journal des opérations diverses permet de visualiser l'ensemble des opérations 
                saisies qui ont été validées par le chef d'agence.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<History />}
                  onClick={() => navigate('ODJournal')}
                  sx={{ borderRadius: 2 }}
                >
                  Voir le journal
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Checklist />}
                  onClick={() => navigate('/ODGestionValidation')}
                  sx={{ borderRadius: 2 }}
                >
                  OD en attente de validation
                </Button>
               {/*  <Button 
                  variant="outlined" 
                  startIcon={<Description />}
                  onClick={() => navigate('/operations-diverses/modeles')}
                  sx={{ borderRadius: 2 }}
                >
                  Gérer les modèles
                </Button>*/}
              </Box>
            </Paper>

            {/* Info workflow */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '10px', 
                      bgcolor: '#e8f5e9', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <Typography color="#4caf50" fontWeight="700">1</Typography>
                    </Box>
                    <Typography fontWeight="600">Saisie</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    L'assistant comptable saisit l'opération. Les comptes ne sont pas encore mouvementés.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '10px', 
                      bgcolor: '#e3f2fd', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <Typography color="#2196f3" fontWeight="700">2</Typography>
                    </Box>
                    <Typography fontWeight="600">Validation</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Chef d'agence → Chef comptable → DG (pour les charges). Chaque niveau doit valider.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '10px', 
                      bgcolor: '#f3e5f5', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <Typography color="#9c27b0" fontWeight="700">3</Typography>
                    </Box>
                    <Typography fontWeight="600">Comptabilisation</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Après validation complète, le chef comptable comptabilise l'opération.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}