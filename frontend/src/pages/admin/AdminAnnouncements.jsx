import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Bell, Plus, Trash2, Send } from 'lucide-react';

const AdminAnnouncements = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['adminAnnouncements'],
    queryFn: async () => {
      const res = await api.get('/admin/announcements');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      await api.post('/admin/announcements', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
      setIsCreating(false);
      setFormData({ title: '', content: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.content) {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) return <div className="p-8">Loading announcements...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-[#4E8B83]" />
            Global Announcements
          </h1>
          <p className="text-sm text-gray-500 mt-1">Send broadcast notifications to all customers.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-[#12241F] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1a352d] transition-colors"
        >
          {isCreating ? 'Cancel' : <><Plus className="w-4 h-4" /> New Announcement</>}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4E8B83]/50 focus:border-[#4E8B83] outline-none"
              placeholder="E.g., System Maintenance"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea 
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4E8B83]/50 focus:border-[#4E8B83] outline-none"
              placeholder="Write your broadcast message here..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 bg-[#4E8B83] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#3d6e68] transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Sending...' : <><Send className="w-4 h-4" /> Broadcast to All</>}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-500">
            No announcements found. Create one above!
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 ${!ann.isActive ? 'opacity-60' : ''}`}>
              <div className="mt-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ann.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Bell className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{ann.title}</h3>
                    <p className="text-xs text-gray-500 font-medium mb-2">{new Date(ann.createdAt).toLocaleString()}</p>
                  </div>
                  {ann.isActive && (
                    <button 
                      onClick={() => {
                        if(window.confirm('Are you sure you want to deactivate this announcement?')) {
                          deleteMutation.mutate(ann.id);
                        }
                      }}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Deactivate"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                {!ann.isActive && <span className="inline-block mt-3 text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">INACTIVE</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
