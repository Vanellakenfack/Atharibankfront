import ApiClient from './ApiClient';
import { format } from 'date-fns';

export interface CaisseMovement {
  numero_compte: string;
  tiers_nom: string;
  libelle_mouvement: string;
  reference_operation: string;
  montant_debit: number;
  montant_credit: number;
  type_versement: string;
  code_caisse: string;
  code_agence: string;
  date_mouvement: string;
}

export interface CaisseJournalApiResponse {
  statut: string;
  solde_ouverture: number;
  journal_groupe: CaisseMovement[];
  total_debit: number;
  total_credit: number;
  solde_cloture: number;
  synthese?: Record<string, number>;
}

export interface CaisseFilterParams {
  dateDebut: Date;
  dateFin: Date;
  caisse_id: string;
  code_agence: string;
}

class JournalCaisseService {
  async getCaisseJournalEntries(filters: CaisseFilterParams): Promise<CaisseJournalApiResponse> {
    try {
      console.log('Récupération du journal de caisse avec filtres:', filters);
      
      const params = {
        date_debut: format(filters.dateDebut, 'yyyy-MM-dd'),
        date_fin: format(filters.dateFin, 'yyyy-MM-dd'),
        caisse_id: filters.caisse_id,
        code_agence: filters.code_agence
      };
      
      console.log('Paramètres envoyés:', params);
      
      const response = await ApiClient.get('/caisse/journal', { params });
      
      console.log('Réponse API journal caisse reçue:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Erreur lors de la récupération du journal de caisse:', error);
      throw error;
    }
  }
  
  async exporterJournalPDF(filters: CaisseFilterParams): Promise<void> {
    try {
      const params = {
        date_debut: format(filters.dateDebut, 'yyyy-MM-dd'),
        date_fin: format(filters.dateFin, 'yyyy-MM-dd'),
        caisse_id: filters.caisse_id,
        code_agence: filters.code_agence
      };
      
      console.log('Export PDF journal caisse avec paramètres:', params);
      
      const response = await ApiClient.get('/caisse/journal/export-pdf', {
        params,
        responseType: 'blob'
      });
      
      if (!response.data || response.data.size === 0) {
        throw new Error('Le PDF généré est vide');
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `journal_caisse_${format(filters.dateDebut, 'yyyyMMdd')}_${format(filters.dateFin, 'yyyyMMdd')}.pdf`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'export PDF journal caisse:', error);
      
      if (error.response) {
        console.error('Réponse d\'erreur:', error.response);
        
        if (error.response.status === 404) {
          throw new Error('Endpoint PDF journal caisse non trouvé.');
        }
        if (error.response.status === 500) {
          let errorMessage = 'Erreur serveur lors de la génération du PDF.';
          
          if (error.response.data) {
            if (error.response.data instanceof Blob) {
              try {
                const text = await error.response.data.text();
                const jsonData = JSON.parse(text);
                errorMessage = jsonData.message || jsonData.error || errorMessage;
              } catch (e) {
                errorMessage = 'Erreur serveur. Vérifiez les logs Laravel.';
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
  
  async testBackend(): Promise<boolean> {
    try {
      // Test simple de connexion
      const response = await ApiClient.get('/caisse/journal', {
        params: {
          date_debut: format(new Date(), 'yyyy-MM-dd'),
          date_fin: format(new Date(), 'yyyy-MM-dd'),
          caisse_id: '1',
          code_agence: '001'
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Test backend journal caisse échoué:', error);
      return false;
    }
  }
}

export default new JournalCaisseService();