// clientApi.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Assurez-vous que c'est la bonne URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  console.log('Token actuel:', localStorage.getItem('authToken'));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Erreur dans l\'intercepteur de requête:', error);
  return Promise.reject(error);
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Rediriger vers la page de connexion ou rafraîchir le token
      console.error('Erreur 401: Non autorisé - Token invalide ou expiré');
      // Redirection vers la page de connexion
      //window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export de l'instance api pour une utilisation directe
export { api };

// Services pour le plan comptable
export const planComptableService = {
  // Récupérer toutes les catégories comptables
  async getCategories() {
    try {
      const response = await api.get('/plan-comptable/categories');
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories comptables:', error);
      throw error;
    }
  },

  // Récupérer les chapitres, optionnellement filtrés par catégorie et/ou terme de recherche
  async getChapitres(categorieId: string | null = null, searchTerm: string = '') {
    try {
      const params: Record<string, any> = {};
      
      // Ne pas ajouter categorie_id s'il est null ou undefined
      if (categorieId !== null && categorieId !== undefined) {
        params.categorie_id = categorieId;
      }
      
      // Ajouter le terme de recherche s'il est fourni
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      console.log('Paramètres de la requête getChapitres:', params);
      const response = await api.get('/plan_comptable/comptes', { params });
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des chapitres:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  }
};

export const clientService = {
  async getAllClients() {
    try {
      console.log('Tentative de récupération des clients...');
      const response = await api.get('/clients');
      console.log('Réponse reçue:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Erreur détaillée lors de la récupération des clients:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  async getClientById(id: number) {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du client ${id}:`, error);
      throw error;
    }
  }
};