import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { api } from '../../services/api/clientApi';

// Définition du type Compte basé sur la structure du service
interface Mandataire {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string;
  relation?: string;
  // Propriétés du mandataire si nécessaire
}

interface Client {
  id?: number;
  num_client?: string;
  type_client?: string;
  telephone?: string;
  email?: string;
  adresse_ville?: string;
  adresse_quartier?: string;
  bp?: string;
  pays_residence?: string;
  prenom?: string;
  nom?: string;
}

interface CompteType {
  id: number;
  numero_compte: string;
  client_id: number;
  type_compte_id: number;
  chapitre_comptable_id?: string;
  solde: number | string;
  solde_disponible: number | string;
  solde_bloque: number | string;
  devise: string;
  gestionnaire_nom: string;
  gestionnaire_prenom: string;
  gestionnaire_code: string;
  rubriques_mata: Record<string, any> | null;
  duree_blocage_mois: number | null;
  statut: 'actif' | 'inactif' | 'cloture' | 'suspendu';
  date_ouverture: string;
  date_cloture: string | null;
  notice_acceptee: boolean;
  date_acceptation_notice: string | null;
  observations: string | null;
  mandataires?: Mandataire[];
  client?: Client;
}

const compteService = {
  updateCompte: (id: number, data: Partial<CompteType>): Promise<CompteType> => {
    return api.put(`/comptes/${id}`, data).then(response => response.data);
  }
};

interface ModifierCompteModalProps {
  open: boolean;
  onClose: () => void;
  compte: CompteType | null;
  onUpdate: (compte: CompteType) => void;
}

// Liste des statuts possibles
const STATUTS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'cloture', label: 'Clôturé' },
];

// Liste des devises (à adapter selon vos besoins)
const DEVISES = [
  { value: 'FCFA', label: 'FCFA' },
  { value: 'EURO', label: 'EURO' },
  { value: 'DOLLAR', label: 'DOLLAR' },
];

interface FormValues {
  solde: number | string;
  solde_disponible: number | string;
  solde_bloque: number | string;
  devise: string;
  statut: string;
  gestionnaire_nom: string;
  gestionnaire_prenom: string;
  gestionnaire_code: string;
  observations: string | null;
  telephone: string;
  email: string;
  adresse_ville: string;
  adresse_quartier: string;
  bp: string;
  pays_residence: string;
  duree_blocage_mois: number | null;
  commission_retrait: number | string;
  commission_sms: number | string;
  taux_interet_annuel: number | string;
}

const validationSchema = Yup.object({
  solde: Yup.number().required('Le solde est requis').min(0, 'Le solde ne peut pas être négatif'),
  solde_disponible: Yup.number().min(0, 'Le solde disponible ne peut pas être négatif'),
  solde_bloque: Yup.number().min(0, 'Le solde bloqué ne peut pas être négatif'),
  duree_blocage_mois: Yup.number()
    .nullable()
    .integer('La durée doit être un nombre entier')
    .min(3, 'La durée minimale est de 3 mois')
    .max(12, 'La durée maximale est de 12 mois')
    .typeError('La durée doit être un nombre'),
  devise: Yup.string()
    .required('La devise est requise')
    .oneOf(['FCFA', 'EURO', 'DOLLAR', 'POUND'], 'La devise doit être : FCFA, EURO, DOLLAR ou POUND')
    .transform((value) => value ? value.toUpperCase() : value),
  statut: Yup.string().required('Le statut est requis'),
  gestionnaire_nom: Yup.string().required('Le nom du gestionnaire est requis'),
  gestionnaire_prenom: Yup.string().required('Le prénom du gestionnaire est requis'),
  gestionnaire_code: Yup.string().required('Le code gestionnaire est requis'),
  observations: Yup.string().nullable(),
  telephone: Yup.string().required('Le téléphone est requis'),
  email: Yup.string().email('Email invalide').required('L\'email est requis'),
  adresse_ville: Yup.string().required('La ville est requise'),
  adresse_quartier: Yup.string().required('Le quartier est requis'),
  bp: Yup.string().required('La boîte postale est requise'),
  pays_residence: Yup.string().required('Le pays de résidence est requis'),
  commission_retrait: Yup.number().min(0, 'La commission retrait ne peut pas être négative').nullable(),
  commission_sms: Yup.number().min(0, 'La commission SMS ne peut pas être négative').nullable(),
  taux_interet_annuel: Yup.number().min(0, 'Le taux intérêt ne peut pas être négatif').nullable(),
});

