// src/pages/compte/Formulaire.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  CircularProgress,
  Box,
  Snackbar,
  IconButton,
  Tooltip,
  Typography,
  styled
} from '@mui/material';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import Step1ClientInfo from './etape/Step1ClientInfo';
import Step2AccountType from './etape/Step2AccountType';
import Step3Mandataires from './etape/Step3Mandataires';
import Step4Documents from './etape/Step4Documents';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { compteService, type CompteData } from '../../services/api/compteApi';

const steps = [
  'Informations Client',
  'Type de Compte',
  'Mandataires',
  'Documents & Engagement'
];

// Styles personnalisés pour le stepper
const StyledStepIcon = styled('div')(({ ownerState }: any) => ({
  display: 'flex',
  height: 40,
  width: 40,
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
  fontWeight: 'bold',
  background: ownerState?.active || ownerState?.completed 
    ? 'linear-gradient(45deg, #4a6cf7, #6a11cb)'
    : '#e0e0e0',
  boxShadow: '0 2px 10px rgba(74, 108, 247, 0.3)',
  transition: 'all 0.3s ease',
}));

const StyledConnector = styled('div')({
  '& .MuiStepConnector-line': {
    borderTopWidth: 3,
    borderColor: '#e0e0e0',
    marginLeft: 'calc(-50% + 20px)',
    marginRight: 'calc(50% + 20px)',
    minWidth: '50px',
    borderRadius: '3px',
    transition: 'all 0.3s ease',
  },
  '& .MuiStepConnector-root': {
    top: '20px',
    left: 'calc(-50% + 20px)',
    right: 'calc(50% + 20px)',
  },
  '& .MuiStepConnector-line': {
    borderTopWidth: 3,
    borderColor: '#e0e0e0',
  },
  '& .MuiStepConnector-line.Mui-active, & .MuiStepConnector-line.Mui-completed': {
    borderColor: 'transparent',
    background: 'linear-gradient(90deg, #6a11cb, #4a6cf7)',
    height: 4,
    boxShadow: '0 2px 5px rgba(106, 17, 203, 0.3)',
  },
});

const defaultFormData: CompteData = {
  client: null,
  accountType: '',
  accountSubType: '',
  options: {
    montant: '',
    duree: '',
    module: '',
    chapitre_id: '',
  },
  gestionnaire: {
    nom: '',
    prenom: '',
    code: ''
  },
  mandataire1: {
    sexe: '',
    noms: '',
    prenoms: '',
    date_naissance: '',
    lieu_naissance: '',
    telephone: '',
    adresse: '',
    nationalite: '',
    profession: '',
    nom_jeune_fille_mere: '',
    cni: '',
    situation_familiale: '',
    nom_conjoint: '',
    date_naissance_conjoint: '',
    lieu_naissance_conjoint: '',
    cni_conjoint: '',
    signature: null,
  },
  mandataire2: {
    sexe: '',
    noms: '',
    prenoms: '',
    date_naissance: '',
    lieu_naissance: '',
    telephone: '',
    adresse: '',
    nationalite: '',
    profession: '',
    nom_jeune_fille_mere: '',
    cni: '',
    situation_familiale: '',
    nom_conjoint: '',
    date_naissance_conjoint: '',
    lieu_naissance_conjoint: '',
    cni_conjoint: '',
    signature: null,
  },
  documents: {
    cni_client: null,
    autres_documents: []
  },
  engagementAccepted: false,
  clientSignature: null
};

interface AccountFormProps {
  account?: any;
  onSuccess?: (result: any) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

const AccountForm: React.FC<AccountFormProps> = ({ 
  account, 
  onSuccess, 
  onCancel, 
  mode = 'create' 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CompteData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stepValidated, setStepValidated] = useState<number[]>([0]);
  
  const navigate = useNavigate();

  // Initialiser les données pour l'édition
  useEffect(() => {
    if (mode === 'edit' && account) {
      setFormData({
        ...defaultFormData,
        ...account
      });
    }
  }, [account, mode]);

  // Mettre à jour les données du formulaire
  const updateFormData = (field: keyof CompteData | string, value: any) => {
    console.log(`Updating field: ${field}`, value);

    if (field === 'options' && typeof value === 'object' && value !== null) {
      setFormData(prev => ({
        ...prev,
        options: {
          ...(prev.options || {}),
          ...value
        }
      }));
    } else if (field === 'documents' || field === 'engagementAccepted' || field === 'clientSignature') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (field === 'mandataire1' || field === 'mandataire2') {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...(prev[field] || {}),
          ...value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Valider l'étape 1
  const handleValidateStep1 = async (clientId: number, accountSubType: string) => {
    try {
      setLoading(true);
      const response = await compteService.validerEtape1({
        client_id: clientId,
        code_type_compte: accountSubType
      });
      
      // Marquer l'étape comme validée
      if (!stepValidated.includes(1)) {
        setStepValidated(prev => [...prev, 1]);
      }
      
      // Passer à l'étape suivante
      setActiveStep(1);
      setError('');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la validation de l\'étape 1');
    } finally {
      setLoading(false);
    }
  };

  // Valider l'étape 2
  const handleValidateStep2 = async (etape2Data: any) => {
    try {
      setLoading(true);
      const response = await compteService.validerEtape2(etape2Data);
      
      // Mettre à jour le formData avec l'accountType
      updateFormData('accountType', etape2Data.account_type);
      updateFormData('accountSubType', etape2Data.account_sub_type);
      
      // Mettre à jour les options du formulaire
      updateFormData('options', {
        ...formData.options,
        montant: etape2Data.montant,
        duree: etape2Data.duree,
        module: etape2Data.module,
        chapitre_id: etape2Data.chapitre_comptable_id,
        categorie_id: etape2Data.categorie_id    
      });

    // Mettre à jour l'objet gestionnaire
    updateFormData('gestionnaire', {
      nom: etape2Data.gestionnaire_nom || '',
      prenom: etape2Data.gestionnaire_prenom || '',
      code: etape2Data.gestionnaire_code || ''
    });
      
      // Marquer l'étape comme validée
      if (!stepValidated.includes(2)) {
        setStepValidated(prev => [...prev, 2]);
      }
      
      // Passer à l'étape suivante
      setActiveStep(2);
      setError('');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la validation de l\'étape 2');
    } finally {
      setLoading(false);
    }
  };

  // Valider l'étape 3
  const handleValidateStep3 = async (etape3Data: any) => {
    try {
      setLoading(true);
      const response = await compteService.validerEtape3(etape3Data);
      
      // Marquer l'étape comme validée
      if (!stepValidated.includes(3)) {
        setStepValidated(prev => [...prev, 3]);
      }
      
      // Passer à l'étape suivante
      setActiveStep(3);
      setError('');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la validation de l\'étape 3');
    } finally {
      setLoading(false);
    }
  };

