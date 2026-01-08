import ApiClient from './ApiClient';
import { format } from 'date-fns';

export interface JournalEntryApi {
  agence: string;
  date_ouverture: string;
  numero_client: string;
  numero_compte: string;
  type_compte: string;
  intitule_mouvement: string;
  montant_debit: string;
  montant_credit: string;
  nom_client?: string;
  journal?: string;
}

export interface JournalApiResponse {
  statut: string;
  metadata: {
    total_operations: number;
    periode: string;
    genere_le: string;
  };
  donnees: JournalEntryApi[];
}

export interface FilterParams {
  dateDebut: Date;
  dateFin: Date;
  agence: string;
  devise: string;
}

class JournalService {
  async getJournalEntries(filters: FilterParams): Promise<JournalApiResponse> {
    try {
      console.log('Récupération des données du journal avec filtres:', filters);
      
      // Convertir les dates au format backend (yyyy-MM-dd)
      const params = {
        date_debut: format(filters.dateDebut, 'yyyy-MM-dd'),
        date_fin: format(filters.dateFin, 'yyyy-MM-dd'),
        code_agence: filters.agence === 'all' ? null : filters.agence
      };
      
      // Nettoyer les params (enlever les valeurs null)
      const cleanParams: any = {};
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== null && params[key as keyof typeof params] !== undefined) {
          cleanParams[key] = params[key as keyof typeof params];
        }
      });
      
      console.log('Paramètres envoyés:', cleanParams);
      
      const response = await ApiClient.get('/comptes/journal-ouverture', { params: cleanParams });
      
      console.log('Réponse API reçue avec', response.data.donnees?.length || 0, 'entrées');
      return response.data;
      
    } catch (error) {
      console.error('Erreur lors de la récupération du journal:', error);
      throw error;
    }
  }
  
  // Méthode pour exporter le PDF via le backend
  async exporterJournalPDF(filters: FilterParams): Promise<void> {
    try {
      // Convertir les dates au format backend
      const params = {
        date_debut: format(filters.dateDebut, 'yyyy-MM-dd'),
        date_fin: format(filters.dateFin, 'yyyy-MM-dd'),
        code_agence: filters.agence === 'all' ? null : filters.agence
      };
      
      // Nettoyer les params
      const cleanParams: any = {};
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== null && params[key as keyof typeof params] !== undefined) {
          cleanParams[key] = params[key as keyof typeof params];
        }
      });
      
      console.log('Export PDF avec paramètres:', cleanParams);
      
      // Configurer la réponse comme blob (fichier)
      const response = await ApiClient.get('/comptes/journal-pdf', {
        params: cleanParams,
        responseType: 'blob'
      });
      
      // Vérifier si la réponse est valide
      if (!response.data || response.data.size === 0) {
        throw new Error('Le PDF généré est vide');
      }
      
      // Créer un URL pour le blob et déclencher le téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Essayer d'obtenir le nom de fichier depuis les headers
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `journal_ouvertures_${format(filters.dateDebut, 'yyyyMMdd')}_${format(filters.dateFin, 'yyyyMMdd')}.pdf`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'export PDF:', error);
      
      // Fournir un message d'erreur plus détaillé
      if (error.response) {
        console.error('Réponse d\'erreur:', error.response);
        
        if (error.response.status === 404) {
          throw new Error('Endpoint PDF non trouvé. Vérifiez que la route /comptes/journal-pdf existe dans le backend.');
        }
        if (error.response.status === 500) {
          // Essayer de lire le message d'erreur du backend
          let errorMessage = 'Erreur serveur lors de la génération du PDF.';
          
          if (error.response.data) {
            // Si c'est un blob, essayer de le lire comme texte
            if (error.response.data instanceof Blob) {
              try {
                const text = await error.response.data.text();
                const jsonData = JSON.parse(text);
                errorMessage = jsonData.message || jsonData.error || errorMessage;
              } catch (e) {
                // Ce n'est pas du JSON
                errorMessage = 'Le backend a retourné une erreur 500. Vérifiez les logs Laravel.';
              }
            } else if (typeof error.response.data === 'object') {
              errorMessage = error.response.data.message || error.response.data.error || errorMessage;
            }
          }
          
          throw new Error(errorMessage);
        }
      }
      
      throw new Error(`Erreur lors de l'export PDF: ${error.message || 'Erreur inconnue'}`);
    }
  }
  
  // Méthode pour tester la connexion au backend
  async testBackend(): Promise<boolean> {
    try {
      const response = await ApiClient.get('/comptes/journal-ouverture', {
        params: {
          date_debut: format(new Date(), 'yyyy-MM-dd'),
          date_fin: format(new Date(), 'yyyy-MM-dd')
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Test backend échoué:', error);
      return false;
    }
  }
}

export default new JournalService();