const ModifierCompteModal: React.FC<ModifierCompteModalProps> = ({ 
  open, 
  onClose, 
  compte: initialCompte,
  onUpdate 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik<FormValues>({
    initialValues: {
      solde: initialCompte?.solde || 0,
      solde_disponible: initialCompte?.solde_disponible || 0,
      solde_bloque: initialCompte?.solde_bloque || 0,
      devise: initialCompte?.devise || 'XOF',
      statut: initialCompte?.statut || 'actif',
      gestionnaire_nom: initialCompte?.gestionnaire_nom || '',
      gestionnaire_prenom: initialCompte?.gestionnaire_prenom || '',
      gestionnaire_code: initialCompte?.gestionnaire_code || '',
      observations: initialCompte?.observations || null,
      telephone: initialCompte?.client?.telephone || '',
      email: initialCompte?.client?.email || '',
      adresse_ville: initialCompte?.client?.adresse_ville || '',
      adresse_quartier: initialCompte?.client?.adresse_quartier || '',
      bp: initialCompte?.client?.bp || '',
      pays_residence: initialCompte?.client?.pays_residence || '',
      duree_blocage_mois: initialCompte?.duree_blocage_mois || null,
      commission_retrait: (initialCompte as any)?.commission_retrait || '',
      commission_sms: (initialCompte as any)?.commission_sms || '',
      taux_interet_annuel: (initialCompte as any)?.taux_interet_annuel || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!initialCompte) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Valider duree_blocage_mois
        let dureeBlocageMois: number | null = null;
        if (values.duree_blocage_mois !== null && values.duree_blocage_mois !== undefined && values.duree_blocage_mois !== '') {
          // Convertir en nombre et vérifier que c'est un entier valide
          const duree = parseInt(values.duree_blocage_mois.toString(), 10);
          if (isNaN(duree) || duree < 3 || duree > 12) {
            throw new Error('La durée de blocage doit être un nombre entier entre 3 et 12 mois');
          }
          dureeBlocageMois = duree;
        }
        
        // Normaliser la devise en majuscules
        const updatedValues = {
          ...values,
          devise: values.devise ? values.devise.toUpperCase() : values.devise,
          duree_blocage_mois: dureeBlocageMois
        };
        
        // Préparer uniquement les champs attendus par l'API
        const dataToSend: Record<string, any> = {
          // Champs autorisés par UpdateCompteRequest
          devise: updatedValues.devise,
          statut: updatedValues.statut as 'actif' | 'inactif' | 'suspendu',
          gestionnaire_nom: updatedValues.gestionnaire_nom || null,
          gestionnaire_prenom: updatedValues.gestionnaire_prenom || null,
          gestionnaire_code: updatedValues.gestionnaire_code || null,
          rubriques_mata: initialCompte.rubriques_mata || {},
          observations: updatedValues.observations || null,
        };

        // Ajouter duree_blocage_mois uniquement s'il a une valeur
        if (dureeBlocageMois !== null) {
          // S'assurer que la valeur est un nombre entier et la convertir explicitement
          dataToSend.duree_blocage_mois = Math.floor(Number(dureeBlocageMois));
        } else {
          // Si la durée de blocage est null ou undefined, l'exclure complètement
          delete dataToSend.duree_blocage_mois;
        }

        // Mise à jour séparée des informations du client
        const clientData = {
          telephone: values.telephone,
          email: values.email,
          adresse_ville: values.adresse_ville,
          adresse_quartier: values.adresse_quartier,
          bp: values.bp,
          pays_residence: values.pays_residence,
        };

        // Envoyer uniquement les données autorisées
        const updatedCompte = await compteService.updateCompte(initialCompte.id, dataToSend);
        
        onUpdate({
          ...initialCompte,
          ...updatedCompte,
        });
        
        onClose();
      } catch (err: any) {
        console.error('Erreur lors de la mise à jour du compte:', err);
        
        // Afficher le message d'erreur détaillé s'il est disponible
        if (err.response?.data?.message) {
          setError(`Erreur: ${err.response.data.message}`);
        } else if (err.message) {
          setError(`Erreur: ${err.message}`);
        } else {
          setError('Une erreur est survenue lors de la mise à jour du compte');
        }
      } finally {
        setLoading(false);
      }
    },
  });

  if (!initialCompte) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Modifier le compte {initialCompte.numero_compte}</Typography>
            <IconButton onClick={onClose} size="small" disabled={loading}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {error && (
            <Box mb={2} color="error.main">
              <Typography color="error">{error}</Typography>
            </Box>
          )}
          
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Informations générales
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
              {/* Client */}
              <TextField
                label="Client"
                value={`${initialCompte.client?.prenom || ''} ${initialCompte.client?.nom || ''}`.trim() || 'Non spécifié'}
                fullWidth
                margin="normal"
                disabled
              />

              {/* Type de compte */}
              <TextField
                label="Type de compte"
                value={initialCompte.type_compte_id || 'Non spécifié'}
                fullWidth
                margin="normal"
                disabled
              />

              {/* Chapitre comptable */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Chapitre Comptable:
                </Typography>
                <Typography variant="body2">
                  {initialCompte.chapitre_comptable_id ? 
                    `${initialCompte.chapitre_comptable_id} - Chapitre` : 'Non défini'}
                </Typography>
              </Box>

              {/* Gestionnaire Prénom */}
              <TextField
                label="Prénom du gestionnaire"
                name="gestionnaire_prenom"
                value={formik.values.gestionnaire_prenom}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.gestionnaire_prenom && Boolean(formik.errors.gestionnaire_prenom)}
                helperText={formik.touched.gestionnaire_prenom && formik.errors.gestionnaire_prenom}
                fullWidth
                margin="normal"
              />

              {/* Gestionnaire Nom */}
              <TextField
                label="Nom du gestionnaire"
                name="gestionnaire_nom"
                value={formik.values.gestionnaire_nom}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.gestionnaire_nom && Boolean(formik.errors.gestionnaire_nom)}
                helperText={formik.touched.gestionnaire_nom && formik.errors.gestionnaire_nom}
                fullWidth
                margin="normal"
              />

              {/* Code gestionnaire */}
              <TextField
                label="Code gestionnaire"
                name="gestionnaire_code"
                value={formik.values.gestionnaire_code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.gestionnaire_code && Boolean(formik.errors.gestionnaire_code)}
                helperText={formik.touched.gestionnaire_code && formik.errors.gestionnaire_code}
                fullWidth
                margin="normal"
              />

              {/* Informations client */}
              <TextField
                label="ID Client"
                value={initialCompte.client?.id || 'Non spécifié'}
                fullWidth
                margin="normal"
                disabled
              />

              <TextField
                label="Numéro client"
                value={initialCompte.client?.num_client || 'Non spécifié'}
                fullWidth
                margin="normal"
                disabled
              />

              <TextField
                label="Type de client"
                value={initialCompte.client?.type_client || 'Non spécifié'}
                fullWidth
                margin="normal"
                disabled
              />

              <TextField
                label="Téléphone"
                name="telephone"
                value={formik.values.telephone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.telephone && Boolean(formik.errors.telephone)}
                helperText={formik.touched.telephone && formik.errors.telephone}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Ville"
                name="adresse_ville"
                value={formik.values.adresse_ville}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.adresse_ville && Boolean(formik.errors.adresse_ville)}
                helperText={formik.touched.adresse_ville && formik.errors.adresse_ville}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Quartier"
                name="adresse_quartier"
                value={formik.values.adresse_quartier}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.adresse_quartier && Boolean(formik.errors.adresse_quartier)}
                helperText={formik.touched.adresse_quartier && formik.errors.adresse_quartier}
                fullWidth
                margin="normal"
              />

              <TextField
                label="BP"
                name="bp"
                value={formik.values.bp}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bp && Boolean(formik.errors.bp)}
                helperText={formik.touched.bp && formik.errors.bp}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Pays de résidence"
                name="pays_residence"
                value={formik.values.pays_residence}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.pays_residence && Boolean(formik.errors.pays_residence)}
                helperText={formik.touched.pays_residence && formik.errors.pays_residence}
                fullWidth
                margin="normal"
              />

              {/* Informations sur le compte */}
              <TextField
                label="Date d'ouverture"
                value={initialCompte.date_ouverture ? new Date(initialCompte.date_ouverture).toLocaleDateString() : 'Non spécifiée'}
                fullWidth
                margin="normal"
                disabled
              />

              <TextField
                label="Date de clôture"
                value={initialCompte.date_cloture ? new Date(initialCompte.date_cloture).toLocaleDateString() : 'Non spécifiée'}
                fullWidth
                margin="normal"
                disabled
              />

              <TextField
                label="Notice acceptée"
                value={initialCompte.notice_acceptee ? 'Oui' : 'Non'}
                fullWidth
                margin="normal"
                disabled
              />

              <TextField
                label="Date d'acceptation de la notice"
                value={initialCompte.date_acceptation_notice ? new Date(initialCompte.date_acceptation_notice).toLocaleDateString() : 'Non spécifiée'}
                fullWidth
                margin="normal"
                disabled
              />

              {/* Rubriques Mata */}
              {initialCompte.rubriques_mata && Object.keys(initialCompte.rubriques_mata).length > 0 && (
                <Box gridColumn="1 / -1">
                  <Typography variant="subtitle2" gutterBottom>
                    Rubriques Mata:
                  </Typography>
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 2,
                    p: 1, 
                    border: '1px solid #ddd', 
                    borderRadius: 1 
                  }}>
                    {Object.entries(initialCompte.rubriques_mata).map(([key, value]) => (
                      <Box key={key} p={1} bgcolor="#f5f5f5" borderRadius={1}>
                        <Typography variant="body2">
                          {key}: {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Durée de blocage */}
              <TextField
                label="Durée de blocage (mois)"
                name="duree_blocage_mois"
                type="number"
                value={formik.values.duree_blocage_mois || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.duree_blocage_mois && Boolean(formik.errors.duree_blocage_mois)}
                helperText={formik.touched.duree_blocage_mois && formik.errors.duree_blocage_mois}
                fullWidth
                margin="normal"
                inputProps={{ min: 3, max: 12, step: 1 }}
              />

              {/* Commissions et intérêts */}
              <Divider sx={{ my: 2 }}>Commissions et intérêts</Divider>

              <TextField
                label="Commission Retrait (FCFA)"
                name="commission_retrait"
                type="number"
                value={formik.values.commission_retrait || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.commission_retrait && Boolean(formik.errors.commission_retrait)}
                helperText={formik.touched.commission_retrait && formik.errors.commission_retrait}
                fullWidth
                margin="normal"
                inputProps={{ step: 0.01, min: 0 }}
              />

              <TextField
                label="Commission SMS (FCFA)"
                name="commission_sms"
                type="number"
                value={formik.values.commission_sms || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.commission_sms && Boolean(formik.errors.commission_sms)}
                helperText={formik.touched.commission_sms && formik.errors.commission_sms}
                fullWidth
                margin="normal"
                inputProps={{ step: 0.01, min: 0 }}
              />

              <TextField
                label="Taux Intérêt Annuel (%)"
                name="taux_interet_annuel"
                type="number"
                value={formik.values.taux_interet_annuel || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.taux_interet_annuel && Boolean(formik.errors.taux_interet_annuel)}
                helperText={formik.touched.taux_interet_annuel && formik.errors.taux_interet_annuel}
                fullWidth
                margin="normal"
                inputProps={{ step: 0.01, min: 0 }}
              />

              {/* Mandataires */}
              {initialCompte.mandataires && initialCompte.mandataires.length > 0 && (
                <Box gridColumn="1 / -1">
                  <Typography variant="subtitle2" gutterBottom>
                    Mandataires:
                  </Typography>
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: 2,
                    p: 1, 
                    border: '1px solid #ddd', 
                    borderRadius: 1 
                  }}>
                    {initialCompte.mandataires.map((mandataire, index) => (
                      <Box key={index} p={1} bgcolor="#f5f5f5" borderRadius={1}>
                        <Typography variant="body2">
                          <strong>{mandataire.prenom} {mandataire.nom}</strong>
                          {mandataire.relation && (
                            <>
                              <br />
                              Relation: {mandataire.relation}
                            </>
                          )}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Champs existants */}
              <TextField
                label="Numéro de compte"
                value={initialCompte.numero_compte}
                fullWidth
                margin="normal"
                disabled
              />
              
              <TextField
                label="Solde"
                name="solde"
                type="number"
                value={formik.values.solde}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.solde && Boolean(formik.errors.solde)}
                helperText={formik.touched.solde && formik.errors.solde}
                fullWidth
                margin="normal"
                disabled
              />
              
              <TextField
                label="Solde disponible"
                name="solde_disponible"
                type="number"
                value={formik.values.solde_disponible}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.solde_disponible && Boolean(formik.errors.solde_disponible)}
                helperText={formik.touched.solde_disponible && formik.errors.solde_disponible}
                fullWidth
                margin="normal"
                disabled
              />
              
              <TextField
                label="Solde bloqué"
                name="solde_bloque"
                type="number"
                value={formik.values.solde_bloque}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.solde_bloque && Boolean(formik.errors.solde_bloque)}
                helperText={formik.touched.solde_bloque && formik.errors.solde_bloque}
                fullWidth
                margin="normal"
                disabled
              />
              
              <FormControl 
                fullWidth 
                margin="normal"
                error={formik.touched.devise && Boolean(formik.errors.devise)}
              >
                <InputLabel>Devise</InputLabel>
                <Select
                  name="devise"
                  value={formik.values.devise}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={loading}
                  label="Devise"
                >
                  {DEVISES.map((devise) => (
                    <MenuItem key={devise.value} value={devise.value}>
                      {devise.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.devise && formik.errors.devise && (
                  <FormHelperText>{formik.errors.devise}</FormHelperText>
                )}
              </FormControl>
              
              <FormControl 
                fullWidth 
                margin="normal"
                error={formik.touched.statut && Boolean(formik.errors.statut)}
              >
                <InputLabel>Statut</InputLabel>
                <Select
                  name="statut"
                  value={formik.values.statut}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={loading}
                  label="Statut"
                >
                  {STATUTS.map((statut) => (
                    <MenuItem key={statut.value} value={statut.value}>
                      {statut.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.statut && formik.errors.statut && (
                  <FormHelperText>{formik.errors.statut}</FormHelperText>
                )}
              </FormControl>

              {/* Observations */}
              <TextField
                label="Observations"
                name="observations"
                value={formik.values.observations || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.observations && Boolean(formik.errors.observations)}
                helperText={formik.touched.observations && formik.errors.observations}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={onClose}
            sx={{
              background: 'linear-gradient(135deg, #c5500ce7 0%, #de760dff 100%)',
              borderRadius: '50px',
              padding: '10px 30px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#ffff',
              '&.Mui-disabled': {
                background: '#e0e0e0',
                color: '#ffff',
                boxShadow: 'none'
              }
            }} 
            color="inherit"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !formik.isValid || !formik.dirty}
            sx={{
              background: 'linear-gradient(135deg, #2b56e2e7 0%, #110ddeff 100%)',
              borderRadius: '50px',
              padding: '10px 30px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#ffff',
              '&.Mui-disabled': {
                background: '#e0e0e0',
                color: '#ffff',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ModifierCompteModal;