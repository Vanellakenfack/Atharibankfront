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
  CircularProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

// Interface pour les données
interface PersonneData {
  sexe: string;
  noms: string;
  prenoms: string;
  date_naissance: Date | null;
  lieu_naissance: string;
  telephone: string;
  adresse: string;
  nationalite: string;
  profession: string;
  nom_jeune_fille_mere: string;
  cni: string;
  signature: File | string | null;
}

interface MandataireData extends PersonneData {
  situation_familiale: string;
  nom_conjoint: string;
  date_naissance_conjoint: Date | null;
  lieu_naissance_conjoint: string;
  cni_conjoint: string;
}

interface SignataireData extends PersonneData {}

// Valeurs par défaut pour un mandataire
const defaultMandataire: MandataireData = {
  sexe: '',
  noms: '',
  prenoms: '',
  date_naissance: null,
  lieu_naissance: '',
  telephone: '',
  adresse: '',
  nationalite: '',
  profession: '',
  nom_jeune_fille_mere: '',
  cni: '',
  signature: null,
  situation_familiale: '',
  nom_conjoint: '',
  date_naissance_conjoint: null,
  lieu_naissance_conjoint: '',
  cni_conjoint: '',
};

// Valeurs par défaut pour un signataire
const defaultSignataire: SignataireData = {
  sexe: '',
  noms: '',
  prenoms: '',
  date_naissance: null,
  lieu_naissance: '',
  telephone: '',
  adresse: '',
  nationalite: '',
  profession: '',
  nom_jeune_fille_mere: '',
  cni: '',
  signature: null,
};

interface Step3MandatairesProps {
  mandataire1: any;
  mandataire2: any;
  mandataire3: any;
  signataire: any;
  onChange: (field: 'mandataire1' | 'mandataire2' | 'mandataire3' | 'signataire', value: any) => void;
  onNext: (mandatairesData: any) => Promise<void>;
  isLastStep?: boolean;
}

