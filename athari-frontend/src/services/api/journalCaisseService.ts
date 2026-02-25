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
  mouvements: CaisseMovement[];
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
      
      // ADAPTATION DE LA STRUCTURE - Option 1
      const apiData = response.data;
      
      // DEBUG : Afficher la structure reçue
      console.log('Structure API reçue:', {
        statut: apiData.statut,
        hasGroupes: !!apiData.groupes,
        groupesCount: apiData.groupes ? apiData.groupes.length : 0,
        hasMouvements: !!apiData.mouvements,
        mouvementsCount: apiData.mouvements ? apiData.mouvements.length : 0,
        data: apiData
      });
      
      // Vérifier si on a déjà la structure mouvements
      if (apiData.mouvements && Array.isArray(apiData.mouvements)) {
        // Structure déjà correcte, retourner tel quel
        console.log('✅ Structure mouvements déjà correcte');
        return apiData as CaisseJournalApiResponse;
      }
      
      // Sinon, transformer depuis la structure groupes
      console.log('🔄 Transformation depuis structure groupes...');
      const mouvements: CaisseMovement[] = [];
      
      if (apiData.groupes && Array.isArray(apiData.groupes)) {
        console.log(`📊 ${apiData.groupes.length} groupes trouvés`);
        
        apiData.groupes.forEach((groupe: any, index: number) => {
          console.log(`Groupe ${index + 1}:`, {
            type: groupe.type,
            operationsCount: groupe.operations ? groupe.operations.length : 0
          });
          
          if (groupe.operations && Array.isArray(groupe.operations)) {
            groupe.operations.forEach((operation: any, opIndex: number) => {
              console.log(`Opération ${opIndex + 1}:`, operation);

              // Normaliser les montants débit/crédit en tenant compte de
              // différents formats possibles renvoyés par l'API (entree/sortie,
              // montant + sens, ou champs déjà séparés).
              const rawMontant = operation.montant ?? operation.montant_operation ?? null;
              const rawSens = (operation.sens || operation.type_mouvement || operation.sens_mouvement || operation.type || '').toString();

              let montant_debit = 0;
              let montant_credit = 0;

              if (rawMontant !== null && rawMontant !== undefined && rawMontant !== '') {
                const val = parseFloat(rawMontant) || 0;
                const sens = rawSens.toString().toLowerCase();

                // Heuristiques supplémentaires basées sur le libellé / référence
                const libelleLower = (operation.libelle || operation.libelle_mouvement || '').toString().toLowerCase();
                const refLower = (operation.ref || operation.reference_operation || '').toString().toLowerCase();

                // Cas explicites: si le libellé ou la référence indique un retrait/sortie,
                // il s'agit d'une sortie de caisse => crédit
                const looksLikeRetrait = libelleLower.includes('retrait') || libelleLower.includes('retrait -') || refLower.startsWith('ret') || refLower.includes('ret-') || sens.includes('sortie');

                if (looksLikeRetrait) {
                  montant_credit = val >= 0 ? val : Math.abs(val);
                } else if (sens.includes('d') || sens.includes('debit')) {
                  montant_debit = val >= 0 ? val : Math.abs(val);
                } else if (sens.includes('c') || sens.includes('credit')) {
                  montant_credit = val >= 0 ? val : Math.abs(val);
                } else {
                  // Si pas de sens explicite, déduire par le signe: négatif => crédit
                  if (val < 0) {
                    montant_credit = Math.abs(val);
                  } else {
                    montant_debit = val;
                  }
                }
              } else {
                // Fallback aux champs entree/sortie ou montant_debit/montant_credit
                montant_debit = parseFloat(operation.entree ?? operation.montant_debit) || 0;
                montant_credit = parseFloat(operation.sortie ?? operation.montant_credit) || 0;
                // Si un des deux est négatif, normaliser en valeur absolue
                if (montant_debit < 0) {
                  montant_debit = Math.abs(montant_debit);
                }
                if (montant_credit < 0) {
                  montant_credit = Math.abs(montant_credit);
                }

                // Appliquer heuristique: si le libellé ou la référence indique un retrait/sortie
                // mais les données sont dans `entree`, basculer vers crédit.
                const libelleLowerFallback = (operation.libelle || operation.libelle_mouvement || '').toString().toLowerCase();
                const refLowerFallback = (operation.ref || operation.reference_operation || '').toString().toLowerCase();
                const looksLikeRetraitFallback = libelleLowerFallback.includes('retrait') || libelleLowerFallback.includes('sortie') || refLowerFallback.startsWith('ret') || refLowerFallback.includes('ret-');

                if (looksLikeRetraitFallback && montant_debit > 0 && montant_credit === 0) {
                  montant_credit = montant_debit;
                  montant_debit = 0;
                }
              }

              // Créer un mouvement pour chaque opération
              const mouvement: CaisseMovement = {
                numero_compte: operation.numero_compte || '',
                tiers_nom: operation.tiers || operation.tiers_nom || '',
                libelle_mouvement: operation.libelle || operation.libelle_mouvement || '',
                reference_operation: operation.ref || operation.reference_operation || '',
                montant_debit: montant_debit,
                montant_credit: montant_credit,
                type_versement: groupe.type || operation.type_versement || 'ESPECE',
                code_caisse: operation.code_caisse || '',
                code_agence: filters.code_agence,
                date_mouvement: operation.date || operation.date_mouvement || ''
              };

              console.log(`Mouvement ${opIndex + 1} transformé:`, mouvement);
              mouvements.push(mouvement);
            });
          }
        });
      }
      
      console.log(`✅ ${mouvements.length} mouvements transformés`);
      
      // Retourner la structure attendue par le frontend
      const transformedData: CaisseJournalApiResponse = {
        statut: apiData.statut || 'success',
        solde_ouverture: parseFloat(apiData.solde_ouverture) || 0,
        mouvements: mouvements,
        total_debit: parseFloat(apiData.total_general_debit || apiData.total_debit) || 0,
        total_credit: parseFloat(apiData.total_general_credit || apiData.total_credit) || 0,
        solde_cloture: parseFloat(apiData.solde_cloture) || 0,
        synthese: apiData.synthese || {}
      };
      
      console.log('✅ Données transformées prêtes:', transformedData);
      return transformedData;
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération du journal de caisse:', error);
      
      // Log détaillé pour le debug
      if (error.response) {
        console.error('Détails de la réponse erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      // Retourner une structure vide pour éviter les crashs
      return {
        statut: 'error',
        solde_ouverture: 0,
        mouvements: [],
        total_debit: 0,
        total_credit: 0,
        solde_cloture: 0,
        synthese: {}
      };
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
        },
        timeout: 5000 // Timeout de 5 secondes
      });
      
      console.log('Test backend - Réponse:', {
        status: response.status,
        data: response.data
      });
      
      return response.status === 200;
    } catch (error: any) {
      console.error('Test backend journal caisse échoué:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return false;
    }
  }
}

export default new JournalCaisseService();