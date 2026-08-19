import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Mail, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminSupportPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // Fetch both Support Tickets and Contact Requests with active client filtering
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['adminSupportTickets'],
    queryFn: async () => {
      const [ticketsRes, clientsRes] = await Promise.all([
        api.get('/admin/support/tickets'),
        api.get('/admin/clients')
      ]);

      const clientsList = Array.isArray(clientsRes.data) ? clientsRes.data : clientsRes.data?.content || [];
      const validUserIds = new Set(clientsList.map(c => c.id));

      const raw = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
      return raw.filter(t => t.customer && validUserIds.has(t.customer.id));
    }
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
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

  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ id, status, type }) => {
      if (type === 'TICKET') {
        if (status === 'RESOLVED') {
          return await api.post(`/admin/support/tickets/${id}/resolve`, { adminResponse: 'Resolved from table', resolutionNotes: '' });
        } else {
          return await api.put(`/admin/support/tickets/${id}/status`, { status });
        }
      } else {
        if (status === 'RESOLVED') {
          return await api.put(`/admin/contact-requests/${id}/resolve`);
        } else {
          return await api.put(`/admin/contact-requests/${id}/status`, { status });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminSupportTickets']);
      queryClient.invalidateQueries(['adminContactRequests']);
      toast.success('Status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  const handleAction = (id, type, action) => {
    let mappedStatus = action;
    if (action === 'PROGRESS') mappedStatus = 'IN_PROGRESS';
    if (action === 'PENDING') mappedStatus = 'OPEN';
    
    updateTicketStatusMutation.mutate({ id, status: mappedStatus, type });
  };

  const isLoading = ticketsLoading || requestsLoading;

  // Combine and sort
  const combinedItems = [
    ...(Array.isArray(tickets) ? tickets : []).map(t => ({
      id: t.id || t._id,
      type: 'TICKET',
      name: t.customer?.name || t.customerId?.name || 'Customer',
      email: t.customer?.email || t.customerId?.email || 'N/A',
      phone: t.customer?.phone || t.customerId?.phone || 'N/A',
      subject: t.subject || t.category,
      message: t.description,
      status: t.status, 
      createdAt: t.createdAt
    })),
    ...(Array.isArray(requests) ? requests : []).map(r => ({
      id: r.id || r._id,
      type: 'REQUEST',
      name: r.name,
      email: r.email,
      phone: r.phone,
      subject: r.subject || 'General Inquiry',
      message: r.message,
      status: r.status || 'NEW', 
      createdAt: r.createdAt
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalPages = Math.ceil(combinedItems.length / PAGE_SIZE);
  const paginatedItems = combinedItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-500 mt-1">Review and manage support tickets and contact requests in one place.</p>
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
              ) : combinedItems.length > 0 ? (
                paginatedItems.map(item => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <div className="flex flex-col gap-1 mt-1">
                        <a href={`mailto:${item.email}`} className="text-xs text-blue-600 hover:underline flex items-center"><Mail className="w-3 h-3 mr-1"/>{item.email}</a>
                        {item.phone && item.phone !== 'N/A' && <span className="text-xs text-gray-500">{item.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{item.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      <p className="line-clamp-3 text-xs leading-relaxed">{item.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        ['NEW', 'OPEN', 'PENDING'].includes(item.status) ? 'bg-blue-100 text-blue-700' :
                        item.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAction(item.id, item.type, e.target.value);
                            e.target.value = ''; // Reset
                          }
                        }}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg focus:ring-[#4E8B83] focus:border-[#4E8B83] block w-full p-2 outline-none cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>Action...</option>
                        <option value="PROGRESS">Progress</option>
                        <option value="PENDING">Pending</option>
                        <option value="RESOLVED">Resolve</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Settings className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">No support tickets found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI - Only rendered if total items > 15 */}
        {combinedItems.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, combinedItems.length)} of {combinedItems.length} support items
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 rounded-xl text-xs font-bold transition-all text-gray-700 cursor-pointer shadow-sm"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-gray-700 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 rounded-xl text-xs font-bold transition-all text-gray-700 cursor-pointer shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportPage;
