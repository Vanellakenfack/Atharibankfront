import axios from 'axios';
import type { Account } from '../../types/comptes';

const API_URL = 'http://localhost:3000/api'; // Remplacez par votre URL API

const AccountService = {
  async getAccounts(): Promise<Account[]> {
    const response = await axios.get(API_URL);
    return response.data;
  },

  async getAccount(id: string): Promise<Account> {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  async createAccount(accountData: Partial<Account>): Promise<Account> {
    const response = await axios.post(API_URL, accountData);
    return response.data;
  },

  async updateAccount(id: string, accountData: Partial<Account>): Promise<Account> {
    const response = await axios.put(`${API_URL}/${id}`, accountData);
    return response.data;
  },

  async deleteAccount(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  },

  async updateStatus(id: string, status: Account['status']): Promise<Account> {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status });
    return response.data;
  }
};

export default AccountService;