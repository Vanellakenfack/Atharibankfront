import React, { useEffect, useState } from "react";
import {
  Box, Paper, Typography, TextField, Grid, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Alert, Snackbar,
  FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, Stack, Container,
  InputAdornment, alpha, useTheme
} from "@mui/material";
import {
  Search, Download, FilterList, CalendarToday,
  Print, Refresh, Assignment, Receipt, ArrowBack,
  PictureAsPdf, InsertDriveFile, Info,
  LocationCity, AttachMoney, PointOfSale
} from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
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
  agence: { name: string; code: string; short_name?: string };
  compte_debit: { code: string; libelle: string };
  compte_credit: { code: string; libelle: string };
}

interface JournalTotals {
  total: number;
  total_par_type: { [key: string]: number };
  total_par_code: { [key: string]: number };
  count: number;
}

// Palette de couleurs bleue dégradée
const blueGradient = {
  primary: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
  dark: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
  light: 'linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%)',
  lighter: 'linear-gradient(135deg, #bbdefb 0%, #e3f2fd 100%)',
  header: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
  button: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
  buttonHover: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
  success: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
  successHover: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
  error: 'linear-gradient(135deg, #c62828 0%, #d32f2f 100%)',
  warning: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
};

// Types de collecte avec couleurs
const typeCollecteColors: Record<string, string> = {
  'MATA_BOOST': '#1976d2',
  'EPARGNE_JOURNALIERE': '#4caf50',
  'CHARGE': '#f57c00',
  'AUTRE': '#757575',
  'GENERIQUE': '#9c27b0'
};

