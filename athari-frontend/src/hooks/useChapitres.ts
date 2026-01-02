import { useState, useCallback, useEffect } from 'react';
import { chapitreService } from '../services/chapitreService';
import { useSnackbar } from 'notistack';

/**
 * Hook personnalisé pour la gestion des chapitres comptables
 */
export const useChapitres = () => {
  const [chapitres, setChapitres] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Charger les chapitres
  const loadChapitres = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chapitreService.getChapitres();
      
      if (response && response.data) {
        setChapitres(Array.isArray(response.data) ? response.data : []);
      } else {
        setChapitres([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des chapitres';
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

  // Rechercher des chapitres
  const searchChapitres = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      const response = await chapitreService.searchChapitres(searchTerm);
      return response?.data || [];
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la recherche des chapitres';
      console.error('Erreur lors de la recherche des chapitres:', err);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return [];
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Charger les chapitres au montage du composant
  useEffect(() => {
    loadChapitres();
  }, [loadChapitres]);

  return {
    chapitres,
    loading,
    error,
    loadChapitres,
    searchChapitres
  };
};

export default useChapitres;
