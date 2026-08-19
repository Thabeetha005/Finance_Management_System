import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { Search, Filter, Trash2, X, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

const AdminAuditLogsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter States
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterModule, setFilterModule] = useState('ALL');
  const [filterDateRange, setFilterDateRange] = useState('ALL');

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: async () => {
      const res = await api.get('/admin/audit-logs');
      return res.data;
    }
  });

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/admin/audit-logs');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminAuditLogs']);
    }
  });

  const handleClearAllLogs = () => {
    if (window.confirm("Are you sure you want to clear all audit logs and restart log history from scratch?")) {
      clearLogsMutation.mutate();
    }
  };

  const handleResetFilters = () => {
    setFilterAction('ALL');
    setFilterModule('ALL');
    setFilterDateRange('ALL');
    setSearchTerm('');
  };

  const hasActiveFilters = filterAction !== 'ALL' || filterModule !== 'ALL' || filterDateRange !== 'ALL' || searchTerm !== '';

  const filteredLogs = logs.filter(log => {
    // Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const logId = `log${log.id.toString().padStart(3, '0')}`;
      const matchesSearch = (
        logId.includes(term) ||
        (log.adminUsername || '').toLowerCase().includes(term) ||
        (log.adminName || '').toLowerCase().includes(term) ||
        (log.action || '').toLowerCase().includes(term) ||
        (log.targetType || '').toLowerCase().includes(term) ||
        (log.description || '').toLowerCase().includes(term) ||
        (log.ipAddress || '').toLowerCase().includes(term)
      );
      if (!matchesSearch) return false;
    }

    // Action Filter
    if (filterAction !== 'ALL') {
      if ((log.action || '').toUpperCase() !== filterAction.toUpperCase()) return false;
    }

    // Module / Target Type Filter
    if (filterModule !== 'ALL') {
      if ((log.targetType || '').toUpperCase() !== filterModule.toUpperCase()) return false;
    }

    // Date Range Filter
    if (filterDateRange !== 'ALL' && log.createdAt) {
      const logDate = new Date(log.createdAt);
      const now = new Date();
      if (filterDateRange === 'TODAY') {
        if (logDate.toDateString() !== now.toDateString()) return false;
      } else if (filterDateRange === 'THIS_WEEK') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (logDate < weekAgo) return false;
      } else if (filterDateRange === 'THIS_MONTH') {
        if (logDate.getMonth() !== now.getMonth() || logDate.getFullYear() !== now.getFullYear()) return false;
      }
    }

    return true;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAction, filterModule, filterDateRange]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy hh:mm a');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-gray-500 text-sm mt-1">Track and filter system administrative actions and activity records.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, email, action or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8B83] focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors text-sm font-medium border ${
              showFilterPanel || hasActiveFilters
                ? 'bg-[#12241F] text-white border-[#12241F]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            )}
          </button>
          <button
            onClick={handleClearAllLogs}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Clear Logs
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {showFilterPanel && (
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#4E8B83]" />
                Filter Options
              </h3>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>
                )}
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Action Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Action Type</label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4E8B83]"
                >
                  <option value="ALL">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="APPROVE">Approve</option>
                  <option value="REJECT">Reject</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                </select>
              </div>

              {/* Module Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Target Module</label>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4E8B83]"
                >
                  <option value="ALL">All Modules</option>
                  <option value="USER">User Management</option>
                  <option value="LOAN">Loan Management</option>
                  <option value="INVESTMENT">Investments</option>
                  <option value="DOCUMENT">Document Verification</option>
                  <option value="TICKET">Support Tickets</option>
                  <option value="CONSULTATION">Consultations</option>
                  <option value="SYSTEM">System Settings</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Date Range</label>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4E8B83]"
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today</option>
                  <option value="THIS_WEEK">This Week</option>
                  <option value="THIS_MONTH">This Month</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-700 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">User / Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                  </tr>
                ))
              ) : paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="px-6 py-4 font-medium text-gray-900">LOG{log.id.toString().padStart(3, '0')}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{log.adminName || 'System'}</div>
                      <div className="text-xs text-gray-500">{log.adminUsername}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{log.targetType || 'General'}</td>
                    <td className="px-6 py-4 text-gray-600">{log.description}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{formatDate(log.createdAt)}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{log.ipAddress || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {hasActiveFilters ? 'No audit logs found matching your filters.' : 'No audit logs available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="font-medium text-gray-900">{filteredLogs.length}</span> logs
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                      currentPage === i + 1
                        ? 'bg-[#12241F] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AdminAuditLogsPage;
