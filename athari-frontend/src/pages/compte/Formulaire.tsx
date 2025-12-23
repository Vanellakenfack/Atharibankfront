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
  stepConnectorClasses,
  StepConnector
} from '@mui/material';
import { Box, styled } from '@mui/system';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Step1ClientInfo from './etape/Step1ClientInfo';
import Step2AccountType from './etape/Step2AccountType';
import Step3Mandataires from './etape/Step3Mandataires';
import Step4Documents from './etape/Step4Documents';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Tooltip } from '@mui/material';

const steps = [
  'Informations Client',
  'Type de Compte',
  'Mandataires',
  'Documents & Engagement'
];

// Thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#6c5ce7',
      light: '#a29bfe',
      dark: '#5f27cd',
      contrastText: '#fff',
    },
    secondary: {
      main: '#00b894',
      light: '#55efc4',
      dark: '#00a884',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
          border: '1px solid #e0e0e0',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 4px 14px rgba(108, 92, 231, 0.4)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(108, 92, 231, 0.5)',
          },
        },
      },
    },
  },
});

// Composant de carte stylisé
const StyledCard = styled(Card)({
  borderRadius: 16,
  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  padding: '2rem',
  marginBottom: '2rem',
});

// Styles personnalisés pour le stepper
const StyledStepIcon = styled('div')(({ ownerState }) => ({
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
  '& .MuiStepConnector-line.MuiStepConnector-lineHorizontal': {
    borderTopWidth: 3,
    borderColor: '#e0e0e0',
  },
  '& .MuiStepConnector-line.Mui-active, & .MuiStepConnector-line.Mui-completed': {
    borderColor: 'transparent',
    background: 'linear-gradient(90deg, #6a11cb, #4a6cf7)',
    height: 4,
    boxShadow: '0 2px 5px rgba(106, 17, 203, 0.3)',
  },
  '& .MuiStepConnector-line.Mui-completed': {
    background: 'linear-gradient(90deg, #4a6cf7, #6a11cb)',
  },
});

interface AccountFormData {
  client: any;
  accountNumber: string;
  accountType: string;
  accountSubType: string;
  options: {
    montant: string;
    duree: string;
    module: string;
    chapitre_id: string;
  };
  mandataire1: {
    sexe: string;
    noms: string;
    prenoms: string;
    date_naissance: string;
    lieu_naissance: string;
    telephone: string;
    adresse: string;
    nationalite: string;
    profession: string;
    nom_jeune_fille_mere: string;
    cni: string;
    situation_familiale: string;
    nom_conjoint: string;
    date_naissance_conjoint: string;
    lieu_naissance_conjoint: string;
    cni_conjoint: string;
    signature: any;
  };
  mandataire2: {
    sexe: string;
    noms: string;
    prenoms: string;
    date_naissance: string;
    lieu_naissance: string;
    telephone: string;
    adresse: string;
    nationalite: string;
    profession: string;
    nom_jeune_fille_mere: string;
    cni: string;
    situation_familiale: string;
    nom_conjoint: string;
    date_naissance_conjoint: string;
    lieu_naissance_conjoint: string;
    cni_conjoint: string;
    signature: any;
  };
  documents: {
    cni_client: any;
    autres_documents: any[];
  };
  engagementAccepted: boolean;
  clientSignature: any;
}

const AccountForm = ({ account, onSuccess, onCancel, mode = 'create' }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<AccountFormData>(() => {
    if (mode === 'edit' && account) {
      return {
        ...account,
        options: account.options || {
          montant: '',
          duree: '',
          module: '',
          chapitre_id: '',
        },
      };
    }
    return {
      accountType: '',
      accountSubType: '',
      options: {
        montant: '',
        duree: '',
        module: '',
        chapitre_id: '',
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
        signature: null
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
        signature: null
      },
      documents: {
        cni_client: null,
        autres_documents: []
      },
      engagementAccepted: false,
      clientSignature: null
    };
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (mode === 'edit' && account) {
      // Pré-remplir les données pour l'édition
      setFormData(prev => ({
        ...prev,
        ...account
      }));
    }
  }, [account, mode]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  //pour passer d'un step a un autre
  const handleNext = () => {
    // Validation selon l'étape
    if (activeStep === 0 && !formData.client) {
      setError('Veuillez sélectionner un client');
      return;
    }
    
    if (activeStep === 1) {
      if (!formData.accountType) {
        setError('Veuillez sélectionner un type de compte');
        return;
      }
      if (!formData.accountSubType) {
        setError('Veuillez sélectionner une sous-rubrique');
        return;
      }
      if (!formData.options?.montant) {
        setError('Veuillez renseigner le montant');
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        if (key === 'documents' || key === 'mandataire1' || key === 'mandataire2') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === 'clientSignature' || key === 'mandataire1.signature' || key === 'mandataire2.signature') {
          if (value) {
            formDataToSend.append(key, value as Blob);
          }
        } else {
          formDataToSend.append(key, value as string | Blob);
        }
      });

      const url = mode === 'create' ? '/api/accounts' : `/api/accounts/${account?.id}`;
      const method = mode === 'create' ? 'post' : 'put';

      await axios({
        method,
        url,
        data: formDataToSend,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess?.();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur inconnue est survenue');
      }
      console.error('Erreur lors de la soumission du formulaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: unknown) => {
    console.log(`Updating field: ${field}`, value);

    setFormData((prev) => {
      if (field === 'options' && typeof value === 'object' && value !== null) {
        return {
          ...prev,
          options: {
            ...(prev.options || {}),
            ...(value as Partial<AccountFormData['options']>),
          },
        };
      }

      return {
        ...prev,
        [field]: value,
      } as AccountFormData;
    });
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Step1ClientInfo
            clients={clients}
            selectedClient={formData.client}
            onClientSelect={(client) => updateFormData('client', client)}
            accountNumber={formData.accountNumber}
          />
        );
      case 1:
        return (
          <Step2AccountType
            accountType={formData.accountType}
            accountSubType={formData.accountSubType}
            options={formData.options || {}}
            onChange={(field: string, value: unknown) => updateFormData(field, value)}
          />
        );
      case 2:
        return (
          <Step3Mandataires
            mandataire1={formData.mandataire1}
            mandataire2={formData.mandataire2}
            onChange={(mandataire: 'mandataire1' | 'mandataire2', data: any) => updateFormData(mandataire, data)}
          />
        );
      case 3:
        return (
          <Step4Documents
            documents={formData.documents}
            engagementAccepted={formData.engagementAccepted}
            clientSignature={formData.clientSignature}
            onChange={(field: keyof Pick<AccountFormData, 'documents' | 'engagementAccepted' | 'clientSignature'>, value: any) =>
              updateFormData(field, value)
            }
          />
        );
      default:
        return null;
    }
  };

  //pour retouner au menu principal
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg"> 
      <Card sx={{ p: 3, mt: 3 }}>
              <Tooltip title="Retour au menu principal" arrow>
        <IconButton
          onClick={() => navigate('/dashboard')}
          sx={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
            color: 'white',
            mr: 2,
            '&:hover': {
              background: 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)',
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
        <h2 className="mb-4">
          {mode === 'create' ? 'Ouverture de Compte' : 'Modification de Compte'}
        </h2>

      <Stepper  
        activeStep={activeStep}
        alternativeLabel
        connector={<StyledConnector />}
        sx={{ 
          mb: 6,
          maxWidth: '100%',
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
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderStep()}

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
              '&.Mui-disabled': {
                background: '#e0e0e0',
                color: '#9e9e9e',
                boxShadow: 'none'
              }
            }}
          >
            {activeStep === 0 ? 'Annuler' : 'Retour'}
          </Button>

          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                                sx={{
                  background: 'linear-gradient(135deg, #8A2BE2 0%, #6A5ACD 100%)',
                  borderRadius: '50px',
                  padding: '10px 30px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(138, 43, 226, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7B24E0 0%, #5A4AC9 100%)',
                    boxShadow: '0 6px 20px rgba(138, 43, 226, 0.5)',
                  },
                  '&.Mui-disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                    boxShadow: 'none'
                  }
                }}
                disabled={loading || !formData.engagementAccepted}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  mode === 'create' ? 'Créer le Compte' : 'Mettre à Jour'
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #8A2BE2 0%, #6A5ACD 100%)',
                  borderRadius: '50px',
                  padding: '10px 30px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(138, 43, 226, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7B24E0 0%, #5A4AC9 100%)',
                    boxShadow: '0 6px 20px rgba(138, 43, 226, 0.5)',
                  },
                  '&.Mui-disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                    boxShadow: 'none'
                  }
                }}
              >
                Suivant
              </Button>
            )}
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default AccountForm;