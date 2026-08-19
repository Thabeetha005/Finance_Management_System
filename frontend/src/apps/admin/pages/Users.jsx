import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../../shared/api/axios';
import {
  Search, Users, CheckCircle2, XCircle, Clock, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';

const statusBadge = (status) => {
  const s = (status || 'Active').toLowerCase();
  if (s === 'active') return <span className="text-[#4E8B83] font-medium text-sm">Active</span>;
  if (s === 'inactive' || s === 'suspended') return <span className="text-red-500 font-medium text-sm">Inactive</span>;
  return <span className="text-gray-500 font-medium text-sm">{status}</span>;
};

const verificationBadge = (verified) => {
  if (verified === true || verified === 'Yes' || String(verified).toLowerCase() === 'true') {
    return <span className="text-[#4E8B83] font-medium text-sm">Yes</span>;
  }
  return <span className="text-red-500 font-medium text-sm">No</span>;
};

const formatId = (user) => {
  if (user && user.customerId) return user.customerId;
  if (!user || !user.id) return 'CUS1000';
  return `CUS${1000 + Number(user.id)}`;
};

const AllCustomers = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['adminAllCustomers'],
    queryFn: async () => {
      const res = await api.get('/admin/clients');
      // Filter only CUSTOMER role
      return (Array.isArray(res.data) ? res.data : res.data?.content || res.data?.data || [])
        .filter(u => !u.role || u.role === 'CUSTOMER');
    }
  });

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-xl font-bold text-gray-900">All Customers</h2>
      </div>

      {/* Search & Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#4E8B83] focus:border-[#4E8B83] transition-all bg-white"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#4E8B83] text-white text-sm font-medium rounded-lg hover:bg-[#3d6e68] transition-colors">
            <Search className="w-4 h-4" /> {/* Filter Icon Representation */}
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">ID</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Verified</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Joined Date</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gray-200"/><div className="h-4 w-28 bg-gray-200 rounded"/></div></td>
                    {[...Array(5)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 w-24 bg-gray-200 rounded"/></td>)}
                    <td className="px-5 py-4"><div className="h-8 w-16 bg-gray-200 rounded-lg ml-auto"/></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-red-500">
                    Failed to load customers. Make sure the backend is running.
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No customers found{search ? ` for "${search}"` : ''}.</p>
                  </td>
                </tr>
              ) : (
                paginated.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                    <td className="px-6 py-5 text-sm text-gray-500">{formatId(user)}</td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-900">{user.name || 'Unknown'}</td>
                    <td className="px-6 py-5 text-sm text-gray-500">{user.email || '—'}</td>
                    <td className="px-6 py-5 text-sm text-gray-500">{user.phone || user.phoneNumber || '—'}</td>
                    <td className="px-6 py-5">{statusBadge(user.status || user.accountStatus)}</td>
                    <td className="px-6 py-5">{verificationBadge(user.isVerified || user.verificationStatus)}</td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="text-gray-400 hover:text-gray-600 transition-colors inline-block"
                        title="View Profile"
                      >
                        <span className="text-xl leading-none tracking-widest font-bold">...</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - only render if totalPages > 1 */}
        {totalPages > 1 && (
          <div className="p-4 flex items-center justify-end border-t border-gray-100">
            <div className="flex items-center gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                if (
                  idx === 0 || 
                  idx === totalPages - 1 || 
                  (idx >= page - 1 && idx <= page + 1)
                ) {
                  return (
                    <button
                      key={idx}
                      onClick={() => setPage(idx)}
                      className={`w-8 h-8 flex items-center justify-center rounded border font-medium text-sm transition-colors ${
                        page === idx 
                          ? 'bg-[#12241F] text-white border-[#12241F]' 
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                }
                
                if (
                  (idx === page - 2 && page > 2) || 
                  (idx === page + 2 && page < totalPages - 3)
                ) {
                  return <span key={idx} className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>;
                }
                
                return null;
              })}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCustomers;
