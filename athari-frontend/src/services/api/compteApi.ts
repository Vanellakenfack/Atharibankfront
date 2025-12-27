import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Fonction pour obtenir le token
const getToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('Token non trouvé dans localStorage');
    // Rediriger vers la page de login
    window.location.href = '/login';
    throw new Error('Token d\'authentification manquant');
  }
  return token;
};

// Interface pour les données du compte
export interface CompteData {
  client: any;
  accountType: string;
  accountSubType: string;
  options: {
    montant: string;
    duree: string;
    module: string;
    chapitre_id: string;
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
        const token = getToken();
        const response = await axios.post(`${API_BASE_URL}/comptes/creer`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
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
        throw error;
    }
    },

  // Valider étape 1
  async validerEtape1(data: any): Promise<any> {
    try {
      const token = getToken();
      console.log('Données étape 1:', data);
      
      const response = await axios.post(`${API_BASE_URL}/comptes/etape1/valider`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur validation étape 1:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
      throw error;
    }
  },

  // Valider étape 2
  async validerEtape2(data: any): Promise<any> {
    try {
      const token = getToken();
      console.log('Données étape 2 envoyées:', JSON.stringify(data, null, 2));
      
      const response = await axios.post(`${API_BASE_URL}/comptes/etape2/valider`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Réponse étape 2:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur détaillée validation étape 2:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
      
      throw error;
    }
  },

  // Valider étape 3
  async validerEtape3(data: any): Promise<any> {
    try {
      const token = getToken();
      
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

      const response = await axios.post(
        `${API_BASE_URL}/comptes/etape3/valider`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
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
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
      throw error;
    }
  },

  // Préparer FormData pour l'envoi final
    prepareFormData(compteData: CompteData): FormData {
    const formData = new FormData();

    // Fonction utilitaire pour formater les dates
    const formatDate = (dateString: string | Date): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
    };

    // Log pour débogage
    console.log('Données du compte:', JSON.stringify(compteData, null, 2));
    console.log('Type de compte ID:', compteData.accountType);
    console.log('Date de naissance mandataire 1:', compteData.mandataire1?.date_naissance);
    console.log('Situation familiale:', compteData.mandataire1?.situation_familiale);

    // Étape 1: Informations de base
    if (compteData.client) {
      console.log('Préparation des données - accountType:', compteData.accountType, 'Type:', typeof compteData.accountType);
      
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
      
      console.log('Type de compte ID converti:', typeCompteId);
      
      if (typeCompteId === null || isNaN(typeCompteId)) {
        console.error('Erreur: Le type de compte est invalide:', compteData.accountType);
        throw new Error('Le type de compte n\'est pas valide. Veuillez sélectionner un type de compte.');
      }
      
      formData.append('etape1[client_id]', compteData.client.id.toString());
      formData.append('etape1[type_compte_id]', typeCompteId.toString());
      formData.append('etape1[code_type_compte]', compteData.accountSubType || '');
      
      console.log('Données ajoutées à formData - type_compte_id:', typeCompteId);
      formData.append('etape1[devise]', 'FCFA');
      formData.append('etape1[gestionnaire_nom]', 'Nom Gestionnaire');
      formData.append('etape1[gestionnaire_prenom]', 'Prénom Gestionnaire');
      formData.append('etape1[gestionnaire_code]', 'CODE123');
    }

    // Étape 2: Plan comptable
    if (compteData.options) {
      formData.append('etape2[plan_comptable_id]', compteData.options.chapitre_id || '');
    }

    // Étape 3: Mandataires
    if (compteData.mandataire1) {
      const m1 = compteData.mandataire1;
      const isMarried = m1.situation_familiale === 'marie';

      // Informations de base du mandataire
      formData.append('etape3[mandataire_1][sexe]', m1.sexe || '');
      formData.append('etape3[mandataire_1][nom]', m1.nom || m1.noms || '');
      formData.append('etape3[mandataire_1][prenom]', m1.prenom || m1.prenoms || '');
      formData.append('etape3[mandataire_1][date_naissance]', formatDate(m1.date_naissance));
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
        formData.append('etape3[mandataire_1][date_naissance_conjoint]', formatDate(m1.date_naissance_conjoint));
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