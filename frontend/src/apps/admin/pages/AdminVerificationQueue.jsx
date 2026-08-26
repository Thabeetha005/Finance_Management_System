import React, { useState, useMemo, useEffect } from 'react';
import { Search, FileText, CheckCircle, XCircle, Eye, ExternalLink, Download, AlertCircle, Loader2, X } from 'lucide-react';
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

  // Document preview states
  const [docLoading, setDocLoading] = useState(false);
  const [docBlobUrl, setDocBlobUrl] = useState(null);
  const [docMimeType, setDocMimeType] = useState('');
  const [docLoadError, setDocLoadError] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);

  // Load document preview when selectedApp opens
  useEffect(() => {
    let activeUrl = null;
    if (selectedApp) {
      setDocLoading(true);
      setDocLoadError(false);
      setDocBlobUrl(null);
      api.get(`/admin/documents/${selectedApp.originalId}`, { responseType: 'blob' })
        .then(res => {
          const type = res.headers['content-type'] || (selectedApp.documents?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/png');
          const blob = new Blob([res.data], { type });
          activeUrl = window.URL.createObjectURL(blob);
          setDocBlobUrl(activeUrl);
          setDocMimeType(type);
        })
        .catch(err => {
          console.error("Error loading document preview:", err);
          setDocLoadError(true);
        })
        .finally(() => {
          setDocLoading(false);
        });
    }

    return () => {
      if (activeUrl) {
        window.URL.revokeObjectURL(activeUrl);
      }
    };
  }, [selectedApp]);

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
      toast.error("Failed to update verification status: " + (err.response?.data?.message || err.response?.data || err.message));
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
                <th className="py-4 px-6 text-right">Action</th>
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
                    <td className="py-4 px-6 text-right"><div className="h-7 bg-gray-200 animate-pulse rounded-lg w-16 ml-auto"></div></td>
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
                    <td className="py-4 px-6 font-medium text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-xs">{row.documents}</span>
                      </div>
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
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {row.status === 'APPROVED' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Approved
                        </span>
                      ) : row.status === 'REJECTED' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-800 border border-red-200">
                          Rejected
                        </span>
                      ) : (
                        <button 
                          onClick={() => setSelectedApp(row)}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm bg-[#106354] hover:bg-[#0c4e42] text-white cursor-pointer"
                        >
                          Review
                        </button>
                      )}
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

      {/* Review Modal with Inline Document Viewer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-gray-100 my-8 flex flex-col max-h-[90vh]">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900">Review Application</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedApp.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    selectedApp.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedApp.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{selectedApp.id}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedApp(null);
                  if (docBlobUrl) window.URL.revokeObjectURL(docBlobUrl);
                  setDocBlobUrl(null);
                }} 
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Summary Information Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Customer</label>
                  <div className="font-bold text-gray-900 mt-0.5 truncate">{selectedApp.customer}</div>
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
                  <div className="font-bold text-gray-900 mt-0.5 truncate" title={selectedApp.documents}>{selectedApp.documents}</div>
                </div>
              </div>
              
              {/* Inline Document Preview Box */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-slate-900/5">
                <div className="px-4 py-2.5 bg-gray-100/80 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700 font-bold text-xs">
                    <FileText className="w-4 h-4 text-[#106354]" />
                    <span className="truncate max-w-xs sm:max-w-md">Uploaded Document: {selectedApp.documents}</span>
                  </div>
                  {docBlobUrl && (
                    <div className="flex items-center gap-2">
                      <a
                        href={docBlobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-[11px] shadow-xs cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in New Tab
                      </a>
                      <a
                        href={docBlobUrl}
                        download={selectedApp.documents || 'document'}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#106354] text-white hover:bg-[#0c4e42] font-bold text-[11px] shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-2 sm:p-4 min-h-[380px] max-h-[500px] flex items-center justify-center bg-gray-50/50">
                  {docLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-500 gap-3">
                      <Loader2 className="w-8 h-8 text-[#106354] animate-spin" />
                      <p className="font-medium text-xs">Loading document preview...</p>
                    </div>
                  ) : docLoadError ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-500 gap-2 text-center">
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                      <p className="font-bold text-gray-800 text-sm">Preview Unavailable</p>
                      <p className="text-xs text-gray-500 max-w-sm">
                        Unable to render preview directly. You can inspect the document by opening it in a new tab.
                      </p>
                    </div>
                  ) : docBlobUrl ? (
                    docMimeType.includes('image') || (selectedApp.documents && /\.(png|jpe?g|webp|gif)$/i.test(selectedApp.documents)) ? (
                      <div className="w-full flex items-center justify-center max-h-[460px] overflow-auto">
                        <img 
                          src={docBlobUrl} 
                          alt="Uploaded Document" 
                          className="max-h-[440px] max-w-full object-contain rounded-xl border border-gray-200 shadow-sm bg-white"
                        />
                      </div>
                    ) : (
                      <iframe 
                        src={docBlobUrl} 
                        className="w-full h-[450px] rounded-xl border border-gray-200 bg-white shadow-xs" 
                        title="Document PDF Viewer"
                      />
                    )
                  ) : null}
                </div>
              </div>
              
              {/* Actions Footer */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100 flex-shrink-0">
                {selectedApp.status === 'PENDING' ? (
                  <>
                    <p className="text-[11px] text-gray-500 italic">
                      Decision is final and fixed once confirmed.
                    </p>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleAction('Denied')}
                        className="px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-all text-xs cursor-pointer border border-red-200"
                      >
                        Deny Application
                      </button>
                      <button 
                        onClick={() => handleAction('Approved')}
                        className="px-5 py-2 bg-[#106354] hover:bg-[#0c4e42] text-white rounded-xl font-bold transition-all text-xs shadow-md cursor-pointer"
                      >
                        Approve Application
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      This document is <strong className="capitalize">{selectedApp.status.toLowerCase()}</strong> and its status is locked.
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedApp(null);
                        if (docBlobUrl) window.URL.revokeObjectURL(docBlobUrl);
                        setDocBlobUrl(null);
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerificationQueue;
