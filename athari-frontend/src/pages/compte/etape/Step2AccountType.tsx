// src/pages/compte/etape/Step2AccountType.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { planComptableService } from '../../../services/api/clientApi';
import { typeCompteService } from '../../../services/api/typeCompteApi';
import type { SelectChangeEvent } from '@mui/material/Select';
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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import { Search as SearchIcon, ExpandMore, Info, Euro, AttachMoney, AccountBalance, Settings } from '@mui/icons-material';

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
  chapitre_defaut_id?: string | null;
  [key: string]: any; // Permet d'accepter n'importe quel champ supplémentaire
}

interface FormOptions {
  solde: string;
  duree: string;
  module: string;
  categorie_id?: string;
  chapitre_id?: string;
  type_compte_id?: number;
  gestionnaire_nom?: string;
  gestionnaire_prenom?: string;
  gestionnaire_code?: string;
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

// Helper function pour formater les valeurs
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'number') {
    if (value === 0) return 'Non';
    if (value === 1) return 'Oui';
    return value.toString();
  }
  if (typeof value === 'string' && value.trim() === '') return '-';
  if (typeof value === 'string' && value === '0.00') return '-';
  return value.toString();
};

// Helper pour formater les soldes
const formatsolde = (value: string): string => {
  if (!value || value === '0.00' || value === '0') return '-';
  try {
    const num = parseFloat(value);
    return `${num.toLocaleString('fr-FR')} FCFA`;
  } catch {
    return value;
  }
};

// Helper pour formater les pourcentages
const formatPourcentage = (value: string): string => {
  if (!value || value === '0.00' || value === '0') return '-';
  if (value.includes('%')) return value;
  return `${value}%`;
};

// Catégoriser les paramètres
const categorizeParameters = (typeCompte: TypeCompte) => {
  const fraisKeys = [
    'frais_ouverture', 'frais_deblocage', 'frais_cloture_anticipe', 
    'frais_carnet', 'frais_perte_carnet', 'frais_renouvellement_carnet', 'frais_livret', 'frais_renouvellement_livret'
  ];
  
  const commissionKeys = [
    'commission_retrait', 'commission_sms', 'taux_interet_annuel',
    'seuil_commission', 'commission_si_inferieur', 'commission_si_superieur', 'commission_mensuel'
  ];
  
  const caracteristiqueKeys = [
    'minimum_compte', 'duree_blocage_min', 'duree_blocage_max',
    'capitalisation_interets', 'a_vue', 'frequence_calcul_interet',
    'heure_calcul_interet'
  ];
  
  const activationKeys = [
    'frais_ouverture_actif', 'frais_deblocage_actif', 'frais_cloture_actif',
    'frais_carnet_actif', 'commission_retrait_actif', 'commission_sms_actif',
    'penalite_actif', 'interets_actifs', 'minimum_compte_actif',
    'frais_perte_actif', 'frais_renouvellement_actif', 'commission_mensuelle_actif', 'frais_livret_actif'
  ];

  const autresKeys = Object.keys(typeCompte).filter(key => 
    ![
      'id', 'code', 'libelle', 'description', 'est_mata', 'necessite_duree', 
      'est_islamique', 'actif', 'created_at', 'updated_at', 'deleted_at',
      ...fraisKeys, ...commissionKeys, ...caracteristiqueKeys, ...activationKeys
    ].includes(key) &&
    !key.includes('chapitre_') &&
    !key.includes('_id')
  );

  return {
    frais: fraisKeys.filter(key => key in typeCompte),
    commissions: commissionKeys.filter(key => key in typeCompte),
    caracteristiques: caracteristiqueKeys.filter(key => key in typeCompte),
    activations: activationKeys.filter(key => key in typeCompte),
    autres: autresKeys.filter(key => !key.startsWith('_'))
  };
};

