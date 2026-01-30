import ApiClient from './ApiClient';

// Fonction pour gérer les erreurs d'authentification
const handleAuthError = (error: any) => {
  if (error.response?.status === 401) {
    console.error('Erreur d\'authentification, redirection vers la page de connexion');
    window.location.href = '/login';
  }
  throw error;
};

// Interface pour les données du compte
export interface CompteData {
  client: any;
  accountType: string;
  accountSubType: string;
  options: {
    solde: string;
    duree_blocage_mois: string;
    module: string;
    chapitre_id: string;
    devise?: string;
  };
  gestionnaire?: {
    id: number | null;
    nom: string;
    prenom: string;
    code: string;
  };
  mandataire1: any;
  mandataire2: any;
  documents: {
    cni_client: File | null;
    autres_documents: File[];
    demande_ouverture_pdf: File | null;
    formulaire_ouverture_pdf: File | null;
  };
  engagementAccepted: boolean;
  clientSignature: File | null;
  etape2Data?: any;
}

export const compteService = {
  // Créer un compte
  async createCompte(formData: FormData): Promise<any> {
    try {
      console.log('=== ENVOI DU FORMULAIRE FINAL ===');
      console.log('Contenu du FormData envoyé:');
      for (let pair of (formData as any).entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      
      const response = await ApiClient.post('/comptes/creer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('=== RÉPONSE DU SERVEUR ===', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errors) {
        console.error('Erreurs de validation détaillées:', error.response.data.errors);
      }
      if (error.response?.data?.message) {
        console.error('Message d\'erreur:', error.response.data.message);
      }
      return handleAuthError(error);
    }
  },

  // Valider étape 1
  async validerEtape1(data: any): Promise<any> {
    try {
      console.log('Données étape 1:', data);
      const response = await ApiClient.post('/comptes/etape1/valider', data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur validation étape 1:', error);
      return handleAuthError(error);
    }
  },

  // Valider étape 2
  async validerEtape2(data: any): Promise<any> {
    try {
      console.log('=== VALIDATION ÉTAPE 2 ===');
      console.log('Données étape 2 envoyées:', JSON.stringify(data, null, 2));
      
      // Vérification du gestionnaire_id
      if (!data.gestionnaire_id) {
        console.error('ERREUR: gestionnaire_id manquant dans les données de l\'étape 2');
        throw new Error('Le gestionnaire_id est requis pour l\'étape 2');
      }
      
      const response = await ApiClient.post('/comptes/etape2/valider', data);
      console.log('Réponse étape 2:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur détaillée validation étape 2:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return handleAuthError(error);
    }
  },

  // Valider étape 3
  async validerEtape3(data: any): Promise<any> {
    try {
      // Créer un objet FormData pour envoyer les données
      const formData = new FormData();
      
      // Fonction pour ajouter les données d'un mandataire au FormData
      const addMandataireToFormData = (prefix: string, mandataire: any) => {
        if (!mandataire) return;
        
        // Liste des champs attendus par le backend
        const fields = [
          { key: 'sexe', required: true },
          { key: 'nom', required: true, altKey: 'noms' },
          { key: 'prenom', required: true, altKey: 'prenoms' },
          { key: 'date_naissance', required: true },
          { key: 'lieu_naissance', required: true },
          { key: 'telephone', required: true },
          { key: 'adresse', required: true },
          { key: 'nationalite', required: true },
          { key: 'profession', required: true },
          { key: 'nom_jeune_fille_mere', required: false },
          { key: 'numero_cni', required: true, altKey: 'cni' },
          { key: 'situation_familiale', required: true },
          { key: 'nom_conjoint', required: mandataire.situation_familiale === 'marie' },
          { key: 'date_naissance_conjoint', required: mandataire.situation_familiale === 'marie' },
          { key: 'lieu_naissance_conjoint', required: mandataire.situation_familiale === 'marie' },
          { key: 'cni_conjoint', required: mandataire.situation_familiale === 'marie' }
        ];
        
        fields.forEach(field => {
          // Utiliser la clé alternative si la clé principale n'existe pas
          const value = mandataire[field.key] ?? (field.altKey ? mandataire[field.altKey] : undefined);
          
          // Si le champ est requis mais manquant, lancer une erreur
          if (field.required && (value === undefined || value === null || value === '')) {
            throw new Error(`Le champ ${field.key} est obligatoire pour ${prefix}`);
          }
          
          // Ajouter au FormData si la valeur existe
          if (value !== undefined && value !== null) {
            formData.append(`${prefix}[${field.key}]`, value);
          }
        });
      };
      
      // Ajouter le mandataire 1 (toujours requis)
      if (!data.mandataire_1) {
        throw new Error('Les informations du mandataire 1 sont obligatoires');
      }
      
      // Préparer les données du mandataire 1 avec les alias de champs
      const mandataire1Data = {
        ...data.mandataire_1,
        nom: data.mandataire_1.nom || data.mandataire_1.noms,
        prenom: data.mandataire_1.prenom || data.mandataire_1.prenoms,
        numero_cni: data.mandataire_1.numero_cni || data.mandataire_1.cni
      };
      
      addMandataireToFormData('mandataire_1', mandataire1Data);
      
      // Ajouter le mandataire 2 s'il existe
      if (data.mandataire_2 && (data.mandataire_2.nom || data.mandataire_2.noms)) {
        // Préparer les données du mandataire 2 avec les alias de champs
        const mandataire2Data = {
          ...data.mandataire_2,
          nom: data.mandataire_2.nom || data.mandataire_2.noms,
          prenom: data.mandataire_2.prenom || data.mandataire_2.prenoms,
          numero_cni: data.mandataire_2.numero_cni || data.mandataire_2.cni
        };
        
        addMandataireToFormData('mandataire_2', mandataire2Data);
      }
      
      // Afficher les données pour le débogage
      console.log('Données étape 3 formatées:');
      for (let pair of (formData as any).entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await ApiClient.post(
        '/comptes/etape3/valider',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur validation étape 3:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
        console.error('Status:', error.response.status);
      }
      return handleAuthError(error);
    }
  },

  formatDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  },

  // Préparer FormData pour l'envoi final
  prepareFormData(compteData: CompteData): FormData {
    const formData = new FormData();

    console.log('=== PRÉPARATION DU FORMULAIRE FINAL ===');
    console.log('Données du compte:', compteData);

    // Étape 1: Informations de base
    if (compteData.client) {
      console.log('=== ÉTAPE 1 - INFORMATIONS CLIENT ===');
      
      // S'assurer que accountType est un nombre valide
      let typeCompteId: number | null = null;
      
      if (compteData.accountType !== undefined && compteData.accountType !== null) {
        if (typeof compteData.accountType === 'string') {
          // Si c'est une chaîne, essayer de la convertir en nombre
          const parsed = parseInt(compteData.accountType, 10);
          typeCompteId = isNaN(parsed) ? null : parsed;
        } else if (typeof compteData.accountType === 'number') {
          // Si c'est déjà un nombre, l'utiliser directement
          typeCompteId = compteData.accountType;
        }
      }
      
      if (typeCompteId === null || isNaN(typeCompteId)) {
        console.error('Erreur: Le type de compte est invalide:', compteData.accountType);
        throw new Error('Le type de compte n\'est pas valide. Veuillez sélectionner un type de compte.');
      }
      
      // S'assurer que code_type_compte est une chaîne de 2 caractères
      let codeTypeCompte = '';
      if (compteData.accountSubType && typeof compteData.accountSubType === 'string') {
        // Prendre les 2 premiers caractères et les compléter avec des zéros si nécessaire
        codeTypeCompte = String(compteData.accountSubType).padStart(2, '0').slice(0, 2);
      } else {
        // Si pas de accountSubType, utiliser les 2 premiers chiffres de l'ID du type de compte
        codeTypeCompte = String(typeCompteId).padStart(2, '0').slice(0, 2);
      }
      
      // Ajouter les champs de l'étape 1
      formData.append('etape1[client_id]', String(compteData.client.id));
      console.log('etape1[client_id]:', compteData.client.id);
      
      formData.append('etape1[code_type_compte]', codeTypeCompte);
      console.log('etape1[code_type_compte]:', codeTypeCompte);
      
      formData.append('etape1[devise]', compteData.options?.devise || 'FCFA');
      console.log('etape1[devise]:', compteData.options?.devise || 'FCFA');
      
      formData.append('etape1[type_compte_id]', String(typeCompteId));
      console.log('etape1[type_compte_id]:', typeCompteId);
    }

    // Étape 2: Plan comptable et options
    console.log('=== ÉTAPE 2 - PLAN COMPTABLE ET OPTIONS ===');
    
    // Utiliser etape2Data en priorité
    if (compteData.etape2Data) {
      console.log('📦 Utilisation des données stockées de l\'étape 2');
      const etape2 = compteData.etape2Data;
      
      // 1. Plan comptable
      if (etape2.plan_comptable_id) {
        formData.append('etape2[plan_comptable_id]', String(etape2.plan_comptable_id));
        console.log('📝 etape2[plan_comptable_id]:', etape2.plan_comptable_id);
      }
      
      // 2. GESTIONNAIRE - AJOUTER gestionnaire_id
      console.log('🔍 Vérification gestionnaire_id dans etape2Data:', {
        hasGestionnaireId: !!etape2.gestionnaire_id,
        value: etape2.gestionnaire_id,
        type: typeof etape2.gestionnaire_id
      });
      
      // TOUJOURS ajouter gestionnaire_id s'il existe
      if (etape2.gestionnaire_id !== undefined && etape2.gestionnaire_id !== null) {
        formData.append('etape2[gestionnaire_id]', String(etape2.gestionnaire_id));
        console.log('✅ AJOUTÉ: etape2[gestionnaire_id]:', etape2.gestionnaire_id);
      } else {
        console.error('❌ ERREUR: gestionnaire_id manquant ou null!');
        console.error('Valeur de gestionnaire_id:', etape2.gestionnaire_id);
        throw new Error('Le gestionnaire_id est requis dans l\'étape 2');
      }
      
      // 3. Autres champs du gestionnaire
      if (etape2.gestionnaire_nom) {
        formData.append('etape2[gestionnaire_nom]', etape2.gestionnaire_nom);
        console.log('📝 etape2[gestionnaire_nom]:', etape2.gestionnaire_nom);
      }
      if (etape2.gestionnaire_prenom) {
        formData.append('etape2[gestionnaire_prenom]', etape2.gestionnaire_prenom);
        console.log('📝 etape2[gestionnaire_prenom]:', etape2.gestionnaire_prenom);
      }
      if (etape2.gestionnaire_code) {
        formData.append('etape2[gestionnaire_code]', etape2.gestionnaire_code);
        console.log('📝 etape2[gestionnaire_code]:', etape2.gestionnaire_code);
      }
      
      // 4. Solde initial
      if (etape2.solde !== undefined) {
        formData.append('etape2[solde]', String(etape2.solde));
        console.log('📝 etape2[solde]:', etape2.solde);
      }
      
      // 5. Durée si applicable
      if (etape2.duree !== undefined && etape2.duree > 0) {
        formData.append('etape2[duree_blocage_mois]', String(etape2.duree));
        console.log('📝 etape2[duree_blocage_mois]:', etape2.duree);
      }
      
      // 6. Module si applicable
      if (etape2.module) {
        formData.append('etape2[module]', etape2.module);
        console.log('📝 etape2[module]:', etape2.module);
      }
      
      // 7. Chapitre comptable ID (compatibilité)
      if (etape2.chapitre_comptable_id) {
        formData.append('etape2[chapitre_comptable_id]', String(etape2.chapitre_comptable_id));
        console.log('📝 etape2[chapitre_comptable_id]:', etape2.chapitre_comptable_id);
      }
    } 
    // Fallback: Vérifier dans les options
    else if (compteData.options) {
      console.log('⚠️ Utilisation du fallback: données dans options');
      
      if (compteData.options.chapitre_id) {
        formData.append('etape2[plan_comptable_id]', String(compteData.options.chapitre_id));
        console.log('📝 etape2[plan_comptable_id]:', compteData.options.chapitre_id);
      }
      
      // Ajouter gestionnaire_id depuis options si disponible
      const options = compteData.options as any;
      if (options.gestionnaire_id) {
        formData.append('etape2[gestionnaire_id]', String(options.gestionnaire_id));
        console.log('✅ AJOUTÉ: etape2[gestionnaire_id] depuis options:', options.gestionnaire_id);
      }
      
      if (options.gestionnaire_nom) {
        formData.append('etape2[gestionnaire_nom]', options.gestionnaire_nom);
        console.log('📝 etape2[gestionnaire_nom]:', options.gestionnaire_nom);
      }
      
      if (options.gestionnaire_prenom) {
        formData.append('etape2[gestionnaire_prenom]', options.gestionnaire_prenom);
        console.log('📝 etape2[gestionnaire_prenom]:', options.gestionnaire_prenom);
      }
      
      if (options.gestionnaire_code) {
        formData.append('etape2[gestionnaire_code]', options.gestionnaire_code);
        console.log('📝 etape2[gestionnaire_code]:', options.gestionnaire_code);
      }
      
      // Solde et durée
      if (compteData.options.solde) {
        formData.append('etape2[solde]', String(compteData.options.solde));
        console.log('📝 etape2[solde]:', compteData.options.solde);
      }
      if (compteData.options.duree_blocage_mois) {
        formData.append('etape2[duree_blocage_mois]', String(compteData.options.duree_blocage_mois));
        console.log('📝 etape2[duree_blocage_mois]:', compteData.options.duree_blocage_mois);
      }
      
      // Module
      if (compteData.options.module) {
        formData.append('etape2[module]', compteData.options.module);
        console.log('📝 etape2[module]:', compteData.options.module);
      }
    }
    // Fallback 2: Vérifier dans l'objet gestionnaire
    else if (compteData.gestionnaire) {
      console.log('⚠️ Utilisation du fallback: objet gestionnaire');
      
      if (compteData.gestionnaire.id) {
        formData.append('etape2[gestionnaire_id]', String(compteData.gestionnaire.id));
        console.log('✅ AJOUTÉ: etape2[gestionnaire_id] depuis gestionnaire:', compteData.gestionnaire.id);
      }
      
      if (compteData.gestionnaire.nom) {
        formData.append('etape2[gestionnaire_nom]', compteData.gestionnaire.nom);
        console.log('📝 etape2[gestionnaire_nom]:', compteData.gestionnaire.nom);
      }
      
      if (compteData.gestionnaire.prenom) {
        formData.append('etape2[gestionnaire_prenom]', compteData.gestionnaire.prenom);
        console.log('📝 etape2[gestionnaire_prenom]:', compteData.gestionnaire.prenom);
      }
      
      if (compteData.gestionnaire.code) {
        formData.append('etape2[gestionnaire_code]', compteData.gestionnaire.code);
        console.log('📝 etape2[gestionnaire_code]:', compteData.gestionnaire.code);
      }
    }
    else {
      console.error('❌ ERREUR CRITIQUE: Aucune donnée d\'étape 2 trouvée!');
      throw new Error('Les données de l\'étape 2 sont requises');
    }

    // Étape 3: Mandataires
    console.log('=== ÉTAPE 3 - MANDATAIRES ===');
    if (compteData.mandataire1) {
      const m1 = compteData.mandataire1;
      const isMarried = m1.situation_familiale === 'marie';

      // Informations de base du mandataire
      formData.append('etape3[mandataire_1][sexe]', m1.sexe || '');
      formData.append('etape3[mandataire_1][nom]', m1.nom || m1.noms || '');
      formData.append('etape3[mandataire_1][prenom]', m1.prenom || m1.prenoms || '');
      formData.append('etape3[mandataire_1][date_naissance]', this.formatDate(m1.date_naissance));
      formData.append('etape3[mandataire_1][lieu_naissance]', m1.lieu_naissance || '');
      formData.append('etape3[mandataire_1][telephone]', m1.telephone || '');
      formData.append('etape3[mandataire_1][adresse]', m1.adresse || '');
      formData.append('etape3[mandataire_1][nationalite]', m1.nationalite || '');
      formData.append('etape3[mandataire_1][profession]', m1.profession || '');
      formData.append('etape3[mandataire_1][numero_cni]', m1.numero_cni || m1.cni || '');
      formData.append('etape3[mandataire_1][situation_familiale]', m1.situation_familiale || 'celibataire');
      formData.append('etape3[mandataire_1][nom_jeune_fille_mere]', m1.nom_jeune_fille_mere || '');

      console.log('etape3[mandataire_1][nom]:', m1.nom || m1.noms || '');
      console.log('etape3[mandataire_1][prenom]:', m1.prenom || m1.prenoms || '');

      // Si marié, ajouter les champs du conjoint
      if (isMarried) {
        formData.append('etape3[mandataire_1][nom_conjoint]', m1.nom_conjoint || '');
        formData.append('etape3[mandataire_1][date_naissance_conjoint]', this.formatDate(m1.date_naissance_conjoint));
        formData.append('etape3[mandataire_1][lieu_naissance_conjoint]', m1.lieu_naissance_conjoint || '');
        formData.append('etape3[mandataire_1][cni_conjoint]', m1.cni_conjoint || '');
      } else {
        // Ajouter des valeurs vides pour les champs du conjoint si non marié
        formData.append('etape3[mandataire_1][nom_conjoint]', '');
        formData.append('etape3[mandataire_1][date_naissance_conjoint]', '');
        formData.append('etape3[mandataire_1][lieu_naissance_conjoint]', '');
        formData.append('etape3[mandataire_1][cni_conjoint]', '');
      }
    }

    // Étape 4: Documents et validation
    console.log('=== ÉTAPE 4 - DOCUMENTS ET VALIDATION ===');
    formData.append('etape4[notice_acceptee]', compteData.engagementAccepted ? '1' : '0');
    console.log('etape4[notice_acceptee]:', compteData.engagementAccepted ? '1' : '0');

    // AJOUT DES NOUVEAUX DOCUMENTS PDF
    if (compteData.documents?.demande_ouverture_pdf) {
      formData.append('demande_ouverture_pdf', compteData.documents.demande_ouverture_pdf);
      console.log('demande_ouverture_pdf: ajouté');
    }

    if (compteData.documents?.formulaire_ouverture_pdf) {
      formData.append('formulaire_ouverture_pdf', compteData.documents.formulaire_ouverture_pdf);
      console.log('formulaire_ouverture_pdf: ajouté');
    }

    // Documents existants
    if (compteData.documents?.cni_client) {
      formData.append('documents[]', compteData.documents.cni_client);
      formData.append('types_documents[]', 'cni');
      console.log('documents[]: cni_client ajouté');
    }

    // Autres documents
    if (compteData.documents?.autres_documents && compteData.documents.autres_documents.length > 0) {
      compteData.documents.autres_documents.forEach((doc, index) => {
        formData.append('documents[]', doc);
        formData.append('types_documents[]', 'autre');
        console.log(`documents[]: autre document ${index} ajouté`);
      });
    }

    // Signature
    if (compteData.clientSignature) {
      formData.append('signature', compteData.clientSignature);
      console.log('signature: ajoutée');
    }

    // Log du contenu du FormData pour débogage
    console.log('=== CONTENU COMPLET DU FORMDATA ===');
    for (let pair of (formData as any).entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    console.log('=== FIN DU FORMDATA ===');

    return formData;
  },

  // Méthodes supplémentaires pour la gestion des comptes
  async getComptesList(params?: any): Promise<any> {
    try {
      const response = await ApiClient.get('/comptes', { params });
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la liste des comptes:', error);
      return handleAuthError(error);
    }
  },

  async getCompteById(id: number): Promise<any> {
    try {
      const response = await ApiClient.get(`/comptes/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la récupération du compte ${id}:`, error);
      return handleAuthError(error);
    }
  },

  async updateCompte(id: number, data: any): Promise<any> {
    try {
      const response = await ApiClient.put(`/comptes/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour du compte ${id}:`, error);
      return handleAuthError(error);
    }
  },

  async cloturerCompte(id: number, motif?: string): Promise<any> {
    try {
      const response = await ApiClient.post(`/comptes/${id}/cloturer`, { motif });
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la clôture du compte ${id}:`, error);
      return handleAuthError(error);
    }
  },

  async deleteCompte(id: number): Promise<any> {
    try {
      const response = await ApiClient.delete(`/comptes/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la suppression du compte ${id}:`, error);
      return handleAuthError(error);
    }
  },

  async getComptesClient(clientId: number): Promise<any> {
    try {
      const response = await ApiClient.get(`/clients/${clientId}/comptes`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des comptes du client ${clientId}:`, error);
      return handleAuthError(error);
    }
  },

  async getParametresTypeCompte(compteId: number): Promise<any> {
    try {
      const response = await ApiClient.get(`/comptes/${compteId}/parametres-type-compte`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des paramètres pour le compte ${compteId}:`, error);
      return handleAuthError(error);
    }
  },

  async getJournalOuvertures(params: {
    date_debut?: string;
    date_fin?: string;
    code_agence?: string;
  }): Promise<any> {
    try {
      const response = await ApiClient.get('/comptes/journal-ouvertures', { params });
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du journal des ouvertures:', error);
      return handleAuthError(error);
    }
  },

  async clotureJourneeOuvertures(params: {
    date?: string;
    code_agence?: string;
  }): Promise<any> {
    try {
      const response = await ApiClient.get('/comptes/cloture-journee-ouvertures', { params });
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la clôture de journée des ouvertures:', error);
      return handleAuthError(error);
    }
  },

  async exporterJournalPdf(params: {
    date_debut: string;
    date_fin: string;
    code_agence?: string;
  }): Promise<any> {
    try {
      const response = await ApiClient.get('/comptes/exporter-journal-pdf', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de l\'export PDF du journal:', error);
      return handleAuthError(error);
    }
  }
};