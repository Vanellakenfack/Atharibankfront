import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { Box } from '@mui/system';
import Step1ClientInfo from './etape/Step1ClientInfo';
import Step2AccountType from './etape/Step2AccountType';
import Step3Mandataires from './etape/Step3Mandataires';
import Step4Documents from './etape/Step4Documents';
import axios from 'axios';

const steps = [
  'Informations Client',
  'Type de Compte',
  'Mandataires',
  'Documents & Engagement'
];

const AccountForm = ({ account, onSuccess, onCancel, mode = 'create' }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Étape 1
    client: null,
    accountNumber: '',
    
    // Étape 2
    accountType: '',
    accountSubType: '',
    options: {},
    
    // Étape 3
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
    
    // Étape 4
    documents: {
      cni_client: null,
      autres_documents: []
    },
    engagementAccepted: false,
    clientSignature: null
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

  const handleNext = () => {
    // Validation selon l'étape
    if (activeStep === 0 && !formData.client) {
      setError('Veuillez sélectionner un client');
      return;
    }
    
    if (activeStep === 1 && !formData.accountType) {
      setError('Veuillez sélectionner un type de compte');
      return;
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
      
      // Ajouter toutes les données au FormData
      Object.keys(formData).forEach(key => {
        if (key === 'documents' || key === 'mandataire1' || key === 'mandataire2') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'clientSignature' || key === 'mandataire1.signature' || key === 'mandataire2.signature') {
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const url = mode === 'create' ? '/api/accounts' : `/api/accounts/${account.id}`;
      const method = mode === 'create' ? 'post' : 'put';

      await axios({
        method,
        url,
        data: formDataToSend,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
            options={formData.options}
            onChange={(field, value) => updateFormData(field, value)}
          />
        );
      case 2:
        return (
          <Step3Mandataires
            mandataire1={formData.mandataire1}
            mandataire2={formData.mandataire2}
            onChange={(mandataire, data) => updateFormData(mandataire, data)}
          />
        );
      case 3:
        return (
          <Step4Documents
            documents={formData.documents}
            engagementAccepted={formData.engagementAccepted}
            clientSignature={formData.clientSignature}
            onChange={(field, value) => updateFormData(field, value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Card sx={{ p: 3, mt: 3 }}>
        <h2 className="mb-4">
          {mode === 'create' ? 'Ouverture de Compte' : 'Modification de Compte'}
        </h2>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
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
          >
            {activeStep === 0 ? 'Annuler' : 'Retour'}
          </Button>

          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
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