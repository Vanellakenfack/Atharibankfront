import React, { useState } from 'react';
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
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import { styled } from '@mui/material/styles';

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

const Step4Documents = ({ documents, engagementAccepted, clientSignature, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (field, files) => {
    const file = files[0];
    if (!file) return;

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

  const handleRemoveDocument = (index) => {
    const newDocuments = [...documents.autres_documents];
    newDocuments.splice(index, 1);
    onChange('documents', {
      ...documents,
      autres_documents: newDocuments
    });
  };

  const handleSignatureUpload = (file) => {
    onChange('clientSignature', file);
  };

  const renderFilePreview = (file) => {
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
                sx={{ mb: 2 }}
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
                Signature du client
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
              >
                Télécharger la signature
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSignatureUpload(e.target.files[0])}
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
          <Alert severity="success">
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
      </Grid>
    </div>
  );
};

export default Step4Documents;