export default function ODJournal() {
  const theme = useTheme();
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
    date: null as Date | null,
    date_debut: new Date(new Date().setDate(new Date().getDate() - 30)),
    date_fin: new Date(),
    agence_id: "all",
    type_collecte: "all",
    code_operation: ""
  });
  const [agences, setAgences] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });
  const [debugInfo, setDebugInfo] = useState("");
  const [backendAccessible, setBackendAccessible] = useState(true);
  const [hasSearched, setHasSearched] = useState(false); // Nouvel état pour suivre si une recherche a été effectuée

  useEffect(() => {
    fetchAgences();
    // NE PAS appeler fetchJournal automatiquement ici
  }, []);

  const fetchAgences = async () => {
    try {
      setDebugInfo("Chargement des agences...");
      const response = await ApiClient.get("/operation-diverses/agences/liste");
      const data = response.data?.data || response.data?.agences || [];
      setAgences(Array.isArray(data) ? data : []);
      setDebugInfo(`✅ ${data.length} agences chargées`);
      setBackendAccessible(true);
    } catch (error) {
      console.error("Erreur chargement agences:", error);
      setDebugInfo("❌ Erreur chargement agences");
      setBackendAccessible(false);
      // Données fictives pour développement
      const agencesFictives = [
        { id: 1, code: '001', name: 'SIÈGE CENTRAL', short_name: 'SIEGE' },
        { id: 2, code: '002', name: 'AGENCE COMMERCIALE', short_name: 'AGCOMM' },
        { id: 3, code: '003', name: 'AGENCE PRINCIPALE', short_name: 'PRINCIPALE' },
      ];
      setAgences(agencesFictives);
    }
  };

  const fetchJournal = async () => {
    if (!backendAccessible) {
      setSnackbar({
        open: true,
        message: "Backend non accessible. Vérifiez votre connexion.",
        severity: "error"
      });
      return;
    }

    // Validation des filtres de base
    if (filters.agence_id === "all") {
      setSnackbar({
        open: true,
        message: "Veuillez sélectionner une agence spécifique.",
        severity: "warning"
      });
      return;
    }

    if (!filters.date && (!filters.date_debut || !filters.date_fin)) {
      setSnackbar({
        open: true,
        message: "Veuillez sélectionner une date ou une période.",
        severity: "warning"
      });
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true); // Marquer qu'une recherche a été effectuée
    try {
      setDebugInfo("Chargement du journal en cours...");
      
      const params = new URLSearchParams();
      
      if (filters.date) {
        params.append('date', format(filters.date, 'yyyy-MM-dd'));
      } else if (filters.date_debut && filters.date_fin) {
        params.append('date_debut', format(filters.date_debut, 'yyyy-MM-dd'));
        params.append('date_fin', format(filters.date_fin, 'yyyy-MM-dd'));
      }
      
      if (filters.agence_id && filters.agence_id !== "all") {
        params.append('agence_id', filters.agence_id);
      }
      if (filters.type_collecte && filters.type_collecte !== "all") {
        params.append('type_collecte', filters.type_collecte);
      }
      if (filters.code_operation) {
        params.append('code_operation', filters.code_operation);
      }

      const url = `/operation-diverses/journal/liste?${params}`;
      
      const response = await ApiClient.get(url);
      const data = response.data?.data;
      
      if (!data) {
        throw new Error("Données de journal non disponibles");
      }
      
      const entriesData = Array.isArray(data?.operationDiverses) ? data.operationDiverses : [];
      
      const formattedEntries = entriesData.map((entry: any) => ({
        id: entry.id,
        numero_od: entry.numero_od || "",
        numero_piece: entry.numero_piece || "",
        libelle: entry.libelle || "",
        type_operation: entry.type_operation || entry.code_operation || "",
        type_collecte: entry.type_collecte || entry.code_operation || "",
        montant: parseFloat(entry.montant) || 0,
        devise: entry.devise || "FCFA",
        date_operation: entry.date_operation || entry.date_comptable || "",
        agence: entry.agence || { name: "N/A", code: "N/A" },
        compte_debit: entry.compte_debit || { code: "N/A", libelle: "Non disponible" },
        compte_credit: entry.compte_credit || { code: "N/A", libelle: "Non disponible" }
      }));
      
      setEntries(formattedEntries);
      setTotals({
        total: data?.total || 0,
        total_par_type: data?.total_par_type || {},
        total_par_code: data?.total_par_code || {},
        count: data?.count || 0
      });
      
      setDebugInfo(`✅ ${formattedEntries.length} entrées chargées`);
      
      if (formattedEntries.length === 0) {
        setSnackbar({
          open: true,
          message: "Aucune opération trouvée pour les critères sélectionnés.",
          severity: "info"
        });
      }
      
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
      setDebugInfo(`❌ Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      // Validation avant export
      if (entries.length === 0) {
        setSnackbar({
          open: true,
          message: "Aucune donnée à exporter",
          severity: "warning"
        });
        return;
      }

      const params = new URLSearchParams();
      
      if (filters.date) {
        params.append('date', format(filters.date, 'yyyy-MM-dd'));
      } else if (filters.date_debut && filters.date_fin) {
        params.append('date_debut', format(filters.date_debut, 'yyyy-MM-dd'));
        params.append('date_fin', format(filters.date_fin, 'yyyy-MM-dd'));
      } else {
        const dateFin = new Date();
        const dateDebut = new Date();
        dateDebut.setMonth(dateDebut.getMonth() - 1);
        params.append('date_debut', format(dateDebut, 'yyyy-MM-dd'));
        params.append('date_fin', format(dateFin, 'yyyy-MM-dd'));
      }
      
      if (filters.agence_id && filters.agence_id !== "all") {
        params.append('agence_id', filters.agence_id);
      }
      if (filters.type_collecte && filters.type_collecte !== "all") {
        params.append('type_collecte', filters.type_collecte);
      }
      if (filters.code_operation) {
        params.append('code_operation', filters.code_operation);
      }
      
      const response = await ApiClient.get(`operation-diverses/journal/pdf?${params}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const date = new Date().toISOString().split('T')[0];
      const agenceCode = agences.find(a => a.id == filters.agence_id)?.code || 'all';
      let filename = `journal_od_${agenceCode}_${date}.pdf`;
      
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      setSnackbar({
        open: true,
        message: "PDF généré avec succès",
        severity: "success"
      });
      
    } catch (error: any) {
      console.error('Erreur lors de la génération du PDF:', error);
      let errorMessage = "Erreur lors de la génération du PDF";
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "Route PDF non trouvée";
        } else if (error.response.status === 500) {
          errorMessage = "Erreur serveur lors de la génération du PDF";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Aucune réponse du serveur. Vérifiez votre connexion.";
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      // Validation avant export
      if (entries.length === 0) {
        setSnackbar({
          open: true,
          message: "Aucune donnée à exporter",
          severity: "warning"
        });
        return;
      }

      const params = new URLSearchParams();
      
      if (filters.date_debut) params.append('date_debut', format(filters.date_debut, 'yyyy-MM-dd'));
      if (filters.date_fin) params.append('date_fin', format(filters.date_fin, 'yyyy-MM-dd'));
      if (filters.agence_id && filters.agence_id !== "all") params.append('agence_id', filters.agence_id);
      if (filters.type_collecte && filters.type_collecte !== "all") params.append('type_collecte', filters.type_collecte);

      const response = await ApiClient.get(`/operation-diverses/export/data?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const date = new Date().toISOString().split('T')[0];
      const agenceCode = agences.find(a => a.id == filters.agence_id)?.code || 'all';
      link.setAttribute('download', `journal_od_${agenceCode}_${date}.xlsx`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbar({
        open: true,
        message: "Excel généré avec succès",
        severity: "success"
      });
      
    } catch (error: any) {
      console.error('Erreur lors de la génération du fichier Excel:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Erreur lors de la génération du fichier Excel",
        severity: "error"
      });
    }
  };

  const handlePrint = () => {
    if (entries.length === 0) {
      setSnackbar({
        open: true,
        message: "Aucune donnée à imprimer",
        severity: "warning"
      });
      return;
    }
    window.print();
  };

  const resetFilters = () => {
    setFilters({
      date: null,
      date_debut: new Date(new Date().setDate(new Date().getDate() - 30)),
      date_fin: new Date(),
      agence_id: "all",
      type_collecte: "all",
      code_operation: ""
    });
    setEntries([]);
    setTotals({
      total: 0,
      total_par_type: {},
      total_par_code: {},
      count: 0
    });
    setHasSearched(false);
    setError(null);
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

  const getAgenceLabel = (): string => {
    if (filters.agence_id === "all") {
      return "TOUTES LES AGENCES";
    }
    
    const selectedAgence = agences.find(a => a.id == filters.agence_id);
    return selectedAgence ? `${selectedAgence.code} - ${selectedAgence.name}` : `AGENCE ${filters.agence_id}`;
  };

  const getTypeCollecteLabelForFilter = (): string => {
    if (filters.type_collecte === "all") {
      return "TOUS LES TYPES";
    }
    
    return getTypeCollecteLabel(filters.type_collecte);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return "Date invalide";
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  const formatMontantAvecDevise = (montant: number) => {
    return `${formatMontant(montant)} FCFA`;
  };

  const retesterConnexion = async () => {
    setLoading(true);
    try {
      await fetchAgences();
      setSnackbar({
        open: true,
        message: "Connexion rétablie avec succès",
        severity: "success"
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Impossible de se connecter au backend",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Layout>
        <Box sx={{ 
          minHeight: '100vh', 
          bgcolor: '#F8FAFC',
          py: 4,
          px: { xs: 2, md: 4 }
        }}>
          <Container maxWidth="xl">
            {/* En-tête principal */}
            <Box sx={{ 
              mb: 4, 
              p: 4,
              textAlign: 'center',
              background: backendAccessible ? blueGradient.primary : blueGradient.error,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
              color: 'white'
            }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}>
                <Assignment sx={{ fontSize: 40 }} />
                Journal des Opérations Diverses
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                Consultez et exportez les journaux des opérations diverses
              </Typography>
              
              {!backendAccessible && (
                <Button
                  variant="contained"
                  onClick={retesterConnexion}
                  sx={{
                    mt: 2,
                    background: 'white',
                    color: blueGradient.error,
                    fontWeight: 'bold',
                    '&:hover': {
                      background: '#e3f2fd'
                    }
                  }}
                >
                  Tester la connexion
                </Button>
              )}
            </Box>

            {/* Section Filtres */}
            <Paper elevation={6} sx={{ 
              p: 3, 
              mb: 4,
              border: 'none',
              borderRadius: 3,
              background: 'white',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{
                  mr: 2,
                  p: 1.5,
                  background: blueGradient.light,
                  borderRadius: 2,
                  color: 'white'
                }}>
                  <FilterList fontSize="large" />
                </Box>
                <Typography variant="h5" component="h2" sx={{ 
                  fontWeight: 'bold',
                  background: blueGradient.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Filtres du Journal OD
                </Typography>
              </Box>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Date unique"
                    value={filters.date}
                    onChange={(date) => setFilters({ 
                      ...filters, 
                      date: date,
                      date_debut: new Date(new Date().setDate(new Date().getDate() - 30)),
                      date_fin: new Date()
                    })}
                    format="dd/MM/yyyy"
                    maxDate={new Date()}
                    slotProps={{
                      textField: { 
                        fullWidth: true,
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#1976d2',
                              borderWidth: 2,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#1976d2',
                              borderWidth: 2,
                            }
                          }
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Date début"
                    value={filters.date_debut}
                    onChange={(date) => setFilters({ 
                      ...filters, 
                      date_debut: date || new Date(),
                      date: null
                    })}
                    format="dd/MM/yyyy"
                    maxDate={filters.date_fin}
                    slotProps={{
                      textField: { 
                        fullWidth: true,
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#1976d2',
                              borderWidth: 2,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#1976d2',
                              borderWidth: 2,
                            }
                          }
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Date fin"
                    value={filters.date_fin}
                    onChange={(date) => setFilters({ 
                      ...filters, 
                      date_fin: date || new Date(),
                      date: null
                    })}
                    format="dd/MM/yyyy"
                    minDate={filters.date_debut}
                    maxDate={new Date()}
                    slotProps={{
                      textField: { 
                        fullWidth: true,
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#1976d2',
                              borderWidth: 2,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#1976d2',
                              borderWidth: 2,
                            }
                          }
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{ 
                        color: '#1976d2',
                        fontWeight: 'bold'
                      }}
                    >
                      Agence
                    </InputLabel>
                    <Select
                      value={filters.agence_id}
                      onChange={(e) => setFilters({ ...filters, agence_id: e.target.value })}
                      label="Agence"
                      startAdornment={
                        <LocationCity sx={{ mr: 1, color: '#1976d2' }} />
                      }
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha('#1976d2', 0.3),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: 2,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: 2,
                        },
                      }}
                    >
                      <MenuItem 
                        value="all"
                        sx={{ 
                          color: '#1976d2',
                          fontWeight: 'bold',
                          background: blueGradient.lighter,
                          mb: 1,
                          borderRadius: 1
                        }}
                      >
                        TOUTES LES AGENCES
                      </MenuItem>
                      
                      {agences.map((agence) => (
                        <MenuItem 
                          key={agence.id} 
                          value={agence.id}
                          sx={{ 
                            color: '#1976d2',
                            fontWeight: 'medium',
                            borderLeft: `4px solid ${agence.code === '001' ? '#1976d2' : agence.code === '002' ? '#2196f3' : '#42a5f5'}`,
                            mb: 0.5,
                            '&:hover': {
                              background: alpha('#1976d2', 0.04),
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              background: agence.code === '001' ? '#1976d2' : agence.code === '002' ? '#2196f3' : '#42a5f5',
                              mr: 2 
                            }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" fontWeight="medium">
                                {agence.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Code: {agence.code}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{ 
                        color: '#1976d2',
                        fontWeight: 'bold'
                      }}
                    >
                      Type de collecte
                    </InputLabel>
                    <Select
                      value={filters.type_collecte}
                      onChange={(e) => setFilters({ ...filters, type_collecte: e.target.value })}
                      label="Type de collecte"
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha('#1976d2', 0.3),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: 2,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: 2,
                        },
                      }}
                    >
                      <MenuItem 
                        value="all"
                        sx={{ 
                          color: '#1976d2',
                          fontWeight: 'bold',
                          background: blueGradient.lighter,
                          mb: 1,
                          borderRadius: 1
                        }}
                      >
                        TOUS LES TYPES
                      </MenuItem>
                      <MenuItem value="MATA_BOOST">MATA BOOST</MenuItem>
                      <MenuItem value="EPARGNE_JOURNALIERE">Épargne Journalière</MenuItem>
                      <MenuItem value="CHARGE">Charge</MenuItem>
                      <MenuItem value="AUTRE">Générique</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth
                    label="Code opération"
                    value={filters.code_operation}
                    onChange={(e) => setFilters({ ...filters, code_operation: e.target.value })}
                    placeholder="Ex: CHARGE"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha('#1976d2', 0.3),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: 2,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                          borderWidth: 2,
                        },
                      }
                    }}
                  />
                </Grid>
              </Grid>
              
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Box>
                  <Chip 
                    icon={<LocationCity />}
                    label={getAgenceLabel()}
                    sx={{ 
                      background: blueGradient.primary,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      height: 40,
                      px: 2,
                      mr: 2,
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                  <Chip 
                    icon={<AttachMoney />}
                    label={getTypeCollecteLabelForFilter()}
                    sx={{ 
                      background: blueGradient.light,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      height: 40,
                      px: 2,
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                </Box>
                
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={resetFilters}
                    sx={{
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#1565c0',
                        background: alpha('#1976d2', 0.04),
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    variant="contained"
                    onClick={fetchJournal}
                    disabled={loading || !backendAccessible}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                    sx={{
                      background: backendAccessible ? blueGradient.button : '#bdbdbd',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: backendAccessible ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                      '&:hover': backendAccessible ? {
                        background: blueGradient.buttonHover,
                        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-2px)'
                      } : {},
                      '&:disabled': {
                        background: '#bdbdbd',
                        boxShadow: 'none',
                        transform: 'none'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? "Chargement..." : "Charger le journal"}
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {/* Message initial (avant toute recherche) */}
            {!hasSearched && (
              <Paper elevation={6} sx={{ 
                p: 6, 
                textAlign: 'center',
                border: 'none',
                borderRadius: 3,
                background: 'white',
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
                mb: 4
              }}>
                <Box sx={{
                  width: 100,
                  height: 100,
                  background: blueGradient.primary,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)'
                }}>
                  <Info sx={{ fontSize: 50, color: 'white' }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ 
                  background: blueGradient.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  mb: 2
                }}>
                  Prêt à consulter votre journal OD
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                  Sélectionnez une agence, une période et éventuellement un type de collecte pour consulter le journal des opérations diverses
                </Typography>
                <Button
                  variant="contained"
                  onClick={fetchJournal}
                  startIcon={<Refresh />}
                  disabled={!backendAccessible || loading}
                  sx={{
                    background: backendAccessible ? blueGradient.button : '#bdbdbd',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    px: 5,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: backendAccessible ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                    '&:hover': backendAccessible ? {
                      background: blueGradient.buttonHover,
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)'
                    } : {},
                    transition: 'all 0.3s ease'
                  }}
                >
                  Charger le journal
                </Button>
              </Paper>
            )}

            {/* Section Résumé (seulement après recherche avec résultats) */}
            {hasSearched && !error && entries.length > 0 && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    background: blueGradient.primary,
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                    height: '100%'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{
                          mr: 2,
                          p: 1,
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 1
                        }}>
                          <AttachMoney />
                        </Box>
                        <Typography variant="h6" gutterBottom>
                          Total des montants
                        </Typography>
                      </Box>
                      <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                        {formatMontantAvecDevise(totals.total)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {totals.count} opération{totals.count > 1 ? 's' : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'white',
                    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
                    height: '100%'
                  }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ 
                      color: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <PointOfSale />
                      Répartition par type
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(totals.total_par_type).map(([type, montant]) => (
                        <Grid item xs={6} sm={4} md={3} key={type}>
                          <Card variant="outlined" sx={{ 
                            borderRadius: 2,
                            border: `1px solid ${alpha(typeCollecteColors[type] || '#757575', 0.2)}`,
                            background: alpha(typeCollecteColors[type] || '#757575', 0.05),
                            '&:hover': {
                              boxShadow: `0 4px 12px ${alpha(typeCollecteColors[type] || '#757575', 0.1)}`
                            }
                          }}>
                            <CardContent sx={{ textAlign: 'center', p: 2 }}>
                              <Typography variant="caption" color="textSecondary" display="block" sx={{ 
                                color: typeCollecteColors[type] || '#757575',
                                fontWeight: 'bold',
                                mb: 1
                              }}>
                                {getTypeCollecteLabel(type)}
                              </Typography>
                              <Typography variant="body1" fontWeight="bold" sx={{ 
                                color: typeCollecteColors[type] || '#757575'
                              }}>
                                {formatMontantAvecDevise(montant)}
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

            {/* Section Tableau (seulement après recherche) */}
            {hasSearched && (
              <Paper elevation={6} sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
                mb: 4
              }}>
                {/* En-tête du tableau */}
                <Box sx={{ 
                  p: 4,
                  background: blueGradient.header,
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" component="h3" gutterBottom sx={{ 
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    JOURNAL DES OPÉRATIONS DIVERSES
                  </Typography>
                  <Typography variant="h5" gutterBottom>
                    {getAgenceLabel()}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    {filters.date ? 
                      `Date : ${format(filters.date, 'dd/MM/yyyy')}` :
                      `Période : Du ${format(filters.date_debut, 'dd/MM/yyyy')} au ${format(filters.date_fin, 'dd/MM/yyyy')}`
                    }
                  </Typography>
                </Box>
                
                {loading ? (
                  <Box sx={{ p: 8, textAlign: 'center' }}>
                    <CircularProgress 
                      size={80} 
                      thickness={4}
                      sx={{ 
                        mb: 3,
                        color: '#1976d2',
                        background: blueGradient.light,
                        borderRadius: '50%',
                        p: 1
                      }} 
                    />
                    <Typography variant="h5" gutterBottom sx={{ 
                      background: blueGradient.primary,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold'
                    }}>
                      Chargement du journal...
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {debugInfo}
                    </Typography>
                  </Box>
                ) : error ? (
                  <Box sx={{ p: 8, textAlign: 'center' }}>
                    <Alert 
                      severity="error" 
                      icon={false}
                      sx={{ 
                        maxWidth: 600, 
                        mx: 'auto',
                        background: '#ffebee',
                        color: '#c62828',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{ color: '#c62828' }}>
                        Impossible de charger le journal
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ color: '#c62828' }}>
                        {error}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={fetchJournal}
                        startIcon={<Refresh />}
                        sx={{
                          background: blueGradient.error,
                          color: 'white',
                          fontWeight: 'bold',
                          '&:hover': {
                            background: '#b71c1c'
                          }
                        }}
                      >
                        Réessayer
                      </Button>
                    </Alert>
                  </Box>
                ) : entries.length === 0 ? (
                  <Box sx={{ p: 8, textAlign: 'center' }}>
                    <Box sx={{
                      width: 100,
                      height: 100,
                      background: '#f5f5f5',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      border: '2px dashed #bdbdbd'
                    }}>
                      <Receipt sx={{ fontSize: 50, color: '#757575' }} />
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ 
                      color: '#757575',
                      fontWeight: 'bold',
                      mb: 2
                    }}>
                      Aucune opération trouvée
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                      Aucune opération diverse ne correspond à vos critères de recherche.
                      Essayez de modifier les dates, l'agence ou le type de collecte.
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={resetFilters}
                      sx={{
                        borderColor: '#1976d2',
                        color: '#1976d2',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: '#1565c0',
                          background: alpha('#1976d2', 0.04),
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ 
                            background: blueGradient.primary,
                            '& th': {
                              color: 'black',
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              borderBottom: 'none',
                              py: 2.5,
                              textAlign: 'left',
                              '&:first-of-type': {
                                borderTopLeftRadius: '8px'
                              },
                              '&:last-of-type': {
                                borderTopRightRadius: '8px'
                              }
                            }
                          }}>
                            <TableCell>Date</TableCell>
                            <TableCell>N° OD / Pièce</TableCell>
                            <TableCell>Libellé</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Compte Débit</TableCell>
                            <TableCell>Compte Crédit</TableCell>
                            <TableCell align="right">Montant</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {entries.map((entry) => (
                            <TableRow 
                              key={entry.id}
                              hover
                              sx={{ 
                                '&:nth-of-type(even)': { 
                                  background: alpha('#1976d2', 0.03) 
                                },
                                '&:hover': { 
                                  background: alpha('#1976d2', 0.08),
                                  transition: 'all 0.2s ease'
                                },
                                borderBottom: `1px solid ${alpha('#1976d2', 0.1)}`
                              }}
                            >
                              <TableCell sx={{ 
                                fontWeight: 'medium', 
                                color: '#757575',
                                fontSize: '0.95rem'
                              }}>
                                {formatDate(entry.date_operation)}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: '#1976d2' }}>
                                  {entry.numero_od || "N/A"}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Pièce: {entry.numero_piece || "Sans pièce"}
                                </Typography>
                                <Typography variant="caption" display="block" color="textSecondary">
                                  Agence: {entry.agence?.code || "N/A"} - {entry.agence?.name || "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ color: '#424242' }}>
                                {entry.libelle || "Sans libellé"}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getTypeCollecteLabel(entry.type_collecte)}
                                  size="small"
                                  sx={{ 
                                    background: alpha(typeCollecteColors[entry.type_collecte] || '#757575', 0.1),
                                    color: typeCollecteColors[entry.type_collecte] || '#757575',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    border: `1px solid ${alpha(typeCollecteColors[entry.type_collecte] || '#757575', 0.3)}`,
                                    height: 28
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'medium' }}>
                                  {entry.compte_debit?.code || "N/A"}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {entry.compte_debit?.libelle || "Non disponible"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: '#2196f3', fontWeight: 'medium' }}>
                                  {entry.compte_credit?.code || "N/A"}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {entry.compte_credit?.libelle || "Non disponible"}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body1" fontWeight="bold" sx={{ 
                                  color: entry.montant < 0 ? '#f44336' : '#4caf50'
                                }}>
                                  {formatMontantAvecDevise(entry.montant)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Total Général */}
                    <Box sx={{ 
                      p: 4,
                      mt: 3,
                      background: blueGradient.primary,
                      color: 'white',
                      textAlign: 'center',
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)'
                    }}>
                      <Typography variant="h4" component="div" sx={{ 
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        mb: 1
                      }}>
                        TOTAL GÉNÉRAL : {entries.length} OPÉRATION{entries.length > 1 ? 'S' : ''}
                    </Typography>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {formatMontantAvecDevise(totals.total)}
                      </Typography>
                    </Box>
                  </>
                )}
              </Paper>
            )}

            {/* Actions d'exportation (seulement après recherche avec résultats) */}
            {hasSearched && entries.length > 0 && !loading && !error && (
              <Box sx={{ 
                p: 3, 
                background: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                gap: 3
              }}>
                <Button
                  variant="contained"
                  onClick={handlePrint}
                  startIcon={<Print />}
                  size="large"
                  sx={{
                    background: '#757575',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    px: 5,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(117, 117, 117, 0.3)',
                    '&:hover': {
                      background: '#616161',
                      boxShadow: '0 6px 20px rgba(117, 117, 117, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease',
                    minWidth: 220
                  }}
                >
                  Imprimer
                </Button>
                <Button
                  variant="contained"
                  onClick={handleExportPDF}
                  startIcon={<PictureAsPdf />}
                  size="large"
                  sx={{
                    background: blueGradient.primary,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    px: 5,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      background: blueGradient.buttonHover,
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease',
                    minWidth: 220
                  }}
                >
                  Exporter PDF
                </Button>
                {/*<Button
                  variant="contained"
                  onClick={handleExportExcel}
                  startIcon={<InsertDriveFile />}
                  size="large"
                  sx={{
                    background: blueGradient.success,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    px: 5,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      background: blueGradient.successHover,
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease',
                    minWidth: 220
                  }}
                >
                  Exporter Excel
                </Button>*/}
              </Box>
            )}

            {/* Snackbar */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                severity={snackbar.severity}
                sx={{ width: '100%' }}
                variant="filled"
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Container>
        </Box>
      </Layout>
    </LocalizationProvider>
  );
}