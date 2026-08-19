import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../../api/axios';

const AdminVerificationQueue = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
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
        const [docsRes, clientsRes] = await Promise.all([
          api.get('/admin/documents'),
          api.get('/admin/clients')
        ]);

        const clientsList = Array.isArray(clientsRes.data) ? clientsRes.data : clientsRes.data?.content || [];
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

        const rawDocs = Array.isArray(docsRes.data) ? docsRes.data : [];
        const docsData = rawDocs
          .filter(doc => doc.userId && clientsMap[doc.userId] && !isMockName(clientsMap[doc.userId]))
          .map(doc => ({
            id: `DOC-${doc.id}`,
            originalId: doc.id,
            customer: clientsMap[doc.userId] ? `${clientsMap[doc.userId]} (ID: ${doc.userId})` : `User ID: ${doc.userId}`,
            isVerified: false,
            type: doc.documentType || 'Document',
            documents: doc.fileName,
            date: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: doc.verificationStatus || 'PENDING',
            raw: doc
          }));
        
        docsData.sort((a, b) => (b.originalId || 0) - (a.originalId || 0));
        setData(docsData);
      } catch (err) {
        console.error("Failed to fetch queue data", err);
        setErrorMsg(err.message + " | " + (err.response?.data?.message || err.response?.status));
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
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(query) ||
          item.customer.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query)
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
          adminNote: 'Document looks good'
        });
      } else if (status === 'Denied') {
        await api.post(`/admin/documents/${selectedApp.originalId}/verify`, {
          verificationStatus: 'REJECTED',
          adminNote: 'Did not meet verification criteria'
        });
      }
      
      // Update local state to reflect change
      setData(prev => prev.map(item => item.id === selectedApp.id ? { ...item, status: status === 'Approved' ? 'APPROVED' : 'REJECTED' } : item));
      setSelectedApp(null);
    } catch (err) {
      console.error("Action failed", err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-[#12241F]">Verification Queue</h1>
        <p className="text-[13px] text-gray-500 mt-1">Review and verify customer documents</p>
      </div>

      {/* Search and Filter Row */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by customer or application..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1E4A40]/20 focus:border-[#1E4A40] text-gray-800 placeholder-gray-400 transition-shadow shadow-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-[13px] font-semibold transition-colors relative ${
              activeTab === tab.id 
                ? 'text-[#1E4A40]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1E4A40] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-900">Document ID</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-900">User ID</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-900">Type</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-900">File Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-900">Uploaded On</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-900">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-sm text-gray-500">
                    Loading applications...
                  </td>
                </tr>
              ) : errorMsg ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-sm text-red-500 font-bold">
                    Error: {errorMsg}
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-sm text-gray-500">
                    No applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-[13px] font-medium text-gray-700">{row.id}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-700">{row.customer}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-700">{row.type}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-700">{row.documents}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-700">{row.date}</td>
                    <td className="py-4 px-6 text-[13px]">
                      <span className={`font-semibold ${
                        row.status === 'UNDER_REVIEW' ? 'text-[#1E4A40]' : 
                        row.status === 'PENDING' ? 'text-amber-500' : 
                        row.status === 'APPROVED' ? 'text-emerald-500' :
                        row.status === 'REJECTED' ? 'text-red-500' :
                        'text-[#1E4A40]'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => setSelectedApp(row)}
                        className="px-4 py-1.5 text-[12px] font-medium rounded-md transition-colors shadow-sm bg-[#1E4A40] hover:bg-[#153a31] text-white"
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

        {/* Pagination UI - Only rendered if total items > 15 */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Review Application</h2>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Customer</label>
                  <div className="text-sm font-semibold text-gray-900">{selectedApp.customer}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Document ID</label>
                  <div className="text-sm font-semibold text-gray-900">{selectedApp.id}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                  <div className="text-sm font-semibold text-gray-900">{selectedApp.type}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">File Name</label>
                  <div className="text-sm font-semibold text-gray-900">{selectedApp.documents}</div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl mt-4">
                <button 
                  onClick={async () => {
                    try {
                      const res = await api.get(`/admin/documents/${selectedApp.originalId}`, { responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([res.data]));
                      window.open(url, '_blank');
                    } catch (e) {
                      alert("Failed to open document");
                    }
                  }}
                  className="w-full py-2 bg-white border border-[#1E4A40] text-[#1E4A40] rounded-lg font-bold hover:bg-gray-50 transition-colors mb-2"
                >
                  View Document File
                </button>
                <p className="text-sm text-gray-600 text-center">
                  Review the document content before verifying.
                </p>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  onClick={() => handleAction('Denied')}
                  className="px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                >
                  Deny Application
                </button>
                <button 
                  onClick={() => handleAction('Approved')}
                  className="px-4 py-2 bg-[#4E8B83] hover:bg-[#3A6B65] text-white rounded-lg font-medium transition-colors"
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
