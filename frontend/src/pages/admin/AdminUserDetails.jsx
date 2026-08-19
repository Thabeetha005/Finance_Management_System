import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { 
  ArrowLeft, Wallet, ArrowRightLeft, TrendingUp, CreditCard, PieChart, 
  Activity, Shield, FileText, Landmark, Video, Users, Calendar, AlertCircle, MessageSquare, Trash2, X, CheckCircle
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const TabOverview = ({ userId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminUserOverview', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-6">Loading overview...</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load overview data</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-medium text-gray-900">{data?.name || data?.fullName || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium text-gray-900">{data?.email || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-medium capitalize text-gray-900">{data?.role || 'Customer'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Joined</p>
          <p className="font-medium text-gray-900">{data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

const TabWallet = ({ userId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminUserWallet', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/wallet`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-6">Loading wallet...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Info</h3>
      <div className="text-3xl font-bold text-emerald-600 mb-2">
        ₹{(data?.balance || 0).toLocaleString('en-IN')}
      </div>
      <p className="text-sm text-gray-500">Status: <span className="font-medium text-gray-800">{data?.status || 'Active'}</span></p>
    </div>
  );
};

const TabTransactions = ({ userId }) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['adminUserTransactions', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/transactions`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-6">Loading transactions...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions</h3>
      {data.length === 0 ? <p className="text-gray-500">No transactions found.</p> : (
        <ul className="divide-y divide-gray-100">
          {data.map((tx, i) => (
            <li key={i} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{tx.description || tx.type || 'Transaction'}</p>
                <p className="text-xs text-gray-500">{new Date(tx.date || tx.createdAt).toLocaleDateString()}</p>
              </div>
              <div className={`font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const TabInvestments = ({ userId }) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['adminUserInvestments', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/investments`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-6">Loading investments...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Investments</h3>
      {data.length === 0 ? <p className="text-gray-500">No investments found.</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.map((inv, i) => (
            <div key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
              <h4 className="font-bold text-gray-900">{inv.name || 'Investment Portfolio'}</h4>
              <p className="text-sm text-gray-600 mt-1">Value: <span className="font-semibold text-gray-900">₹{(inv.value || 0).toLocaleString('en-IN')}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TabLoans = ({ userId }) => {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ['adminUserLoans', userId],
    queryFn: async () => {
      // Assuming AdminUserController has this endpoint, else we'll need to fetch all and filter or fix backend
      const res = await api.get(`/admin/users/${userId}/loans`);
      return res.data;
    }
  });

  const handleApprove = async (loanId, requestedAmount) => {
    try {
      const amountStr = prompt("Enter approved amount:", requestedAmount);
      if (!amountStr) return;
      await api.post(`/admin/loans/${loanId}/approve?approvedAmount=${amountStr}`);
      alert("Loan approved!");
      queryClient.invalidateQueries();
    } catch (e) {
      alert("Error approving loan: " + e.response?.data?.message);
    }
  };

  const handleReject = async (loanId) => {
    try {
      const reason = prompt("Enter rejection reason:");
      if (!reason) return;
      await api.post(`/admin/loans/${loanId}/reject?reason=${reason}`);
      alert("Loan rejected!");
      queryClient.invalidateQueries();
    } catch (e) {
      alert("Error rejecting loan: " + e.response?.data?.message);
    }
  };

  if (isLoading) return <div className="p-6">Loading loans...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Loans</h3>
      {data.length === 0 ? <p className="text-gray-500">No loans found.</p> : (
        <div className="space-y-4">
          {data.map((loan, i) => (
            <div key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900">{loan.loanType || loan.type || 'Personal Loan'}</h4>
                <p className="text-sm text-gray-600">Requested: ₹{(loan.requestedAmount || loan.amount || 0).toLocaleString('en-IN')}</p>
                {loan.approvedAmount && (
                  <p className="text-sm text-emerald-600 font-semibold">Approved: ₹{(loan.approvedAmount).toLocaleString('en-IN')}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase 
                  ${loan.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                    loan.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {loan.status || 'PENDING'}
                </span>
                
                {(loan.status === 'PENDING' || loan.status === 'UNDER_REVIEW') && (
                  <div className="flex gap-2 ml-2">
                    <button 
                      onClick={() => handleApprove(loan.id, loan.requestedAmount)}
                      className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleReject(loan.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TabPayments = ({ userId }) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['adminUserPayments', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/payments`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-6">Loading payments...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Payments</h3>
      {data.length === 0 ? <p className="text-gray-500">No scheduled payments.</p> : (
        <ul className="divide-y divide-gray-100">
          {data.map((p, i) => (
            <li key={i} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{p.title || 'EMI Payment'}</p>
                <p className="text-xs text-gray-500">Due: {new Date(p.dueDate).toLocaleDateString()}</p>
              </div>
              <div className="font-bold text-gray-900">₹{(p.amount || 0).toLocaleString('en-IN')}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const TabLoanInstallments = ({ userId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminUserLoanInstallments', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/loan-installments`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-6">Loading installments...</div>;

  const currentEmi = data?.currentEmi;
  const history = data?.history || [];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Installments</h3>
      {!currentEmi && history.length === 0 ? (
        <p className="text-gray-500">No loan installments found.</p>
      ) : (
        <div className="space-y-8">
          {currentEmi && (
            <div>
              <h4 className="font-bold text-gray-700 uppercase text-xs mb-3">Current Actionable EMI</h4>
              <div className="p-4 border border-emerald-100 rounded-xl bg-emerald-50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-emerald-900">Installment #{currentEmi.installmentNumber || 1}</h4>
                  <p className="text-sm text-emerald-700 mt-1">
                    Amount: ₹{(currentEmi.amountDue || currentEmi.amount || 0).toLocaleString('en-IN')} 
                    {currentEmi.dueDate && <span className="ml-2">Due: {new Date(currentEmi.dueDate).toLocaleDateString()}</span>}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  currentEmi.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                  currentEmi.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' : 
                  currentEmi.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 
                  'bg-white text-emerald-700 border border-emerald-200'
                }`}>
                  {currentEmi.status || 'PENDING'}
                </span>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-700 uppercase text-xs mb-3">Payment History</h4>
              <div className="space-y-3">
                {history.map((inst, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900">Installment #{inst.installmentNumber || i + 1}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Amount: ₹{(inst.amountDue || inst.amount || 0).toLocaleString('en-IN')} 
                        {inst.dueDate && <span className="ml-2">Due: {new Date(inst.dueDate).toLocaleDateString()}</span>}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      inst.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                      inst.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' : 
                      inst.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {inst.status || 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TabPaymentAttempts = ({ userId }) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['adminUserPaymentAttempts', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/payment-attempts`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-6">Loading payment attempts...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Attempts</h3>
      {data.length === 0 ? <p className="text-gray-500">No payment attempts found.</p> : (
        <ul className="divide-y divide-gray-100">
          {data.map((attempt, i) => (
            <li key={i} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Attempt for ₹{(attempt.amount || 0).toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500">Date: {new Date(attempt.createdAt || attempt.date || Date.now()).toLocaleString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                attempt.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 
                attempt.status === 'FAILED' ? 'bg-red-100 text-red-700' : 
                'bg-gray-200 text-gray-700'
              }`}>
                {attempt.status || 'PENDING'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const TabAssetAllocation = ({ userId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminUserAssets', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/asset-allocation`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-6">Loading asset allocation...</div>;

  const COLORS = ['#4E8B83', '#C47D57', '#FBBF24', '#8B5CF6', '#EF4444'];
  const chartData = data?.length ? data : [
    { name: 'Stocks', value: 400 },
    { name: 'Bonds', value: 300 },
    { name: 'Cash', value: 300 },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend verticalAlign="bottom" height={36}/>
          </RePieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const TabConsultations = ({ userId }) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['adminUserConsultations', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/consultations`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-6">Loading consultations...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultations</h3>
      {data.length === 0 ? <p className="text-gray-500">No consultations booked.</p> : (
        <div className="space-y-4">
          {data.map((cons, i) => (
            <div key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video className="w-8 h-8 text-[#4E8B83] p-1.5 bg-[#4E8B83]/10 rounded-lg" />
                <div>
                  <h4 className="font-bold text-gray-900">{cons.topic || 'Financial Planning'}</h4>
                  <p className="text-xs text-gray-500">{new Date(cons.date || Date.now()).toLocaleString()}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${cons.status === 'COMPLETED' ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                {cons.status || 'SCHEDULED'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TabActivity = ({ userId }) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['adminUserActivity', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/activity`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-6">Loading activity...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      {data.length === 0 ? <p className="text-gray-500">No recent activity.</p> : (
        <ul className="space-y-4">
          {data.map((act, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-[#C47D57]" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{act.action}</p>
                <p className="text-xs text-gray-500">{new Date(act.timestamp).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const TabDocuments = ({ userId }) => {
  const queryClient = useQueryClient();
  const [verifyingDocId, setVerifyingDocId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ['adminUserDocuments', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/documents`);
      return res.data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ documentId, status, adminNote }) => {
      await api.post(`/admin/documents/${documentId}/verify`, { verificationStatus: status, adminNote });
    },
    onSuccess: () => {
      toast.success('Document status updated');
      queryClient.invalidateQueries(['adminUserDocuments', userId]);
      setShowRejectModal(false);
      setRejectNote('');
      setVerifyingDocId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data || 'Failed to update status');
    }
  });

  const handleView = async (documentId) => {
    try {
      const res = await api.get(`/admin/documents/${documentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      window.open(url, '_blank');
    } catch (err) {
      toast.error('Failed to open document');
    }
  };

  if (isLoading) return <div className="p-6">Loading documents...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
      {data.length === 0 ? <p className="text-gray-500">No documents found.</p> : (
        <div className="space-y-4">
          {data.map((doc, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center mb-4 sm:mb-0">
                <FileText className="w-8 h-8 text-[#12241F] mr-3" />
                <div>
                  <p className="text-sm font-bold text-gray-900">{doc.documentType || 'Document'}</p>
                  <p className="text-xs text-gray-500">{doc.fileName || 'Document.pdf'} • {(doc.fileSize / 1024).toFixed(1) || '1.2'} KB</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                  doc.verificationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                  doc.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {doc.verificationStatus || 'PENDING'}
                </span>
                
                <button onClick={() => handleView(doc.id)} className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  View
                </button>
                
                {doc.verificationStatus === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => verifyMutation.mutate({ documentId: doc.id, status: 'APPROVED', adminNote: '' })}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      disabled={verifyMutation.isLoading}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => {
                        setVerifyingDocId(doc.id);
                        setShowRejectModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      disabled={verifyMutation.isLoading}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Reject Document</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this document. The user will be notified.</p>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none mb-4"
              rows="3"
              placeholder="e.g. Document is blurry"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button 
                onClick={() => verifyMutation.mutate({ documentId: verifyingDocId, status: 'REJECTED', adminNote: rejectNote })}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                disabled={!rejectNote.trim() || verifyMutation.isLoading}
              >
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabMessages = ({ userId }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('SUPPORT');
  const [successMessage, setSuccessMessage] = useState('');
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['adminUserMessages', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/messages`);
      return res.data;
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msgData) => {
      await api.post(`/admin/users/${userId}/messages`, msgData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUserMessages', userId] });
      setSubject('');
      setBody('');
      setSuccessMessage('Sent Successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!subject || !body) return;
    sendMessageMutation.mutate({ subject, message: body, type });
  };

  if (isLoading) return <div className="p-6">Loading messages...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Message</h3>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#4E8B83]">
              <option value="SUPPORT">Support</option>
              <option value="SYSTEM">System</option>
              <option value="LOAN">Loan</option>
              <option value="INVESTMENT">Investment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#4E8B83]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#4E8B83] h-32" required></textarea>
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" disabled={sendMessageMutation.isPending} className="px-4 py-2 bg-[#1b4d3e] text-white font-bold rounded-lg hover:bg-[#153a2f] transition-colors">
              {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
            </button>
            {successMessage && <span className="text-emerald-600 font-medium text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {successMessage}</span>}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Message History</h3>
        {data.length === 0 ? <p className="text-gray-500">No messages sent to this user.</p> : (
          <div className="space-y-4">
            {data.map((msg, i) => (
              <div key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">{msg.type}</span>
                    <h4 className="font-bold text-gray-900 inline">{msg.subject}</h4>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message || msg.body}</p>
                <div className="mt-2 text-xs font-medium">
                  Status: <span className={msg.isRead ? "text-emerald-600" : "text-gray-500"}>{msg.isRead ? "Read" : "Unread"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminUserDetails = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminClients']);
      setShowDeleteModal(false);
      navigate('/admin/users');
    },
    onError: (err) => {
      alert("Failed to delete user: " + (err.response?.data?.message || err.message));
    }
  });

  // Fetch basic user info for the header
  const { data: user } = useQuery({
    queryKey: ['adminUserHeader', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'loans', label: 'Loans', icon: Landmark },
    { id: 'loan-installments', label: 'Loan Installments', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'payment-attempts', label: 'Payment Attempts', icon: AlertCircle },
    { id: 'assets', label: 'Asset Allocation', icon: PieChart },
    { id: 'consultations', label: 'Consultations', icon: Video },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <Link to="/admin/users" className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#12241F]">{user?.name || user?.fullName || `User #${userId.substring(0,6)}`}</h1>
              {user?.isVerified && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">Verified</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 font-medium">Customer Profile</p>
          </div>
        </div>
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-3 space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-[#12241F] text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-[#12241F]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'overview' && <TabOverview userId={userId} />}
          {activeTab === 'wallet' && <TabWallet userId={userId} />}
          {activeTab === 'transactions' && <TabTransactions userId={userId} />}
          {activeTab === 'investments' && <TabInvestments userId={userId} />}
          {activeTab === 'loans' && <TabLoans userId={userId} />}
          {activeTab === 'loan-installments' && <TabLoanInstallments userId={userId} />}
          {activeTab === 'payments' && <TabPayments userId={userId} />}
          {activeTab === 'payment-attempts' && <TabPaymentAttempts userId={userId} />}
          {activeTab === 'assets' && <TabAssetAllocation userId={userId} />}
          {activeTab === 'consultations' && <TabConsultations userId={userId} />}
          {activeTab === 'activity' && <TabActivity userId={userId} />}
          {activeTab === 'documents' && <TabDocuments userId={userId} />}
          {activeTab === 'messages' && <TabMessages userId={userId} />}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-red-50 rounded-xl mb-4 border border-red-100">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-800">
                  <strong className="block mb-1">Warning: Irreversible Action</strong>
                  This will permanently delete the user's account, including all their transactions, loans, investments, and personal data.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-gray-900">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all uppercase"
                placeholder="DELETE"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmText === 'DELETE') {
                    deleteUserMutation.mutate();
                  }
                }}
                disabled={deleteConfirmText !== 'DELETE' || deleteUserMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center gap-2"
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetails;
