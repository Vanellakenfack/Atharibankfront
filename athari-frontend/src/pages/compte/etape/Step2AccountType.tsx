import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { planComptableService } from '../../../services/api/clientApi';
import { typeCompteService } from '../../../services/api/typeCompteApi';
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
  InputAdornment
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
}) => {
  // États
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingTypes, setLoadingTypes] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>(accountSubType || '');
  const [typesComptes, setTypesComptes] = useState<TypeCompte[]>([]);
  
  // États pour les chapitres
  const [chapitres, setChapitres] = useState<ChapitreComptable[]>([]);
  const [selectedChapitre, setSelectedChapitre] = useState<ChapitreComptable | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingChapitres, setLoadingChapitres] = useState<boolean>(false);

  // Charger les types de comptes
  useEffect(() => {
    const fetchTypesComptes = async () => {
      console.log('Début du chargement des types de comptes...');
      try {
        const data = await typeCompteService.getTypesComptes();
        console.log('Types de comptes chargés:', data);
        setTypesComptes(data);
        setLoading(false); // S'assurer que le chargement est terminé
      } catch (err) {
        console.error('Erreur lors du chargement des types de comptes:', err);
        setError('Impossible de charger les types de comptes. Veuillez réessayer plus tard.');
      } finally {
        console.log('Chargement des types terminé');
        setLoadingTypes(false);
      }
    };

    fetchTypesComptes();
  }, []);

  // Mettre à jour les données du formulaire
  const updateFormData = useCallback((updates: Partial<FormOptions>) => {
    const newFormData = { ...options, ...updates };
    onChange('options', newFormData);
  }, [onChange, options]);

  // Charger tous les chapitres
  useEffect(() => {
    const loadAllChapitres = async () => {
      console.log('Chargement de tous les chapitres...');
      try {
        setLoadingChapitres(true);
        // Appel avec null comme premier paramètre pour récupérer tous les chapitres
        const data = await planComptableService.getChapitres(null, '');
        console.log('Tous les chapitres chargés:', data);
        setChapitres(data);
        
        // Si un chapitre est déjà sélectionné dans les options, on le restaure
        if (options.chapitre_id) {
          console.log('Restauration du chapitre sélectionné:', options.chapitre_id);
          const chapitre = data.find(c => c.id === options.chapitre_id);
          if (chapitre) {
            setSelectedChapitre(chapitre);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des chapitres:', err);
        setError('Impossible de charger les chapitres. Veuillez réessayer plus tard.');
      } finally {
        console.log('Fin du chargement des chapitres');
        setLoadingChapitres(false);
        setLoading(false);
      }
    };

    loadAllChapitres();
  }, [options.chapitre_id]);

  // Mettre à jour la liste des chapitres filtrés lors de la saisie de recherche
  useEffect(() => {
    const filterChapitres = async () => {
      if (!searchTerm) {
        // Si le terme de recherche est vide, recharger tous les chapitres
        try {
          setLoadingChapitres(true);
          const data = await planComptableService.getChapitres(null, '');
          console.log('Chargement de tous les chapitres:', data);
          setChapitres(data);
        } catch (err) {
          console.error('Erreur lors du chargement des chapitres:', err);
          setError('Erreur lors du chargement des chapitres. Veuillez réessayer.');
        } finally {
          setLoadingChapitres(false);
        }
        return;
      }
      
      console.log('Recherche de chapitres avec le terme:', searchTerm);
      try {
        setLoadingChapitres(true);
        const data = await planComptableService.getChapitres(null, searchTerm);
        console.log('Résultats de la recherche:', data);
        setChapitres(data);
      } catch (err) {
        console.error('Erreur lors de la recherche des chapitres:', err);
        setError('Erreur lors de la recherche des chapitres. Veuillez réessayer.');
      } finally {
        setLoadingChapitres(false);
      }
    };

    const timer = setTimeout(() => {
      filterChapitres();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Gestion du changement de chapitre
  const handleChapitreChange = (event: React.SyntheticEvent, newValue: ChapitreComptable | null) => {
    console.log('Chapitre sélectionné:', newValue);
    setSelectedChapitre(newValue);
    
    const updates: Partial<FormOptions> = {
      chapitre_id: newValue?.id || '',
      categorie_id: newValue?.categorie_id || ''
    };
    
    // S'assurer que le montant est défini s'il est requis
    if (!options.montant) {
      updates.montant = '0';
    }
    
    updateFormData(updates);
    setError(null); // Effacer l'erreur si un chapitre est sélectionné
  };

  // Gestion de la recherche de chapitres
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchTerm(event.target.value);
  };

  // Options de filtre pour l'Autocomplete des chapitres (filtrage côté client en plus de l'API)
  const filteredChapitres = useMemo(() => {
    if (!searchTerm) return chapitres;
    const lowercasedSearch = searchTerm.toLowerCase();
    return chapitres.filter(
      chapitre => 
        (chapitre.code && chapitre.code.toLowerCase().includes(lowercasedSearch)) ||
        (chapitre.libelle && chapitre.libelle.toLowerCase().includes(lowercasedSearch))
    );
  }, [chapitres, searchTerm]);

  // Gestion du changement de type de compte
  const handleTypeChange = useCallback((event: SelectChangeEvent<string>) => {
    const typeCode = event.target.value;
    const selected = typesComptes.find(t => t.code === typeCode);
    
    if (selected) {
      setSelectedType(typeCode);
      // Mettre à jour à la fois accountSubType et accountType
      onChange('accountSubType', typeCode);
      onChange('accountType', 'COMPTE_EPARGNE'); // ou une autre valeur appropriée
      
      // Mettre à jour les options supplémentaires en fonction du type de compte
      const updates: Partial<FormOptions> = {};
      
      if (selected.necessite_duree) {
        updates.duree = '6'; // Valeur par défaut pour la durée
      } else {
        updates.duree = '';
      }
      
      if (selected.est_islamique) {
        updates.module = MODULES[3]; // 'FONDS ISLAMIQUE' par défaut
      }
      
      if (Object.keys(updates).length > 0) {
        updateFormData(updates);
      }
      
      // Effacer toute erreur existante
      setError(null);
    }
  }, [onChange, typesComptes, updateFormData]);

  // Gestion du changement des champs de formulaire
  const handleInputChange = useCallback((field: keyof FormOptions) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateFormData({ [field]: event.target.value });
    }, [updateFormData]);

  // Mise à jour du type sélectionné
  useEffect(() => {
    setSelectedType(accountSubType);
  }, [accountSubType]);

  if (loading) {
    return (
      <Card>
        <CardContent style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
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
      </Alert>

      <Grid container spacing={3}>
        {/* Sélection du type de compte */}
        <Grid item xs={12}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Type de compte</InputLabel>
            <Select
              value={selectedType}
              sx={{ minWidth: 200 }}
              onChange={handleTypeChange}
              label="Type de compte"
              disabled={loading || loadingTypes}
            >
              {typesComptes.map((type) => (
                <MenuItem key={type.id} value={type.code}>
                  {type.libelle}
                </MenuItem>
              ))}
              {loadingTypes && (
                <MenuItem disabled>
                  <Box display="flex" alignItems="center" width="100%">
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Chargement...
                  </Box>
                </MenuItem>
              )}
              {!loadingTypes && typesComptes.length === 0 && (
                <MenuItem disabled>Aucun type de compte disponible</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        {/* Sélection de la catégorie comptable */}
        <Grid item xs={12}>
          <FormControl sx={{ minWidth: 400 }} margin="normal">
            <Autocomplete
              options={filteredChapitres}
              getOptionLabel={(option) => `${option.code} - ${option.libelle}${option.nature_solde ? ` (${option.nature_solde})` : ''}`}
              value={selectedChapitre}
              onChange={handleChapitreChange}
              loading={loadingChapitres}
              filterOptions={(x) => x} // Désactive le filtrage côté client car on gère tout côté serveur
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Rechercher un chapitre par code ou libellé"
                  variant="outlined"
                  onChange={handleSearchChange}
                  placeholder="Tapez pour rechercher..."
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
                // Extraire la propriété key de props pour éviter l'avertissement
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
              noOptionsText={searchTerm ? "Aucun chapitre trouvé" : "Commencez à taper pour rechercher un chapitre"}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {chapitres.length} chapitres disponibles
            </Typography>
          </FormControl>
        </Grid>

        {/* Affichage des informations sélectionnées */}
        {(selectedType || selectedChapitre) && (
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Type de compte :</strong> {
                  selectedType ? 
                    typesComptes.find(t => t.code === selectedType)?.libelle || 'Non sélectionné' : 
                    'Non sélectionné'
                }
              </Typography>
              {selectedChapitre && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Chapitre :</strong> {selectedChapitre.libelle} ({selectedChapitre.code})
                </Typography>
              )}
            </Card>
          </Grid>
        )}

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
                    sx={{ minWidth: 200 }}
                    label="Montant initial (FCFA)"
                    type="number"
                    value={options.montant || ''}
                    onChange={handleInputChange('montant')}
                    disabled={loading}
                    required
                    inputProps={{
                      min: 0,
                      step: 1000
                    }}
                  />
                </Grid>

                {/* Champ Durée (conditionnel) - Affiché uniquement pour les comptes qui nécessitent une durée */}
                {(() => {
                  const selectedAccountType = typesComptes.find(t => t.code === selectedType);
                  if (selectedAccountType?.necessite_duree) {
                    return (
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Durée de blocage</InputLabel>
                          <Select
                            sx={{ minWidth: 200 }}
                            value={options.duree || '3'}
                            onChange={(e) => updateFormData({ duree: e.target.value as string })}
                            label="Durée de blocage"
                            disabled={loading}
                            required
                          >
                            {Array.from({ length: 10 }, (_, i) => {
                              const months = i + 3; // De 3 à 12 mois
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

                {/* Champ Module */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    sx={{ minWidth: 200 }}
                    label="Frais sms  (FCFA)"
                    type="number"
                    value={'200'}
                    onChange={handleInputChange('montant')}
                    disabled={loading}
                    required
                    inputProps={{
                      min: 0,
                      step: 1000
                    }}
                  />
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3, fontSize: '0.9rem' }}>
                Vérifiez que toutes les informations sont correctes avant de continuer.
              </Alert>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Step2AccountType;
