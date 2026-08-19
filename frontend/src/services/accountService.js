import api from '../api/axios';

export const accountService = {
  getAllAccounts: async () => {
    const response = await api.get('/admin/accounts');
    return response.data;
  }
};
