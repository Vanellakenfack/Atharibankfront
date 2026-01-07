import api from './api/axios';

/**
 * Service simple pour la gestion des chapitres comptables
 */
export const chapitreService = {
  /**
   * Récupère TOUS les chapitres comptables avec pagination automatique
   */
  async getChapitres() {
    try {
      let allChapitres: any[] = [];
      let page = 1;
      let hasMore = true;
      const perPage = 100; // Taille raisonnable

      console.log('Début du chargement des chapitres...');

      while (hasMore) {
        try {
          console.log(`Chargement page ${page}...`);
          
          const response = await api.get('plan-comptable/comptes', {
            params: { page, per_page: perPage }
          });

          const data = response.data;
          let pageData: any[] = [];

          // Extraire les données selon le format
          if (Array.isArray(data)) {
            pageData = data;
            hasMore = data.length === perPage;
          } else if (data.data && Array.isArray(data.data)) {
            pageData = data.data;
            hasMore = page < (data.last_page || data.meta?.last_page || 1);
          } else {
            console.warn('Format inattendu:', data);
            break;
          }

          if (pageData.length === 0) {
            hasMore = false;
          } else {
            allChapitres = [...allChapitres, ...pageData];
            console.log(`Page ${page}: ${pageData.length} chapitres (total: ${allChapitres.length})`);
            page++;
          }

        } catch (pageError) {
          console.error(`Erreur page ${page}:`, pageError);
          // Si c'est la première page, propager l'erreur
          if (page === 1) throw pageError;
          // Sinon, s'arrêter avec ce qu'on a
          hasMore = false;
        }
      }

      console.log(`Chargement terminé: ${allChapitres.length} chapitres`);
      return allChapitres;

    } catch (error) {
      console.error('Erreur lors de la récupération des chapitres:', error);
      throw error;
    }
  },

  /**
   * Récupère un chapitre par son ID
   */
  async getChapitre(id: number) {
    try {
      const response = await api.get(`plan-comptable/comptes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du chapitre ${id}:`, error);
      throw error;
    }
  },

  /**
   * Recherche des chapitres
   */
  async searchChapitres(searchTerm: string) {
    try {
      const response = await api.get('plan-comptable/comptes/search', {
        params: { q: searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche des chapitres:', error);
      throw error;
    }
  }
};