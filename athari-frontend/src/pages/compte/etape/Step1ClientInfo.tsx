import React, { useState, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Step1ClientInfo = ({ clients, selectedClient, onClientSelect, accountNumber }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState(clients);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(client =>
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cni.includes(searchTerm)
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  const generateAccountNumber = (clientId) => {
    if (!clientId) return '';
    const paddedId = clientId.toString().padStart(9, '0');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `${paddedId}${randomDigits}`;
  };

  const handleClientSelect = (client) => {
    onClientSelect(client);
    // Générer automatiquement le numéro de compte
    const generatedNumber = generateAccountNumber(client.id);
    // Vous pourriez vouloir passer ce numéro au parent
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Étape 1: Sélection du Client
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Sélectionnez un client existant. Le numéro de compte sera généré automatiquement (9 chiffres client + 4 chiffres = 13 chiffres).
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Autocomplete
            options={filteredClients}
            getOptionLabel={(client) => 
              `${client.nom} ${client.prenom} - CNI: ${client.cni} - Tél: ${client.telephone}`
            }
            value={selectedClient}
            onChange={(event, newValue) => handleClientSelect(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Rechercher un client"
                placeholder="Nom, prénom ou CNI"
                variant="outlined"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <SearchIcon sx={{ mr: 1 }} />
                }}
              />
            )}
          />
        </Grid>

        {selectedClient && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informations du Client
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Nom:</strong> {selectedClient.nom}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Prénom:</strong> {selectedClient.prenom}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>CNI:</strong> {selectedClient.cni}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Téléphone:</strong> {selectedClient.telephone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Email:</strong> {selectedClient.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Adresse:</strong> {selectedClient.adresse}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      <strong>Numéro de compte généré:</strong> {generateAccountNumber(selectedClient.id)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {!selectedClient && (
          <Grid item xs={12}>
            <Alert severity="warning">
              Aucun client sélectionné. Veuillez rechercher et sélectionner un client.
            </Alert>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default Step1ClientInfo;