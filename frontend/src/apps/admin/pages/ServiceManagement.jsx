import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { Briefcase, Plus, Edit, Trash2, X } from 'lucide-react';

const ServiceManagement = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', iconName: '', category: '', isActive: true
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['adminServices'],
    queryFn: async () => {
      const res = await api.get('/services');
      return res.data;
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['adminServiceCategories'],
    queryFn: async () => {
      try {
        const res = await api.get('/services/categories');
        return res.data;
      } catch (e) {
        return [];
      }
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newService) => await api.post('/admin/services', { ...newService, isPublished: newService.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminServices']);
      setShowForm(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => await api.put(`/admin/services/${id}`, { ...data, isPublished: data.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminServices']);
      setShowForm(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/admin/services/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['adminServices'])
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', iconName: '', category: '', isActive: true });
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setFormData({
      title: service.title,
      description: service.description || '',
      iconName: service.iconName || '',
      category: service.category || '',
      isActive: service.isPublished !== false
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-500 mt-1">Manage financial services and categories.</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-[#4E8B83] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3d6f69] transition-colors"
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Service</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Service' : 'Create New Service'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input required type="text" className="w-full p-2 border rounded-xl" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name (lucide-react)</label>
              <input type="text" className="w-full p-2 border rounded-xl" placeholder="e.g. Shield, Briefcase" value={formData.iconName} onChange={e => setFormData({...formData, iconName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input required type="text" className="w-full p-2 border rounded-xl" placeholder="e.g. Lending, Wealth" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" id="isActive" className="w-4 h-4 text-[#4E8B83] rounded border-gray-300" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active (Visible on public site)</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required className="w-full p-2 border rounded-xl" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <button 
            type="submit" 
            disabled={createMutation.isLoading || updateMutation.isLoading}
            className="bg-[#4E8B83] text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50"
          >
            {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save Service'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : services.length > 0 ? (
                services.map(service => (
                  <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{service.title}</td>
                    <td className="px-6 py-4 text-gray-600">{service.category || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${service.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {service.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(service)} className="text-gray-400 hover:text-blue-600 transition-colors p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)} 
                        disabled={deleteMutation.isLoading && deleteMutation.variables === service.id}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Briefcase className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">No services found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;
