import React, { useEffect, useState } from "react";
import {
  Box, Paper, Typography, TextField, Grid, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, CircularProgress, Alert, Snackbar,
  InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, Stack, Divider
} from "@mui/material";
import {
  Search, Download, FilterList, CalendarToday,
  Print, Refresh, Assignment, Receipt, ArrowBack
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { indigo, green } from "@mui/material/colors";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";

interface JournalEntry {
  id: number;
  numero_od: string;
  numero_piece: string;
  libelle: string;
  type_operation: string;
  type_collecte: string;
  montant: number;
  devise: string;
  date_operation: string;
  agence: { nom: string; code: string };
  compteDebit: { code: string; libelle: string };
  compteCredit: { code: string; libelle: string };
}

interface JournalTotals {
  total: number;
  total_par_type: { [key: string]: number };
  total_par_code: { [key: string]: number };
  count: number;
}

export default function ODJournal() {
  const navigate = useNavigate();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [totals, setTotals] = useState<JournalTotals>({
    total: 0,
    total_par_type: {},
    total_par_code: {},
    count: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    date_debut: "",
    date_fin: "",
    agence_id: "",
    type_collecte: "",
    code_operation: ""
  });
  const [agences, setAgences] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });

  useEffect(() => {
    fetchAgences();
    fetchJournal();
  }, []);

  const fetchAgences = async () => {
    try {
      const response = await ApiClient.get("/operation-diverses/agences/liste");
      const data = response.data?.data || response.data?.agences || [];
      setAgences(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement agences:", error);
      // Pas besoin d'afficher une erreur pour les agences, on continue avec une liste vide
    }
  };

  const fetchJournal = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      if (filters.date) {
        params.append('date', filters.date);
      } else if (filters.date_debut && filters.date_fin) {
        params.append('date_debut', filters.date_debut);
        params.append('date_fin', filters.date_fin);
      }
      
      if (filters.agence_id) params.append('agence_id', filters.agence_id);
      if (filters.type_collecte) params.append('type_collecte', filters.type_collecte);
      if (filters.code_operation) params.append('code_operation', filters.code_operation);

      const response = await ApiClient.get(`/operation-diverses/journal/liste?${params}`);
      const data = response.data?.data;
      
      // Vérifier si les données sont valides
      if (!data) {
        throw new Error("Données de journal non disponibles");
      }
      
      // S'assurer que operationDiverses est un tableau
      const entriesData = Array.isArray(data?.operationDiverses) ? data.operationDiverses : [];
      
      // Filtrer les entrées invalides
      const validEntries = entriesData.filter(entry => 
        entry && 
        entry.compteDebit && 
        entry.compteCredit
      );
      
      setEntries(validEntries);
      setTotals({
        total: data?.total || 0,
        total_par_type: data?.total_par_type || {},
        total_par_code: data?.total_par_code || {},
        count: data?.count || 0
      });
      
    } catch (error: any) {
      console.error("Erreur chargement journal:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Une erreur est survenue lors du chargement du journal";
      setError(errorMessage);
      setEntries([]);
      setTotals({
        total: 0,
        total_par_type: {},
        total_par_code: {},
        count: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_debut) params.append('date_debut', filters.date_debut);
      if (filters.date_fin) params.append('date_fin', filters.date_fin);
      if (filters.agence_id) params.append('agence_id', filters.agence_id);
      if (filters.type_collecte) params.append('type_collecte', filters.type_collecte);

      const response = await ApiClient.get(`/operation-diverses/export/data?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `journal_od_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: "Erreur lors de l'export du fichier", 
        severity: "error" 
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setFilters({
      date: new Date().toISOString().split('T')[0],
      date_debut: "",
      date_fin: "",
      agence_id: "",
      type_collecte: "",
      code_operation: ""
    });
  };

  const getTypeCollecteLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'MATA_BOOST': 'MATA BOOST',
      'EPARGNE_JOURNALIERE': 'Épargne Journalière',
      'CHARGE': 'Charge',
      'AUTRE': 'Générique'
    };
    return labels[type] || type;
  };

  // Fonction pour obtenir les valeurs sécurisées des comptes
  const getCompteInfo = (compte: any) => {
    if (!compte) {
      return { code: "N/A", libelle: "Non disponible" };
    }
    return {
      code: compte.code || "N/A",
      libelle: compte.libelle || "Non disponible"
    };
  };

  // Fonction pour obtenir les valeurs sécurisées de l'agence
  const getAgenceInfo = (agence: any) => {
    if (!agence) {
      return { nom: "N/A", code: "N/A" };
    }
    return {
      nom: agence.nom || "N/A",
      code: agence.code || "N/A"
    };
  };

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/ChoicePageOd')} sx={{ mb: 2 }}>
            Retour
          </Button>            
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assignment sx={{ color: green[500] }} />
            Journal des Opérations Diverses
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrint}
              disabled={entries.length === 0}
            >
              Imprimer
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExport}
              disabled={entries.length === 0}
              sx={{ bgcolor: green[500], '&:hover': { bgcolor: green[600] } }}
            >
              Exporter
            </Button>
          </Stack>
        </Box>

        {/* Filtres */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            Filtres du journal
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date unique"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value, date_debut: "", date_fin: "" })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date début"
                value={filters.date_debut}
                onChange={(e) => setFilters({ ...filters, date_debut: e.target.value, date: "" })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date fin"
                value={filters.date_fin}
                onChange={(e) => setFilters({ ...filters, date_fin: e.target.value, date: "" })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Agence</InputLabel>
                <Select
                  value={filters.agence_id}
                  onChange={(e) => setFilters({ ...filters, agence_id: e.target.value })}
                  label="Agence"
                >
                  <MenuItem value="">Toutes les agences</MenuItem>
                  {agences.map(agence => (
                    <MenuItem key={agence.id} value={agence.id}>
                      {agence.code || 'N/A'} - {agence.name || agence.nom || 'Agence inconnue'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type de collecte</InputLabel>
                <Select
                  value={filters.type_collecte}
                  onChange={(e) => setFilters({ ...filters, type_collecte: e.target.value })}
                  label="Type de collecte"
                >
                  <MenuItem value="">Tous les types</MenuItem>
                  <MenuItem value="MATA_BOOST">MATA BOOST</MenuItem>
                  <MenuItem value="EPARGNE_JOURNALIERE">Épargne Journalière</MenuItem>
                  <MenuItem value="CHARGE">Charge</MenuItem>
                  <MenuItem value="AUTRE">Générique</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Code opération"
                value={filters.code_operation}
                onChange={(e) => setFilters({ ...filters, code_operation: e.target.value })}
                placeholder="Ex: CHARGE_ELECTRICITE"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={resetFilters}
            >
              Réinitialiser
            </Button>
            <Button
              variant="contained"
              onClick={fetchJournal}
              startIcon={<Refresh />}
              disabled={loading}
            >
              {loading ? "Chargement..." : "Appliquer les filtres"}
            </Button>
          </Box>
        </Paper>

        {/* Message d'erreur */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setError(null)}
              >
                Fermer
              </Button>
            }
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Erreur de chargement
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Vérifiez votre connexion ou contactez l'administrateur si le problème persiste.
            </Typography>
          </Alert>
        )}

        {/* Résumé - seulement si pas d'erreur et données disponibles */}
        {!error && entries.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total des montants
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {new Intl.NumberFormat().format(totals.total)} FCFA
                  </Typography>
                  <Typography variant="body2">
                    {totals.count} opérations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Répartition par type
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(totals.total_par_type).map(([type, montant]) => (
                    <Grid item xs={6} md={3} key={type}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            {getTypeCollecteLabel(type)}
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {new Intl.NumberFormat().format(montant)} FCFA
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Table du journal */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">
              Entrées du journal {entries.length > 0 && `(${entries.length})`}
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Chargement du journal en cours...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Alert 
                severity="error" 
                icon={false}
                sx={{ maxWidth: 600, mx: 'auto' }}
              >
                <Typography variant="h6" gutterBottom>
                  Impossible de charger le journal
                </Typography>
                <Typography variant="body2" paragraph>
                  {error}
                </Typography>
                <Button
                  variant="contained"
                  onClick={fetchJournal}
                  startIcon={<Refresh />}
                >
                  Réessayer
                </Button>
              </Alert>
            </Box>
          ) : entries.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Aucune entrée trouvée pour les filtres sélectionnés
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Modifiez vos critères de recherche ou vérifiez qu'il existe des opérations pour la période choisie.
              </Typography>
              <Button
                variant="outlined"
                onClick={resetFilters}
                startIcon={<FilterList />}
              >
                Réinitialiser les filtres
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>N° OD / Pièce</strong></TableCell>
                    <TableCell><strong>Libellé</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Compte Débit</strong></TableCell>
                    <TableCell><strong>Compte Crédit</strong></TableCell>
                    <TableCell align="right"><strong>Montant</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry) => {
                    const compteDebit = getCompteInfo(entry.compteDebit);
                    const compteCredit = getCompteInfo(entry.compteCredit);
                    
                    return (
                      <TableRow key={entry.id} hover>
                        <TableCell>
                          {entry.date_operation ? 
                            new Date(entry.date_operation).toLocaleDateString() : 
                            "Date non disponible"}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {entry.numero_od || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {entry.numero_piece || "Sans pièce"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{entry.libelle || "Sans libellé"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getTypeCollecteLabel(entry.type_collecte)}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {compteDebit.code}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {compteDebit.libelle}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {compteCredit.code}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {compteCredit.libelle}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {new Intl.NumberFormat().format(entry.montant || 0)} {entry.devise || "FCFA"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
}