const Step3Mandataires: React.FC<Step3MandatairesProps> = ({ 
  mandataire1 = defaultMandataire, 
  mandataire2 = defaultMandataire,
  mandataire3 = defaultMandataire,
  signataire = defaultSignataire,
  onChange,
  onNext,
  isLastStep = false
}) => {
  // États locaux pour gérer les données
  const [localMandataire1, setLocalMandataire1] = useState<MandataireData>(defaultMandataire);
  const [localMandataire2, setLocalMandataire2] = useState<MandataireData>(defaultMandataire);
  const [localMandataire3, setLocalMandataire3] = useState<MandataireData>(defaultMandataire);
  const [localSignataire, setLocalSignataire] = useState<SignataireData>(defaultSignataire);
  
  const [activeTab, setActiveTab] = useState(0);
  const [activeMandataire, setActiveMandataire] = useState(1);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [mandataireCount, setMandataireCount] = useState(1);

  // Initialiser les données locales à partir des props
  useEffect(() => {
    const normalizeData = (data: any, defaults: any) => {
      if (!data) return defaults;
      
      const normalized = { ...defaults };
      
      // Copier toutes les propriétés existantes
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          // Gérer la compatibilité entre les anciens et nouveaux noms de champs
          if (key === 'nom') {
            normalized.noms = data[key];
          } else if (key === 'prenom') {
            normalized.prenoms = data[key];
          } else if (key === 'noms' && !normalized.noms) {
            normalized.noms = data[key];
          } else if (key === 'prenoms' && !normalized.prenoms) {
            normalized.prenoms = data[key];
          } else {
            normalized[key] = data[key];
          }
        }
      });
      
      return normalized;
    };

    setLocalMandataire1(normalizeData(mandataire1, defaultMandataire));
    setLocalMandataire2(normalizeData(mandataire2, defaultMandataire));
    setLocalMandataire3(normalizeData(mandataire3, defaultMandataire));
    setLocalSignataire(normalizeData(signataire, defaultSignataire));
    
    // Déterminer le nombre de mandataires actifs
    let count = 1;
    const m2 = normalizeData(mandataire2, defaultMandataire);
    const m3 = normalizeData(mandataire3, defaultMandataire);
    
    if (m2.noms && m2.noms.trim() !== '') count = 2;
    if (m3.noms && m3.noms.trim() !== '') count = 3;
    setMandataireCount(count);
    
  }, [mandataire1, mandataire2, mandataire3, signataire]);

  // Fonction générique pour mettre à jour un mandataire
  const updateMandataire = (number: number, updates: Partial<MandataireData>) => {
    switch (number) {
      case 1:
        const newMandataire1 = { ...localMandataire1, ...updates };
        setLocalMandataire1(newMandataire1);
        onChange('mandataire1', newMandataire1);
        break;
      case 2:
        const newMandataire2 = { ...localMandataire2, ...updates };
        setLocalMandataire2(newMandataire2);
        onChange('mandataire2', newMandataire2);
        
        // Si on ajoute des données au mandataire 2, l'activer
        if ((updates.noms && updates.noms.trim() !== '') || 
            (updates.prenoms && updates.prenoms.trim() !== '')) {
          setMandataireCount(prev => Math.max(prev, 2));
        }
        break;
      case 3:
        const newMandataire3 = { ...localMandataire3, ...updates };
        setLocalMandataire3(newMandataire3);
        onChange('mandataire3', newMandataire3);
        
        // Si on ajoute des données au mandataire 3, l'activer
        if ((updates.noms && updates.noms.trim() !== '') || 
            (updates.prenoms && updates.prenoms.trim() !== '')) {
          setMandataireCount(prev => Math.max(prev, 3));
        }
        break;
    }
  };

  // Fonction pour mettre à jour le signataire
  const updateSignataire = (updates: Partial<SignataireData>) => {
    const newSignataire = { ...localSignataire, ...updates };
    setLocalSignataire(newSignataire);
    onChange('signataire', newSignataire);
  };

  const handleSignatureUpload = (type: 'mandataire' | 'signataire', number: number, file: File | null) => {
    if (file) {
      if (type === 'mandataire') {
        updateMandataire(number, { signature: file });
      } else {
        updateSignataire({ signature: file });
      }
    }
  };

  const addMandataire = () => {
    if (mandataireCount < 3) {
      const newCount = mandataireCount + 1;
      setMandataireCount(newCount);
      setActiveMandataire(newCount);
      setActiveTab(0);
      
      // Activer automatiquement le nouvel onglet
      if (newCount === 2 && !localMandataire2.noms) {
        setLocalMandataire2(defaultMandataire);
      } else if (newCount === 3 && !localMandataire3.noms) {
        setLocalMandataire3(defaultMandataire);
      }
    }
  };

  const removeMandataire = (mandataireNumber: number) => {
    if (mandataireNumber === 1) return;
    
    if (mandataireNumber === 2) {
      if (mandataireCount === 3) {
        // Déplacer le mandataire 3 vers le mandataire 2
        setLocalMandataire2(localMandataire3);
        onChange('mandataire2', localMandataire3);
        
        setLocalMandataire3(defaultMandataire);
        onChange('mandataire3', defaultMandataire);
        
        setActiveMandataire(2);
      } else {
        setLocalMandataire2(defaultMandataire);
        onChange('mandataire2', defaultMandataire);
        setMandataireCount(1);
        setActiveMandataire(1);
      }
    } else if (mandataireNumber === 3) {
      setLocalMandataire3(defaultMandataire);
      onChange('mandataire3', defaultMandataire);
      setMandataireCount(2);
      setActiveMandataire(2);
    }
  };

  // Valider l'étape 3
  const handleValidateStep3 = async () => {
    const agencyId = localStorage.getItem('agence_id') || localStorage.getItem('current_agency_id');

    console.log('Validating step 3 with data:', {
      mandataire1: localMandataire1,
      mandataire2: localMandataire2,
      mandataire3: localMandataire3,
      signataire: localSignataire
    });
    console.log('Agence ID utilisé pour validation:', agencyId);
    
    // RETIRÉ: Vérification des champs obligatoires
    // Maintenant aucun champ n'est obligatoire
    
    try {
      setValidating(true);
      setError('');

      // Formater les données pour le backend
      const formatMandataireData = (data: MandataireData, isSignataire = false) => {
        const formatDate = (date: any) => {
          if (!date) return null;
          if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }
          if (date instanceof Date) {
            return date.toISOString().split('T')[0];
          }
          try {
            const d = new Date(date);
            return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
          } catch (e) {
            console.error('Erreur de format de date:', e);
            return null;
          }
        };

        // Préparer les données pour l'envoi
        const formattedData: any = {
          sexe: data.sexe || '',
          noms: data.noms || '',
          prenoms: data.prenoms || '',
          date_naissance: formatDate(data.date_naissance),
          lieu_naissance: data.lieu_naissance || '',
          telephone: data.telephone || '',
          adresse: data.adresse || '',
          nationalite: data.nationalite || '',
          profession: data.profession || '',
          nom_jeune_fille_mere: data.nom_jeune_fille_mere || '',
          cni: data.cni || '',
          signature: data.signature || null,
        };
        
        if (!isSignataire) {
          formattedData.situation_familiale = data.situation_familiale || '';
          formattedData.nom_conjoint = data.nom_conjoint || '';
          formattedData.date_naissance_conjoint = formatDate(data.date_naissance_conjoint);
          formattedData.lieu_naissance_conjoint = data.lieu_naissance_conjoint || '';
          formattedData.cni_conjoint = data.cni_conjoint || '';
        }
        
        return formattedData;
      };

      // Créer le payload avec agency_id au niveau racine
      const etape3Data: any = {
        agency_id: agencyId, // Agency ID au niveau racine
        mandataire_1: formatMandataireData(localMandataire1),
      };

      // Ajouter le mandataire 2 uniquement s'il a des données
      if (localMandataire2.noms && localMandataire2.noms.trim() !== '') {
        etape3Data.mandataire_2 = formatMandataireData(localMandataire2);
      }

      // Ajouter le mandataire 3 uniquement s'il a des données
      if (localMandataire3.noms && localMandataire3.noms.trim() !== '') {
        etape3Data.mandataire_3 = formatMandataireData(localMandataire3);
      }

      // Ajouter le signataire uniquement s'il a des données
      if (localSignataire.noms && localSignataire.noms.trim() !== '') {
        etape3Data.signataire = formatMandataireData(localSignataire as any, true);
      }

      console.log('Données envoyées à l\'API (étape 3):', etape3Data);
      console.log('Structure du payload:', {
        racine: {
          agency_id: etape3Data.agency_id,
          mandataire_1: 'Object',
          mandataire_2: etape3Data.mandataire_2 ? 'Object' : 'Non défini',
          mandataire_3: etape3Data.mandataire_3 ? 'Object' : 'Non défini',
          signataire: etape3Data.signataire ? 'Object' : 'Non défini'
        }
      });
      
      await onNext(etape3Data);

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la validation de l\'étape 3');
      console.error('Erreur détaillée:', err);
    } finally {
      setValidating(false);
    }
  };

  const renderMandataireForm = (mandataireNumber: number) => {
    const isMandataire1 = mandataireNumber === 1;
    
    // Obtenir les données pour ce mandataire
    let data: MandataireData;
    switch (mandataireNumber) {
      case 1:
        data = localMandataire1;
        break;
      case 2:
        data = localMandataire2;
        break;
      case 3:
        data = localMandataire3;
        break;
      default:
        data = defaultMandataire;
    }
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" gutterBottom>
              Mandataire {mandataireNumber} {isMandataire1 ? '(Principal)' : '(Secondaire)'}
            </Typography>
            {!isMandataire1 && mandataireNumber <= mandataireCount && (
              <Tooltip title="Supprimer ce mandataire">
                <IconButton 
                  onClick={() => removeMandataire(mandataireNumber)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Grid>

        {/* Sexe */}
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Sexe</FormLabel>
            <RadioGroup
              row
              value={data.sexe || ''}
              onChange={(e) => updateMandataire(mandataireNumber, { sexe: e.target.value })}
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
            label="Noms"
            value={data.noms || ''}
            onChange={(e) => updateMandataire(mandataireNumber, { noms: e.target.value })}
          />
        </Grid>

        {/* Prénoms */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Prénoms"
            value={data.prenoms || ''}
            onChange={(e) => updateMandataire(mandataireNumber, { prenoms: e.target.value })}
          />
        </Grid>

        {/* Date de naissance */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label="Date de naissance"
              value={data.date_naissance}
              onChange={(date) => updateMandataire(mandataireNumber, { date_naissance: date })}
              slotProps={{
                textField: {
                  fullWidth: true,
                }
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Lieu de naissance */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Lieu de naissance"
            value={data.lieu_naissance || ''}
            onChange={(e) => updateMandataire(mandataireNumber, { lieu_naissance: e.target.value })}
          />
        </Grid>

        {/* Téléphone */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Téléphone"
            value={data.telephone || ''}
            onChange={(e) => updateMandataire(mandataireNumber, { telephone: e.target.value })}
            type="tel"
          />
        </Grid>

        {/* Adresse */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Adresse complète"
            value={data.adresse || ''}
            onChange={(e) => updateMandataire(mandataireNumber, { adresse: e.target.value })}
            multiline
            rows={2}
          />
        </Grid>

        {/* Nationalité */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nationalité"
            value={data.nationalite || ''}
            onChange={(e) => updateMandataire(mandataireNumber, { nationalite: e.target.value })}
          />
        </Grid>

        {/* Profession */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Profession"
            value={data.profession || ''}
            onChange={(e) => updateMandataire(mandataireNumber, { profession: e.target.value })}
          />
        </Grid>

        {/* Nom de jeune fille de la mère */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nom de jeune fille de la mère"
            value={data.nom_jeune_fille_mere || ''}
            onChange={(e) => updateMandataire(mandataireNumber, { nom_jeune_fille_mere: e.target.value })}
          />
        </Grid>

        {/* CNI */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Numéro CNI"
            value={data.cni || ''}
            onChange={(e) => updateMandataire(mandataireNumber, { cni: e.target.value })}
          />
        </Grid>

        {/* Situation familiale */}
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Situation familiale</FormLabel>
            <RadioGroup
              row
              value={data.situation_familiale || ''}
              onChange={(e) => updateMandataire(mandataireNumber, { situation_familiale: e.target.value })}
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
                value={data.nom_conjoint || ''}
                onChange={(e) => updateMandataire(mandataireNumber, { nom_conjoint: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date de naissance du conjoint"
                  value={data.date_naissance_conjoint}
                  onChange={(date) => updateMandataire(mandataireNumber, { date_naissance_conjoint: date })}
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
                value={data.lieu_naissance_conjoint || ''}
                onChange={(e) => updateMandataire(mandataireNumber, { lieu_naissance_conjoint: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CNI du conjoint"
                value={data.cni_conjoint || ''}
                onChange={(e) => updateMandataire(mandataireNumber, { cni_conjoint: e.target.value })}
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
              color: '#ffff'
            }}
            startIcon={<PhotoCamera />}
          >
            Télécharger la signature
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleSignatureUpload('mandataire', mandataireNumber, e.target.files?.[0] || null)}
            />
          </Button>
          {data.signature && (
            <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
              ✓ Signature téléchargée
            </Typography>
          )}
        </Grid>
      </Grid>
    );
  };

  const renderSignataireForm = () => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Signataire
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Le signataire est la personne qui signera les documents.
          </Typography>
        </Grid>

        {/* Sexe */}
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Sexe</FormLabel>
            <RadioGroup
              row
              value={localSignataire.sexe || ''}
              onChange={(e) => updateSignataire({ sexe: e.target.value })}
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
            label="Noms"
            value={localSignataire.noms || ''}
            onChange={(e) => updateSignataire({ noms: e.target.value })}
          />
        </Grid>

        {/* Prénoms */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Prénoms"
            value={localSignataire.prenoms || ''}
            onChange={(e) => updateSignataire({ prenoms: e.target.value })}
          />
        </Grid>

        {/* Date de naissance */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label="Date de naissance"
              value={localSignataire.date_naissance}
              onChange={(date) => updateSignataire({ date_naissance: date })}
              slotProps={{
                textField: {
                  fullWidth: true,
                }
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Lieu de naissance */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Lieu de naissance"
            value={localSignataire.lieu_naissance || ''}
            onChange={(e) => updateSignataire({ lieu_naissance: e.target.value })}
          />
        </Grid>

        {/* Téléphone */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Téléphone"
            value={localSignataire.telephone || ''}
            onChange={(e) => updateSignataire({ telephone: e.target.value })}
            type="tel"
          />
        </Grid>

        {/* Adresse */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Adresse complète"
            value={localSignataire.adresse || ''}
            onChange={(e) => updateSignataire({ adresse: e.target.value })}
            multiline
            rows={2}
          />
        </Grid>

        {/* Nationalité */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nationalité"
            value={localSignataire.nationalite || ''}
            onChange={(e) => updateSignataire({ nationalite: e.target.value })}
          />
        </Grid>

        {/* Profession */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Profession"
            value={localSignataire.profession || ''}
            onChange={(e) => updateSignataire({ profession: e.target.value })}
          />
        </Grid>

        {/* Nom de jeune fille de la mère */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nom de jeune fille de la mère"
            value={localSignataire.nom_jeune_fille_mere || ''}
            onChange={(e) => updateSignataire({ nom_jeune_fille_mere: e.target.value })}
          />
        </Grid>

        {/* CNI */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Numéro CNI"
            value={localSignataire.cni || ''}
            onChange={(e) => updateSignataire({ cni: e.target.value })}
          />
        </Grid>

        {/* Signature */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Signature du signataire
          </Typography>
          <Button
            variant="outlined"
            component="label"
            sx={{
              background: 'linear-gradient(135deg, #62bfc6ff 0%, #2e787d69 100%)',
              boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
              border: 'none',
              padding: '10px 16px',
              color: '#ffff'
            }}
            startIcon={<PhotoCamera />}
          >
            Télécharger la signature
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleSignatureUpload('signataire', 0, e.target.files?.[0] || null)}
            />
          </Button>
          {localSignataire.signature && (
            <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
              ✓ Signature téléchargée
            </Typography>
          )}
        </Grid>
      </Grid>
    );
  };

  // Fonction pour obtenir les données d'un mandataire pour l'aperçu
  const getMandataireForPreview = (number: number) => {
    switch (number) {
      case 1: return localMandataire1;
      case 2: return localMandataire2;
      case 3: return localMandataire3;
      default: return defaultMandataire;
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Étape 3: Mandataires et Signataire (maximum 3 mandataires)
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
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="Mandataires" />
                <Tab label="Signataire" />
              </Tabs>

              {activeTab === 0 ? (
                <>
                  {/* Onglets des mandataires */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {[1, 2, 3].map((num) => (
                      <Grid item xs={4} key={num}>
                        <Button
                          fullWidth
                          variant={activeMandataire === num ? "contained" : "outlined"}
                          onClick={() => setActiveMandataire(num)}
                          disabled={num > mandataireCount}
                          sx={{
                            background: activeMandataire === num 
                              ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' 
                              : 'transparent',
                            color: activeMandataire === num ? '#fff' : 'inherit',
                            borderColor: num <= mandataireCount ? '#4CAF50' : '#ccc',
                            opacity: num > mandataireCount ? 0.5 : 1,
                            '&:hover': num <= mandataireCount ? {
                              background: activeMandataire === num 
                                ? 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)' 
                                : 'rgba(76, 175, 80, 0.04)'
                            } : {}
                          }}
                        >
                          Mandataire {num} {num === 1 && '(Principal)'}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Bouton pour ajouter un mandataire */}
                  {mandataireCount < 3 && (
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addMandataire}
                        sx={{
                          borderColor: '#4CAF50',
                          color: '#4CAF50',
                          '&:hover': {
                            borderColor: '#388E3C',
                            backgroundColor: 'rgba(76, 175, 80, 0.04)'
                          }
                        }}
                      >
                        Ajouter un mandataire {mandataireCount + 1}
                      </Button>
                    </Box>
                  )}

                  {/* Formulaire du mandataire actif */}
                  {renderMandataireForm(activeMandataire)}
                </>
              ) : (
                renderSignataireForm()
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Aperçu */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Aperçu
          </Typography>
          <Grid container spacing={2}>
            {[1, 2, 3].map((num) => {
              const data = getMandataireForPreview(num);
              const isActive = num <= mandataireCount;
              const hasData = data.noms && data.noms.trim() !== '';
              
              return (
                <Grid item xs={12} md={4} key={`mandataire-preview-${num}`}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      opacity: isActive ? 1 : 0.6,
                      bgcolor: num === 1 ? 'rgba(76, 175, 80, 0.04)' : 'transparent'
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Mandataire {num} {num === 1 && '(Principal)'}
                      </Typography>
                      {hasData ? (
                        <>
                          <Typography><strong>Nom:</strong> {data.noms} {data.prenoms}</Typography>
                          <Typography><strong>CNI:</strong> {data.cni || 'Non renseigné'}</Typography>
                          <Typography><strong>Téléphone:</strong> {data.telephone || 'Non renseigné'}</Typography>
                          <Typography><strong>Situation:</strong> {data.situation_familiale || 'Non renseigné'}</Typography>
                        </>
                      ) : (
                        <Typography color="textSecondary">
                          {num === 1 ? 'À renseigner' : 'Non renseigné'}
                        </Typography>
                      )}
                      {!isActive && num > 1 && (
                        <Typography variant="caption" color="textSecondary">
                          (Non activé)
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
            
            {/* Signataire */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Signataire
                  </Typography>
                  {localSignataire.noms && localSignataire.noms.trim() !== '' ? (
                    <>
                      <Typography><strong>Nom:</strong> {localSignataire.noms} {localSignataire.prenoms}</Typography>
                      <Typography><strong>CNI:</strong> {localSignataire.cni || 'Non renseigné'}</Typography>
                      <Typography><strong>Téléphone:</strong> {localSignataire.telephone || 'Non renseigné'}</Typography>
                    </>
                  ) : (
                    <Typography color="textSecondary">
                      Non renseigné
                    </Typography>
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
              disabled={validating}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                color: 'white',
                padding: '10px 30px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)',
                },
                '&.Mui-disabled': {
                  background: 'linear-gradient(135deg, #cccccc 0%, #999999 100%)',
                }
              }}
            >
              {validating ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Validation...
                </>
              ) : (
                isLastStep ? 'Terminer' : 'Valider cette étape'
              )}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default Step3Mandataires;