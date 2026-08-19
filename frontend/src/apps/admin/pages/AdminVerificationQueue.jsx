import React, { useState, useMemo, useEffect } from 'react';
import { Search, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import api from '../../../shared/api/axios';
import { toast } from 'react-hot-toast';

const AdminVerificationQueue = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let docsList = [];
        let clientsList = [];

        try {
          const docsRes = await api.get('/admin/documents');
          docsList = Array.isArray(docsRes.data) ? docsRes.data : docsRes.data?.content || [];
        } catch (e) {
          console.warn("Could not fetch admin documents", e);
        }

        try {
          const clientsRes = await api.get('/admin/clients');
          clientsList = Array.isArray(clientsRes.data) ? clientsRes.data : clientsRes.data?.content || [];
        } catch (e) {
          console.warn("Could not fetch admin clients", e);
        }

        const clientsMap = {};
        clientsList.forEach(c => {
          if (c && c.id) {
            clientsMap[c.id] = c.name || c.email;
          }
        });

        const isMockName = (name) => {
          if (!name) return false;
          const lower = String(name).toLowerCase();
          return lower.startsWith('customer a') || lower.startsWith('test customer') || lower.startsWith('wallet customer') || lower.startsWith('withdrawal customer');
        };

        const docsData = docsList
          .filter(doc => !doc.userId || !clientsMap[doc.userId] || !isMockName(clientsMap[doc.userId]))
          .map(doc => ({
            id: `DOC-${doc.id}`,
            originalId: doc.id,
            userId: doc.userId || 'N/A',
            customer: clientsMap[doc.userId] ? `${clientsMap[doc.userId]} (ID: ${doc.userId})` : `User ID: ${doc.userId || 'N/A'}`,
            type: doc.documentType || 'Identity Document',
            documents: doc.fileName || 'Document.pdf',
            date: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: doc.verificationStatus || 'PENDING',
            raw: doc
          }));
        
        docsData.sort((a, b) => (b.originalId || 0) - (a.originalId || 0));
        setData(docsData);
      } catch (err) {
        console.error("Failed to fetch queue data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived filtered data based on search and tabs
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Tab filter
      if (activeTab !== 'All' && item.status !== activeTab) {
        return false;
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(query) ||
          item.customer.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query) ||
          item.documents.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activeTab, searchQuery, data]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    return filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filteredData, page]);

  const counts = {
    All: data.length,
    PENDING: data.filter(d => d.status === 'PENDING').length,
    APPROVED: data.filter(d => d.status === 'APPROVED').length,
    REJECTED: data.filter(d => d.status === 'REJECTED').length
  };

  const tabs = [
    { id: 'All', label: `All (${counts.All})` },
    { id: 'PENDING', label: `Pending (${counts.PENDING})` },
    { id: 'APPROVED', label: `Approved (${counts.APPROVED})` },
    { id: 'REJECTED', label: `Rejected (${counts.REJECTED})` }
  ];

  const handleAction = async (status) => {
    if (!selectedApp) return;
    
    try {
      if (status === 'Approved') {
        await api.post(`/admin/documents/${selectedApp.originalId}/verify`, {
          verificationStatus: 'APPROVED',
          adminNote: 'Document verified & approved by Admin'
        });
        toast.success('Document Approved successfully');
      } else if (status === 'Denied') {
        await api.post(`/admin/documents/${selectedApp.originalId}/verify`, {
          verificationStatus: 'REJECTED',
          adminNote: 'Document rejected due to non-compliance'
        });
        toast.success('Document Rejected');
      }
      
      // Update local state to reflect change
      setData(prev => prev.map(item => item.id === selectedApp.id ? { ...item, status: status === 'Approved' ? 'APPROVED' : 'REJECTED' } : item));
      setSelectedApp(null);
    } catch (err) {
      console.error("Action failed", err);
      toast.error("Failed to update verification status: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="text-xs text-gray-500 mt-1">Review and verify customer KYC and identity documents in real-time.</p>
      </div>

      {/* Search and Filter Row */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by customer name, Document ID, file name, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#106354] transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-xs font-bold transition-colors relative cursor-pointer ${
              activeTab === tab.id 
                ? 'text-[#106354]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#106354] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Document ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">File Name</th>
                <th className="py-4 px-6">Uploaded On</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 animate-pulse rounded w-28"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                    <td className="py-4 px-6"><div className="h-6 bg-gray-200 animate-pulse rounded-full w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-7 bg-gray-200 animate-pulse rounded-lg w-16"></div></td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-xs text-gray-500">
                    No documents found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{row.id}</td>
                    <td className="py-4 px-6 font-bold text-gray-800">{row.customer}</td>
                    <td className="py-4 px-6 font-semibold text-gray-700">{row.type}</td>
                    <td className="py-4 px-6 font-medium text-gray-600 flex items-center gap-1.5 mt-2">
                      <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate max-w-xs">{row.documents}</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-500">{row.date}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        row.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        row.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => setSelectedApp(row)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm bg-[#106354] hover:bg-[#0c4e42] text-white cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {filteredData.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length} documents
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

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Review Application</h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedApp.id}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Customer</label>
                  <div className="font-bold text-gray-900 mt-0.5">{selectedApp.customer}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Document ID</label>
                  <div className="font-bold text-gray-900 mt-0.5">{selectedApp.id}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Type</label>
                  <div className="font-bold text-gray-900 mt-0.5">{selectedApp.type}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">File Name</label>
                  <div className="font-bold text-gray-900 mt-0.5 truncate">{selectedApp.documents}</div>
                </div>
              </div>
              
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center space-y-2">
                <button 
                  onClick={async () => {
                    try {
                      const res = await api.get(`/admin/documents/${selectedApp.originalId}`, { responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([res.data]));
                      window.open(url, '_blank');
                    } catch (e) {
                      toast.error("Failed to open document file");
                    }
                  }}
                  className="w-full py-2.5 bg-white border border-[#106354] text-[#106354] rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  View Uploaded Document File
                </button>
                <p className="text-[11px] text-gray-500">
                  Inspect official document details before verifying.
                </p>
              </div>
              
              <div className="pt-3 flex justify-end gap-3">
                <button 
                  onClick={() => handleAction('Denied')}
                  className="px-4 py-2.5 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-all text-xs cursor-pointer"
                >
                  Deny Application
                </button>
                <button 
                  onClick={() => handleAction('Approved')}
                  className="px-4 py-2.5 bg-[#106354] hover:bg-[#0c4e42] text-white rounded-xl font-bold transition-all text-xs shadow-md cursor-pointer"
                >
                  Approve Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerificationQueue;
