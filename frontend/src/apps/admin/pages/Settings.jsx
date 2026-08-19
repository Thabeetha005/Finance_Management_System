import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const Settings = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);

  // TanStack Query for fetching data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['settings', pageIndex, search],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/${'settings'}?page=${pageIndex}&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  // Mutation for deleting
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/${'settings'}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <button className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-all shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </button>
      </div>
      
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Date / Info</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading records...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-danger">Error loading data. Please try again.</td>
                </tr>
              ) : data?.data?.length === 0 || !data?.data ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No records found</h3>
                    <p className="text-gray-500 text-sm">Get started by creating a new record.</p>
                  </td>
                </tr>
              ) : (
                data.data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{item.id.substring(0,8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.name || item.description || item.title || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-sm text-gray-500">Showing page {pageIndex}</span>
          <div className="space-x-2">
            <button 
              disabled={pageIndex === 1}
              onClick={() => setPageIndex(p => p - 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setPageIndex(p => p + 1)}
              className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
