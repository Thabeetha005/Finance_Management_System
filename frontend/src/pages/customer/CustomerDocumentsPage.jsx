import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, Eye, Download, ShieldCheck, HelpCircle, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CustomerDocumentsPage = () => {
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('PAN Card');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['myDocuments'],
    queryFn: async () => {
      const res = await api.get('/documents/me');
      return res.data;
    }
  });

  const getDocStatus = (type) => {
    const doc = documents.find(d => d.documentType === type);
    if (!doc) return 'Not Uploaded';
    if (doc.verificationStatus === 'APPROVED') return 'Verified';
    if (doc.verificationStatus === 'REJECTED') return 'Rejected';
    return 'Pending Review';
  };

  const getDocFile = (type) => {
    return documents.find(d => d.documentType === type);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      setShowUploadModal(false);
      setSelectedFile(null);
      queryClient.invalidateQueries(['myDocuments']);
    },
    onError: (err) => {
      toast.error(err.response?.data || 'Failed to upload document');
    }
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('documentType', selectedDocType);
    formData.append('file', selectedFile);
    setIsUploading(true);
    uploadMutation.mutate(formData, {
      onSettled: () => setIsUploading(false)
    });
  };

  const handleView = async (documentId) => {
    try {
      const res = await api.get(`/documents/${documentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      window.open(url, '_blank');
    } catch (err) {
      toast.error('Failed to open document');
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const res = await api.get(`/documents/${documentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error('Failed to download document');
    }
  };

  const docTypes = [
    { type: 'PAN Card', label: 'PAN Card', desc: 'Upload a clear copy of your PAN Card for identity verification.', required: true, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { type: 'Aadhaar Card', label: 'Aadhaar Card', desc: 'Upload a clear copy of your Aadhaar Card for KYC verification.', required: true, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { type: 'Bank Statement', label: 'Bank Statement', desc: 'Upload your latest 3 months bank statement for address and income verification.', required: true, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { type: 'GST Certificate', label: 'GST Certificate', desc: 'Required only for business loan applications. Upload your GST certificate.', required: false, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#12241F] mb-1">My Documents</h1>
          <p className="text-gray-500 text-sm">Upload and manage your documents securely</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-[#05231e] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0a352d] transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          Upload New Document
        </button>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-start md:items-center gap-3">
          <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 md:mt-0" />
          <div>
            <h4 className="text-sm font-bold text-gray-900">Required Documents</h4>
            <p className="text-xs text-gray-600">Please upload the following documents to complete your verification process.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-white px-3 py-1.5 rounded-full border border-emerald-100">
          <ShieldCheck className="w-4 h-4" />
          Your documents are secure and encrypted
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {docTypes.map(doc => {
          const status = getDocStatus(doc.type);
          const uploadedDoc = getDocFile(doc.type);
          const isUploaded = status !== 'Not Uploaded';

          return (
            <div key={doc.type} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${doc.bg} ${doc.color} flex items-center justify-center`}>
                  <doc.icon className="w-6 h-6" />
                </div>
                {doc.required ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Required</span>
                ) : (
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">If Applicable</span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">{doc.label}</h3>
              <p className="text-xs text-gray-500 mb-6 flex-1 leading-relaxed">{doc.desc}</p>
              
              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-2">
                  {status === 'Verified' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : status === 'Pending Review' ? (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  ) : status === 'Rejected' ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-white text-[10px] font-bold">-</div>
                  )}
                  <span className={`text-sm font-bold ${
                    status === 'Verified' ? 'text-emerald-600' : 
                    status === 'Pending Review' ? 'text-amber-600' : 
                    status === 'Rejected' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {status}
                  </span>
                </div>
                
                {isUploaded ? (
                  <button 
                    onClick={() => handleView(uploadedDoc.id)}
                    className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    View Document
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedDocType(doc.type);
                      setShowUploadModal(true);
                    }}
                    className="w-full py-2.5 bg-[#05231e] text-white font-bold text-sm rounded-xl hover:bg-[#0a352d] transition-colors"
                  >
                    Upload Document
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Uploaded Documents</h2>
        <p className="text-sm text-gray-500">View all your uploaded documents and their status</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Document Type</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">File Name</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Uploaded On</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading documents...</td>
                </tr>
              ) : docTypes.map(doc => {
                const uploadedDoc = getDocFile(doc.type);
                if (!uploadedDoc) {
                  return (
                    <tr key={doc.type} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${doc.bg} ${doc.color} flex items-center justify-center`}>
                            <doc.icon className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-gray-700">{doc.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">-</td>
                      <td className="px-6 py-4 text-gray-400">-</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-500">
                          Not Uploaded
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400">-</td>
                    </tr>
                  );
                }

                const isVerified = uploadedDoc.verificationStatus === 'APPROVED';
                
                return (
                  <tr key={doc.type} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${doc.bg} ${doc.color} flex items-center justify-center`}>
                          <doc.icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-900">{doc.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium truncate max-w-[200px]">{uploadedDoc.fileName}</p>
                      <p className="text-xs text-gray-500">{(uploadedDoc.fileSize / 1024).toFixed(1)} KB</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(uploadedDoc.uploadedAt || Date.now()).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${isVerified ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                        {isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleView(uploadedDoc.id)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-gray-200 bg-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDownload(uploadedDoc.id, uploadedDoc.fileName)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-gray-200 bg-white"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Document Type</label>
                <select 
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 transition-colors"
                >
                  {docTypes.map(d => (
                    <option key={d.type} value={d.type}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select File</label>
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                <p className="text-xs text-gray-500 mt-2">Accepted formats: JPG, PNG, PDF. Max size: 10MB.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 font-bold bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerDocumentsPage;
