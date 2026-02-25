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
import ArticleIcon from '@mui/icons-material/Article';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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
    cni_recto_url: string | null;
    cni_verso_url: string | null;
    autres_documents: File[];
    demande_ouverture_pdf: File | null;
    formulaire_ouverture_pdf: File | null;
  };
  engagementAccepted: boolean;
  clientSignature: File | null;
  clientSignatureUrl: string | null;
  onChange: (field: 'documents' | 'engagementAccepted' | 'clientSignature', value: any) => void;
  formData: CompteData;
  onSave: (result: any) => void;
  onPrevious: () => void;
  mode?: 'create' | 'edit';
}

const Step4Documents: React.FC<Step4DocumentsProps> = ({ 
  documents, 
  engagementAccepted, 
  clientSignature, 
  clientSignatureUrl,
  onChange,
  formData,
  onSave,
  onPrevious,
  mode = 'create'
}) => {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (field: 'cni_client' | 'autres' | 'demande_ouverture_pdf' | 'formulaire_ouverture_pdf', files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Vérifier la taille du fichier (8 Mo max)
    if (file.size > 8 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 8 Mo');
      return;
    }

    // Vérifier le type de fichier - pour les PDF, n'accepter que PDF
    if (field === 'demande_ouverture_pdf' || field === 'formulaire_ouverture_pdf') {
      if (file.type !== 'application/pdf') {
        alert('Le fichier doit être au format PDF');
        return;
      }
    } else {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Type de fichier non supporté. Utilisez PDF, JPG ou PNG.');
        return;
      }
    }

    if (field === 'cni_client') {
      onChange('documents', {
        ...documents,
        cni_client: file
      });
    } else if (field === 'autres') {
      onChange('documents', {
        ...documents,
        autres_documents: [...documents.autres_documents, file]
      });
    } else if (field === 'demande_ouverture_pdf') {
      onChange('documents', {
        ...documents,
        demande_ouverture_pdf: file
      });
    } else if (field === 'formulaire_ouverture_pdf') {
      onChange('documents', {
        ...documents,
        formulaire_ouverture_pdf: file
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

  const handleRemoveSpecificDocument = (field: 'demande_ouverture_pdf' | 'formulaire_ouverture_pdf') => {
    onChange('documents', {
      ...documents,
      [field]: null
    });
  };

  const handleRemoveCni = () => {
    onChange('documents', {
      ...documents,
      cni_client: null
    });
  };

  const handleSignatureUpload = (file: File | null) => {
    onChange('clientSignature', file);
  };

  const handleRemoveSignature = () => {
    onChange('clientSignature', null);
  };

  // Valider et enregistrer le compte
  const handleSaveCompte = async () => {
    // Seule validation : l'engagement doit être accepté
    if (!engagementAccepted) {
      setError('Vous devez accepter les conditions générales');
      return;
    }

    setConfirmOpen(true);
  };

  const confirmSave = async () => {
    setConfirmOpen(false);
    setSaving(true);
    setError(null);

    try {
      // Récupération de l'agence id
      const agencyId = formData.agency_id 
                  ?? formData.client?.agency_id 
                  ?? formData.client?.agence_id 
                  ?? null;
      if (!agencyId) {
        throw new Error("L'identifiant de l'agence est manquant.");
      }
      
      // Préparer les données complètes
      const compteData: CompteData = {
        ...formData,
        documents,
        engagementAccepted,
        clientSignature,
        clientSignatureUrl,
        agency_id: agencyId,
      };

      // Vérifier que accountType est défini
      if (!compteData.accountType) {
        throw new Error('Le type de compte n\'a pas été défini. Veuillez sélectionner un type de compte valide.');
      }

      // Préparer FormData
      const formDataToSend = compteService.prepareFormData(compteData);
      if (!formDataToSend.has('agency_id')) {
        formDataToSend.append('agency_id', String(agencyId));
      }

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
        {file.type === 'application/pdf' ? (
          <PictureAsPdfIcon sx={{ mr: 1, color: '#d32f2f' }} />
        ) : (
          <DescriptionIcon sx={{ mr: 1 }} />
        )}
        <Typography variant="body2">{file.name}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
          ({(file.size / 1024 / 1024).toFixed(2)} Mo)
        </Typography>
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
        Téléchargez les documents nécessaires pour l'ouverture du compte.
        <br />
        Formats acceptés: PDF, JPG, PNG (max 8 Mo chacun).
        <br />
        <strong>Note:</strong> Tous les documents sont optionnels sauf l'acceptation des conditions générales.
      </Alert>

      <Grid container spacing={3}>
        {/* Section Documents PDF */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ArticleIcon sx={{ mr: 1 }} />
                Documents PDF
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Ces documents peuvent être joints à la demande d'ouverture de compte. (Optionnels)
              </Typography>

              {/* Demande d'ouverture PDF */}
              <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography fontWeight="bold">
                      Demande d'ouverture (PDF)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Document formalisant la demande d'ouverture (optionnel)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    {!documents.demande_ouverture_pdf ? (
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        disabled={saving}
                        sx={{
                          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                          boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
                          border: 'none',
                          padding: '10px 16px',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1565c0 0%, #0a3d91 100%)',
                          }
                        }}
                      >
                        Télécharger la demande d'ouverture (PDF)
                        <VisuallyHiddenInput
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload('demande_ouverture_pdf', e.target.files)}
                        />
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PictureAsPdfIcon sx={{ mr: 2, color: '#d32f2f', fontSize: 30 }} />
                          <Box>
                            <Typography fontWeight="bold">
                              {documents.demande_ouverture_pdf.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(documents.demande_ouverture_pdf.size / 1024 / 1024).toFixed(2)} Mo • PDF
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveSpecificDocument('demande_ouverture_pdf')}
                          disabled={saving}
                          sx={{ color: '#d32f2f' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>

              {/* Formulaire d'ouverture PDF */}
              <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography fontWeight="bold">
                      Formulaire d'ouverture (PDF)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Formulaire officiel d'ouverture de compte (optionnel)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    {!documents.formulaire_ouverture_pdf ? (
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        disabled={saving}
                        sx={{
                          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                          boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
                          border: 'none',
                          padding: '10px 16px',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1565c0 0%, #0a3d91 100%)',
                          }
                        }}
                      >
                        Télécharger le formulaire d'ouverture (PDF)
                        <VisuallyHiddenInput
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload('formulaire_ouverture_pdf', e.target.files)}
                        />
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PictureAsPdfIcon sx={{ mr: 2, color: '#d32f2f', fontSize: 30 }} />
                          <Box>
                            <Typography fontWeight="bold">
                              {documents.formulaire_ouverture_pdf.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(documents.formulaire_ouverture_pdf.size / 1024 / 1024).toFixed(2)} Mo • PDF
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveSpecificDocument('formulaire_ouverture_pdf')}
                          disabled={saving}
                          sx={{ color: '#d32f2f' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CNI du client */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Documents d'identité
              </Typography>

              {/* CNI du client - avec options automatiques */}
              <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Typography fontWeight="bold">CNI du client</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Recto et verso ou document unique (optionnel)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  {/* Afficher les CNI automatiques si disponibles */}
                  {documents.cni_recto_url && documents.cni_verso_url && !documents.cni_client && (
                    <Box sx={{ mb: 2 }}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>CNI du client disponible automatiquement</strong>
                          <br />
                          Les CNI de {formData.client?.physique?.nom_prenoms} sont disponibles et seront utilisées si vous ne téléchargez pas de nouvelle CNI.
                        </Typography>
                      </Alert>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            border: '1px solid #e0e0e0', 
                            borderRadius: '4px', 
                            padding: '8px',
                            mb: 2
                          }}>
                            <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 1 }}>
                              CNI Recto
                            </Typography>
                            <img 
                              src={documents.cni_recto_url} 
                              alt="CNI Recto" 
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: 150,
                                display: 'block'
                              }}
                              onError={(e) => {
                                console.error('Erreur de chargement de l\'image CNI recto:', e);
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmFmYWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzg4OCI+Q05JIFJlY3RvPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            border: '1px solid #e0e0e0', 
                            borderRadius: '4px', 
                            padding: '8px',
                            mb: 2
                          }}>
                            <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 1 }}>
                              CNI Verso
                            </Typography>
                            <img 
                              src={documents.cni_verso_url} 
                              alt="CNI Verso" 
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: 150,
                                display: 'block'
                              }}
                              onError={(e) => {
                                console.error('Erreur de chargement de l\'image CNI verso:', e);
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmFmYWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzg4OCI+Q05JIFZlcnNvPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  
                  {/* Bouton pour télécharger une CNI manuelle */}
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
                      color:' #ffff',
                      mb: documents.cni_client ? 2 : 0
                    }}
                  >
                    Télécharger la CNI (PDF ou image)
                    <VisuallyHiddenInput
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('cni_client', e.target.files)}
                    />
                  </Button>
                  
                  {/* Afficher la CNI téléchargée manuellement */}
                  {documents.cni_client && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      {renderFilePreview(documents.cni_client)}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" color="success.main">
                          ✓ CNI téléchargée manuellement
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={handleRemoveCni}
                          disabled={saving}
                          sx={{ color: '#d32f2f' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
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
                Ajouter un document supplémentaire
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
                      {doc.type === 'application/pdf' ? (
                        <PictureAsPdfIcon sx={{ mr: 2, color: '#d32f2f' }} />
                      ) : (
                        <DescriptionIcon sx={{ mr: 2 }} />
                      )}
                      <ListItemText
                        primary={doc.name}
                        secondary={`${(doc.size / 1024 / 1024).toFixed(2)} Mo • ${doc.type.split('/')[1].toUpperCase()}`}
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
                Signature du client
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                Signature du client (optionnelle)
              </Typography>
              
              {/* Afficher la signature automatique si disponible */}
              {clientSignatureUrl && !clientSignature && (
                <Box sx={{ mb: 3 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Signature du client disponible</strong>
                      <br />
                      La signature de {formData.client?.physique?.nom_prenoms} est disponible et sera utilisée si vous ne téléchargez pas de nouvelle signature.
                    </Typography>
                  </Alert>
                  
                  <Box sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '4px', 
                    padding: '8px',
                    display: 'inline-block',
                    mb: 2
                  }}>
                    <img 
                      src={clientSignatureUrl} 
                      alt="Signature du client" 
                      style={{ 
                        maxWidth: 300, 
                        maxHeight: 150,
                        display: 'block'
                      }}
                      onError={(e) => {
                        console.error('Erreur de chargement de l\'image:', e);
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmFmYWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzg4OCI+U2lnbmF0dXJlIGR1IGNsaWVudDwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  </Box>
                </Box>
              )}
              
              {/* Bouton pour télécharger une signature manuelle */}
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
                  color:' #ffff',
                  mb: 2
                }}
              >
                Télécharger la signature
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSignatureUpload(e.target.files?.[0] || null)}
                />
              </Button>
              
              {/* Afficher la signature téléchargée manuellement */}
              {clientSignature && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'inline-block' }}>
                  <Box sx={{ 
                    border: '1px solid #2196F3', 
                    borderRadius: '4px', 
                    padding: '8px',
                    display: 'inline-block',
                    position: 'relative'
                  }}>
                    <img 
                      src={URL.createObjectURL(clientSignature)} 
                      alt="Signature téléchargée" 
                      style={{ 
                        maxWidth: 300, 
                        maxHeight: 150,
                        display: 'block'
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleRemoveSignature}
                      disabled={saving}
                      sx={{ 
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        bgcolor: 'white',
                        color: '#d32f2f',
                        '&:hover': { bgcolor: '#ffebee' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    ✓ Signature téléchargée manuellement
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
                Notice d'engagement *
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
          <Alert 
            severity={engagementAccepted ? "success" : "warning"}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Récapitulatif des documents
            </Typography>
            <List dense>
              <ListItem>
                <Typography>
                  <strong>Demande d'ouverture (PDF):</strong> 
                  {documents.demande_ouverture_pdf ? '✓ Fournie' : '✗ Non fournie (optionnel)'}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  <strong>Formulaire d'ouverture (PDF):</strong> 
                  {documents.formulaire_ouverture_pdf ? '✓ Fourni' : '✗ Non fourni (optionnel)'}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  <strong>CNI du client:</strong> 
                  {documents.cni_client ? '✓ Fournie (manuelle)' : 
                   documents.cni_recto_url && documents.cni_verso_url ? '✓ Disponible (profil client)' : '✗ Non fournie (optionnel)'}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  <strong>Documents supplémentaires:</strong> {documents.autres_documents.length} document(s)
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  <strong>Signature client:</strong> 
                  {clientSignature ? (
                    '✓ Fournie (manuelle)'
                  ) : clientSignatureUrl ? (
                    '✓ Disponible (profil client)'
                  ) : '✗ Non fournie (optionnel)'}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  <strong>Acceptation des conditions:</strong> {engagementAccepted ? '✓ Acceptée' : '✗ Requise'}
                </Typography>
              </ListItem>
            </List>
          </Alert>
        </Grid>

        {/* Bouton d'enregistrement final */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onPrevious}
              disabled={saving}
              sx={{
                color: '#2e787d',
                borderColor: '#2e787d',
                '&:hover': {
                  backgroundColor: 'rgba(46, 120, 125, 0.04)',
                  borderColor: '#1a4c4f',
                },
                padding: '12px 30px',
                fontSize: '1rem',
              }}
            >
              Retour
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveCompte}
              disabled={saving || !engagementAccepted} // UNIQUEMENT désactivé si saving OU engagement non accepté
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                color: 'white',
                padding: '12px 30px',
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)',
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e'
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
          
          {/* Information sur les documents (message informatif) */}
          {!documents.demande_ouverture_pdf && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Aucune demande d'ouverture PDF n'a été jointe.
            </Alert>
          )}
          
          {!documents.formulaire_ouverture_pdf && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Aucun formulaire d'ouverture PDF n'a été joint.
            </Alert>
          )}
          
          {!documents.cni_client && !documents.cni_recto_url && !documents.cni_verso_url && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Aucune CNI n'est disponible.
            </Alert>
          )}
          
          {!clientSignature && !clientSignatureUrl && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Aucune signature n'est disponible.
            </Alert>
          )}
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