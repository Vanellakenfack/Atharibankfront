// src/services/api/compteApi.js (version temporaire avec mock)
import axios from 'axios';

const API_URL = '/api/comptes';

// Données simulées pour les comptes
const MOCK_COMPTES = [
  {
    id: 3,
    numero_compte: "002000001311I",
    client_id: 16,
    type_compte_id: 31,
    plan_comptable_id: 852,
    devise: "FCFA",
    gestionnaire_nom: "baba",
    gestionnaire_prenom: "sylmain",
    gestionnaire_code: "G001",
    rubriques_mata: null,
    duree_blocage_mois: null,
    statut: "actif",
    solde: "1800000.00",
    notice_acceptee: true,
    date_acceptation_notice: "2026-01-02T16:26:38.000000Z",
    signature_path: "signatures/GOsMobVogwT45e44p3xtv1H8ojM5TuBfPlIv3SRr.png",
    date_ouverture: "2026-01-02T16:26:38.000000Z",
    date_cloture: null,
    observations: null,
    created_at: "2026-01-02T16:26:38.000000Z",
    updated_at: "2026-01-16T13:16:08.000000Z",
    deleted_at: null,
    client: {
      id: 16,
      num_client: "002000001",
      agency_id: 5,
      type_client: "morale",
      telephone: "559",
      email: "admin@atharibank.com",
      adresse_ville: "Yaoundé",
      adresse_quartier: "bonaberi",
      bp: null,
      pays_residence: "Cameroun",
      immobiliere: null,
      autres_biens: null,
      gestionnaire: null,
      profil: null,
      taxable: 0,
      interdit_chequier: 0,
      solde_initial: "0.00",
      created_at: "2025-12-30T07:48:46.000000Z",
      updated_at: "2025-12-30T07:48:46.000000Z",
      etat: "",
      lieu_dit_domicile: "",
      lieu_dit_activite: "",
      quartier_activite: "",
      ville_activite: "",
      nui: null,
      photo_localisation_domicile: null,
      photo_localisation_activite: null,
      nom_complet: "Client #002000001",
      morale: null
    }
  },
  // Ajoutez d'autres comptes simulés si nécessaire
];

const getAllComptes = async () => {
  try {
    // Essayez d'abord l'API réelle
    const response = await axios.get(API_URL, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.warn('API non disponible, utilisation des données simulées');
    // Retourne les données simulées en cas d'échec
    return {
      success: true,
      data: MOCK_COMPTES
    };
  }
};

const getCompteById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.warn(`API non disponible, recherche dans les données simulées pour le compte ${id}`);
    const compte = MOCK_COMPTES.find(c => c.id === id);
    return {
      success: true,
      data: compte || null
    };
  }
};

const getComptesByClientId = async (clientId) => {
  try {
    const response = await axios.get(`${API_URL}/client/${clientId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.warn(`API non disponible, filtrage des données simulées pour le client ${clientId}`);
    const comptes = MOCK_COMPTES.filter(c => c.client_id === clientId);
    return {
      success: true,
      data: comptes
    };
  }
};

const searchComptes = async (searchTerm) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { q: searchTerm },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.warn('API non disponible, recherche dans les données simulées');
    const filtered = MOCK_COMPTES.filter(compte => {
      const clientName = compte.client?.nom_complet || '';
      const numClient = compte.client?.num_client || '';
      const numCompte = compte.numero_compte || '';
      
      return clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             numClient.toLowerCase().includes(searchTerm.toLowerCase()) ||
             numCompte.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    return {
      success: true,
      data: filtered
    };
  }
};

const getComptesActifs = async () => {
  try {
    const response = await axios.get(`${API_URL}/actifs`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.warn('API non disponible, filtrage des comptes actifs dans les données simulées');
    const comptesActifs = MOCK_COMPTES.filter(c => c.statut === 'actif');
    return {
      success: true,
      data: comptesActifs
    };
  }
};

// Exportation nommée
export const compteService = {
  getAllComptes,
  getCompteById,
  getComptesByClientId,
  searchComptes,
  getComptesActifs
};

// Exportation par défaut
export default {
  getAllComptes,
  getCompteById,
  getComptesByClientId,
  searchComptes,
  getComptesActifs
};