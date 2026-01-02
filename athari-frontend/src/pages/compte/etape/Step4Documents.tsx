// src/pages/compte/etape/Step4Documents.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import { compteService, type CompteData } from '../../../services/api/compteApi';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface Step4DocumentsProps {
  documents: {
    cni_client: File | null;
    autres_documents: File[];
  };
  engagementAccepted: boolean;
  clientSignature: File | null;
  onChange: (field: 'documents' | 'engagementAccepted' | 'clientSignature', value: any) => void;
  formData: CompteData;
  onSave: (result: any) => void;
  mode?: 'create' | 'edit';
}

const Step4Documents: React.FC<Step4DocumentsProps> = ({ 
  documents, 
  engagementAccepted, 
  clientSignature, 
  onChange,
  formData,
  onSave,
  mode = 'create'
}) => {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (field: 'cni_client' | 'autres', files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Vérifier la taille du fichier (8 Mo max)
    if (file.size > 8 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 8 Mo');
      return;
    }

    // Vérifier le type de fichier
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Type de fichier non supporté. Utilisez PDF, JPG ou PNG.');
      return;
    }

    if (field === 'cni_client') {
      onChange('documents', {
        ...documents,
        cni_client: file
      });
    } else {
      onChange('documents', {
        ...documents,
        autres_documents: [...documents.autres_documents, file]
      });
    }
  };

  const handleRemoveDocument = (index: number) => {
    const newDocuments = [...documents.autres_documents];
    newDocuments.splice(index, 1);
    onChange('documents', {
      ...documents,
      autres_documents: newDocuments
    });
  };

  const handleSignatureUpload = (file: File | null) => {
    onChange('clientSignature', file);
  };

  // Valider et enregistrer le compte
  const handleSaveCompte = async () => {
    // Validation finale
    if (!engagementAccepted) {
      setError('Vous devez accepter les conditions générales');
      return;
    }

    if (!documents.cni_client) {
      setError('La CNI du client est requise');
      return;
    }

    if (!clientSignature) {
      setError('La signature du client est requise');
      return;
    }

    setConfirmOpen(true);
  };

  const confirmSave = async () => {
    setConfirmOpen(false);
    setSaving(true);
    setError(null);

    try {
      // Log pour déboguer
      console.log('Données du formulaire avant préparation:', {
        ...formData,
        documents,
        engagementAccepted,
        clientSignature,
        // Ne pas logger les fichiers pour éviter les problèmes de sérialisation
        documentsPreview: documents ? {
          cni_client: documents.cni_client ? documents.cni_client.name : null,
          autres_documents: documents.autres_documents.map(d => d.name)
        } : null,
        clientSignaturePreview: clientSignature ? clientSignature.name : null
      });

      // Préparer les données complètes
      const compteData: CompteData = {
        ...formData,
        documents,
        engagementAccepted,
        clientSignature
      };

      // Vérifier que accountType est défini
      if (!compteData.accountType) {
        throw new Error('Le type de compte n\'a pas été défini. Veuillez sélectionner un type de compte valide.');
      }

      // Préparer FormData
      console.log('Préparation des données avec accountType:', compteData.accountType);
      const formDataToSend = compteService.prepareFormData(compteData);

      // Envoyer au backend
      const result = await compteService.createCompte(formDataToSend);

      // Appeler le callback de succès
      if (onSave) {
        onSave(result);
      }

      // Afficher le succès et rediriger après un court délai
      setSuccessOpen(true);
      
      // Rediriger vers la liste des comptes après 2 secondes
      setTimeout(() => {
        navigate('/liste-des-comptes');
      }, 2000);

    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement:', err);
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const renderFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <Box sx={{ maxWidth: 200, maxHeight: 200, mt: 1 }}>
          <img 
            src={URL.createObjectURL(file)} 
            alt="Preview" 
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <DescriptionIcon sx={{ mr: 1 }} />
        <Typography>{file.name}</Typography>
      </Box>
    );
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Étape 4: Documents & Engagement
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        Téléchargez les documents nécessaires. Formats acceptés: PDF, JPG, PNG (max 8 Mo chacun).
      </Alert>

      <Grid container spacing={3}>
        {/* Section Documents */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Documents requis
              </Typography>

              {/* CNI du client */}
              <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Typography fontWeight="bold">CNI du client *</Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    disabled={saving}
                    sx={{
                      background: 'linear-gradient(135deg, #62bfc6ff 0%, #2e787d69 100%)',
                      boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
                      border: 'none',
                      padding: '10px 16px',
                      color:' #ffff'
                    }}
                  >
                    Télécharger la CNI
                    <VisuallyHiddenInput
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('cni_client', e.target.files)}
                    />
                  </Button>
                  {documents.cni_client && (
                    <Box sx={{ mt: 2 }}>
                      {renderFilePreview(documents.cni_client)}
                      <Typography variant="body2" color="success.main">
                        ✓ CNI téléchargée ({documents.cni_client.name})
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>

              {/* Autres documents */}
              <Typography variant="subtitle1" gutterBottom>
                Autres documents (optionnels)
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={saving}
                sx={{ 
                  mb: 2,
                  background: 'linear-gradient(135deg, #62bfc6ff 0%, #2e787d69 100%)',
                  boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
                  border: 'none',
                  padding: '10px 16px',
                  color:' #ffff'
                }}
              >
                Ajouter un document
                <VisuallyHiddenInput
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('autres', e.target.files)}
                  multiple
                />
              </Button>

              {documents.autres_documents.length > 0 && (
                <List dense>
                  {documents.autres_documents.map((doc, index) => (
                    <ListItem key={index}>
                      <DescriptionIcon sx={{ mr: 2 }} />
                      <ListItemText
                        primary={doc.name}
                        secondary={`${(doc.size / 1024 / 1024).toFixed(2)} Mo`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveDocument(index)}
                          disabled={saving}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Signature du client */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Signature du client *
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={saving}
                sx={{
                  background: 'linear-gradient(135deg, #62bfc6ff 0%, #2e787d69 100%)',
                  boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
                  border: 'none',
                  padding: '10px 16px',
                  color:' #ffff'
                }}
              >
                Télécharger la signature
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSignatureUpload(e.target.files?.[0] || null)}
                />
              </Button>
              {clientSignature && (
                <Box sx={{ mt: 2 }}>
                  <img 
                    src={URL.createObjectURL(clientSignature)} 
                    alt="Signature" 
                    style={{ maxWidth: 300, maxHeight: 150, border: '1px solid #ccc' }}
                  />
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    ✓ Signature téléchargée
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notice d'engagement */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notice d'engagement
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 3, mb: 3, maxHeight: 300, overflow: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom>
                  CONDITIONS GÉNÉRALES D'OUVERTURE ET DE FONCTIONNEMENT DU COMPTE
                </Typography>
                
                <Typography paragraph>
                  1. J'atteste / nous attestons que les informations fournies dans le présent document sont correctes et seront d'actualités d'ouverture du compte.
                </Typography>
                
                <Typography paragraph>
                  2. J'ai / nous avons également pris connaissance des termes et conditions de la micro finance ainsi que les clauses contenues dans la brochure jointe au présent formulaire.
                </Typography>
                
                <Typography paragraph>
                  3. En cas d'absence d'une telle brochure, je m'engage / nous nous engageons à respecter les termes correspondants aux services de la micro finance auxquelles j'ai / nous avons souscrits.
                </Typography>
                
                <Typography paragraph>
                  4. Je demande / nous demandons par conséquent l'ouverture d'un compte et la fourniture des services ci-dessus sélectionnés, accompagné des informations correspondantes.
                </Typography>
                
                <Typography paragraph>
                  5. Je reconnais avoir reçu et lu le document d'information précontractuelle et les conditions générales.
                </Typography>
              </Paper>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={engagementAccepted}
                    onChange={(e) => onChange('engagementAccepted', e.target.checked)}
                    color="primary"
                    disabled={saving}
                  />
                }
                label="Je reconnais avoir lu et accepté les conditions générales d'ouverture de compte et m'engage à les respecter."
                required
              />

              {!engagementAccepted && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Vous devez accepter les conditions générales pour continuer.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Récapitulatif */}
        <Grid item xs={12}>
          <Alert severity={engagementAccepted && documents.cni_client && clientSignature ? "success" : "warning"}>
            <Typography variant="subtitle1" gutterBottom>
              Récapitulatif des documents
            </Typography>
            <List dense>
              <ListItem>
                <Typography>
                  <strong>CNI du client:</strong> {documents.cni_client ? '✓ Fournie' : '✗ Manquante'}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  <strong>Documents supplémentaires:</strong> {documents.autres_documents.length} document(s)
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  <strong>Signature client:</strong> {clientSignature ? '✓ Fournie' : '✗ Manquante'}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  <strong>Acceptation des conditions:</strong> {engagementAccepted ? '✓ Acceptée' : '✗ En attente'}
                </Typography>
              </ListItem>
            </List>
          </Alert>
        </Grid>

        {/* Bouton d'enregistrement final */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSaveCompte}
              disabled={saving || !engagementAccepted || !documents.cni_client || !clientSignature}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                color: 'white',
                padding: '12px 30px',
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)',
                }
              }}
            >
              {saving ? 'Enregistrement en cours...' : 'Créer le Compte'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Dialog de confirmation */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmer la création du compte</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir créer ce compte ? Cette action est irréversible.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Vérifiez que toutes les informations sont correctes avant de continuer.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={saving}>
            Annuler
          </Button>
          <Button 
            onClick={confirmSave} 
            variant="contained" 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              color: 'white',
            }}
          >
            {saving ? 'Création...' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de succès */}
      <Snackbar
        open={successOpen}
        autoHideDuration={6000}
        onClose={() => setSuccessOpen(false)}
        message="Compte créé avec succès !"
      />
    </div>
  );
};

export default Step4Documents;