import ApiClient from './api/ApiClient';

import type { Agence } from '../types/agenceTypes';

// Interface pour les données d'agence (basée sur votre réponse API)
export interface AgenceApi {
  id: number;
  code: string;
  agency_name: string;  // ⚠️ Changé de "name" à "agency_name"
  initials: string;     // ⚠️ Changé de "short_name" à "initials"
  created_at: string;
}

// Interface pour la réponse API paginée
export interface AgencesPaginatedResponse {
  data: AgenceApi[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

// Service pour les agences
const agenceService = {
  // Récupérer toutes les agences
  async getAgences(): Promise<Agence[]> {
    try {
      console.log('📍 Appel API pour récupérer les agences...');
      
      const response = await ApiClient.get<AgencesPaginatedResponse>('/agencies');
      console.log('✅ Réponse API brute:', response);
      console.log('📊 Données de réponse:', response.data);
      
      const agencesData = response.data;
      
      if (agencesData && agencesData.data && Array.isArray(agencesData.data)) {
        console.log(`📋 ${agencesData.data.length} agences trouvées`);
        
        return agencesData.data.map(agence => ({
          id: agence.id,
          code: agence.code,
          name: agence.agency_name,        // ⚠️ Mapping correct
          shortName: agence.initials,      // ⚠️ Mapping correct
          createdAt: agence.created_at,
          updatedAt: agence.created_at,    // Utiliser created_at comme fallback
        }));
      } else {
        console.error('❌ Structure de réponse inattendue:', agencesData);
        throw new Error('Format de réponse inattendu de l\'API');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur dans agenceService.getAgences:', error);
      
      // Log détaillé de l'erreur
      if (error.response) {
        console.error('📡 Détails de la réponse erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          url: error.response.config?.url
        });
        
        if (error.response.status === 404) {
          throw new Error('Endpoint /agencies non trouvé (404). Vérifiez la configuration des routes Laravel.');
        } else if (error.response.status === 500) {
          throw new Error('Erreur serveur interne (500) lors de la récupération des agences. Vérifiez les logs Laravel.');
        }
        throw new Error(error.response.data?.message || `Erreur ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        console.error('🌐 Pas de réponse du serveur:', error.request);
        throw new Error('Impossible de se connecter au serveur Laravel. Vérifiez que le serveur est démarré (php artisan serve).');
      } else {
        console.error('⚡ Erreur de configuration:', error.message);
        throw new Error(error.message || 'Erreur inconnue lors de la récupération des agences.');
      }
    }
  },

  // Récupérer une agence par son ID
  async getAgenceById(id: number): Promise<Agence> {
    try {
      console.log(`📍 Récupération agence ID: ${id}`);
      const response = await ApiClient.get<{ data: AgenceApi }>(`/agencies/${id}`);
      console.log('✅ Réponse agence par ID:', response.data);
      
      const agence = response.data.data;
      
      return {
        id: agence.id,
        code: agence.code,
        name: agence.agency_name,
        shortName: agence.initials,
        createdAt: agence.created_at,
        updatedAt: agence.created_at,
      };
    } catch (error: any) {
      console.error(`❌ Erreur dans agenceService.getAgenceById(${id}):`, error);
      throw error;
    }
  },

  // Vérifier si le backend est accessible
  async testBackend(): Promise<boolean> {
    try {
      console.log('🔍 Test de connexion au backend...');
      // Tester avec un timeout court
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('⏰ Timeout test backend');
      }, 5000);
      
      await ApiClient.get('/agencies', { 
        signal: controller.signal,
        params: { per_page: 1 } // Limiter à 1 résultat pour le test
      });
      clearTimeout(timeoutId);
      console.log('✅ Backend accessible');
      return true;
    } catch (error: any) {
      console.log('❌ Test backend échoué:', error.message);
      return false;
    }
  }
};

export default agenceService;