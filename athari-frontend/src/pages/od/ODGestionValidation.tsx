import React, { useEffect, useState, useCallback } from "react";

import {
  Box, Button, Paper, Typography, TextField, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Stack, IconButton, CircularProgress, Alert,
  Snackbar, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Tab, Tabs, Card, CardContent, LinearProgress, Tooltip, Avatar,
  List, ListItem, ListItemIcon, ListItemText, Divider, Pagination
} from "@mui/material";
import {
  Search, CheckCircle, Cancel, Visibility, FilterList,
  Refresh, Assignment, Download, AccountCircle,
  VerifiedUser, GppGood, Check, Clear,
  Person, Business, TrendingUp, HourglassEmpty, DoneAll,
  Block, Security, Warning, LockPerson, ArrowBack,
  ContentCopy, Send, Lock, AttachMoney
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { indigo, red, green, orange, blue } from "@mui/material/colors";
import Layout from "../../components/layout/Layout";
import ApiClient from "../../services/api/ApiClient";

interface OperationDiverse {
  id: number;
  numero_od: string;
  numero_piece: string;
  libelle: string;
  type_operation: string;
  type_collecte: string;
  montant: string;
  devise: string;
  statut: string;
  est_urgence: boolean;
  est_comptabilise: boolean;
  date_operation: string;
  date_validation: string | null;
  justificatif_path:string;
  agence: { id: number; name: string; code: string };
  saisi_par: { id: number; name: string };
  valide_par: { id: number; name: string } | null;
  workflow: any[];
  permissions_validation?: {
    peut_valider_agence: boolean;
    peut_valider_comptable: boolean;
    peut_valider_dg: boolean;
    peut_rejeter: boolean;
    peut_comptabiliser: boolean;
  };
  etat_validations?: {
    chef_agence: boolean;
    chef_comptable: boolean;
    directeur_general: boolean;
    est_complet: boolean;
    peut_comptabiliser: boolean;
  };
}

interface StatutCount {
  [key: string]: number;
}

interface WorkflowStep {
  id: number;
  niveau: number;
  role_requis: string;
  decision: string;
  commentaire: string;
  validateur: { id: number; name: string; email: string };
  date_decision: string;
  created_at: string;
  updated_at: string;
}

interface ValidationStatus {
  niveau: number;
  role: string;
  label: string;
  statut: 'pending' | 'approved' | 'rejected' | 'not_required';
  validateur?: string;
  date?: string;
  commentaire?: string;
  est_requis: boolean; // Nouveau champ : indique si cette validation est requise
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export default function ODGestionValidation() {

  const navigate = useNavigate();
  const BASE_URL = ApiClient.defaults.baseURL.replace('/api', '');
const FILE_BASE = `${BASE_URL}/storage`;

  // États principaux
  const [ods, setOds] = useState<OperationDiverse[]>([]);
  const [filteredOds, setFilteredOds] = useState<OperationDiverse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOd, setSelectedOd] = useState<OperationDiverse | null>(null);
  const [workflowDetails, setWorkflowDetails] = useState<WorkflowStep[]>([]);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus[]>([]);
  const [selectedValidation, setSelectedValidation] = useState<string>("");
  const [commentaire, setCommentaire] = useState("");

  // États utilisateur
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // États UI
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [openDetails, setOpenDetails] = useState(false);
  const [openValidation, setOpenValidation] = useState(false);
  const [openRejet, setOpenRejet] = useState(false);
  const [motifRejet, setMotifRejet] = useState("");
  const [loadingValidation, setLoadingValidation] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  // NOUVEAU ÉTAT: Modal pour le code de caisse
  const [codeCaisseModal, setCodeCaisseModal] = useState<{
    open: boolean;
    code: string;
    odNumero: string;
    montant: string;
    devise: string;
  }>({
    open: false,
    code: '',
    odNumero: '',
    montant: '',
    devise: ''
  });

  // Filtres
  const [filters, setFilters] = useState({
    statut: "",
    type_collecte: "",
    type_operation: "",
    date_debut: "",
    date_fin: ""
  });

  const [statutCounts, setStatutCounts] = useState<StatutCount>({
    'BROUILLON': 0,
    'SAISI': 0,
    'VALIDE_AGENCE': 0,
    'VALIDE_COMPTABLE': 0,
    'VALIDE_DG': 0,
    'VALIDE': 0,
    'REJETE': 0,
    'ANNULE': 0
  });

  // Fonction pour générer un code alphanumérique de 6 caractères
  const genererCodeCaisse = (): string => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return code;
  };

  // Fonction pour copier le code dans le presse-papier
  const copierCode = () => {
    navigator.clipboard.writeText(codeCaisseModal.code).then(() => {
      setSnackbar({
        open: true,
        message: "Code copié dans le presse-papier !",
        severity: "success"
      });
    }).catch(err => {
      console.error('Erreur lors de la copie : ', err);
      setSnackbar({
        open: true,
        message: "Erreur lors de la copie du code",
        severity: "error"
      });
    });
  };

  // Fonction pour envoyer le code (simulation)
  const envoyerCode = async () => {
    try {
      const response = await ApiClient.post(
        `/operation-diverses/${selectedOd?.id}/enregistrer-code-dg`, 
        {
          code: codeCaisseModal.code
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `Code ${codeCaisseModal.code} enregistré pour l'OD ${codeCaisseModal.odNumero}`,
          severity: "success"
        });
        setCodeCaisseModal({ ...codeCaisseModal, open: false });
        
        // Rafraîchir les données
        if (openDetails && selectedOd) {
          handleShowDetails(selectedOd);
        }
      }
    } catch (error: any) {
      console.error('Erreur enregistrement code:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Erreur lors de l'enregistrement du code",
        severity: "error"
      });
    }
  };

  // Fonction modifiée pour la validation DG
  const handleValidate = async () => {
    if (!selectedOd || !selectedValidation) {
      return;
    }

    setLoadingValidation(true);
    
    try {
      let endpoint = "";
      let successMessage = "";
      
      switch (selectedValidation) {
        case "agence": 
          endpoint = `valider-agence`;
          successMessage = "OD validée par le chef d'agence";
          break;
        case "comptable": 
          endpoint = `valider-comptable`;
          successMessage = "OD validée par le chef comptable";
          break;
        case "dg": 
          endpoint = `valider-dg`;
          successMessage = "OD validée par le directeur général";
          break;
        default:
          throw new Error("Type de validation inconnu");
      }

      const response = await ApiClient.post(`/operation-diverses/${selectedOd.id}/${endpoint}`, {
        commentaire: commentaire.trim() || null
      });
      
      // Si c'est le DG qui valide, ouvrir la modal avec le code
      if (selectedValidation === "dg" && userRole === "DG") {
        const codeGenere = genererCodeCaisse();
        setCodeCaisseModal({
          open: true,
          code: codeGenere,
          odNumero: selectedOd.numero_od,
          montant: selectedOd.montant,
          devise: selectedOd.devise
        });
      } else {
        setSnackbar({ open: true, message: successMessage, severity: "success" });
      }
      
      setOpenValidation(false);
      setCommentaire("");
      fetchODs();
      
      if (openDetails && selectedOd) {
        handleShowDetails(selectedOd);
      }
    } catch (error: any) {
      console.error("Erreur validation:", error);
      const message = error.response?.data?.message || error.response?.data?.error || "Erreur de validation";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoadingValidation(false);
    }
  };

  // Fonction pour vérifier si le rôle est autorisé
  const checkAuthorization = (role: string): boolean => {
    const authorizedRoles = [
      "Chef d'Agence (CA)",
      "Chef Comptable",
      "DG"
    ];
    return authorizedRoles.includes(role);
  };

  // Fonction pour récupérer le profil utilisateur
  const fetchUserProfile = async () => {
    try {
      console.log("=== CHARGEMENT PROFIL UTILISATEUR ===");
      
      // 1. Essayer le localStorage d'abord
      const tokenData = localStorage.getItem('token_data');
      if (tokenData) {
        try {
          const parsed = JSON.parse(tokenData);
          console.log("Données localStorage:", parsed);
          
          // Les données sont directement dans parsed
          const userData = parsed;
          
          if (userData && userData.role) {
            console.log("Rôle trouvé dans localStorage:", userData.role);
            setUserProfile(userData);
            setUserRole(userData.role);
            setIsAuthorized(checkAuthorization(userData.role));
            return;
          }
        } catch (error) {
          console.error("Erreur parsing localStorage:", error);
        }
      }

      // 2. Essayer l'API
      try {
        const response = await ApiClient.get("/me");
        console.log("Réponse API /me:", response.data);
        
        // Les données sont directement dans response.data
        const userData = response.data;
        
        if (userData && userData.role) {
          console.log("Rôle trouvé dans API:", userData.role);
          setUserProfile(userData);
          setUserRole(userData.role);
          setIsAuthorized(checkAuthorization(userData.role));
        } else {
          console.log("Aucun rôle trouvé dans la réponse API");
          setIsAuthorized(false);
        }
      } catch (apiError: any) {
        console.log("Erreur API /me:", apiError.message);
        setIsAuthorized(false);
      }
    } catch (error: any) {
      console.error("Erreur récupération profil:", error);
      setIsAuthorized(false);
    }
  };

  // Fonction pour charger les OD depuis l'API
  const fetchODs = async () => {
    setLoading(true);
    try {
      console.log("Début chargement OD...");
      const response = await ApiClient.get("/operation-diverses");
      console.log("Réponse API operation-diverses:", response.data);
      
      let data: OperationDiverse[] = [];
      
      if (response.data && response.data.success) {
        const responseData = response.data.data;
        
        // CORRECTION : Les données sont dans data.operationDiverses.data
        if (responseData?.operationDiverses?.data) {
          data = responseData.operationDiverses.data;
          console.log("Données OD trouvées:", data.length, "éléments");
        } else {
          console.log("Structure de données différente:", responseData);
          
          // Essayer d'autres structures possibles
          if (Array.isArray(responseData)) {
            data = responseData;
          } else if (responseData?.data && Array.isArray(responseData.data)) {
            data = responseData.data;
          }
        }
      }
      
      // Formater les données
      const formattedData = data.map((od: any) => ({
        id: od.id,
        numero_od: od.numero_od || od.numero_OD || od.numero || `OD-${od.id}`,
        numero_piece: od.numero_piece || od.numero_pièce || 'N/A',
        libelle: od.libelle || od.libellé || od.description || 'Sans libellé',
        type_operation: od.type_operation || od.type_opération || 'N/A',
        type_collecte: od.type_collecte || od.type_collecte || 'AUTRE',
        montant: od.montant || od.montant_total || "0",
        devise: od.devise || 'FCFA',
        statut: od.statut || od.status || 'SAISI',
        est_urgence: od.est_urgence || od.urgence || false,
        est_comptabilise: od.est_comptabilise || od.comptabilisé || false,
        date_operation: od.date_operation || od.date_opération || new Date().toISOString(),
        date_validation: od.date_validation || od.date_validation || null,
  // Remplacez la ligne 263 par:
          justificatif_path: (() => {
            const path = od.justificatif_path;
            if (!path) return null;
            
            console.log("🔍 DEBUG justificatif_path:", {
              original: path,
              afterReplace: path.replace(/^app\/public\//, '').replace(/\\/g, '/'),
              urlComplete: `${BASE_URL}/${path.replace(/^app\/public\//, '').replace(/\\/g, '/')}`
            });
            
            return path
              .replace(/^app\/public\//, '')
              .replace(/\\/g, '/');
          })(),
        agence: od.agence || { id: od.agence_id || 0, name: 'N/A', code: 'N/A' },
        saisi_par: od.saisi_par || od.saisiPar || { id: 0, name: 'Inconnu' },
        valide_par: od.valide_par || od.validePar || null,
        workflow: od.workflow || od.workflow_steps || [],
        permissions_validation: od.permissions_validation || {
          peut_valider_agence: false,
          peut_valider_comptable: false,
          peut_valider_dg: false,
          peut_rejeter: false,
          peut_comptabiliser: false
        },
        etat_validations: od.etat_validations || {
          chef_agence: false,
          chef_comptable: false,
          directeur_general: false,
          est_complet: false,
          peut_comptabiliser: false
        }
      }));
      
      console.log("Données formatées:", formattedData);
      setOds(formattedData);
      calculateStatutCounts(formattedData);
      
      // Si aucune donnée n'est trouvée
      if (formattedData.length === 0) {
        console.log("Aucune OD trouvée dans la réponse");
        setSnackbar({ 
          open: true, 
          message: "Aucune opération diverse n'est disponible", 
          severity: "info" 
        });
      }
      
    } catch (error: any) {
      console.error("Erreur chargement OD:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          "Erreur de chargement des OD";
      
      if (error.response?.status === 403) {
        setSnackbar({ 
          open: true, 
          message: "Permission refusée : " + errorMessage, 
          severity: "error" 
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: errorMessage, 
          severity: "error" 
        });
      }
      
      setOds([]);
    } finally {
      setLoading(false);
      console.log("Chargement terminé");
    }
  };

  const calculateStatutCounts = (data: OperationDiverse[]) => {
    const counts: StatutCount = {
      'BROUILLON': 0,
      'SAISI': 0,
      'VALIDE_AGENCE': 0,
      'VALIDE_COMPTABLE': 0,
      'VALIDE_DG': 0,
      'VALIDE': 0,
      'REJETE': 0,
      'ANNULE': 0
    };

    if (Array.isArray(data)) {
      data.forEach(od => {
        if (od && od.statut) {
          const statutKey = od.statut.toUpperCase();
          counts[statutKey] = (counts[statutKey] || 0) + 1;
        }
      });
    }

    setStatutCounts(counts);
  };

  const getStatutColor = (statut: string) => {
    const statutUpper = statut.toUpperCase();
    switch (statutUpper) {
      case 'BROUILLON': return 'default';
      case 'SAISI': return 'info';
      case 'VALIDE_AGENCE': return 'primary';
      case 'VALIDE_COMPTABLE': return 'warning';
      case 'VALIDE_DG': return 'success';
      case 'VALIDE': return 'success';
      case 'REJETE': return 'error';
      case 'ANNULE': return 'secondary';
      default: return 'default';
    }
  };

  const getStatutLabel = (statut: string) => {
    const statutUpper = statut.toUpperCase();
    const labels: { [key: string]: string } = {
      'BROUILLON': 'Brouillon',
      'SAISI': 'Saisi',
      'VALIDE_AGENCE': 'Validé agence',
      'VALIDE_COMPTABLE': 'Validé comptable',
      'VALIDE_DG': 'Validé DG',
      'VALIDE': 'Validé',
      'REJETE': 'Rejeté',
      'ANNULE': 'Annulé'
    };
    return labels[statutUpper] || statut;
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

  // NOUVELLE FONCTION : Analyse le statut de validation avec les nouvelles règles
  const analyzeValidationStatus = (od: OperationDiverse): ValidationStatus[] => {
    const isCharge = od.type_collecte === "CHARGE";
    
    // Récupérer l'état des validations depuis le backend
    const chefAgenceValide = od.etat_validations?.chef_agence || false;
    const chefComptableValide = od.etat_validations?.chef_comptable || false;
    const directeurGeneralValide = od.etat_validations?.directeur_general || false;
    
    // Base des statuts de validation
    const statuses: ValidationStatus[] = [
      {
        niveau: 1,
        role: 'Chef d\'Agence (CA)',
        label: 'Chef d\'Agence',
        statut: chefAgenceValide ? 'approved' : 'pending',
        est_requis: true // Chef d'agence toujours requis
      },
      {
        niveau: 2,
        role: 'Chef Comptable',
        label: 'Chef Comptable',
        statut: chefComptableValide ? 'approved' : 'pending',
        est_requis: true // Chef comptable toujours requis
      },
      {
        niveau: 3,
        role: 'DG',
        label: 'Directeur Général',
        statut: isCharge 
          ? (directeurGeneralValide ? 'approved' : 'pending')
          : 'not_required', // DG requis uniquement pour les charges
        est_requis: isCharge // DG requis seulement pour les charges
      }
    ];

    // Mettre à jour avec les détails du workflow
    if (od.workflow && od.workflow.length > 0) {
      od.workflow.forEach((step: any) => {
        const index = statuses.findIndex(s => s.niveau === step.niveau);
        if (index !== -1) {
          statuses[index].statut = step.decision === 'APPROUVE' ? 'approved' : 
                                  step.decision === 'REJETE' ? 'rejected' : 'pending';
          statuses[index].validateur = step.validateur?.name || step.user_id;
          statuses[index].date = step.date_decision || step.created_at;
          statuses[index].commentaire = step.commentaire;
        }
      });
    }

    return statuses;
  };

  const getStatusIcon = (statut: 'pending' | 'approved' | 'rejected' | 'not_required') => {
    switch (statut) {
      case 'approved': return <Check sx={{ color: green[500] }} />;
      case 'rejected': return <Clear sx={{ color: red[500] }} />;
      case 'pending': return <HourglassEmpty sx={{ color: orange[500] }} />;
      case 'not_required': return <Check sx={{ color: blue[200] }} />;
      default: return <HourglassEmpty sx={{ color: orange[500] }} />;
    }
  };

  const getStatusColor = (statut: 'pending' | 'approved' | 'rejected' | 'not_required') => {
    switch (statut) {
      case 'approved': return green[500];
      case 'rejected': return red[500];
      case 'pending': return orange[500];
      case 'not_required': return blue[200];
      default: return orange[500];
    }
  };

  // NOUVELLE FONCTION : Vérifie si l'utilisateur peut valider selon son rôle et l'état actuel
  const peutValiderSelonRole = (od: OperationDiverse): boolean => {
    const validationStatuses = analyzeValidationStatus(od);
    const isCharge = od.type_collecte === "CHARGE";
    
    // Récupérer les statuts actuels
    const chefAgenceStatus = validationStatuses.find(s => s.niveau === 1);
    const chefComptableStatus = validationStatuses.find(s => s.niveau === 2);
    const dgStatus = validationStatuses.find(s => s.niveau === 3);
    
    // Vérifications par rôle
    switch (userRole) {
      case "Chef d'Agence (CA)":
        // Chef d'agence peut toujours valider si pas encore validé
        return chefAgenceStatus?.statut === 'pending';
        
      case "Chef Comptable":
        // Chef comptable ne peut valider QUE si le chef d'agence a validé
        return chefAgenceStatus?.statut === 'approved' && 
               chefComptableStatus?.statut === 'pending';
               
      case "DG":
        // DG ne peut valider QUE si:
        // 1. C'est une charge (sinon pas requis)
        // 2. Chef d'agence a validé
        // 3. Chef comptable a validé
        // 4. DG n'a pas encore validé
        if (!isCharge) return false; // DG pas requis pour non-charges
        return chefAgenceStatus?.statut === 'approved' && 
               chefComptableStatus?.statut === 'approved' && 
               dgStatus?.statut === 'pending';
               
      default:
        return false;
    }
  };

  // NOUVELLE FONCTION : Vérifie si l'utilisateur peut comptabiliser
  const peutComptabiliser = (od: OperationDiverse): boolean => {
    const validationStatuses = analyzeValidationStatus(od);
    const isCharge = od.type_collecte === "CHARGE";
    
    // Récupérer les statuts actuels
    const chefAgenceStatus = validationStatuses.find(s => s.niveau === 1);
    const chefComptableStatus = validationStatuses.find(s => s.niveau === 2);
    const dgStatus = validationStatuses.find(s => s.niveau === 3);
    
    // Conditions pour comptabiliser :
    // 1. Chef d'agence doit avoir validé
    // 2. Chef comptable doit avoir validé
    // 3. Pour les charges : DG doit avoir validé
    // 4. Pas déjà comptabilisé
    // 5. Doit être Chef Comptable (seul rôle autorisé à comptabiliser)
    
    if (userRole !== "Chef Comptable") return false;
    if (od.est_comptabilise) return false;
    if (chefAgenceStatus?.statut !== 'approved') return false;
    if (chefComptableStatus?.statut !== 'approved') return false;
    
    // Pour les charges, vérifier que le DG a validé
    if (isCharge) {
      return dgStatus?.statut === 'approved';
    }
    
    // Pour les non-charges, chef comptable peut comptabiliser directement après sa validation
    return true;
  };

  // FONCTION MODIFIÉE : Gestion du clic sur le bouton Valider
  const handleValidateClick = (od: OperationDiverse) => {
    const peutValider = peutValiderSelonRole(od);
    
    if (!peutValider) {
      let message = "";
      
      switch (userRole) {
        case "Chef d'Agence (CA)":
          message = "Vous ne pouvez pas valider cette OD (déjà validée ou non éligible)";
          break;
        case "Chef Comptable":
          if (od.etat_validations?.chef_agence === false) {
            message = "Le Chef d'Agence doit valider avant vous";
          } else {
            message = "Vous ne pouvez pas valider cette OD (déjà validée ou non éligible)";
          }
          break;
        case "DG":
          if (od.type_collecte !== "CHARGE") {
            message = "La validation DG n'est requise que pour les charges";
          } else if (od.etat_validations?.chef_agence === false) {
            message = "Le Chef d'Agence doit valider avant le DG";
          } else if (od.etat_validations?.chef_comptable === false) {
            message = "Le Chef Comptable doit valider avant le DG";
          } else {
            message = "Vous ne pouvez pas valider cette OD (déjà validée ou non éligible)";
          }
          break;
        default:
          message = "Rôle non autorisé pour la validation";
      }
      
      setSnackbar({ 
        open: true, 
        message, 
        severity: "warning" 
      });
      return;
    }
    
    // Déterminer le type de validation selon le rôle
    let validationType = "";
    
    if (userRole === "Chef d'Agence (CA)") {
      validationType = "agence";
    } else if (userRole === "Chef Comptable") {
      validationType = "comptable";
    } else if (userRole === "DG") {
      validationType = "dg";
    } else {
      setSnackbar({ 
        open: true, 
        message: "Rôle non autorisé pour la validation", 
        severity: "error" 
      });
      return;
    }
    
    setSelectedValidation(validationType);
    setSelectedOd(od);
    setOpenValidation(true);
  };

  // FONCTION MODIFIÉE : Vérifie si une OD peut être rejetée
  const peutRejeter = (od: OperationDiverse): boolean => {
    // On peut rejeter à n'importe quel moment du workflow
    return userRole === "Chef d'Agence (CA)" || 
           userRole === "Chef Comptable" || 
           userRole === "DG";
  };

  const handleShowDetails = async (od: OperationDiverse) => {
    setSelectedOd(od);
    
    try {
      const response = await ApiClient.get(`/operation-diverses/${od.id}`);
      console.log("Réponse détails OD:", response.data);
      
      let workflowData: WorkflowStep[] = [];
      let odDetails = response.data;
      
      if (odDetails && odDetails.data) {
        odDetails = odDetails.data;
      }
      
      if (odDetails) {
        if (odDetails.workflow && Array.isArray(odDetails.workflow)) {
          workflowData = odDetails.workflow;
        } else if (odDetails.data && odDetails.data.workflow) {
          workflowData = odDetails.data.workflow;
        }
        
        if (odDetails.permissions_validation) {
          setOds(prev => prev.map(item => 
            item.id === od.id 
              ? { ...item, permissions_validation: odDetails.permissions_validation }
              : item
          ));
        }
        
        if (odDetails.etat_validations) {
          setOds(prev => prev.map(item => 
            item.id === od.id 
              ? { ...item, etat_validations: odDetails.etat_validations }
              : item
          ));
        }
      }
      
      setWorkflowDetails(workflowData);
      
      const validationStatuses = analyzeValidationStatus({
        ...od,
        workflow: workflowData,
        etat_validations: odDetails?.etat_validations || od.etat_validations
      });
      setValidationStatus(validationStatuses);
      
    } catch (error: any) {
      console.error("Erreur chargement détails:", error);
      setWorkflowDetails(od.workflow || []);
      const validationStatuses = analyzeValidationStatus(od);
      setValidationStatus(validationStatuses);
    }
    
    setOpenDetails(true);
  };

  const handleReject = async () => {
    if (!selectedOd || !motifRejet.trim()) {
      setSnackbar({ open: true, message: "Veuillez saisir un motif de rejet", severity: "error" });
      return;
    }

    setLoadingValidation(true);
    
    try {
      const response = await ApiClient.post(`/operation-diverses/${selectedOd.id}/rejeter`, {
        motif: motifRejet.trim()
      });
      
      setSnackbar({ open: true, message: "OD rejetée avec succès", severity: "success" });
      setOpenRejet(false);
      setMotifRejet("");
      fetchODs();
      
      if (openDetails && selectedOd) {
        handleShowDetails(selectedOd);
      }
    } catch (error: any) {
      console.error("Erreur rejet:", error);
      const message = error.response?.data?.message || error.response?.data?.error || "Erreur lors du rejet";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoadingValidation(false);
    }
  };

  const handleComptabiliser = async (id: number) => {
    setLoadingValidation(true);
    
    try {
      const response = await ApiClient.post(`/operation-diverses/${id}/comptabiliser`);
      
      setSnackbar({ open: true, message: "OD comptabilisée avec succès", severity: "success" });
      fetchODs();
    } catch (error: any) {
      console.error("Erreur comptabilisation:", error);
      const message = error.response?.data?.message || error.response?.data?.error || "Erreur de comptabilisation";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoadingValidation(false);
    }
  };

  const handleDownloadJustificatif = async (od: OperationDiverse) => {
    try {
      const response = await ApiClient.get(`/operation-diverses/${od.id}/justificatif`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `justificatif_${od.numero_od}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: "Justificatif non disponible", 
        severity: "info" 
      });
    }
  };

  const getUserRoleLabel = () => {
    if (userRole) {
      return userRole;
    }
    return "Utilisateur";
  };

  // NOUVELLE FONCTION : Vérifie si une OD est complètement validée
  const isODCompletementValidee = (od: OperationDiverse) => {
    const validationStatuses = analyzeValidationStatus(od);
    
    // Une OD est complètement validée si tous les niveaux requis sont "approved"
    const niveauxRequis = validationStatuses.filter(status => status.est_requis);
    const niveauxApprouves = niveauxRequis.filter(status => status.statut === 'approved');
    
    return niveauxRequis.length === niveauxApprouves.length;
  };

  // Types d'opérations pour les filtres
  const typesOperation = ["VIREMENT", "FRAIS", "COMMISSION", "REGULARISATION", "AUTRE"];
  const typesCollecte = ["MATA_BOOST", "EPARGNE_JOURNALIERE", "CHARGE", "AUTRE"];
  const statuts = ["BROUILLON", "SAISI", "VALIDE_AGENCE", "VALIDE_COMPTABLE", "VALIDE_DG", "VALIDE", "REJETE", "ANNULE"];

  // useEffect pour appliquer les filtres
  const applyFilters = useCallback(() => {
    console.log("🔄 Application des filtres", { odsLength: ods.length, search, filters });
    
    if (!Array.isArray(ods)) {
      console.log("📭 ods n'est pas un tableau");
      setFilteredOds([]);
      return;
    }

    let filtered = [...ods];

    // Filtre de recherche
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(od =>
        (od.numero_od?.toLowerCase() || '').includes(searchLower) ||
        (od.libelle?.toLowerCase() || '').includes(searchLower) ||
        (od.numero_piece?.toLowerCase() || '').includes(searchLower) ||
        (od.agence?.name?.toLowerCase() || '').includes(searchLower) ||
        (od.agence?.code?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Filtres par statut
    if (filters.statut) {
      filtered = filtered.filter(od => od.statut === filters.statut);
    }

    // Filtre par type de collecte
    if (filters.type_collecte) {
      filtered = filtered.filter(od => od.type_collecte === filters.type_collecte);
    }

    // Filtre par type d'opération
    if (filters.type_operation) {
      filtered = filtered.filter(od => od.type_operation === filters.type_operation);
    }

    // Filtre par dates
    if (filters.date_debut) {
      filtered = filtered.filter(od => {
        if (!od.date_operation) return false;
        return new Date(od.date_operation) >= new Date(filters.date_debut);
      });
    }
    
    if (filters.date_fin) {
      filtered = filtered.filter(od => {
        if (!od.date_operation) return false;
        const dateFin = new Date(filters.date_fin);
        dateFin.setHours(23, 59, 59, 999);
        return new Date(od.date_operation) <= dateFin;
      });
    }

    console.log("✅ Filtrage terminé:", filtered.length, "sur", ods.length, "éléments");
    setFilteredOds(filtered);
  }, [ods, search, filters]);

  // useEffect pour charger le profil utilisateur
  useEffect(() => {
    console.log("=== EFFET CHARGEMENT PROFIL ===");
    fetchUserProfile();
  }, []);

  // useEffect pour charger les OD quand l'utilisateur est autorisé
  useEffect(() => {
    console.log("=== EFFET CHARGEMENT OD ===", { isAuthorized });
    
    if (isAuthorized === true) {
      console.log("Utilisateur autorisé, chargement des OD...");
      fetchODs();
    }
  }, [isAuthorized]);

  // useEffect pour appliquer les filtres
  useEffect(() => {
    console.log("=== EFFET APPLICATION FILTRES ===", { odsLength: ods.length });
    
    if (ods.length > 0) {
      applyFilters();
    }
  }, [applyFilters, ods]);

  // Afficher la page de blocage d'accès si l'utilisateur n'est pas autorisé
  if (isAuthorized === false) {
    return (
      <Layout>
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
          {/* Header avec info utilisateur */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Block sx={{ color: red[500] }} />
                Accès Refusé - Gestion des OD
              </Typography>
              {userProfile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: indigo[500] }}>
                    <AccountCircle sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="body2" color="textSecondary">
                    {userProfile.name} • {getUserRoleLabel()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Carte d'alerte d'accès refusé */}
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4, bgcolor: red[50], border: `2px solid ${red[200]}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar sx={{ bgcolor: red[500], width: 80, height: 80 }}>
                <LockPerson sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold" color={red[700]} gutterBottom>
                  ⚠️ ACCÈS NON AUTORISÉ
                </Typography>
                <Typography variant="body1" paragraph>
                  Vous n'avez pas les permissions nécessaires pour accéder à la page de gestion et validation des OD.
                </Typography>
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Rôle détecté :</strong> {userRole || "Non défini"}
                  </Typography>
                </Alert>
                <Typography variant="body2" color="textSecondary">
                  Seuls les rôles suivants sont autorisés :
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    label="Chef d'Agence (CA)" 
                    color="primary" 
                    variant="outlined"
                    icon={<Business />}
                  />
                  <Chip 
                    label="Chef Comptable" 
                    color="warning" 
                    variant="outlined"
                    icon={<VerifiedUser />}
                  />
                  <Chip 
                    label="Directeur Général (DG)" 
                    color="success" 
                    variant="outlined"
                    icon={<GppGood />}
                  />
                </Stack>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security /> Informations sur l'accès
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Cette page est réservée exclusivement aux membres autorisés du workflow de validation des Opérations Diverses.
              Si vous pensez avoir besoin d'accéder à cette fonctionnalité, veuillez contacter votre administrateur système.
            </Typography>

            {/* Section des statistiques d'accès */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', height: '100%' }}>
                  <CardContent>
                    <Avatar sx={{ bgcolor: red[100], color: red[600], width: 60, height: 60, mx: 'auto', mb: 2 }}>
                      <Warning sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold" color={red[600]}>
                      Accès Refusé
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Votre rôle ne permet pas l'accès
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', height: '100%' }}>
                  <CardContent>
                    <Avatar sx={{ bgcolor: orange[100], color: orange[600], width: 60, height: 60, mx: 'auto', mb: 2 }}>
                      <Person sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" color={orange[600]}>
                      {getUserRoleLabel()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Rôle actuel détecté
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', height: '100%' }}>
                  <CardContent>
                    <Avatar sx={{ bgcolor: blue[100], color: blue[600], width: 60, height: 60, mx: 'auto', mb: 2 }}>
                      <Business sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" color={blue[600]}>
                      3 Rôles
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Autorisés uniquement
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Actions */}
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Security />}
                onClick={() => window.location.href = '/dashboard'}
                sx={{ minWidth: 200 }}
              >
                Retour au Tableau de Bord
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Block />}
                onClick={() => {
                  localStorage.removeItem('token_data');
                  window.location.href = '/login';
                }}
                sx={{ minWidth: 200 }}
              >
                Se Déconnecter
              </Button>
            </Box>
          </Paper>

          {/* Instructions pour obtenir l'accès */}
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: blue[50] }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUser /> Comment obtenir l'accès ?
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Check sx={{ color: green[500] }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Contactez votre superviseur" 
                  secondary="Demandez à être assigné à l'un des rôles autorisés : Chef d'Agence, Chef Comptable ou DG"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Check sx={{ color: green[500] }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Soumettez une demande formelle" 
                  secondary="Utilisez le système de tickets IT ou contactez le support informatique"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Check sx={{ color: green[500] }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Attendez l'approbation" 
                  secondary="Les demandes d'accès sont vérifiées par l'équipe de sécurité"
                />
              </ListItem>
            </List>
          </Paper>

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
        </Box>
      </Layout>
    );
  }

  // Afficher un loader pendant la vérification de l'autorisation
  if (isAuthorized === null) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  // Code pour les utilisateurs autorisés
  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        {/* Header avec info utilisateur */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/ChoicePageOd')} sx={{ mb: 2 }}>
              Retour
            </Button>            
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Assignment sx={{ color: indigo[500] }} />
              Gestion et Validation des OD
            </Typography>
            {userProfile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: indigo[500] }}>
                  <AccountCircle sx={{ fontSize: 16 }} />
                </Avatar>
                <Typography variant="body2" color="textSecondary">
                  {userProfile.name} • {getUserRoleLabel()}
                </Typography>
                {userRole === "Chef d'Agence (CA)" && (
                  <Chip 
                    label="Chef d'Agence" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    icon={<Business sx={{ fontSize: 14 }} />}
                  />
                )}
                {userRole === "Chef Comptable" && (
                  <Chip 
                    label="Chef Comptable" 
                    size="small" 
                    color="warning" 
                    variant="outlined"
                    icon={<VerifiedUser sx={{ fontSize: 14 }} />}
                  />
                )}
                {userRole === "DG" && (
                  <Chip 
                    label="Directeur Général" 
                    size="small" 
                    color="success" 
                    variant="outlined"
                    icon={<GppGood sx={{ fontSize: 14 }} />}
                  />
                )}
              </Box>
            )}
          </Box>
          
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setTabIndex(1)}
            >
              Filtres
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchODs}
              sx={{ bgcolor: indigo[500], '&:hover': { bgcolor: indigo[600] } }}
            >
              Actualiser
            </Button>
          </Stack>
        </Box>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && userRole && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Debug:</strong> Rôle actuel: <strong>{userRole}</strong>
              <br />
              Rôle autorisé? <strong>{isAuthorized ? "✓ OUI" : "✗ NON"}</strong>
            </Typography>
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 4, borderRadius: 3 }}>
          <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} variant="fullWidth">
            <Tab label="Liste" icon={<Assignment />} />
            <Tab label="Filtres" icon={<FilterList />} />
            <Tab label="Statistiques" icon={<TrendingUp />} />
          </Tabs>
        </Paper>

        {/* Contenu selon l'onglet */}
        {tabIndex === 0 && (
          <>
            {/* Statistiques rapides */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {Object.entries(statutCounts).map(([statut, count]) => (
                <Grid item xs={6} sm={4} md={2} key={statut}>
                  <Card sx={{ textAlign: 'center', bgcolor: 'background.paper', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h4" fontWeight="bold">
                        {count}
                      </Typography>
                      <Chip
                        label={getStatutLabel(statut)}
                        size="small"
                        color={getStatutColor(statut) as any}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Barre de recherche */}
            <TextField
              fullWidth
              placeholder="Rechercher par numéro OD, libellé, pièce..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            {/* Table des OD */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <TableContainer>
                {loading ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Chargement des données...
                    </Typography>
                  </Box>
                ) : filteredOds.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      {search || Object.values(filters).some(f => f) 
                        ? "Aucune OD ne correspond aux critères de recherche" 
                        : "Aucune OD disponible"}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={fetchODs}
                      sx={{ mt: 2 }}
                    >
                      Réessayer
                    </Button>
                  </Box>
                ) : (
                  <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell><strong>N° OD</strong></TableCell>
                        <TableCell><strong>Libellé</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Montant</strong></TableCell>
                        <TableCell><strong>Validation</strong></TableCell>
                        <TableCell><strong>Statut</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOds.map((od) => {
                        const validationStatuses = analyzeValidationStatus(od);
                        const peutValider = peutValiderSelonRole(od);
                        const peutRejeterOD = peutRejeter(od);
                        const peutComptabiliserOD = peutComptabiliser(od);
                        const isCharge = od.type_collecte === "CHARGE";
                        
                        return (
                          <TableRow key={od.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {od.numero_od || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Pièce: {od.numero_piece || 'N/A'}
                              </Typography>
                              {isCharge && (
                                <Chip 
                                  label="CHARGE" 
                                  size="small" 
                                  color="error" 
                                  variant="outlined"
                                  icon={<AttachMoney sx={{ fontSize: 12 }} />}
                                  sx={{ mt: 0.5, fontSize: '0.7rem' }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{od.libelle}</Typography>
                              {od.est_urgence && (
                                <Chip label="URGENT" size="small" color="error" sx={{ mt: 0.5 }} />
                              )}
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                <Chip
                                  label={od.type_operation || 'N/A'}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                                <Chip
                                  label={getTypeCollecteLabel(od.type_collecte)}
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                />
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {parseFloat(od.montant).toLocaleString('fr-FR')} {od.devise || 'FCFA'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                {validationStatuses.map((status, index) => (
                                  <Tooltip 
                                    key={index} 
                                    title={
                                      <Box>
                                        <Typography variant="body2">
                                          <strong>{status.label}</strong>
                                        </Typography>
                                        <Typography variant="caption">
                                          Statut: {status.statut === 'approved' ? 'Validé' : 
                                                  status.statut === 'rejected' ? 'Rejeté' : 
                                                  status.statut === 'pending' ? 'En attente' : 'Non requis'}
                                        </Typography>
                                        {!status.est_requis && (
                                          <Typography variant="caption" display="block">
                                            (Non requis pour ce type d'OD)
                                          </Typography>
                                        )}
                                      </Box>
                                    }
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      {getStatusIcon(status.statut)}
                                    </Box>
                                  </Tooltip>
                                ))}
                                {isODCompletementValidee(od) && (
                                  <Tooltip title="Validation complète">
                                    <DoneAll sx={{ color: green[500], fontSize: 16 }} />
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={getStatutLabel(od.statut)}
                                  size="small"
                                  color={getStatutColor(od.statut) as any}
                                />
                                {od.est_comptabilise && (
                                  <Chip label="Comptabilisé" size="small" color="success" variant="outlined" />
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                                <Tooltip title="Détails et workflow">
                                  <IconButton size="small" onClick={() => handleShowDetails(od)}>
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Télécharger justificatif">
                                  <IconButton size="small" onClick={() => handleDownloadJustificatif(od)}>
                                    <Download fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                {/* Bouton Valider - DÉSACTIVÉ SI NON AUTORISÉ */}
                                <Tooltip title={
                                  peutValider 
                                    ? `Valider cette OD (${getUserRoleLabel()})`
                                    : "Vous ne pouvez pas valider cette OD dans l'état actuel"
                                }>
                                  <span>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      startIcon={<CheckCircle />}
                                      onClick={() => handleValidateClick(od)}
                                      disabled={!peutValider}
                                      sx={{ minWidth: '100px' }}
                                    >
                                      Valider
                                    </Button>
                                  </span>
                                </Tooltip>

                                {/* Bouton Rejeter - DÉSACTIVÉ SI NON AUTORISÉ */}
                                <Tooltip title={
                                  peutRejeterOD 
                                    ? "Rejeter cette OD"
                                    : "Vous ne pouvez pas rejeter cette OD"
                                }>
                                  <span>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="error"
                                      startIcon={<Cancel />}
                                      onClick={() => {
                                        setSelectedOd(od);
                                        setOpenRejet(true);
                                      }}
                                      disabled={!peutRejeterOD}
                                      sx={{ minWidth: '100px' }}
                                    >
                                      Rejeter
                                    </Button>
                                  </span>
                                </Tooltip>

                                {/* Bouton Comptabiliser - DÉSACTIVÉ SI NON AUTORISÉ */}
                                {peutComptabiliserOD && (
                                  <Tooltip title="Comptabiliser cette OD (Chef Comptable uniquement)">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="primary"
                                      startIcon={<VerifiedUser />}
                                      onClick={() => handleComptabiliser(od.id)}
                                      sx={{ minWidth: '130px' }}
                                    >
                                      Comptabiliser
                                    </Button>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </TableContainer>
            </Paper>
          </>
        )}

        {/* Onglet Filtres */}
        {tabIndex === 1 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filtres avancés
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={filters.statut}
                    onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                    label="Statut"
                  >
                    <MenuItem value="">Tous les statuts</MenuItem>
                    {statuts.map(statut => (
                      <MenuItem key={statut} value={statut}>
                        {getStatutLabel(statut)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Type de collecte</InputLabel>
                  <Select
                    value={filters.type_collecte}
                    onChange={(e) => setFilters({ ...filters, type_collecte: e.target.value })}
                    label="Type de collecte"
                  >
                    <MenuItem value="">Tous les types</MenuItem>
                    {typesCollecte.map(type => (
                      <MenuItem key={type} value={type}>
                        {getTypeCollecteLabel(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Type d'opération</InputLabel>
                  <Select
                    value={filters.type_operation}
                    onChange={(e) => setFilters({ ...filters, type_operation: e.target.value })}
                    label="Type d'opération"
                  >
                    <MenuItem value="">Toutes les opérations</MenuItem>
                    {typesOperation.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date début"
                  value={filters.date_debut}
                  onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date fin"
                  value={filters.date_fin}
                  onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setFilters({
                  statut: "",
                  type_collecte: "",
                  type_operation: "",
                  date_debut: "",
                  date_fin: ""
                })}
              >
                Réinitialiser
              </Button>
              <Button
                variant="contained"
                onClick={() => setTabIndex(0)}
              >
                Appliquer
              </Button>
            </Box>
          </Paper>
        )}

        {/* Onglet Statistiques */}
        {tabIndex === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Répartition par statut
                </Typography>
                <Stack spacing={2}>
                  {ods.length > 0 ? (
                    Object.entries(statutCounts).map(([statut, count]) => (
                      <Box key={statut}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{getStatutLabel(statut)}</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {count} ({ods.length > 0 ? ((count / ods.length) * 100).toFixed(1) : '0'}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={ods.length > 0 ? (count / ods.length) * 100 : 0}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getStatutColor(statut) === 'default' ? 'grey.500' : getStatutColor(statut),
                            }
                          }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" textAlign="center">
                      Aucune donnée disponible
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Total des montants par type
                </Typography>
                <Stack spacing={2}>
                  {ods.length > 0 ? (
                    typesCollecte.map(type => {
                      const total = ods
                        .filter(od => od.type_collecte === type)
                        .reduce((sum, od) => sum + parseFloat(od.montant || "0"), 0);
                      
                      if (total === 0) return null;
                      
                      return (
                        <Card key={type} variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {getTypeCollecteLabel(type)}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {total.toLocaleString('fr-FR')} FCFA
                            </Typography>
                          </Box>
                        </Card>
                      );
                    }).filter(Boolean)
                  ) : (
                    <Typography variant="body2" color="textSecondary" textAlign="center">
                      Aucune donnée disponible
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Modal Détails avec Workflow de Validation */}
        <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Assignment sx={{ color: indigo[500] }} />
              <Box>
                <Typography variant="h6">Détails OD: {selectedOd?.numero_od}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Workflow de validation
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedOd && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Informations générales
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">Libellé:</Typography>
                      <Typography variant="body1">{selectedOd.libelle}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Type opération:</Typography>
                      <Typography variant="body1">{selectedOd.type_operation}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Type collecte:</Typography>
                      <Typography variant="body1">{getTypeCollecteLabel(selectedOd.type_collecte)}</Typography>
                      {selectedOd.type_collecte === "CHARGE" && (
                        <Chip 
                          label="Nécessite validation DG" 
                          size="small" 
                          color="warning" 
                          sx={{ mt: 1 }}
                          icon={<AttachMoney sx={{ fontSize: 14 }} />}
                        />
                      )}
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Montant:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {parseFloat(selectedOd.montant).toLocaleString('fr-FR')} {selectedOd.devise}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Date opération:</Typography>
                      <Typography variant="body1">
                        {selectedOd.date_operation ? new Date(selectedOd.date_operation).toLocaleDateString('fr-FR') : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Numéro pièce:</Typography>
                      <Typography variant="body1">{selectedOd.numero_piece}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Agence:</Typography>
                      <Typography variant="body1">{selectedOd.agence?.name} ({selectedOd.agence?.code})</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">Saisi par:</Typography>
                      <Typography variant="body1">{selectedOd.saisi_par?.name || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">Validé par:</Typography>
                      <Typography variant="body1">{selectedOd.valide_par?.name || 'Non validé'}</Typography>
                    </Grid>
                    
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Pièce jointe justificative :
                </Typography>
                
                {selectedOd.justificatif_path ? (
                  <Box sx={{ mt: 1 }}>
                    {/\.(jpg|jpeg|png|webp|gif)$/i.test(selectedOd.justificatif_path) ? (
                      <Card variant="outlined" sx={{ maxWidth: 400, overflow: 'hidden' }}>
                        <Box 
                          component="img"
                          src={`${FILE_BASE}/${selectedOd.justificatif_path}`}

                          alt="Justificatif"
                          sx={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: 300,
                            objectFit: 'contain',
                            cursor: 'pointer',
                            bgcolor: '#f8f9fa'
                          }}
                          onClick={() => window.open(`${FILE_BASE}/${selectedOd.justificatif_path}`, '_blank')}
                        />
                        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 }, textAlign: 'center' }}>
                          <Button 
                            size="small" 
                            startIcon={<Visibility />} 
                            onClick={() => window.open(`${FILE_BASE}/${selectedOd.justificatif_path}`, '_blank')}
                          >
                            Voir en plein écran
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => window.open(`${BASE_URL}/${selectedOd.justificatif_path}`, '_blank')}
                      >
                        Télécharger le justificatif (Fichier)
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Alert severity="info" variant="outlined" sx={{ py: 0 }}>
                    Aucun justificatif n'a été rattaché à cette opération.
                  </Alert>
                )}
              </Grid>

                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    État de validation
                  </Typography>
                  
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle2">
                              Validation globale:
                            </Typography>
                            {isODCompletementValidee(selectedOd) ? (
                              <Chip
                                label="COMPLÈTEMENT VALIDÉE"
                                color="success"
                                icon={<DoneAll />}
                                sx={{ fontWeight: 'bold' }}
                              />
                            ) : (
                              <Chip
                                label="EN COURS DE VALIDATION"
                                color="warning"
                                icon={<HourglassEmpty />}
                              />
                            )}
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Détails par niveau:
                          </Typography>
                          <List dense>
                            {validationStatus.map((status, index) => (
                              <React.Fragment key={index}>
                                <ListItem>
                                  <ListItemIcon>
                                    {getStatusIcon(status.statut)}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" fontWeight="medium">
                                          {status.label}
                                        </Typography>
                                        {!status.est_requis && (
                                          <Chip label="Non requis" size="small" variant="outlined" />
                                        )}
                                        {status.est_requis && status.statut === 'pending' && selectedOd.type_collecte === "CHARGE" && status.niveau === 3 && (
                                          <Chip label="Nécessaire (charge)" size="small" color="warning" />
                                        )}
                                      </Box>
                                    }
                                    secondary={
                                      <Box sx={{ mt: 0.5 }}>
                                        {status.validateur && (
                                          <Typography variant="caption" display="block">
                                            Validateur: {status.validateur}
                                          </Typography>
                                        )}
                                        {status.date && (
                                          <Typography variant="caption" display="block">
                                            Date: {new Date(status.date).toLocaleDateString('fr-FR')} à{' '}
                                            {new Date(status.date).toLocaleTimeString('fr-FR')}
                                          </Typography>
                                        )}
                                        {status.commentaire && (
                                          <Typography variant="caption" display="block">
                                            Commentaire: {status.commentaire}
                                          </Typography>
                                        )}
                                        {!status.est_requis && (
                                          <Typography variant="caption" display="block" color="text.secondary">
                                            Non requis pour ce type d'OD
                                          </Typography>
                                        )}
                                      </Box>
                                    }
                                  />
                                  <Box>
                                    <Chip
                                      label={status.statut === 'approved' ? 'Validé' : 
                                            status.statut === 'rejected' ? 'Rejeté' : 
                                            status.statut === 'pending' ? 'En attente' : 'Non requis'}
                                      size="small"
                                      sx={{
                                        bgcolor: getStatusColor(status.statut),
                                        color: 'white',
                                        fontWeight: 'medium'
                                      }}
                                    />
                                  </Box>
                                </ListItem>
                                {index < validationStatus.length - 1 && <Divider variant="inset" component="li" />}
                              </React.Fragment>
                            ))}
                          </List>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="body2" gutterBottom>
                              <strong>Résumé des règles de validation:</strong>
                            </Typography>
                            <Typography variant="body2">
                              1. Chef d'Agence: <strong>Toujours requis</strong> - Premier niveau
                              <br />
                              2. Chef Comptable: <strong>Toujours requis</strong> - Nécessite validation CA
                              <br />
                              3. Directeur Général: <strong>Uniquement pour les charges</strong> - Nécessite validation CA et Chef Comptable
                            </Typography>
                            {isODCompletementValidee(selectedOd) ? (
                              <Alert severity="success" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                  <strong>✓ Cette OD est complètement validée et peut être comptabilisée.</strong>
                                </Typography>
                              </Alert>
                            ) : (
                              <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                  <strong>⏳ Cette OD nécessite encore des validations.</strong>
                                  <br />
                                  {validationStatus.find(s => s.niveau === 1)?.statut !== 'approved' && "• Chef d'Agence doit valider"}
                                  <br />
                                  {validationStatus.find(s => s.niveau === 1)?.statut === 'approved' && 
                                   validationStatus.find(s => s.niveau === 2)?.statut !== 'approved' && "• Chef Comptable peut maintenant valider"}
                                  <br />
                                  {selectedOd.type_collecte === "CHARGE" && 
                                   validationStatus.find(s => s.niveau === 2)?.statut === 'approved' && 
                                   validationStatus.find(s => s.niveau === 3)?.statut !== 'approved' && "• DG peut maintenant valider (charge)"}
                                </Typography>
                              </Alert>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Historique détaillé du workflow */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Historique détaillé du workflow
                  </Typography>
                  <Stack spacing={2}>
                    {workflowDetails.length > 0 ? (
                      workflowDetails.map((step, index) => (
                        <Card key={index} variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="subtitle2">
                                  Niveau {step.niveau}: {step.role_requis}
                                </Typography>
                                {step.validateur && (
                                  <Typography variant="body2" color="textSecondary">
                                    Validateur: {step.validateur.name}
                                  </Typography>
                                )}
                                {step.commentaire && (
                                  <Typography variant="body2" sx={{ mt: 1 }}>
                                    Commentaire: {step.commentaire}
                                  </Typography>
                                )}
                              </Box>
                              {step.decision && (
                                <Chip
                                  label={step.decision}
                                  color={step.decision === 'APPROUVE' ? 'success' : 'error'}
                                  size="small"
                                />
                              )}
                            </Box>
                            {step.date_decision && (
                              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                Le {new Date(step.date_decision).toLocaleDateString('fr-FR')} à{' '}
                                {new Date(step.date_decision).toLocaleTimeString('fr-FR')}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary" textAlign="center">
                        Aucun historique de workflow disponible
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetails(false)}>Fermer</Button>
            
            {/* Boutons de validation/rejet conditionnels */}
            {selectedOd && peutValiderSelonRole(selectedOd) && (
              <Button
                variant="contained"
                onClick={() => {
                  setOpenDetails(false);
                  handleValidateClick(selectedOd);
                }}
              >
                Valider cette OD
              </Button>
            )}
            
            {selectedOd && peutRejeter(selectedOd) && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setOpenDetails(false);
                  setSelectedOd(selectedOd);
                  setOpenRejet(true);
                }}
              >
                Rejeter cette OD
              </Button>
            )}
            
            {/* Bouton comptabiliser si chef comptable et OD complètement validée */}
            {selectedOd && userRole === "Chef Comptable" && peutComptabiliser(selectedOd) && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleComptabiliser(selectedOd.id);
                  setOpenDetails(false);
                }}
                startIcon={<VerifiedUser />}
              >
                Comptabiliser
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Modal Validation */}
        <Dialog open={openValidation} onClose={() => setOpenValidation(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUser sx={{ color: indigo[500] }} />
              Valider l'OD {selectedOd?.numero_od}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Vous êtes en train de valider cette OD en tant que {getUserRoleLabel()}
            </Typography>
            
            {selectedOd && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Type d'OD:</strong> {getTypeCollecteLabel(selectedOd.type_collecte)}
                  <br />
                  {selectedOd.type_collecte === "CHARGE" && 
                   userRole === "DG" && 
                   "⚠️ Validation DG requise pour les charges"}
                  {selectedOd.type_collecte !== "CHARGE" && 
                   userRole === "DG" && 
                   "ℹ️ Validation DG non requise pour ce type d'OD"}
                </Typography>
              </Alert>
            )}
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Commentaire (optionnel)"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="Ajoutez un commentaire si nécessaire..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenValidation(false);
              setCommentaire("");
            }} color="inherit">
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleValidate}
              disabled={loadingValidation}
              startIcon={loadingValidation ? <CircularProgress size={20} /> : <CheckCircle />}
            >
              {loadingValidation ? "Validation..." : "Confirmer la validation"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal Rejet */}
        <Dialog open={openRejet} onClose={() => setOpenRejet(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Rejeter l'OD {selectedOd?.numero_od}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Motif du rejet (obligatoire)"
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
              sx={{ mt: 2 }}
              required
              error={!motifRejet.trim()}
              helperText={!motifRejet.trim() ? "Le motif est obligatoire" : ""}
              placeholder="Expliquez les raisons du rejet..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenRejet(false);
              setMotifRejet("");
            }} color="inherit">
              Annuler
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleReject}
              disabled={!motifRejet.trim() || loadingValidation}
              startIcon={loadingValidation ? <CircularProgress size={20} /> : <Cancel />}
            >
              {loadingValidation ? "Rejet en cours..." : "Confirmer le rejet"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal: Code pour la caisse (s'affiche après validation DG) */}
        <Dialog 
          open={codeCaisseModal.open} 
          onClose={() => setCodeCaisseModal({...codeCaisseModal, open: false})}
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Lock sx={{ color: green[600] }} />
              <Box>
                <Typography variant="h6">Code de Caisse Généré</Typography>
                <Typography variant="body2" color="textSecondary">
                  OD: {codeCaisseModal.odNumero}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold" color="text.primary">
                Communiquer ce code à la caissière
              </Typography>
              
              <Paper 
                sx={{ 
                  p: 4, 
                  my: 3,
                  bgcolor: green[50],
                  border: `3px solid ${green[300]}`,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    bgcolor: green[300],
                    background: `linear-gradient(90deg, ${green[300]}, ${green[500]})`
                  }}
                />
                
                <Typography 
                  variant="h1" 
                  fontWeight="bold" 
                  letterSpacing={8}
                  sx={{ 
                    color: green[800],
                    fontFamily: "'Courier New', monospace",
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                    py: 1
                  }}
                >
                  {codeCaisseModal.code}
                </Typography>
                
                <Box 
                  sx={{ 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    bgcolor: green[300],
                    background: `linear-gradient(90deg, ${green[500]}, ${green[300]})`
                  }}
                />
              </Paper>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                <strong>Montant:</strong> {parseFloat(codeCaisseModal.montant).toLocaleString('fr-FR')} {codeCaisseModal.devise}
              </Typography>
              
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 3, 
                  textAlign: 'left',
                  '& .MuiAlert-icon': { alignItems: 'center' }
                }}
              >
                <Typography variant="body2">
                  <strong>Instructions importantes:</strong>
                  <br />• Transmettez ce code à la caissière pour le paiement
                  <br />• Le code est unique et sécurisé
                  <br />• Il sera nécessaire pour valider la transaction en caisse
                </Typography>
              </Alert>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={() => setCodeCaisseModal({...codeCaisseModal, open: false})}
              color="inherit"
              sx={{ minWidth: 120 }}
            >
              Fermer
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={copierCode}
              startIcon={<ContentCopy />}
              sx={{ minWidth: 120 }}
            >
              Copier
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={envoyerCode}
              startIcon={<Send />}
              sx={{ minWidth: 120 }}
            >
              Envoyer
            </Button>
          </DialogActions>
        </Dialog>

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
      </Box>
    </Layout>
  );
}