  // Enregistrement final réussi
  const handleSaveSuccess = (result: any) => {
    setSuccessMessage('Compte créé avec succès !');
    
    // Appeler le callback de succès
    if (onSuccess) {
      onSuccess(result.data);
    }
    
    // Rediriger après 2 secondes
    setTimeout(() => {
      navigate('/comptes');
    }, 2000);
  };

  // Navigation entre étapes
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      // Vérifier si l'étape actuelle est validée
      if (!stepValidated.includes(activeStep)) {
        setError(`Veuillez d'abord valider l'étape ${activeStep + 1}`);
        return;
      }
      setActiveStep(prev => prev + 1);
    }
    setError('');
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
    setError('');
  };

  // Rendre l'étape actuelle
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Step1ClientInfo
            selectedClient={formData.client}
            onClientSelect={(client) => updateFormData('client', client)}
            onNext={handleValidateStep1}
            accountSubType={formData.accountSubType}
          />
        );
      case 1:
        return (
          <Step2AccountType
            accountType={formData.accountType}
            accountSubType={formData.accountSubType}
            options={formData.options}
            onChange={updateFormData}
            onNext={handleValidateStep2}
          />
        );
      case 2:
        return (
          <Step3Mandataires
            mandataire1={formData.mandataire1}
            mandataire2={formData.mandataire2}
            onChange={updateFormData}
            onNext={handleValidateStep3}
          />
        );
      case 3:
        return (
          <Step4Documents
            documents={formData.documents}
            engagementAccepted={formData.engagementAccepted}
            clientSignature={formData.clientSignature}
            onChange={updateFormData}
            formData={formData}
            onSave={handleSaveSuccess}
            onPrevious={handleBack}  // Ajout de la prop manquante
            mode={mode}
          />
        );
      default:
        return null;
    }
  };

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
        <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
          <Card sx={{ p: 3, mt: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            {/* Bouton retour 
            <Tooltip title="Retour au menu principal" arrow>
              <IconButton
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  mb: 2,
                  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)',
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            */}
            <Typography variant="h4" component="h2" gutterBottom sx={{ 
              fontWeight: 'bold', 
              mb: 4,
              color: '#2c3e50',
              textAlign: 'center'
            }}>
              {mode === 'create' ? 'Ouverture de Compte' : 'Modification de Compte'}
            </Typography>

            {/* Stepper */}
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              connector={<StyledConnector />}
              sx={{ 
                mb: 6,
                '& .MuiStep-root': {
                  padding: '0 10px',
                },
                '& .MuiStepLabel-root': {
                  flexDirection: 'column',
                  '& .MuiStepLabel-label': {
                    marginTop: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#555',
                    '&.Mui-active, &.Mui-completed': {
                      color: '#333',
                      fontWeight: 600,
                    },
                  },
                },
              }}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel 
                    StepIconComponent={(props) => (
                      <StyledStepIcon ownerState={{
                        active: props.active,
                        completed: props.completed,
                      }}>
                        {index + 1}
                      </StyledStepIcon>
                    )}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {/* Messages d'erreur */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }} 
                onClose={() => setError('')}
                action={
                  <Button color="inherit" size="small" onClick={() => setError('')}>
                    Fermer
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {/* Étape courante */}
            {renderStep()}

            {/* Boutons de navigation (sauf pour l'étape 4 qui a son propre bouton) */}
            {activeStep !== 3 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={activeStep === 0 ? onCancel : handleBack}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #B0B0B0 0%, #8E8E8E 100%)',
                    borderRadius: '50px',
                    padding: '10px 30px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    color: '#fff',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #9E9E9E 0%, #7A7A7A 100%)',
                      boxShadow: '0 6px 18px rgba(0, 0, 0, 0.3)',
                    },
                  }}
                >
                  {activeStep === 0 ? 'Annuler' : 'Retour'}
                </Button>

                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading || !stepValidated.includes(activeStep)}
                  sx={{
                    background: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)',
                    borderRadius: '50px',
                    padding: '10px 30px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(33, 150, 243, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1E88E5 0%, #0D365F 100%)',
                      boxShadow: '0 6px 20px rgba(33, 150, 243, 0.5)',
                    },
                    '&.Mui-disabled': {
                      background: '#e0e0e0',
                      color: '#9e9e9e',
                    }
                  }}
                >
                  Suivant
                </Button>
              </Box>
            )}

            {/* Indicateur de chargement global */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Traitement en cours...
                </Typography>
              </Box>
            )}
          </Card>
        </Container>
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
          message={successMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </Box>
  );
};

export default AccountForm;