import api from '../shared/api/axios';

export const clientService = {
  getAllClients: async () => {
    const response = await api.get('/admin/clients');
    return response.data;
  }
};
