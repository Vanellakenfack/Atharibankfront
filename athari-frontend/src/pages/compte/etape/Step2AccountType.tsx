import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent,
  Typography,
  Box,
  Alert
} from '@mui/material';

const ACCOUNT_TYPES = {
  'Courant': {
    label: 'Compte Courant',
    subTypes: [],
    fees: {
      opening: 3500,
      monthly: 2000,
      sms: 200
    }
  },
  'Épargne': {
    label: 'Compte d\'Épargne',
    subTypes: ['Classique', 'Family', 'Logement', 'Participative', 'Garantie'],
    fees: {
      opening: 500,
      monthly: 0,
      sms: 0
    }
  },
  'Mata Boost': {
    label: 'Compte Mata Boost',
    subTypes: ['Mata Boost à vue', 'Mata Boost Bloqué'],
    fees: {
      opening: 500,
      monthly: '300/1000',
      withdrawal: 200,
      sms: 200
    }
  },
  'Collecte': {
    label: 'Compte de Collecte',
    subTypes: ['Journalière', 'Bloquée'],
    fees: {
      opening: 0,
      monthly: 1000,
      unblocking: 1000
    }
  }
};

const Step2AccountType = ({ accountType, accountSubType, options, onChange }) => {
  const [selectedType, setSelectedType] = useState(accountType);
  const [selectedSubType, setSelectedSubType] = useState(accountSubType);

  const handleTypeChange = (event) => {
    const type = event.target.value;
    setSelectedType(type);
    setSelectedSubType('');
    onChange('accountType', type);
    onChange('accountSubType', '');
    onChange('options', ACCOUNT_TYPES[type]?.fees || {});
  };

  const handleSubTypeChange = (event) => {
    const subType = event.target.value;
    setSelectedSubType(subType);
    onChange('accountSubType', subType);
  };

  const getFeeDetails = () => {
    if (!selectedType) return null;
    
    const fees = ACCOUNT_TYPES[selectedType].fees;
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Frais associés:
        </Typography>
        <Grid container spacing={1}>
          {Object.entries(fees).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <Typography>
                <strong>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}:</strong> {value} FCFA
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Étape 2: Type de Compte
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Sélectionnez le type de compte et les options associées. Les frais seront appliqués automatiquement.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Type de compte principal</FormLabel>
            <RadioGroup value={selectedType} onChange={handleTypeChange}>
              {Object.keys(ACCOUNT_TYPES).map((type) => (
                <FormControlLabel
                  key={type}
                  value={type}
                  control={<Radio />}
                  label={ACCOUNT_TYPES[type].label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>

        {selectedType && ACCOUNT_TYPES[selectedType].subTypes.length > 0 && (
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Sous-type de compte</InputLabel>
              <Select
                value={selectedSubType}
                label="Sous-type de compte"
                onChange={handleSubTypeChange}
              >
                <MenuItem value="">
                  <em>Sélectionnez un sous-type</em>
                </MenuItem>
                {ACCOUNT_TYPES[selectedType].subTypes.map((subType) => (
                  <MenuItem key={subType} value={subType}>
                    {subType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {selectedType && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Détails du compte sélectionné
                </Typography>
                <Typography>
                  <strong>Type:</strong> {ACCOUNT_TYPES[selectedType].label}
                </Typography>
                {selectedSubType && (
                  <Typography>
                    <strong>Sous-type:</strong> {selectedSubType}
                  </Typography>
                )}
                {getFeeDetails()}
                
                {selectedType === 'Mata Boost' && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <strong>Note:</strong> Le compte Mata Boost comprend 6 sous-comptes (Business, Scolarité, Santé, Fête, Fournitures, Immobilier). Ils seront créés automatiquement.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Options supplémentaires */}
        {selectedType && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Options supplémentaires
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Montant minimum à maintenir"
                  type="number"
                  value={options.minimumBalance || ''}
                  onChange={(e) => onChange('options', {
                    ...options,
                    minimumBalance: e.target.value
                  })}
                  helperText="Montant bloqué jusqu'à la clôture du compte"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Fréquence des relevés</InputLabel>
                  <Select
                    value={options.statementFrequency || ''}
                    label="Fréquence des relevés"
                    onChange={(e) => onChange('options', {
                      ...options,
                      statementFrequency: e.target.value
                    })}
                  >
                    <MenuItem value="mensuel">Mensuel</MenuItem>
                    <MenuItem value="trimestriel">Trimestriel</MenuItem>
                    <MenuItem value="semestriel">Semestriel</MenuItem>
                    <MenuItem value="annuel">Annuel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default Step2AccountType;