import ApiClient from './api/ApiClient';

const sessionService = {
  // Journée + Agence (Étapes 1 & 2)
  ouvrirAgence: async (agenceId: string | number, dateComptable: string) => {
    const response = await ApiClient.post('/sessions/ouvrir-agence', {
      agence_id: agenceId,
      date_comptable: dateComptable
    });
    return response;
  },

  fermerAgence: async (agenceSessionId: number, jourComptableId: number) => {
    const response = await ApiClient.post('/sessions/fermer-agence', {
      agence_session_id: agenceSessionId,
      jour_comptable_id: jourComptableId
    });
    return response;
  },

  // Guichet (Étape 3)
  ouvrirGuichet: async (agenceSessionId: number, guichetId: number, codeGuichet: string) => {
    console.log('📤 Envoi données ouverture guichet:', {
      agence_session_id: agenceSessionId,
      guichet_id: guichetId,
      code_guichet: codeGuichet
    });
    
    const response = await ApiClient.post('/sessions/ouvrir-guichet', {
      agence_session_id: agenceSessionId.toString(),
      guichet_id: guichetId.toString(),
      code_guichet: codeGuichet
    });
    
    console.log('📥 Réponse API ouverture guichet:', response);
    return response;
  },

  fermerGuichet: async (guichetSessionId: number) => {
    const response = await ApiClient.post('/sessions/fermer-guichet', {
      guichet_session_id: guichetSessionId.toString()
    });
    return response;
  },

  // Caisse (Étape 4) - CORRECTION: Paramètres dans le bon ordre
  ouvrirCaisse: async (
    guichetSessionId: number,
    caisseId: number,
    billetage: Record<string, number>,
    soldeSaisi: number,
    codeCaisse?: string // Optionnel car peut être récupéré côté backend
  ) => {
    console.log('📤 Envoi données ouverture caisse:', {
      guichet_session_id: guichetSessionId,
      caisse_id: caisseId,
      billetage: billetage,
      solde_ouverture: soldeSaisi,
      code_caisse: codeCaisse
    });
    
    const response = await ApiClient.post('/sessions/ouvrir-caisse', {
      guichet_session_id: guichetSessionId,
      caisse_id: caisseId,
      billetage: billetage,
      solde_ouverture: soldeSaisi,
      code_caisse: codeCaisse || '' // Envoyer même si vide
    });
    
    console.log('📥 Réponse API ouverture caisse:', response);
    return response;
  },

  fermerCaisse: async (caisseSessionId: number, soldeFermeture: number, billetageFermeture: Record<string, number>) => {
    const response = await ApiClient.post('/sessions/fermer-caisse', {
      caisse_session_id: caisseSessionId,
      solde_fermeture: soldeFermeture,
      billetage: billetageFermeture
    });
    return response;
  },

  // Solde informatique - CORRECTION: Récupération par code caisse
  getSoldeInformatique: async (codeCaisse: string) => {
    console.log('🔍 Récupération solde informatique pour code caisse:', codeCaisse);
    const response = await ApiClient.get(`/sessions/caisses/${codeCaisse}/solde-informatique`);
    console.log('📦 Réponse solde informatique:', response.data);
    return response.data;
  },

  // Bilan caisse
  getBilanCaisse: async (caisseSessionId: number) => {
    console.log('📊 Récupération bilan pour caisse session:', caisseSessionId);
    const response = await ApiClient.get(`/sessions/bilan-caisse/${caisseSessionId}`);
    console.log('📦 Réponse bilan caisse:', response.data);
    return response.data;
  }, // ← CORRECTION ICI: AJOUT DE LA VIRGULE MANQUANTE !

  /**
   * Récupère TOUTES les sessions actives depuis la BD
   * @returns {Promise<{statut: string, sessions: any, message: string}>}
   */
  getSessionsActives: async () => {
    try {
      console.log('📡 Récupération des sessions actives depuis BD...');
      const response = await ApiClient.get('/sessions/actuelles');
      console.log('✅ Sessions actives récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération sessions:', error);
      return { statut: 'error', sessions: null, message: error.message };
    }
  },
  
  /**
   * Récupère uniquement la session AGENCE active
   * @returns {Promise<{statut: string, session: any, message: string}>}
   */
  getAgenceActive: async () => {
    try {
      console.log('📡 Récupération session agence active...');
      const response = await ApiClient.get('/sessions/agence/active');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération agence:', error);
      return { statut: 'error', session: null, message: error.message };
    }
  },
  
  /**
   * Récupère uniquement la session GUICHET active
   * @returns {Promise<{statut: string, session: any, message: string}>}
   */
  getGuichetActive: async () => {
    try {
      console.log('📡 Récupération session guichet active...');
      const response = await ApiClient.get('/sessions/guichet/active');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération guichet:', error);
      return { statut: 'error', session: null, message: error.message };
    }
  },
  
  /**
   * Récupère uniquement la session CAISSE active
   * @returns {Promise<{statut: string, session: any, message: string}>}
   */
  getCaisseActive: async () => {
    try {
      console.log('📡 Récupération session caisse active...');
      const response = await ApiClient.get('/sessions/caisse/active');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération caisse:', error);
      return { statut: 'error', session: null, message: error.message };
    }
  },
  
  /**
   * Met à jour le localStorage avec les sessions actives
   * Simple et direct
   */
  actualiserLocalStorage: async () => {
    try {
      const response = await sessionService.getSessionsActives();
      
      if (response.statut === 'success' && response.sessions) {
        const { agence, guichet, caisse } = response.sessions;
        
        // Nettoyer
        localStorage.clear();
        
        // Mettre les sessions actives
        if (agence) {
          localStorage.setItem('session_agence_id', agence.id);
          localStorage.setItem('agence_id', agence.agence_id);
          localStorage.setItem('agence_nom', agence.nom);
          localStorage.setItem('agence_code', agence.code);
          localStorage.setItem('date_comptable', agence.date_comptable);
          localStorage.setItem('jour_comptable_id', agence.jour_comptable_id);
        }
        
        if (guichet) {
          localStorage.setItem('guichet_session_id', guichet.id);
          localStorage.setItem('guichet_id', guichet.guichet_id);
          localStorage.setItem('guichet_nom', guichet.nom);
          localStorage.setItem('code_guichet', guichet.code);
        }
        
        if (caisse) {
          localStorage.setItem('caisse_session_id', caisse.id);
          localStorage.setItem('caisse_id', caisse.caisse_id);
          localStorage.setItem('caisse_libelle', caisse.libelle);
          localStorage.setItem('code_caisse', caisse.code);
          localStorage.setItem('solde_caisse', caisse.solde_ouverture);
          localStorage.setItem('solde_actuel_caisse', caisse.solde_actuel);
        }
        
        console.log('✅ localStorage mis à jour avec les sessions actives');
        return true;
      }
      
      console.log('ℹ️ Aucune session active trouvée');
      return false;
    } catch (error) {
      console.error('❌ Erreur actualisation localStorage:', error);
      return false;
    }
  },
  
  /**
   * Vérifie rapidement si l'utilisateur a des sessions actives
   */
  verifierSessionsActives: async () => {
    const response = await sessionService.getSessionsActives();
    return response.statut === 'success' && response.sessions;
  } 

};

export default sessionService;