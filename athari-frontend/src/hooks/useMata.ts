import { useState, useEffect, useCallback } from 'react';
import { mataService } from '../services/mataService';
import { useSnackbar } from 'notistack';

/**
 * Hook personnalisé pour la gestion des opérations MATA
 */
export const useMata = (compteId?: string) => {
  const { enqueueSnackbar } = useSnackbar();
  const [mouvements, setMouvements] = useState<any[]>([]);
  const [recapitulatif, setRecapitulatif] = useState<any>(null);
  const [statistiques, setStatistiques] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les mouvements MATA
  const loadMouvements = useCallback(async (filters: any = {}) => {
    if (!compteId) return;
    
    try {
      setLoading(true);
      const response = await mataService.getMouvements(compteId, filters);
      setMouvements(response.data.mouvements || []);
    } catch (err) {
      setError('Erreur lors du chargement des mouvements MATA');
      enqueueSnackbar('Erreur lors du chargement des mouvements MATA');
    } finally {
      setLoading(false);
    }
  }, [compteId]);

  // Charger le récapitulatif des rubriques
  const loadRecapitulatif = useCallback(async () => {
    if (!compteId) return;
    
    try {
      setLoading(true);
      const response = await mataService.getRecapitulatif(compteId);
      setRecapitulatif(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement du récapitulatif MATA', err);
    } finally {
      setLoading(false);
    }
  }, [compteId]);

  // Charger les statistiques
  const loadStatistiques = useCallback(async (params: any = {}) => {
    if (!compteId) return;
    
    try {
      const response = await mataService.getStatistiques(compteId, params);
      setStatistiques(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques MATA', err);
    }
  }, [compteId]);

  // Créer un nouveau mouvement MATA
  const createMouvement = async (data: any) => {
    if (!compteId) return { success: false, error: 'Aucun compte sélectionné' };
    
    try {
      setLoading(true);
      await mataService.createMouvement(compteId, data);
      await Promise.all([loadMouvements(), loadRecapitulatif(), loadStatistiques()]);
      enqueueSnackbar('Mouvement MATA enregistré avec succès');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'enregistrement du mouvement';
      enqueueSnackbar(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Annuler un mouvement MATA
  const annulerMouvement = async (mouvementId: string) => {
    try {
      setLoading(true);
      await mataService.annulerMouvement(mouvementId);
      await Promise.all([loadMouvements(), loadRecapitulatif(), loadStatistiques()]);
      enqueueSnackbar('Mouvement annulé avec succès');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'annulation du mouvement';
      enqueueSnackbar(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Exporter les mouvements
  const exporterMouvements = async (filters: any = {}) => {
    if (!compteId) return { success: false, error: 'Aucun compte sélectionné' };
    
    try {
      const blob = await mataService.exporterMouvements(compteId, filters);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mouvements-mata-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      enqueueSnackbar('Export terminé avec succès');
      return { success: true };
    } catch (err) {
      enqueueSnackbar('Erreur lors de l\'export des mouvements');
      return { success: false, error: 'Erreur lors de l\'export' };
    }
  };

  // Recharger toutes les données
  const reloadAll = useCallback(() => {
    if (!compteId) return;
    
    return Promise.all([
      loadMouvements(),
      loadRecapitulatif(),
      loadStatistiques()
    ]);
  }, [compteId, loadMouvements, loadRecapitulatif, loadStatistiques]);

  // Charger les données initiales quand le compte change
  useEffect(() => {
    if (compteId) {
      reloadAll();
    } else {
      // Réinitialiser l'état si aucun compte n'est sélectionné
      setMouvements([]);
      setRecapitulatif(null);
      setStatistiques(null);
    }
  }, [compteId, reloadAll]);

  return {
    // État
    mouvements,
    recapitulatif,
    statistiques,
    loading,
    error,
    
    // Méthodes
    loadMouvements,
    loadRecapitulatif,
    loadStatistiques,
    createMouvement,
    annulerMouvement,
    exporterMouvements,
    reloadAll,
  };
};
