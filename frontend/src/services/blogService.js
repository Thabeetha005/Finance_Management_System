import api from '../shared/api/axios';

export const blogService = {
  // Public Methods
  getBlogsByType: async (type) => {
    const response = await api.get(`/public/blogs/${type}`);
    return response.data;
  },
  
  getBlogById: async (id) => {
    const response = await api.get(`/public/blogs/post/${id}`);
    return response.data;
  },

  // Admin Methods - Blogs
  getAllBlogs: async () => {
    const response = await api.get('/admin/blogs');
    return response.data;
  },

  createBlog: async (data) => {
    const response = await api.post('/admin/blogs', data);
    return response.data;
  },

  updateBlog: async (id, data) => {
    const response = await api.put(`/admin/blogs/${id}`, data);
    return response.data;
  },

  deleteBlog: async (id) => {
    const response = await api.delete(`/admin/blogs/${id}`);
    return response.data;
  },

  // Admin Methods - Categories
  getAllCategories: async () => {
    const response = await api.get('/admin/blogs/categories');
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post('/admin/blogs/categories', data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/admin/blogs/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/blogs/categories/${id}`);
    return response.data;
  }
};
