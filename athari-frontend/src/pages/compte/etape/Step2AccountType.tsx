// src/pages/compte/etape/Step2AccountType.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { planComptableService } from '../../../services/api/clientApi';
import { typeCompteService } from '../../../services/api/typeCompteApi';
import { compteService } from '../../../services/api/compteApi';
import {
  FormControl,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Divider,
  CircularProgress,
  Autocomplete,
  InputAdornment,
  Button
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material/Select';

// Types pour les données
interface CategorieComptable {
  id: string;
  code: string;
  libelle: string;
}

interface ChapitreComptable {
  id: string;
  code: string;
  libelle: string;
  nature_solde: string;
  est_actif: boolean;
  categorie_id?: string;
}

interface TypeCompte {
  id: number;
  code: string;
  libelle: string;
  description?: string;
  est_mata: boolean;
  necessite_duree: boolean;
  est_islamique: boolean;
  actif: boolean;
}

interface FormOptions {
  montant: string;
  duree: string;
  module: string;
  categorie_id?: string;
  chapitre_id?: string;
}

interface Step2AccountTypeProps {
  accountType: string;
  accountSubType: string;
  options: FormOptions;
  onChange: (field: string, value: unknown) => void;
  onNext: (data: any) => Promise<void>;
  isLastStep?: boolean;
}

const MODULES = [
  "FONDS AFFECTÉS DE FINANCEMENT DES PARTICIPATIONS",
  "FONDS DE GARANTIE",
  "FONDS D'INVESTISSEMENT",
  "FONDS ISLAMIQUE"
];

const Step2AccountType: React.FC<Step2AccountTypeProps> = ({
  accountType,
  accountSubType,
  options,
  onChange,
  onNext,
  isLastStep = false
}) => {
  // États
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingTypes, setLoadingTypes] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>(accountSubType || '');
  const [typesComptes, setTypesComptes] = useState<TypeCompte[]>([]);
  const [validating, setValidating] = useState<boolean>(false);
  
  // États pour les chapitres
  const [chapitres, setChapitres] = useState<ChapitreComptable[]>([]);
  const [selectedChapitre, setSelectedChapitre] = useState<ChapitreComptable | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingChapitres, setLoadingChapitres] = useState<boolean>(false);

  // Charger les types de comptes
  useEffect(() => {
    const fetchTypesComptes = async () => {
      try {
        setLoadingTypes(true);
        const data = await typeCompteService.getTypesComptes();
        setTypesComptes(data);
      } catch (err) {
        console.error('Erreur lors du chargement des types de comptes:', err);
        setError('Impossible de charger les types de comptes. Veuillez réessayer plus tard.');
      } finally {
        setLoadingTypes(false);
        setLoading(false);
      }
    };

    fetchTypesComptes();
  }, []);

  // Charger tous les chapitres
  useEffect(() => {
    const loadAllChapitres = async () => {
      try {
        setLoadingChapitres(true);
        const data = await planComptableService.getChapitres(null, '');
        setChapitres(data);
        
        // Si un chapitre est déjà sélectionné dans les options, on le restaure
        if (options.chapitre_id) {
          const chapitre = data.find(c => c.id === options.chapitre_id);
          if (chapitre) {
            setSelectedChapitre(chapitre);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des chapitres:', err);
        setError('Impossible de charger les chapitres. Veuillez réessayer plus tard.');
      } finally {
        setLoadingChapitres(false);
      }
    };

    loadAllChapitres();
  }, [options.chapitre_id]);

  // Mettre à jour la liste des chapitres filtrés
  useEffect(() => {
    const filterChapitres = async () => {
      try {
        setLoadingChapitres(true);
        const data = await planComptableService.getChapitres(null, searchTerm);
        setChapitres(data);
      } catch (err) {
        console.error('Erreur lors du chargement des chapitres:', err);
      } finally {
        setLoadingChapitres(false);
      }
    };

    const timer = setTimeout(() => {
      filterChapitres();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Mettre à jour options.chapitre_id quand selectedChapitre change
  useEffect(() => {
    if (selectedChapitre) {
      onChange('options', { 
        ...options, 
        chapitre_id: selectedChapitre.id,
        categorie_id: selectedChapitre.categorie_id || ''
      });
    }
  }, [selectedChapitre]);

  // Gestion du changement de chapitre
  const handleChapitreChange = (event: React.SyntheticEvent, newValue: ChapitreComptable | null) => {
    setSelectedChapitre(newValue);
    setError(null);
  };

  // Gestion de la recherche de chapitres
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Options de filtre pour l'Autocomplete
  const filteredChapitres = useMemo(() => {
    return chapitres.filter(chapitre => chapitre.est_actif !== false);
  }, [chapitres]);

  // Gestion du changement de type de compte
  const handleTypeChange = useCallback((event: SelectChangeEvent<string>) => {
    const typeCode = event.target.value;
    const selected = typesComptes.find(t => t.code === typeCode);
    
    if (selected) {
      console.log('Type de compte sélectionné:', {
        id: selected.id,
        code: selected.code,
        libelle: selected.libelle
      });
      
      setSelectedType(typeCode);
      
      // Mettre à jour à la fois l'ID (pour le backend) et le code (pour l'affichage)
      // S'assurer que l'ID est bien un nombre
      const typeId = typeof selected.id === 'string' ? 
        parseInt(selected.id, 10) : 
        selected.id;
        
      if (isNaN(typeId)) {
        console.error('ID de type de compte invalide:', selected.id);
        setError('Erreur: Type de compte invalide');
        return;
      }
      
      console.log('Mise à jour du type de compte - ID:', typeId, 'Code:', typeCode);
      onChange('accountType', typeId);
      onChange('accountSubType', typeCode);
      
      const updates: Partial<FormOptions> = {};
      
      if (selected.necessite_duree) {
        updates.duree = '6';
      } else {
        updates.duree = '';
      }
      
      if (selected.est_islamique) {
        updates.module = MODULES[3];
      }
      
      if (Object.keys(updates).length > 0) {
        onChange('options', { ...options, ...updates });
      }
      
      setError(null);
    }
  }, [onChange, typesComptes, options]);

  // Gestion du changement des champs de formulaire
  const handleInputChange = useCallback((field: keyof FormOptions) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange('options', { ...options, [field]: event.target.value });
    }, [onChange, options]);

  // Valider l'étape 2
  const handleValidateStep2 = async () => {
    try {
      // Validation du type de compte
      if (!selectedType) {
        throw new Error('Veuillez sélectionner un type de compte');
      }

      // Validation du montant
      const montant = parseFloat(options.montant);
      if (isNaN(montant) || montant <= 0) {
        throw new Error('Veuillez saisir un montant initial valide (supérieur à 0)');
      }

      // Validation du chapitre (OBLIGATOIRE)
      const chapitreId = selectedChapitre?.id || options.chapitre_id;
      if (!chapitreId) {
        throw new Error('Veuillez sélectionner un chapitre comptable');
      }

      setValidating(true);
      setError(null);
      
      // Préparer les données avec les bons types
      const etape2Data = {
        account_type: accountType,
        account_sub_type: accountSubType,
        montant: Number(options.montant) || 0,
        duree: Number(options.duree) || 0,
        module: options.module || '',
        chapitre_comptable_id: (selectedChapitre?.id || options.chapitre_id || '').toString().trim(),
        categorie_id: (selectedChapitre?.categorie_id || options.categorie_id || '').toString().trim()
      };

      console.log('Données envoyées à l\'étape 2:', JSON.stringify(etape2Data, null, 2));
      
      // Validation supplémentaire des données
      if (!etape2Data.account_type || !etape2Data.account_sub_type) {
        throw new Error('Type de compte invalide');
      }

      if (etape2Data.duree < 0) {
        throw new Error('La durée ne peut pas être négative');
      }
      
      if (!etape2Data.chapitre_comptable_id) {
        throw new Error('Veuillez sélectionner un chapitre comptable');
      }

      await onNext(etape2Data);
      
    } catch (err: any) {
      console.error('Erreur de validation:', err);
      
      if (err.response?.status === 422) {
        // Erreur de validation du serveur
        const errorData = err.response.data;
        if (errorData?.errors) {
          // Formater les erreurs de validation Laravel
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => 
              Array.isArray(messages) 
                ? messages.join(', ')
                : String(messages)
            )
            .join('\n');
          setError(`Erreur de validation :\n${errorMessages}`);
        } else if (errorData?.message) {
          setError(errorData.message);
        } else {
          setError('Erreur de validation des données. Veuillez vérifier tous les champs.');
        }
      } else if (err.message) {
        // Erreur de validation côté client
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la validation du formulaire');
      }
    } finally {
      setValidating(false);
    }
  };

  // Mise à jour du type sélectionné
  useEffect(() => {
    setSelectedType(accountSubType);
  }, [accountSubType]);

  if (loading && loadingTypes) {
    return (
      <Card>
        <CardContent style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Étape 2 : Sélection du type de compte et des paramètres
      </Typography>

      <Alert severity="info" sx={{ mb: 4, borderRadius: 1 }}>
        Veuillez sélectionner un type de compte et renseigner les informations requises.
        <strong> Le chapitre comptable est obligatoire.</strong>
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sélection du type de compte */}
        <Grid item xs={12}>
          <FormControl sx={{ minWidth: 200}} margin="normal" required>
            <InputLabel>Type de compte *</InputLabel>
            <Select
              value={selectedType}
              onChange={handleTypeChange}
              label="Type de compte *"
              disabled={loading || loadingTypes}
            >
              {typesComptes.map((type) => (
                <MenuItem key={type.id} value={type.code}>
                  {type.libelle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Sélection du chapitre comptable */}
        <Grid item xs={12}>
          <Box sx={{ position: 'relative' }}>
            <FormControl sx={{ minWidth: 300}} margin="normal" required>
              <Autocomplete
                options={filteredChapitres}
                getOptionLabel={(option) => `${option.code} - ${option.libelle}`}
                value={selectedChapitre}
                onChange={handleChapitreChange}
                loading={loadingChapitres}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Rechercher et sélectionner un chapitre comptable *"
                    variant="outlined"
                    onChange={handleSearchChange}
                    placeholder="Tapez pour rechercher un chapitre..."
                    error={!selectedChapitre}
                    helperText={!selectedChapitre ? "Ce champ est obligatoire" : ""}
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <React.Fragment>
                          {loadingChapitres ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={key} {...otherProps}>
                      <Box>
                        <Typography variant="body1">
                          <strong>{option.code}</strong> - {option.libelle}
                        </Typography>
                        {option.nature_solde && (
                          <Typography variant="caption" color="text.secondary">
                            Nature du solde: {option.nature_solde}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  );
                }}
                noOptionsText={searchTerm ? "Aucun chapitre trouvé" : "Commencez à taper pour rechercher"}
              />
            </FormControl>
            
            {selectedChapitre && (
              <Alert severity="success" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>✓ Chapitre sélectionné :</strong> {selectedChapitre.code} - {selectedChapitre.libelle}
                </Typography>
              </Alert>
            )}
          </Box>
        </Grid>

        {/* Paramètres du compte */}
        {selectedType && (
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ mt: 2, p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Paramètres du compte
              </Typography>
              
              <Grid container spacing={3}>
                {/* Champ Montant */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Montant initial (FCFA) *"
                    type="number"
                    value={options.montant || ''}
                    onChange={handleInputChange('montant')}
                    required
                    inputProps={{
                      min: 0,
                      step: 1000
                    }}
                    helperText="Montant minimum pour l'ouverture du compte"
                  />
                </Grid>

                {/* Champ Durée (conditionnel) */}
                {(() => {
                  const selectedAccountType = typesComptes.find(t => t.code === selectedType);
                  if (selectedAccountType?.necessite_duree) {
                    return (
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Durée de blocage *</InputLabel>
                          <Select
                            value={options.duree || '3'}
                            onChange={(e) => onChange('options', { ...options, duree: e.target.value as string })}
                            label="Durée de blocage *"
                            required
                          >
                            {Array.from({ length: 10 }, (_, i) => {
                              const months = i + 3;
                              return (
                                <MenuItem key={months} value={months.toString()}>
                                  {months} mois
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                    );
                  }
                  return null;
                })()}

                {/* Champ Frais SMS */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Frais SMS (FCFA)"
                    type="number"
                    value={'200'}
                    disabled
                    helperText="Frais SMS fixe"
                  />
                </Grid>
              </Grid>

              {/* Bouton de validation */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleValidateStep2}
                  disabled={validating || !selectedType || !options.montant || !selectedChapitre}
                  sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                    color: 'white',
                    padding: '10px 30px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)',
                    },
                    '&:disabled': {
                      background: '#e0e0e0',
                      color: '#9e9e9e'
                    }
                  }}
                >
                  {validating ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Validation en cours...
                    </>
                  ) : (
                    'Valider cette étape'
                  )}
                </Button>
              </Box>

              <Alert severity="info" sx={{ mt: 3, fontSize: '0.9rem' }}>
                <strong>Vérification requise :</strong> 
                <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                  <li>Type de compte sélectionné</li>
                  <li>Montant initial renseigné</li>
                  <li>Chapitre comptable sélectionné</li>
                  {typesComptes.find(t => t.code === selectedType)?.necessite_duree && (
                    <li>Durée de blocage définie</li>
                  )}
                </ul>
              </Alert>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Step2AccountType;