// Grouper les paramètres actifs/inactifs
const groupActiveInactive = (typeCompte: TypeCompte, keys: string[]) => {
  const active: Array<{key: string, value: any, label: string}> = [];
  const inactive: Array<{key: string, value: any, label: string}> = [];

  keys.forEach(key => {
    const value = typeCompte[key];
    const label = getLabelForKey(key);
    
    if (key.includes('_actif')) {
      if (value === 1 || value === true) {
        active.push({ key, value, label });
      } else {
        inactive.push({ key, value, label });
      }
    } else if (value && value !== '0.00' && value !== '0' && value !== null) {
      active.push({ key, value, label });
    }
  });

  return { active, inactive };
};

// Traduire les clés en labels français
const getLabelForKey = (key: string): string => {
  const labels: { [key: string]: string } = {
    // Frais
    frais_ouverture: 'Frais d\'ouverture',
    frais_deblocage: 'Frais de déblocage',
    frais_cloture_anticipe: 'Frais de clôture anticipée',
    frais_carnet: 'Frais de carnet',
    frais_perte_carnet: 'Frais perte carnet',
    frais_renouvellement_carnet: 'Frais renouvellement carnet',
   frais_livret: 'Frais de livret',
    
    // Commissions
    commission_retrait: 'Commission de retrait',
    commission_sms: 'Commission SMS',
    taux_interet_annuel: 'Taux intérêt annuel',
    commission_mensuelle: 'Commission mensuelle',
    penalite_retrait_anticipe: 'Pénalité retrait anticipé',
    
    // Caractéristiques
    minimum_compte: 'Minimum compte',
    duree_blocage_min: 'Durée blocage min',
    duree_blocage_max: 'Durée blocage max',
    capitalisation_interets: 'Capitalisation intérêts',
    a_vue: 'À vue',
    frequence_calcul_interet: 'Fréquence calcul intérêt',
    heure_calcul_interet: 'Heure calcul intérêt',
    validation_retrait_anticipe: 'Validation retrait anticipé',
    retrait_anticipe_autorise: 'Retrait anticipé autorisé',
    
    // Actifs
    frais_ouverture_actif: 'Frais ouverture actif',
    frais_deblocage_actif: 'Frais déblocage actif',
    frais_cloture_actif: 'Frais clôture actif',
    frais_carnet_actif: 'Frais carnet actif',
     frais_livret_actif: 'Frais li actif',

    commission_retrait_actif: 'Commission retrait actif',
    commission_sms_actif: 'Commission SMS actif',
    penalite_actif: 'Pénalité actif',
    interets_actifs: 'Intérêts actifs',
    minimum_compte_actif: 'Minimum compte actif',
    frais_perte_actif: 'Frais perte actif',
    frais_renouvellement_actif: 'Frais renouvellement carnet/livret actif',
    commission_mensuelle_actif: 'Commission mensuelle actif',
    
    // Autres
    observations: 'Observations',
  };

  // Si la clé n'est pas dans le dictionnaire, formater en français
  if (!labels[key]) {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return labels[key];
};

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
  const [selectedTypeDetails, setSelectedTypeDetails] = useState<TypeCompte | null>(null);
  const [typesComptes, setTypesComptes] = useState<TypeCompte[]>([]);
  const [validating, setValidating] = useState<boolean>(false);
  
  // États pour les chapitres
  const [chapitres, setChapitres] = useState<ChapitreComptable[]>([]);
  const [selectedChapitre, setSelectedChapitre] = useState<ChapitreComptable | null>(null);
  const [natureSolde, setNatureSolde] = useState<string>('');
  const [chapitreDefaut, setChapitreDefaut] = useState<ChapitreComptable | null>(null); // NOUVEAU ÉTAT
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingChapitres, setLoadingChapitres] = useState<boolean>(false);

  // Charger les types de comptes
  useEffect(() => {
    const fetchTypesComptes = async () => {
      try {
        setLoadingTypes(true);
        const data = await typeCompteService.getTypesComptes();
        console.log('Types de comptes chargés:', data);
        setTypesComptes(data);
        
        if (accountSubType && data.length > 0) {
          const type = data.find((t: TypeCompte) => t.code === accountSubType);
          
          if (type) {
            console.log('Type existant trouvé avec données dynamiques:', type);
            setSelectedType(type.code);
            setSelectedTypeDetails(type);
            
            // Chercher un chapitre par défaut
            let chapitreIdToFind = null;
            
            // Chercher d'abord dans les chapitres spécifiques
            const chapitreKeys = Object.keys(type).filter(key => 
              key.includes('chapitre_') && key.includes('_id') && type[key]
            );
            
            if (chapitreKeys.length > 0) {
              // Prendre le premier chapitre non-null trouvé
              chapitreIdToFind = type[chapitreKeys[0]];
            }
            
            if (chapitreIdToFind) {
              try {
                const chapitres = await planComptableService.getChapitres();
                const chapitre = chapitres.find((c: ChapitreComptable) => 
                  c.id === chapitreIdToFind
                );
                if (chapitre) {
                  console.log('Chapitre associé trouvé:', chapitre);
                  setSelectedChapitre(chapitre);
                  setChapitreDefaut(chapitre); // INITIALISER LE CHAPITRE DÉFAUT
                }
              } catch (err) {
                console.error('Erreur lors du chargement du chapitre:', err);
              }
            }
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des types de comptes:', err);
        setError('Impossible de charger les types de comptes. Veuillez réessayer plus tard.');
      } finally {
        setLoadingTypes(false);
        setLoading(false);
      }
    };

    fetchTypesComptes();
  }, [accountSubType]);

  // Charger tous les chapitres
  useEffect(() => {
    const loadAllChapitres = async () => {
      try {
        setLoadingChapitres(true);
        const data = await planComptableService.getChapitres();
        setChapitres(data);
        
        if (options.chapitre_id) {
          const chapitre = data.find((c: ChapitreComptable) => 
            c.id === options.chapitre_id
          );
          if (chapitre) {
            setSelectedChapitre(chapitre);
            setChapitreDefaut(chapitre); // METTRE À JOUR LE CHAPITRE DÉFAUT
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
        const data = await planComptableService.getChapitres();
        const filtered = data.filter((chapitre: ChapitreComptable) => 
          chapitre.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chapitre.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setChapitres(filtered);
      } catch (err) {
        console.error('Erreur lors du chargement des chapitres:', err);
      } finally {
        setLoadingChapitres(false);
      }
    };

    const timer = setTimeout(() => {
      if (searchTerm) {
        filterChapitres();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Gestion du changement de chapitre
  const handleChapitreChange = (event: SelectChangeEvent<string>) => {
    const chapitreId = event.target.value;
    onChange('chapitre_id', chapitreId);
    
    // Trouver le chapitre sélectionné
    const chapitre = chapitres.find(c => c.id === chapitreId);
    if (chapitre) {
      setSelectedChapitre(chapitre);
      // Utiliser nature_technique comme nature du solde
      setNatureSolde(chapitre.comptabilite?.nature_technique || 'Non spécifiée');
      // Mettre à jour la catégorie associée
      onChange('categorie_id', chapitre.categorie_id || '');
    } else {
      setSelectedChapitre(null);
      setNatureSolde('');
      onChange('categorie_id', '');
    }
  };

  // Gestion du changement de type de compte
  const handleTypeCompteChange = async (event: SelectChangeEvent<number>) => {
    const typeCompteId = Number(event.target.value);
    const selectedType = typesComptes.find(tc => tc.id === typeCompteId);
  
    if (selectedType) {
      setSelectedType(selectedType.code);
      setSelectedTypeDetails(selectedType);
      
      // Mettre à jour le formulaire avec les valeurs du type de compte sélectionné
      const updates: any = {};
      Object.entries(selectedType).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          updates[key] = value;
        }
      });
      
      // Mettre à jour le type de compte et sous-type
      updates.accountType = selectedType.id;
      updates.accountSubType = selectedType.code;
      
      try {
        setLoadingChapitres(true);
        
        // Vérifier d'abord s'il y a un chapitre_defaut_id
        if (selectedType.chapitre_defaut_id) {
          console.log('Chargement du chapitre par défaut:', selectedType.chapitre_defaut_id);
          const chapitre = await planComptableService.getChapitre(selectedType.chapitre_defaut_id);
          
          if (chapitre) {
            console.log('Chapitre par défaut trouvé:', chapitre);
            setChapitreDefaut(chapitre);
            setSelectedChapitre(chapitre);
            updates.chapitre_id = chapitre.id;
            updates.categorie_id = chapitre.categorie_id || '';
            // Mettre à jour la nature du solde avec nature_technique
            setNatureSolde(chapitre.comptabilite?.nature_technique || 'Non spécifiée');
          } else {
            // Fallback sur l'ancienne méthode si pas de chapitre_defaut_id
            const chapitreKeys = Object.keys(selectedType).filter(key => 
              key.includes('chapitre_') && key.endsWith('_id') && selectedType[key]
            );
            
            if (chapitreKeys.length > 0) {
              const chapitreIdToFind = selectedType[chapitreKeys[0]];
              const chapitres = await planComptableService.getChapitres();
              const chapitre = chapitres.find((c: ChapitreComptable) => 
                c.id === chapitreIdToFind
              );
              
              if (chapitre) {
                setChapitreDefaut(chapitre);
                setSelectedChapitre(chapitre);
                updates.chapitre_id = chapitre.id;
                updates.categorie_id = chapitre.categorie_id || '';
                // Mettre à jour la nature du solde avec nature_technique
                setNatureSolde(chapitre.comptabilite?.nature_technique || 'Non spécifiée');
              } else {
                // Si aucun chapitre n'est trouvé, réinitialiser
                setChapitreDefaut(null);
                setSelectedChapitre(null);
                setNatureSolde('');
                updates.chapitre_id = '';
                updates.categorie_id = '';
              }
            }
          }
        }
        
        // Mettre à jour les options
        onChange('options', {
          ...options,
          ...updates
        });
        
      } catch (err) {
        console.error('Erreur lors du chargement du chapitre par défaut:', err);
        setError('Erreur lors du chargement du chapitre par défaut');
        
        // En cas d'erreur, réinitialiser les chapitres
        setChapitreDefaut(null);
        setSelectedChapitre(null);
        onChange('options', {
          ...options,
          chapitre_id: '',
          categorie_id: '',
          ...updates
        });
      } finally {
        setLoadingChapitres(false);
      }
    }
  };

  // Gestion du changement des champs de formulaire
  const handleInputChange = useCallback((field: keyof FormOptions) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange('options', { 
        ...options, 
        [field]: event.target.value 
      });
    }, [onChange, options]);

  // Gestion de la validation du formulaire
  const validateForm = () => {
    if (!selectedType) {
      throw new Error('Veuillez sélectionner un type de compte');
    }
    
    // Vérifier si un solde est saisi, et s'il est valide
    if (options.solde && options.solde.trim() !== '') {
      const solde = parseFloat(options.solde);
      if (isNaN(solde) || solde < 0) {
        throw new Error('Le solde initial doit être un nombre positif');
      }
    }

    // Validation des champs gestionnaire
    if (!options.gestionnaire_nom?.trim()) {
      throw new Error('Le nom du gestionnaire est requis');
    }
    if (!options.gestionnaire_prenom?.trim()) {
      throw new Error('Le prénom du gestionnaire est requis');
    }
    if (!options.gestionnaire_code?.trim()) {
      throw new Error('Le code gestionnaire est requis');
    }
    
    if (!selectedChapitre) {
      throw new Error('Veuillez sélectionner un chapitre comptable');
    }
  };

  // Valider l'étape 2
  const handleValidateStep2 = async () => {
    try {
      // Valider le formulaire
      validateForm();

      setValidating(true);
      setError(null);
      
      const etape2Data = {
        account_type: selectedTypeDetails?.id || accountType,
        account_sub_type: selectedType || accountSubType,
        solde: Number(options.solde) || 0,
        duree: selectedTypeDetails?.necessite_duree ? Number(options.duree) || 0 : 0,
        module: selectedTypeDetails?.est_islamique ? MODULES[3] : options.module || '',
        plan_comptable_id: selectedChapitre.plan_comptable_id || selectedChapitre.id,
        chapitre_comptable_id: selectedChapitre.id,
        categorie_id: selectedChapitre.categorie_id || '',
        gestionnaire_nom: options.gestionnaire_nom || '',
        gestionnaire_prenom: options.gestionnaire_prenom || '',
        gestionnaire_code: options.gestionnaire_code || '',
        type_compte_libelle: selectedTypeDetails?.libelle || ''
      };

      console.log('Données envoyées à l\'étape 2:', etape2Data);
      
      await onNext(etape2Data);
      
    } catch (err: any) {
      console.error('Erreur de validation:', err);
      
      if (err.response?.status === 422) {
        const errorData = err.response.data;
        if (errorData?.errors) {
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
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la validation du formulaire');
      }
    } finally {
      setValidating(false);
    }
  };

  // Catégoriser les paramètres si un type est sélectionné
  const categorizedParams = selectedTypeDetails ? categorizeParameters(selectedTypeDetails) : null;
  const fraisActiveInactive = selectedTypeDetails && categorizedParams ? 
    groupActiveInactive(selectedTypeDetails, categorizedParams.frais) : { active: [], inactive: [] };
  const commissionsActiveInactive = selectedTypeDetails && categorizedParams ? 
    groupActiveInactive(selectedTypeDetails, categorizedParams.commissions) : { active: [], inactive: [] };
  const caracteristiquesActiveInactive = selectedTypeDetails && categorizedParams ? 
    groupActiveInactive(selectedTypeDetails, categorizedParams.caracteristiques) : { active: [], inactive: [] };

  return (
    <Box sx={{ p: 4 }}>
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
        <Grid item xs={12} md={6}>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel id="type-compte-label">Type de compte *</InputLabel>
            <Select
              labelId="type-compte-label"
              id="type-compte"
              value={typesComptes.find(tc => tc.code === selectedType)?.id || ''}
              onChange={handleTypeCompteChange}
              label="Type de compte *"
              disabled={loadingTypes}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Sélectionnez un type de compte
              </MenuItem>
              {loadingTypes ? (
                <MenuItem value="">Chargement...</MenuItem>
              ) : (
                typesComptes.map((type) => (
                  <MenuItem key={type.id} value={type.code}>
                    {type.libelle} ({type.code})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>

        {/* MODIFICATION: Remplacer l'Autocomplete par un TextField en lecture seule */}
        <Grid item xs={12} md={6}>
          <FormControl sx={{minWidth:500}} variant="outlined" margin="normal">
            <TextField
              label="Chapitre comptable *"
              value={chapitreDefaut ? `${chapitreDefaut.code} - ${chapitreDefaut.libelle}` : 'Aucun chapitre par défaut'}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalance />
                  </InputAdornment>
                ),
              }}
              disabled={!selectedType}
              helperText={!selectedType ? 'Sélectionnez d\'abord un type de compte' : ''}
            />
          </FormControl>
        </Grid>
      </Grid>

            {/* Section Informations du gestionnaire */}
      <Card sx={{ mb: 4, p: 2, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
          <AccountBalance sx={{ mr: 1 }} />
          Informations du gestionnaire
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Nom du gestionnaire *"
              value={options.gestionnaire_nom || ''}
              onChange={(e) => onChange('options', { ...options, gestionnaire_nom: e.target.value })}
              margin="normal"
              variant="outlined"
              size="small"
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Prénom du gestionnaire *"
              value={options.gestionnaire_prenom || ''}
              onChange={(e) => onChange('options', { ...options, gestionnaire_prenom: e.target.value })}
              margin="normal"
              variant="outlined"
              size="small"
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Code gestionnaire *"
              value={options.gestionnaire_code || ''}
              onChange={(e) => onChange('options', { ...options, gestionnaire_code: e.target.value })}
              margin="normal"
              variant="outlined"
              size="small"
              required
            />
          </Grid>
        </Grid>
      </Card>

      {/* SECTION DES PARAMÈTRES */}
      {selectedType && selectedTypeDetails && (
        <>
          {/* Résumé du type de compte */}
          <Card sx={{ mt: 3, mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {selectedTypeDetails.libelle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Code: {selectedTypeDetails.code} | {selectedTypeDetails.description || 'Pas de description'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedTypeDetails.necessite_duree && (
                    <Tooltip title="Ce compte nécessite une durée de blocage">
                      <Chip 
                        label="Durée requise" 
                        color="warning" 
                        size="small"
                        icon={<Info />}
                      />
                    </Tooltip>
                  )}
                  {selectedTypeDetails.est_islamique && (
                    <Tooltip title="Compte conforme aux principes islamiques">
                      <Chip 
                        label="Islamique" 
                        color="info" 
                        size="small"
                      />
                    </Tooltip>
                  )}
                  {selectedTypeDetails.est_mata && (
                    <Tooltip title="Compte MATA (avec rubriques)">
                      <Chip 
                        label="MATA" 
                        color="success" 
                        size="small"
                      />
                    </Tooltip>
                  )}
                  {selectedTypeDetails.a_vue === 1 && (
                    <Tooltip title="Compte disponible à vue">
                      <Chip 
                        label="À vue" 
                        color="primary" 
                        size="small"
                      />
                    </Tooltip>
                  )}
                  <Chip 
                    label={selectedTypeDetails.actif ? 'Actif' : 'Inactif'} 
                    color={selectedTypeDetails.actif ? 'success' : 'error'} 
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
              
              {/* Affichage de la nature du solde */}
              {selectedChapitre && (
                <Card sx={{ mt: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Nature du solde
                    </Typography>
                    <Chip 
                    label= {natureSolde || 'Non spécifiée'}
                    color={selectedTypeDetails.actif ? 'secondary' : 'error'} 
                    sx={{ 
                      fontSize: '1.2rem',
                      height: 40,
                      '& .MuiChip-label': {
                        padding: '0 16px'
                      }
                    }}                 
                    variant="outlined"
                  />
                  </CardContent>
                </Card>
              )}
              
              {/* Afficher le nombre de paramètres détectés */}
              {categorizedParams && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<AttachMoney />}
                    label={`${fraisActiveInactive.active.length} frais actifs`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    icon={<AccountBalance />}
                    label={`${commissionsActiveInactive.active.length} commissions`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    icon={<Settings />}
                    label={`${caracteristiquesActiveInactive.active.length} caractéristiques`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Accordéon pour les paramètres détaillés */}
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Settings sx={{ mr: 1 }} />
                Détails des paramètres ({Object.keys(selectedTypeDetails).length - 8} paramètres détectés)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* Frais actifs */}
                {fraisActiveInactive.active.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                          <AttachMoney sx={{ mr: 1, fontSize: 18 }} />
                          Frais actifs ({fraisActiveInactive.active.length})
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              {fraisActiveInactive.active.map(({ key, value, label }) => (
                                <TableRow key={key}>
                                  <TableCell sx={{ fontWeight: 'medium' }}>
                                    <Tooltip title={key}>
                                      <span>{label}</span>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell align="right">
                                    {key.includes('_actif') ? (
                                      <Chip 
                                        label={formatValue(value)} 
                                        color="success" 
                                        size="small"
                                      />
                                    ) : (
                                      <Chip 
                                        label={formatsolde(value)} 
                                        color="primary" 
                                        size="small"
                                      />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Commissions actives */}
                {commissionsActiveInactive.active.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                          <AccountBalance sx={{ mr: 1, fontSize: 18 }} />
                          Commissions actives ({commissionsActiveInactive.active.length})
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              {commissionsActiveInactive.active.map(({ key, value, label }) => (
                                <TableRow key={key}>
                                  <TableCell sx={{ fontWeight: 'medium' }}>
                                    <Tooltip title={key}>
                                      <span>{label}</span>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip 
                                      label={
                                        key.includes('taux') ? 
                                        formatPourcentage(value) : 
                                        key.includes('commission') || key.includes('seuil') ? 
                                        formatsolde(value) : 
                                        formatValue(value)
                                      } 
                                      color={
                                        key.includes('penalite') ? 'error' : 
                                        key.includes('taux') ? 'success' : 
                                        'secondary'
                                      } 
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Caractéristiques */}
                {caracteristiquesActiveInactive.active.length > 0 && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                          <Info sx={{ mr: 1, fontSize: 18 }} />
                          Caractéristiques ({caracteristiquesActiveInactive.active.length})
                        </Typography>
                        <Grid container spacing={2}>
                          {caracteristiquesActiveInactive.active.map(({ key, value, label }) => {
                            // Afficher heure_calcul_interet et frequence_calcul_interet seulement si interets_actifs = 1
                            if ((key === 'heure_calcul_interet' || key === 'frequence_calcul_interet') && 
                                selectedTypeDetails?.interets_actifs !== 1) {
                              return null;
                            }
                            
                            return (
                              <Grid item xs={12} sm={6} md={3} key={key}>
                                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                  <Tooltip title={key}>
                                    <Typography variant="caption" color="text.secondary">
                                      {label}
                                    </Typography>
                                  </Tooltip>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                                    {key.includes('heure') ? value : 
                                     key.includes('minimum') ? formatsolde(value) : 
                                     formatValue(value)}
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Informations sur les données */}
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Données dynamiques :</strong> Ce composant affiche automatiquement tous les paramètres 
                      disponibles pour ce type de compte. {Object.keys(selectedTypeDetails).length - 8} paramètres ont été détectés.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </AccordionDetails>
            
          </Accordion>

          {/* Configuration du compte */}
          <Card variant="outlined" sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Configuration du compte
            </Typography>
            
            <Grid container spacing={3}>
              {/* Champ solde */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="solde initial (FCFA)"
                  type="number"
                  value={options.solde || ''}
                  onChange={handleInputChange('solde')}
                  inputProps={{
                    min: 0,
                    step: 1000
                  }}
                  helperText={
                    selectedTypeDetails.minimum_compte && selectedTypeDetails.minimum_compte !== '0.00' 
                      ? `Recommandé: ${formatsolde(selectedTypeDetails.minimum_compte)}`
                      : "Laissez vide si aucun solde initial"
                  }
                />
              </Grid>

              {/* Champ Durée (conditionnel) */}
              {selectedTypeDetails.necessite_duree && (
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
              )}

              {/* Module pour comptes islamiques */}
              {selectedTypeDetails.est_islamique && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Module *</InputLabel>
                    <Select
                      value={options.module || MODULES[3]}
                      onChange={(e) => onChange('options', { ...options, module: e.target.value as string })}
                      label="Module *"
                      required
                    >
                      {MODULES.map((module, index) => (
                        <MenuItem key={index} value={module}>
                          {module}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>

            {/* Bouton de validation */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleValidateStep2}
                disabled={validating || !selectedType || !selectedChapitre}
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
                <li>solde initial renseigné</li>
                <li>Chapitre comptable sélectionné</li>
                {selectedTypeDetails.necessite_duree && (
                  <li>Durée de blocage définie</li>
                )}
                {selectedTypeDetails.est_islamique && (
                  <li>Module sélectionné pour compte islamique</li>
                )}
              </ul>
            </Alert>
          </Card>
        </>
      )}
    </Box>
  );
};

export default Step2AccountType;