import { useState, useCallback, useEffect, useMemo } from 'react';
import { chapitreService } from '../services/chapitreService';
import { useSnackbar } from 'notistack';

// Interface pour les chapitres
export interface Chapitre {
  id: number;
  code: string;
  libelle: string;
  categorie?: {
    id: number;
    code: string;
    nom: string;
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * Hook personnalisé pour la gestion des chapitres comptables
 * Charge TOUS les chapitres en une seule fois
 */
export const useChapitres = () => {
  const [chapitres, setChapitres] = useState<Chapitre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Formater les données de chapitres
  const formatChapitres = (data: any): Chapitre[] => {
    if (!data) return [];
    
    let chapitresArray: any[] = [];
    
    // Gestion de différents formats de réponse
    if (Array.isArray(data)) {
      chapitresArray = data;
    } else if (data.data && Array.isArray(data.data)) {
      chapitresArray = data.data;
    } else if (data.comptes && Array.isArray(data.comptes)) {
      chapitresArray = data.comptes;
    } else {
      console.warn('Format de données non reconnu:', data);
      return [];
    }

    return chapitresArray.map((item: any) => ({
      id: item.id || 0,
      code: item.code || '',
      libelle: item.libelle || '',
      categorie: item.categorie || undefined,
      created_at: item.created_at || item.cree_le,
      updated_at: item.updated_at
    }));
  };

  // Charger TOUS les chapitres
  const loadChapitres = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Chargement de tous les chapitres...');
      const response = await chapitreService.getChapitres();
      
      const formattedChapitres = formatChapitres(response);
      console.log(`${formattedChapitres.length} chapitres chargés avec succès`);
      
      setChapitres(formattedChapitres);
      
      if (formattedChapitres.length === 0) {
        enqueueSnackbar('Aucun chapitre trouvé', { 
          variant: 'warning',
          anchorOrigin: { vertical: 'top', horizontal: 'right' }
        });
      }
      
    } catch (err: any) {
      console.error('Erreur détaillée lors du chargement des chapitres:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Erreur lors du chargement des chapitres';
      
      setError(errorMessage);
      setChapitres([]);
      
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'right' }
      });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Rechercher des chapitres (filtrage côté client)
  const searchChapitres = useCallback((searchTerm: string): Chapitre[] => {
    if (!searchTerm.trim()) return chapitres;
    
    const term = searchTerm.toLowerCase();
    return chapitres.filter(chapitre => 
      chapitre.code.toLowerCase().includes(term) ||
      chapitre.libelle.toLowerCase().includes(term) ||
      (chapitre.categorie?.nom?.toLowerCase()?.includes(term) || false)
    );
  }, [chapitres]);

  // Obtenir un chapitre par ID
  const getChapitreById = useCallback((id: number): Chapitre | undefined => {
    return chapitres.find(chapitre => chapitre.id === id);
  }, [chapitres]);

  // Charger les chapitres au montage du composant
  useEffect(() => {
    loadChapitres();
  }, [loadChapitres]);

  // Mémoïser les chapitres triés
  const sortedChapitres = useMemo(() => {
    return [...chapitres].sort((a, b) => {
      // Trier d'abord par code
      const codeA = a.code || '';
      const codeB = b.code || '';
      return codeA.localeCompare(codeB);
    });
  }, [chapitres]);

  return {
    chapitres: sortedChapitres,
    loading,
    error,
    loadChapitres,
    searchChapitres,
    getChapitreById,
    totalChapitres: chapitres.length
  };
};

export default useChapitres;