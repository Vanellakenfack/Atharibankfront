import { useState, useCallback, useEffect } from 'react';
import { fraisService } from '../services/fraisService';
import { useSnackbar } from 'notistack';

/**
 * Hook personnalisé pour la gestion des frais
 */
export const useFrais = () => {
  const [fraisCommissions, setFraisCommissions] = useState<any[]>([]);
  const [fraisApplications, setFraisApplications] = useState<any[]>([]);
  const [typeComptes, setTypeComptes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Charger les configurations de frais
  const loadFraisCommissions = useCallback(async () => {
    try {
      console.log('Chargement des configurations de frais...');
      setLoading(true);
      const response = await fraisService.getFraisCommissions();
      console.log('Réponse des frais de commission:', response);
      
      if (response && response.data && response.data.data) {
        // Si la réponse contient une propriété data avec un tableau de données
        setFraisCommissions(Array.isArray(response.data.data) ? response.data.data : []);
      } else if (response && response.data) {
        // Si la réponse est directement le tableau de données
        setFraisCommissions(Array.isArray(response.data) ? response.data : []);
      } else {
        console.warn('La réponse des frais de commission est vide ou invalide');
        setFraisCommissions([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des configurations de frais';
      console.error('Erreur détaillée:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Charger les frais appliqués
  const loadFraisApplications = useCallback(async (filters: any = {}) => {
    try {
      console.log('Chargement des frais appliqués avec filtres:', filters);
      setLoading(true);
      
      // Appel au service
      const response = await fraisService.getFraisApplications(filters);
      console.log('Réponse brute des frais appliqués:', response);
      
      if (!response || !response.data) {
        console.warn('La réponse du serveur est vide');
        setFraisApplications([]);
        return { data: [], pagination: { current: 1, pageSize: 10, total: 0 } };
      }

      // Extraire les données et les métadonnées de pagination
      let data = [];
      let paginationData = {
        current: 1,
        pageSize: 10,
        total: 0
      };

      // Vérifier si la réponse contient un tableau data.data (format paginé Laravel)
      if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
        paginationData = {
          current: response.data.current_page || 1,
          pageSize: response.data.per_page || 10,
          total: response.data.total || 0
        };
      } 
      // Vérifier si la réponse est directement un tableau
      else if (Array.isArray(response.data)) {
        data = response.data;
        paginationData = {
          current: 1,
          pageSize: data.length,
          total: data.length
        };
      } 
      // Si la réponse ne correspond à aucun format attendu
      else {
        console.warn('Format de réponse inattendu, tentative d\'extraction directe des données');
        data = response.data || [];
      }

      console.log('Données extraites:', { data, pagination: paginationData });
      
      // Mettre à jour l'état local
      setFraisApplications(data);
      
      // Retourner les données et la pagination
      return {
        data,
        pagination: paginationData
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des frais appliqués';
      console.error('Erreur détaillée:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Charger les types de compte
  const loadTypeComptes = useCallback(async () => {
    try {
      const response = await fraisService.getTypeComptes();
      setTypeComptes(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des types de comptes', err);
    }
  }, []);

  // Créer une configuration de frais
  const createFraisCommission = async (data: any) => {
    try {
      setLoading(true);
      await fraisService.createFraisCommission(data);
      await loadFraisCommissions();
      enqueueSnackbar('Configuration de frais créée avec succès', { variant: 'success' });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la création de la configuration';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une configuration de frais
  const updateFraisCommission = async (id: number, data: any) => {
    try {
      setLoading(true);
      await fraisService.updateFraisCommission(id, data);
      await loadFraisCommissions();
      enqueueSnackbar('Configuration de frais mise à jour avec succès', { variant: 'success' });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour de la configuration';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une configuration de frais
  const deleteFraisCommission = async (id: number) => {
    try {
      setLoading(true);
      await fraisService.deleteFraisCommission(id);
      await loadFraisCommissions();
      enqueueSnackbar('Configuration de frais supprimée avec succès', { variant: 'success' });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression de la configuration';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Annuler un frais appliqué
  const annulerFraisApplication = async (id: number) => {
    try {
      setLoading(true);
      await fraisService.cancelFraisApplication(id);
      await loadFraisApplications();
      enqueueSnackbar('Frais appliqué avec succès', { variant: 'success' });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'annulation du frais';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      console.log('Initialisation des données des frais...');
      try {
        await Promise.all([
          loadFraisCommissions(),
          loadFraisApplications({}),
          loadTypeComptes()
        ]);
        
        if (isMounted) {
          console.log('Données des frais chargées avec succès');
        }
      } catch (error) {
        console.error('Erreur lors du chargement initial des données:', error);
        if (isMounted) {
          enqueueSnackbar('Erreur lors du chargement des données des frais', { variant: 'error' });
        }
      }
    };
    
    init();
    
    return () => {
      isMounted = false; // Nettoyage pour éviter les fuites de mémoire
    };
  }, [loadFraisCommissions, loadFraisApplications, loadTypeComptes, enqueueSnackbar]);

  return {
    // État
    fraisCommissions,
    fraisApplications,
    typeComptes,
    loading,
    error,
    
    // Méthodes
    loadFraisCommissions,
    loadFraisApplications,
    createFraisCommission,
    updateFraisCommission,
    deleteFraisCommission,
    annulerFraisApplication,
  };
};
