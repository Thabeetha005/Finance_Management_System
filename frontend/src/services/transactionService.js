import api from '../api/axios';

export const transactionService = {
  getAllTransactions: async () => {
    const response = await api.get('/admin/transactions');
    return response.data;
  },
  getRecentTransactions: async (limit = 10) => {
    const response = await api.get(`/admin/transactions?limit=${limit}`);
    return response.data;
  }
};
