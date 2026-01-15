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
  ouvrirGuichet: async (agenceSessionId: string | number, guichetId: number) => {
    const response = await ApiClient.post('/sessions/ouvrir-guichet', {
      agence_session_id: parseInt(agenceSessionId.toString()),
      guichet_id: guichetId
    });
    return response;
  },

  fermerGuichet: async (guichetSessionId: string | number) => {
    const response = await ApiClient.post('/sessions/fermer-guichet', {
      guichet_session_id: parseInt(guichetSessionId.toString())
    });
    return response;
  },

  // Caisse (Étape 4)
  ouvrirCaisse: async (
    guichetSessionId: number,
    caisseId: number,
    codeCaisse: string,
    billetage: Record<string, number>,
    soldeSaisi: number
  ) => {
    const response = await ApiClient.post('/sessions/ouvrir-caisse', {
      guichet_session_id: guichetSessionId,
      caisse_id: caisseId,
      billetage: billetage,
      code_caisse: codeCaisse,
      solde_saisi: soldeSaisi
    });
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

  // Solde informatique - CORRECTION : URL correcte selon ton backend
  getSoldeInformatique: async (codeCaisse: string) => {
    const response = await ApiClient.get(`/sessions/caisses/${codeCaisse}/solde-informatique`);
    return response.data;
  },

  // Bilan caisse
  getBilanCaisse: async (caisseSessionId: number) => {
    const response = await ApiClient.get(`/sessions/bilan-caisse/${caisseSessionId}`);
    return response.data;
  }
};

export default sessionService;