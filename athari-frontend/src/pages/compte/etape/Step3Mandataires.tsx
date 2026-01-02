// src/pages/compte/etape/Step3Mandataires.tsx
import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

// Valeurs par défaut pour un mandataire
const defaultMandataire = {
  sexe: '',
  nom: '',
  prenom: '',
  date_naissance: null,
  lieu_naissance: '',
  telephone: '',
  adresse: '',
  nationalite: '',
  profession: '',
  nom_jeune_fille_mere: '',
  cni: '',
  situation_familiale: '',
  nom_conjoint: '',
  date_naissance_conjoint: null,
  lieu_naissance_conjoint: '',
  cni_conjoint: '',
  signature: null,
};

interface Step3MandatairesProps {
  mandataire1: any;
  mandataire2: any;
  onChange: (field: 'mandataire1' | 'mandataire2', value: any) => void;
  onNext: (mandatairesData: any) => Promise<void>;
  isLastStep?: boolean;
}

const Step3Mandataires: React.FC<Step3MandatairesProps> = ({ 
  mandataire1 = defaultMandataire, 
  mandataire2 = defaultMandataire, 
  onChange,
  onNext,
  isLastStep = false
}) => {
  const [activeMandataire, setActiveMandataire] = useState(1);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  // Fusionner avec les valeurs par défaut pour éviter undefined
  const safeMandataire1 = { ...defaultMandataire, ...mandataire1 };
  const safeMandataire2 = { ...defaultMandataire, ...mandataire2 };

  const handleChange = (mandataireNumber: number, field: string, value: any) => {
    // Créer une copie du mandataire actuel en préservant les références des objets Date
    const currentData = mandataireNumber === 1 ? { ...safeMandataire1 } : { ...safeMandataire2 };
    
    // Mettre à jour la valeur du champ
    currentData[field] = value;
    
    // Log pour déboguer
    console.log(`Changement pour mandataire ${mandataireNumber} - ${field}:`, {
      ancienneValeur: mandataireNumber === 1 ? safeMandataire1[field] : safeMandataire2[field],
      nouvelleValeur: value,
      situation_familiale: currentData.situation_familiale
    });
    
    // Mettre à jour l'état via la prop onChange
    onChange(mandataireNumber === 1 ? 'mandataire1' : 'mandataire2', currentData);
  };

  const handleSignatureUpload = (mandataireNumber: number, file: File | null) => {
    if (file) {
      handleChange(mandataireNumber, 'signature', file);
    }
  };

  // Valider l'étape 3
  const handleValidateStep3 = async () => {
    // Vérifier les champs obligatoires pour le mandataire 1
    const requiredFields = [
      'sexe', 'noms', 'prenoms', 'date_naissance', 'lieu_naissance',
      'telephone', 'adresse', 'nationalite', 'profession', 'situation_familiale', 'cni'
    ];

    const missingFields = requiredFields.filter(field => {
      return !safeMandataire1[field] && safeMandataire1[field] !== 0;
    });

    if (missingFields.length > 0) {
      setError(`Veuillez remplir tous les champs obligatoires pour le mandataire 1. Champs manquants: ${missingFields.join(', ')}`);
      return;
    }

    // Vérification des champs du conjoint si marié
    if (safeMandataire1.situation_familiale === 'marie') {
      const conjointFields = ['nom_conjoint', 'date_naissance_conjoint', 'lieu_naissance_conjoint', 'cni_conjoint'];
      const missingConjointFields = conjointFields.filter(field => {
        return !safeMandataire1[field] && safeMandataire1[field] !== 0;
      });

      if (missingConjointFields.length > 0) {
        setError(`Veuillez remplir tous les champs concernant le conjoint pour le mandataire 1. Champs manquants: ${missingConjointFields.join(', ')}`);
        return;
      }
    }

    try {
      setValidating(true);
      setError('');

      // Formater les données selon le format attendu par le backend
      const formatMandataireData = (data: any) => {
        // Fonction utilitaire pour formater une date
        const formatDate = (date: any) => {
          if (!date) return null;
          // Si c'est déjà une chaîne au format YYYY-MM-DD, la retourner telle quelle
          if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }
          // Si c'est un objet Date, le formater
          if (date instanceof Date) {
            return date.toISOString().split('T')[0];
          }
          // Sinon, essayer de créer une date
          try {
            const d = new Date(date);
            return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
          } catch (e) {
            console.error('Erreur de format de date:', e);
            return null;
          }
        };

        const formattedData = {
          ...data, // Conserver toutes les propriétés existantes
          nom: data.nom || data.noms || '',
          prenom: data.prenom || data.prenoms || '',
          date_naissance: formatDate(data.date_naissance),
          date_naissance_conjoint: formatDate(data.date_naissance_conjoint),
          nom_jeune_fille_mere: data.nom_jeune_fille_mere || '',
          numero_cni: data.numero_cni || data.cni || '',
          lieu_naissance_conjoint: data.lieu_naissance_conjoint || null,
          cni_conjoint: data.cni_conjoint || null,
          signature_path: data.signature_path || null
        };
        
        // Ne pas supprimer les champs vides pour éviter les pertes de données
        return formattedData;
      };

      const etape3Data = {
        mandataire_1: formatMandataireData(safeMandataire1),
      };

      // Ajouter le mandataire 2 uniquement si des informations sont renseignées
      if (safeMandataire2.noms || safeMandataire2.nom) {
        etape3Data.mandataire_2 = formatMandataireData(safeMandataire2);
      }

      console.log('Données envoyées à l\'API (étape 3):', etape3Data);
      await onNext(etape3Data);

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la validation de l\'étape 3');
      console.error('Erreur détaillée:', err);
    } finally {
      setValidating(false);
    }
  };
  
  const renderMandataireForm = (mandataireNumber: number, data: any) => {
    const isMandataire1 = mandataireNumber === 1;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Mandataire {mandataireNumber} {isMandataire1 ? '(Principal)' : '(Secondaire)'}
          </Typography>
        </Grid>

        {/* Sexe */}
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset" required>
            <FormLabel component="legend">Sexe *</FormLabel>
            <RadioGroup
              row
              value={data.sexe}
              onChange={(e) => handleChange(mandataireNumber, 'sexe', e.target.value)}
            >
              <FormControlLabel value="feminin" control={<Radio />} label="Féminin" />
              <FormControlLabel value="masculin" control={<Radio />} label="Masculin" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Noms */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Noms *"
            value={data.noms}
            onChange={(e) => handleChange(mandataireNumber, 'noms', e.target.value)}
            required
          />
        </Grid>

        {/* Prénoms */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Prénoms *"
            value={data.prenoms}
            onChange={(e) => handleChange(mandataireNumber, 'prenoms', e.target.value)}
            required
          />
        </Grid>

        {/* Date de naissance */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label="Date de naissance *"
              value={data.date_naissance}
              onChange={(date) => handleChange(mandataireNumber, 'date_naissance', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                }
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Lieu de naissance */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Lieu de naissance *"
            value={data.lieu_naissance}
            onChange={(e) => handleChange(mandataireNumber, 'lieu_naissance', e.target.value)}
            required
          />
        </Grid>

        {/* Téléphone */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Téléphone *"
            value={data.telephone}
            onChange={(e) => handleChange(mandataireNumber, 'telephone', e.target.value)}
            required
            type="tel"
          />
        </Grid>

        {/* Adresse */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Adresse complète *"
            value={data.adresse}
            onChange={(e) => handleChange(mandataireNumber, 'adresse', e.target.value)}
            required
            multiline
            rows={2}
          />
        </Grid>

        {/* Nationalité */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nationalité *"
            value={data.nationalite}
            onChange={(e) => handleChange(mandataireNumber, 'nationalite', e.target.value)}
            required
          />
        </Grid>

        {/* Profession */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Profession *"
            value={data.profession}
            onChange={(e) => handleChange(mandataireNumber, 'profession', e.target.value)}
            required
          />
        </Grid>

        {/* Nom de jeune fille de la mère */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nom de jeune fille de la mère"
            value={data.nom_jeune_fille_mere}
            onChange={(e) => handleChange(mandataireNumber, 'nom_jeune_fille_mere', e.target.value)}
          />
        </Grid>

        {/* CNI */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Numéro CNI *"
            value={data.cni}
            onChange={(e) => handleChange(mandataireNumber, 'cni', e.target.value)}
            required
          />
        </Grid>

        {/* Situation familiale */}
        <Grid item xs={12}>
          <FormControl component="fieldset" required>
            <FormLabel component="legend">Situation familiale *</FormLabel>
            <RadioGroup
              row
              value={data.situation_familiale}
              onChange={(e) => handleChange(mandataireNumber, 'situation_familiale', e.target.value)}
            >
              {['marie', 'celibataire', 'autres'].map((status) => (
                <FormControlLabel
                  key={status}
                  value={status}
                  control={<Radio />}
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Informations du conjoint (si marié) */}
        {data.situation_familiale === 'marie' && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Informations du conjoint
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom du conjoint"
                value={data.nom_conjoint}
                onChange={(e) => handleChange(mandataireNumber, 'nom_conjoint', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date de naissance du conjoint"
                  value={data.date_naissance_conjoint}
                  onChange={(date) => handleChange(mandataireNumber, 'date_naissance_conjoint', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lieu de naissance du conjoint"
                value={data.lieu_naissance_conjoint}
                onChange={(e) => handleChange(mandataireNumber, 'lieu_naissance_conjoint', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CNI du conjoint"
                value={data.cni_conjoint}
                onChange={(e) => handleChange(mandataireNumber, 'cni_conjoint', e.target.value)}
              />
            </Grid>
          </>
        )}

        {/* Signature */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Signature du mandataire
          </Typography>
          <Button
            variant="outlined"
            component="label"
            sx={{
              background: 'linear-gradient(135deg, #62bfc6ff 0%, #2e787d69 100%)',
              boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
              border: 'none',
              padding: '10px 16px',
              color:' #ffff'
            }}
            startIcon={<PhotoCamera />}
          >
            Télécharger la signature
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleSignatureUpload(mandataireNumber, e.target.files?.[0] || null)}
            />
          </Button>
          {data.signature && (
            <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
              ✓ Signature téléchargée: {data.signature.name}
            </Typography>
          )}
        </Grid>
      </Grid>
    );
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Étape 3: Mandataires
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={activeMandataire === 1 ? "contained" : "outlined"}
                    onClick={() => setActiveMandataire(1)}
                    sx={{
                      background: activeMandataire === 1 
                        ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' 
                        : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                      color: activeMandataire === 1 ? '#fff' : 'rgba(0, 0, 0, 0.87)',
                      border: 'none',
                      padding: '10px 16px',
                      '&:hover': {
                        background: activeMandataire === 1 
                          ? 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)' 
                          : 'linear-gradient(135deg, #eeeeee 0%, #d5d5d5 100%)',
                        boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    Mandataire 1
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={activeMandataire === 2 ? "contained" : "outlined"}
                    onClick={() => setActiveMandataire(2)}
                    sx={{
                      background: activeMandataire === 2 
                        ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' 
                        : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                      color: activeMandataire === 2 ? '#fff' : 'rgba(0, 0, 0, 0.87)',
                      border: 'none',
                      padding: '10px 16px',
                      '&:hover': {
                        background: activeMandataire === 2 
                          ? 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)' 
                          : 'linear-gradient(135deg, #eeeeee 0%, #d5d5d5 100%)',
                        boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    Mandataire 2 (Optionnel)
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {activeMandataire === 1
                ? renderMandataireForm(1, safeMandataire1)
                : renderMandataireForm(2, safeMandataire2)}
            </CardContent>
          </Card>
        </Grid>

        {/* Aperçu des deux mandataires */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Aperçu des mandataires
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Mandataire 1 (Principal)
                  </Typography>
                  {safeMandataire1.noms ? (
                    <>
                      <Typography><strong>Nom:</strong> {safeMandataire1.noms} {safeMandataire1.prenoms}</Typography>
                      <Typography><strong>CNI:</strong> {safeMandataire1.cni || 'Non renseigné'}</Typography>
                      <Typography><strong>Téléphone:</strong> {safeMandataire1.telephone || 'Non renseigné'}</Typography>
                      <Typography><strong>Statut:</strong> {safeMandataire1.situation_familiale || 'Non renseigné'}</Typography>
                    </>
                  ) : (
                    <Typography color="textSecondary">Non renseigné</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Mandataire 2 (Optionnel)
                  </Typography>
                  {safeMandataire2.noms ? (
                    <>
                      <Typography><strong>Nom:</strong> {safeMandataire2.noms} {safeMandataire2.prenoms}</Typography>
                      <Typography><strong>CNI:</strong> {safeMandataire2.cni || 'Non renseigné'}</Typography>
                      <Typography><strong>Téléphone:</strong> {safeMandataire2.telephone || 'Non renseigné'}</Typography>
                      <Typography><strong>Statut:</strong> {safeMandataire2.situation_familiale || 'Non renseigné'}</Typography>
                    </>
                  ) : (
                    <Typography color="textSecondary">Non renseigné</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Bouton de validation */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleValidateStep3}
              disabled={validating || !safeMandataire1.noms}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                color: 'white',
                padding: '10px 30px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)',
                }
              }}
            >
              {validating ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Validation...
                </>
              ) : (
                'Valider cette étape'
              )}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default Step3Mandataires;