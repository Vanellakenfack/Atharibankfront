import React, { useState } from 'react';
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
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

// Valeurs par défaut pour un mandataire
const defaultMandataire = {
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
  situation_familiale: '',
  nom_conjoint: '',
  date_naissance_conjoint: null,
  lieu_naissance_conjoint: '',
  cni_conjoint: '',
  signature: null,
};

const Step3Mandataires = ({ 
  mandataire1 = defaultMandataire, 
  mandataire2 = defaultMandataire, 
  onChange 
}) => {
  const [activeMandataire, setActiveMandataire] = useState(1);

  // Fusionner avec les valeurs par défaut pour éviter undefined
  const safeMandataire1 = { ...defaultMandataire, ...mandataire1 };
  const safeMandataire2 = { ...defaultMandataire, ...mandataire2 };

  const handleChange = (mandataireNumber, field, value) => {
    const currentMandataire = mandataireNumber === 1 ? safeMandataire1 : safeMandataire2;
    const updatedMandataire = {
      ...currentMandataire,
      [field]: value
    };
    
    onChange(mandataireNumber === 1 ? 'mandataire1' : 'mandataire2', updatedMandataire);
  };

  const handleSignatureUpload = (mandataireNumber, file) => {
    if (file) {
      handleChange(mandataireNumber, 'signature', file);
    }
  };

  const renderMandataireForm = (mandataireNumber, data) => {
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
          <FormControl component="fieldset">
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

        {/* Date de naissance - CORRIGÉ */}
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

        {/* Situation familiale - CORRIGÉ: RadioGroup au lieu de Checkbox */}
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Situation familiale *</FormLabel>
            <RadioGroup
              row
              value={data.situation_familiale}
              onChange={(e) => handleChange(mandataireNumber, 'situation_familiale', e.target.value)}
            >
              {['marié', 'célibataire', 'divorcé', 'veuf/veuve'].map((status) => (
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
        {data.situation_familiale === 'marié' && (
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
            startIcon={<PhotoCamera />}
          >
            Télécharger la signature
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleSignatureUpload(mandataireNumber, e.target.files?.[0])}
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
                  >
                    Mandataire 1
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={activeMandataire === 2 ? "contained" : "outlined"}
                    onClick={() => setActiveMandataire(2)}
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
                    Mandataire 1
                  </Typography>
                  {safeMandataire1.noms ? (
                    <>
                      <Typography><strong>Nom:</strong> {safeMandataire1.noms} {safeMandataire1.prenoms}</Typography>
                      <Typography><strong>CNI:</strong> {safeMandataire1.cni || 'Non renseigné'}</Typography>
                      <Typography><strong>Téléphone:</strong> {safeMandataire1.telephone || 'Non renseigné'}</Typography>
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
                    Mandataire 2
                  </Typography>
                  {safeMandataire2.noms ? (
                    <>
                      <Typography><strong>Nom:</strong> {safeMandataire2.noms} {safeMandataire2.prenoms}</Typography>
                      <Typography><strong>CNI:</strong> {safeMandataire2.cni || 'Non renseigné'}</Typography>
                      <Typography><strong>Téléphone:</strong> {safeMandataire2.telephone || 'Non renseigné'}</Typography>
                    </>
                  ) : (
                    <Typography color="textSecondary">Non renseigné</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Step3Mandataires;