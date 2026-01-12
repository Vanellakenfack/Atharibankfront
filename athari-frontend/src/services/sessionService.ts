import ApiClient from './api/ApiClient';

const sessionService = {
  // Agence
  ouvrirAgence: async (agenceId: string | number, dateComptable: string) => {
    const response = await ApiClient.post('/sessions/ouvrir-agence', {
      agence_id: agenceId,
      date_comptable: dateComptable
    });
    return response;
  },

  fermerAgence: async (sessionAgenceId: number, journeeId: number) => {
    const response = await ApiClient.post('/sessions/fermer-agence', {
      agence_session_id: sessionAgenceId,
      jour_comptable_id: journeeId
    });
    return response;
  },

  // Guichet
  ouvrirGuichet: async (agenceSessionId: string, codeGuichet: number) => {
    const response = await ApiClient.post('/sessions/ouvrir-guichet', {
      agence_session_id: parseInt(agenceSessionId),
      code_guichet: codeGuichet
    });
    return response;
  },

  fermerGuichet: async (guichetSessionId: string) => {
    const response = await ApiClient.post('/sessions/fermer-guichet', {
      guichet_session_id: parseInt(guichetSessionId)
    });
    return response;
  },

  // Caisse
  ouvrirCaisse: async (
    guichetSessionId: number,
    codeCaisse: string,
    billetage: Record<string, number>,
    soldeSaisi: number
  ) => {
    const response = await ApiClient.post('/sessions/ouvrir-caisse', {
      guichet_session_id: guichetSessionId,
      code_caisse: codeCaisse,
      billetage: billetage,
      solde_saisi: soldeSaisi
    });
    return response;
  },

  fermerCaisse: async (caisseSessionId: number, soldeFermeture: number) => {
    const response = await ApiClient.post('/sessions/fermer-caisse', {
      caisse_session_id: caisseSessionId,
      solde_fermeture: soldeFermeture // CORRIGÉ: solde_fermeture au lieu de solde_saisi
    });
    return response;
  },

  // Solde informatique
  getSoldeInformatique: async (codeCaisse: string) => {
    const response = await ApiClient.get(`/sessions/caisses/${codeCaisse}/solde-informatique`);
    return response.data;
  }
};

export default sessionService;