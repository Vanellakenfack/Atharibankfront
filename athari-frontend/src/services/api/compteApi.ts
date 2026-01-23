//update

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
    id?: number | null;
    nom: string;
    prenom: string;
    code: string;
  };
  mandataire1: any;
  mandataire2: any;
  documents: {
    cni_client: File | null;
    autres_documents: File[];
  };
  engagementAccepted: boolean;
  clientSignature: File | null;
}

export const compteService = {
  // Créer un compte
  async createCompte(formData: FormData): Promise<any> {
    try {
      const response = await ApiClient.post('/comptes/creer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
      console.log('Données étape 2 envoyées:', JSON.stringify(data, null, 2));
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

    // Étape 1: Informations de base
    if (compteData.client) {
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
      formData.append('etape1[code_type_compte]', codeTypeCompte);
      formData.append('etape1[devise]', compteData.options?.devise || 'FCFA');
      formData.append('etape1[type_compte_id]', String(typeCompteId));
      
      // Ajouter type_compte_id à la racine pour la compatibilité
      //formData.append('type_compte_id', String(typeCompteId));
      
      // Ajout des champs du gestionnaire depuis le formulaire
      if (compteData.gestionnaire) {
        // Include gestionnaire_id when available (selected existing gestionnaire)
        if ((compteData.gestionnaire as any).id !== undefined && (compteData.gestionnaire as any).id !== null) {
          formData.append('etape2[gestionnaire_id]', String((compteData.gestionnaire as any).id));
        }
        formData.append('etape2[gestionnaire_nom]', compteData.gestionnaire.nom );
        formData.append('etape2[gestionnaire_prenom]', compteData.gestionnaire.prenom );
        formData.append('etape2[gestionnaire_code]', compteData.gestionnaire.code );
      }
    }

    // Étape 2: Plan comptable et options
    if (compteData.options) {
      if (compteData.options.chapitre_id) {
        formData.append('etape2[plan_comptable_id]', String(compteData.options.chapitre_id));
      }
      // Ajout du solde et de la durée
      if (compteData.options.solde) {
        formData.append('etape2[solde]', String(compteData.options.solde));
      }
      if (compteData.options.duree_blocage_mois) {
        formData.append('etape2[duree_blocage_mois]', String(compteData.options.duree_blocage_mois));
      }
    }

    // Étape 3: Mandataires
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
    formData.append('etape4[notice_acceptee]', compteData.engagementAccepted ? '1' : '0');

    // Documents
    if (compteData.documents?.cni_client) {
      formData.append('documents[]', compteData.documents.cni_client);
      formData.append('types_documents[]', 'cni');
    }

    // Signature
    if (compteData.clientSignature) {
      formData.append('signature', compteData.clientSignature);
    }

    // Log du contenu du FormData pour débogage
    console.log('Contenu du FormData:');
    for (let pair of (formData as any).entries()) {
      console.log(pair[0], pair[1]);
    }

    return formData;
  }
};