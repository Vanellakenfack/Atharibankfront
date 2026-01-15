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
      solde_saisi: soldeSaisi,
      code_caisse: codeCaisse
    });
    
    const response = await ApiClient.post('/sessions/ouvrir-caisse', {
      guichet_session_id: guichetSessionId,
      caisse_id: caisseId,
      billetage: billetage,
      solde_saisi: soldeSaisi,
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
  }
};

export default sessionService;