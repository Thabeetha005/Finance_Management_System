import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { MessageSquare, CheckCircle, Mail } from 'lucide-react';

const ContactRequestManagement = () => {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['adminContactRequests'],
    queryFn: async () => {
      const [reqRes, clientsRes] = await Promise.all([
        api.get('/admin/contact-requests'),
        api.get('/admin/clients')
      ]);

      const clientsList = Array.isArray(clientsRes.data) ? clientsRes.data : clientsRes.data?.content || [];
      const validEmails = new Set(clientsList.map(c => (c.email || '').toLowerCase()));

      const raw = Array.isArray(reqRes.data) ? reqRes.data : [];
      return raw.filter(r => r.email && validEmails.has(String(r.email).toLowerCase()));
    }
  });

  const markResolvedMutation = useMutation({
    mutationFn: async (id) => {
      return await api.put(`/admin/contact-requests/${id}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminContactRequests']);
    }
  });

  const handleResolve = (id) => {
    if (window.confirm("Mark this request as resolved?")) {
      markResolvedMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Requests</h1>
        <p className="text-gray-500 mt-1">Review and manage general inquiries and contact requests.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Contact Details</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Message</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32 mb-2"></div><div className="h-3 bg-gray-200 animate-pulse rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-48 mb-2"></div><div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 animate-pulse rounded-full w-20"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : requests.length > 0 ? (
                requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{req.name}</p>
                      <div className="flex flex-col gap-1 mt-1">
                        <a href={`mailto:${req.email}`} className="text-xs text-blue-600 hover:underline flex items-center"><Mail className="w-3 h-3 mr-1"/>{req.email}</a>
                        {req.phone && <span className="text-xs text-gray-500">{req.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{req.subject || 'General Inquiry'}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      <p className="line-clamp-3 text-xs leading-relaxed">{req.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        req.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(!req.status || req.status === 'PENDING') && (
                        <button 
                          onClick={() => handleResolve(req.id)} 
                          className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-end w-full max-w-[100px] ml-auto"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">No contact requests</p>
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

export default ContactRequestManagement;
