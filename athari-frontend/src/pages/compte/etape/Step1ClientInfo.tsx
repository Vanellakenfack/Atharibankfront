import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Checkbox,
  InputAdornment,
  Box,
  CircularProgress,
  Pagination,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { clientService } from '../../../services/api/clientApi';
import { compteService } from '../../../services/api/compteApi';

type Client = {
  id: number;
  num_client: string;
  type_client: 'physique' | 'morale';
  telephone: string;
  email: string;
  adresse_ville: string;
  adresse_quartier: string;
  physique?: {
    nom_prenoms: string;
    sexe: 'M' | 'F';
    date_naissance: string;
    signature_url?: string;
    cni_recto_url?: string;      // Nouveau champ CNI recto
    cni_verso_url?: string;      // Nouveau champ CNI verso
  };
};

interface Step1ClientInfoProps {
  selectedClient: Client | null;
  onClientSelect: (client: Client, cniData?: { cniRectoUrl: string | null, cniVersoUrl: string | null }) => void;
  onNext: (clientId: number, accountSubType: string) => Promise<void>;
  accountSubType: string;
}

const Step1ClientInfo: React.FC<Step1ClientInfoProps> = ({ 
  selectedClient, 
  onClientSelect,
  onNext,
  accountSubType
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Client>('num_client');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  // Charger les clients depuis l'API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await clientService.getAllClients();
        setClients(data);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les clients. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Filtrer et trier les clients
  const filteredClients = React.useMemo(() => {
    let result = [...clients];

    // Filtrage
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(client => 
        (client.physique?.nom_prenoms?.toLowerCase().includes(term)) ||
        (client.num_client?.toLowerCase().includes(term)) ||
        (client.telephone?.includes(term)) ||
        (client.email?.toLowerCase().includes(term))
      );
    }

    // Tri
    result.sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [clients, searchTerm, orderBy, order]);

  const handleRequestSort = (property: keyof Client) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectClient = async (client: Client) => {
    // Récupérer les URLs des CNI depuis le client
    const cniRectoUrl = client.physique?.cni_recto_url || null;
    const cniVersoUrl = client.physique?.cni_verso_url || null;
    
    // Envoyer le client ET les URLs CNI au parent
    onClientSelect(client, { cniRectoUrl, cniVersoUrl });
    
    // Valider automatiquement l'étape 1
    if (client && accountSubType) {
      try {
        setValidating(true);
        await onNext(client.id, accountSubType);
      } catch (err) {
        console.error('Erreur validation étape 1:', err);
      } finally {
        setValidating(false);
      }
    }
  };

  // Pagination
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredClients.length) : 0;
  const currentClients = filteredClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Étape 1: Sélection du Client
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Sélectionnez un client dans le tableau. L'étape sera validée automatiquement.
          <br />
          <strong>Note :</strong> 
          <br />- La signature du client sera automatiquement récupérée dans l'étape 4.
          <br />- Les CNI (recto et verso) du client seront également récupérées automatiquement si disponibles.
        </Alert>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Box sx={{ width: '40%', minWidth: 300 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ width: '100%', overflow: 'hidden', margin: 0, maxWidth: 'none'}}>
            <TableContainer sx={{ 
                      maxHeight: 440,
                      '& .MuiTable-root': {
                        minWidth: '100%',
                        tableLayout: 'fixed'
                      }
                    }}
            >
              <Table stickyHeader aria-label="Liste des clients" size="small">
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-head': { backgroundColor: 'primary.main', color: 'white' } }}>
                    <TableCell padding="checkbox" sx={{ backgroundColor: 'primary.main' }}></TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main' }}>
                      <TableSortLabel
                        active={orderBy === 'num_client'}
                        direction={orderBy === 'num_client' ? order : 'asc'}
                        onClick={() => handleRequestSort('num_client')}
                        sx={{ color: 'white !important', '&:hover': { color: 'rgba(255, 255, 255, 0.8) !important' } }}
                      >
                        N° Client
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main' }}>
                      <TableSortLabel
                        active={orderBy === 'physique.nom_prenoms'}
                        direction={orderBy === 'physique.nom_prenoms' ? order : 'asc'}
                        onClick={() => handleRequestSort('physique.nom_prenoms')}
                        sx={{ color: 'white !important', '&:hover': { color: 'rgba(255, 255, 255, 0.8) !important' } }}
                      >
                        Nom & Prénoms
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'white' }}>Téléphone</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'white' }}>Email</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'white' }}>Ville</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', color: 'white' }}>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <CircularProgress />
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          Chargement des clients...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'error.main' }}>
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : currentClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                          {searchTerm ? 'Aucun client ne correspond à votre recherche' : 'Aucun client trouvé'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentClients.map((client) => (
                      <TableRow 
                        hover 
                        key={client.id} 
                        selected={selectedClient?.id === client.id}
                        onClick={() => handleSelectClient(client)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedClient?.id === client.id}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>{client.num_client}</TableCell>
                        <TableCell>{client.physique?.nom_prenoms || 'N/A'}</TableCell>
                        <TableCell>{client.telephone}</TableCell>
                        <TableCell>{client.email || 'N/A'}</TableCell>
                        <TableCell>{client.adresse_ville}</TableCell>
                        <TableCell>
                          {client.type_client === 'physique' ? 'Physique' : 'Morale'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {!loading && emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={7} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filteredClients.length)} sur ${filteredClients.length}`}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Pagination 
                  count={Math.ceil(filteredClients.length / rowsPerPage)} 
                  page={page + 1} 
                  onChange={(event, value) => setPage(value - 1)} 
                  color="primary" 
                  shape="rounded"
                  size="small"
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Lignes:
                  </Typography>
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                    size="small"
                    sx={{
                      '& .MuiSelect-select': {
                        py: 0.5,
                        px: 1,
                        fontSize: '0.875rem',
                      },
                    }}
                  >
                    {[5, 10, 25, 50].map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {selectedClient && (
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>Client sélectionné</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom complet"
                    value={selectedClient.physique?.nom_prenoms || 'N/A'}
                    variant="outlined"
                    size="small"
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="N° Client"
                    value={selectedClient.num_client}
                    variant="outlined"
                    size="small"
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    value={selectedClient.telephone}
                    variant="outlined"
                    size="small"
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={selectedClient.email || 'N/A'}
                    variant="outlined"
                    size="small"
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ville"
                    value={selectedClient.adresse_ville}
                    variant="outlined"
                    size="small"
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Type de client"
                    value={selectedClient.type_client === 'physique' ? 'Physique' : 'Morale'}
                    variant="outlined"
                    size="small"
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Signature disponible"
                    value={selectedClient.physique?.signature_url ? 'Oui' : 'Non'}
                    variant="outlined"
                    size="small"
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                    }}
                    helperText={selectedClient.physique?.signature_url ? 'La signature sera automatiquement chargée à l\'étape 4' : 'Aucune signature trouvée pour ce client'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="CNI disponible"
                    value={selectedClient.physique?.cni_recto_url ? 'Oui (Recto & Verso)' : 'Non'}
                    variant="outlined"
                    size="small"
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                    }}
                    helperText={selectedClient.physique?.cni_recto_url ? 'Les CNI seront automatiquement chargées à l\'étape 4' : 'Aucune CNI trouvée pour ce client'}
                  />
                </Grid>
              </Grid>
              
              {validating && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">
                    Validation de l'étape 1 en cours...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </div>
  );
};

export default Step1ClientInfo;