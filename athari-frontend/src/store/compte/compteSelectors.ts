import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { Compte } from '../../types/comptes';

// Selecteurs de base
export const selectAccounts = (state: RootState) => state.account.accounts;
export const selectSelectedAccount = (state: RootState) => state.account.selectedAccount;
export const selectIsLoading = (state: RootState) => state.account.isLoading;
export const selectIsSubmitting = (state: RootState) => state.account.isSubmitting;
export const selectError = (state: RootState) => state.account.error;
export const selectFilters = (state: RootState) => state.account.filters;
export const selectPagination = (state: RootState) => state.account.pagination;
export const selectStatistics = (state: RootState) => state.account.statistics;

// Selecteurs dérivés avec memoization
export const selectFilteredAccounts = createSelector(
  [selectAccounts, selectFilters],
  (accounts, filters) => {
    return accounts.filter((account: any) => {
      // Filtre par statut
      if (filters.statut && account.statut !== filters.statut) {
        return false;
      }
      
      // Filtre par recherche sur le numéro de compte
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matches = (account.numero_compte || '').toLowerCase().includes(searchTerm);
        
        if (!matches) return false;
      }
      
      return true;
    });
  }
);

export const selectActiveAccounts = createSelector(
  [selectAccounts],
  (accounts) => {
    return accounts.filter((account: any) => account.statut === 'actif');
  }
);

export const selectAccountsSummary = createSelector(
  [selectAccounts],
  (accounts) => {
    const total = accounts.length;
    const actifs = accounts.filter((acc: any) => acc.statut === 'actif').length;
    const inactifs = accounts.filter((acc: any) => acc.statut === 'inactif').length;
    
    return {
      total,
      actifs,
      inactifs,
    };
  }
);