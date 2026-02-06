import { createAsyncThunk } from '@reduxjs/toolkit';
import type { CreationCompte, ModificationCompte } from '../../types/comptes';
import { compteService } from '../../services/api/compteService';

// Thunks asynchrones
export const fetchAccounts = createAsyncThunk(
  'account/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await compteService.getComptes();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement des comptes');
    }
  }
);

export const fetchAccountById = createAsyncThunk(
  'account/fetchAccountById',
  async (accountId: number, { rejectWithValue }) => {
    try {
      return await compteService.getCompteById(accountId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement du compte');
    }
  }
);

export const createAccount = createAsyncThunk(
  'account/createAccount',
  async (accountData: CreationCompte, { rejectWithValue }) => {
    try {
      const response = await (compteService as any).createCompte(accountData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de création du compte');
    }
  }
);

export const updateAccount = createAsyncThunk(
  'account/updateAccount',
  async (updateData: ModificationCompte, { rejectWithValue }) => {
    try {
      const response = await compteService.updateCompte(updateData.id, updateData as any);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de mise à jour du compte');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'account/deleteAccount',
  async (accountId: number, { rejectWithValue }) => {
    try {
      await (compteService as any).deleteCompte(accountId);
      return accountId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de suppression du compte');
    }
  }
);

export const fetchAccountStatistics = createAsyncThunk(
  'account/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      // Cette méthode n'existe peut-être pas, à adapter selon l'API
      const response = await compteService.getComptes();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement des statistiques');
    }
  }
);