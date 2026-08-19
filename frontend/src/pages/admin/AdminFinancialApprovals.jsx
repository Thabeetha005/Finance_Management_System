import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle, AlertCircle, Calendar, Clock, Lock, Check, Download, FileText, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';

const AdminFinancialApprovals = () => {
  const [data, setData] = useState([]);
  const [legacyInvestments, setLegacyInvestments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const [selectedApp, setSelectedApp] = useState(null);
  const [loanDocs, setLoanDocs] = useState([]);
  const [resubmissionReason, setResubmissionReason] = useState('');
  const [showResubmitModal, setShowResubmitModal] = useState(false);

  // Resolution Modal State for Legacy Rows
  const [selectedLegacyInv, setSelectedLegacyInv] = useState(null);
  const [legacyForm, setLegacyForm] = useState({
    planId: '',
    durationMonths: 12,
    lockedRate: 8.00,
    startDate: '',
    maturityDate: ''
  });
  const [resolving, setResolving] = useState(false);
  const [resolveSuccessMsg, setResolveSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, clientsRes] = await Promise.all([
        api.get('/admin/loans'),
        api.get('/admin/clients')
      ]);

      const clientsList = Array.isArray(clientsRes.data) ? clientsRes.data : clientsRes.data?.content || [];
      const validClientEmails = new Set(clientsList.map(c => (c.email || '').toLowerCase()));
      const validClientIds = new Set(clientsList.map(c => c.id));

      const isMockName = (name) => {
        if (!name) return false;
        const lower = String(name).toLowerCase();
        return lower.startsWith('customer a') || lower.startsWith('test customer') || lower.startsWith('wallet customer') || lower.startsWith('withdrawal customer');
      };

      const rawLoans = Array.isArray(loansRes.data) ? loansRes.data : [];
      const loansData = rawLoans
        .filter(loan => {
          if (!loan.user) return false;
          if (isMockName(loan.user.name)) return false;
          const userEmail = (loan.user.email || '').toLowerCase();
          return validClientIds.has(loan.user.id) || validClientEmails.has(userEmail);
        })
        .map(loan => ({
          id: `LOAN-${loan.id}`,
          originalId: loan.id,
          customer: loan.user?.name || loan.user?.email || 'Unknown User',
          userEmail: loan.user?.email,
          isVerified: loan.user?.isVerified || false,
          type: 'Loan',
          amount: `₹${Number(loan.amount).toLocaleString('en-IN')}`,
          rawAmount: loan.amount,
          date: loan.appliedAt ? new Date(loan.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: loan.status || 'Pending',
          planName: loan.loanPlan?.name || loan.purpose,
          durationMonths: loan.durationMonths || loan.tenureMonths,
          estimatedEmi: loan.estimatedEmi,
          raw: loan
        }));
      
      let invData = [];
      try {
        const invRes = await api.get('/admin/investments');
        invData = invRes.data.map(inv => ({
          id: `INV-${inv.id}`,
          originalId: inv.id,
          customer: inv.userName || inv.userEmail || 'Unknown User',
          isVerified: true,
          type: 'Investment',
          amount: `₹${Number(inv.investedAmount).toLocaleString('en-IN')}`,
          date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: inv.status || 'ACTIVE',
          raw: inv
        }));
      } catch (e) {
        console.warn("Could not fetch admin investments", e);
      }

      let withdrawalData = [];
      try {
        const wdRes = await api.get('/admin/withdrawals');
        withdrawalData = wdRes.data.map(wd => ({
          id: `WD-${wd.id}`,
          originalId: wd.id,
          customer: wd.customerName || wd.customerEmail || 'Unknown User',
          userEmail: wd.customerEmail,
          isVerified: true,
          type: 'Withdrawal',
          amount: `₹${Number(wd.amount).toLocaleString('en-IN')}`,
          rawAmount: wd.amount,
          date: wd.requestedAt ? new Date(wd.requestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: wd.status || 'PENDING',
          bankName: wd.bankName,
          accountNumberMasked: wd.accountNumberMasked,
          accountHolderName: wd.accountHolderName,
          ifscCode: wd.ifscCode,
          referenceNumber: wd.referenceNumber,
          rejectionReason: wd.rejectionReason,
          raw: wd
        }));
      } catch (e) {
        console.warn("Could not fetch admin withdrawals", e);
      }

      const combinedData = [...loansData, ...invData, ...withdrawalData];
      combinedData.sort((a, b) => (b.originalId || 0) - (a.originalId || 0));
      setData(combinedData.filter(item => item.customer !== 'Unknown User'));

      // Fetch Legacy Unverified Investments
      try {
        const legacyRes = await api.get('/admin/investments/legacy-unverified');
        setLegacyInvestments(legacyRes.data || []);
      } catch (e) {
        console.warn("Could not fetch legacy investments", e);
      }

      // Fetch Investment Plans for dropdown
      try {
        const plansRes = await api.get('/admin/investment-plans');
        setPlans(plansRes.data || []);
      } catch (e) {
        console.warn("Could not fetch investment plans", e);
      }

    } catch (err) {
      setErrorMsg('Failed to load financial approvals data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectApp = async (app) => {
    setSelectedApp(app);
    if (app.type === 'Loan' || app.type === 'Investment') {
      try {
        const appType = app.type.toUpperCase();
        const docsRes = await api.get(`/documents/application/${appType}/${app.originalId}`);
        if (docsRes.data && docsRes.data.length > 0) {
          setLoanDocs(docsRes.data);
        } else {
          const fallbackRes = await api.get(`/documents/loan/${app.originalId}`);
          setLoanDocs(fallbackRes.data || []);
        }
      } catch (e) {
        setLoanDocs([]);
      }
    } else {
      setLoanDocs([]);
    }
  };

  const handleStartReview = async (loanId) => {
    try {
      await api.post(`/admin/loans/${loanId}/start-review`);
      setResolveSuccessMsg(`Started review for Loan #${loanId}`);
      setSelectedApp(null);
      await fetchData();
      setTimeout(() => setResolveSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start review');
    }
  };

  const handleApproveLoan = async (loanId, approvedAmount) => {
    try {
      await api.post(`/admin/loans/${loanId}/approve?approvedAmount=${approvedAmount}`);
      setResolveSuccessMsg(`Loan #${loanId} approved! Rate locked. Ready for disbursement.`);
      setSelectedApp(null);
      await fetchData();
      setTimeout(() => setResolveSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve loan');
    }
  };

  const handleDisburseLoan = async (loanId) => {
    try {
      await api.post(`/admin/loans/${loanId}/disburse`);
      setResolveSuccessMsg(`Loan #${loanId} disbursed! Funds credited to customer wallet and EMI schedule activated.`);
      setSelectedApp(null);
      await fetchData();
      setTimeout(() => setResolveSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to disburse loan');
    }
  };

  const handleRejectLoan = async (loanId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await api.post(`/admin/loans/${loanId}/reject?reason=${encodeURIComponent(reason)}`);
      setResolveSuccessMsg(`Loan #${loanId} rejected.`);
      setSelectedApp(null);
      await fetchData();
      setTimeout(() => setResolveSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject loan');
    }
  };

  const handleApproveWithdrawal = async (withdrawalId) => {
    if (!confirm(`Confirm approval for Withdrawal #${withdrawalId}? This will atomically debit the customer's wallet.`)) return;
    try {
      await api.post(`/admin/withdrawals/${withdrawalId}/approve`);
      setResolveSuccessMsg(`Withdrawal #${withdrawalId} approved and completed successfully!`);
      setSelectedApp(null);
      await fetchData();
      setTimeout(() => setResolveSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve withdrawal');
    }
  };

  const handleRejectWithdrawal = async (withdrawalId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason || !reason.trim()) return;
    try {
      await api.post(`/admin/withdrawals/${withdrawalId}/reject`, { reason: reason.trim() });
      setResolveSuccessMsg(`Withdrawal #${withdrawalId} rejected.`);
      setSelectedApp(null);
      await fetchData();
      setTimeout(() => setResolveSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject withdrawal');
    }
  };

  const handleRequestResubmission = async (loanId) => {
    if (!resubmissionReason) {
      alert("Please provide a reason for resubmission");
      return;
    }
    try {
      await api.post(`/admin/loans/${loanId}/request-resubmission`, { reason: resubmissionReason });
      setResolveSuccessMsg(`Resubmission request sent for Loan #${loanId}`);
      setShowResubmitModal(false);
      setSelectedApp(null);
      setResubmissionReason('');
      await fetchData();
      setTimeout(() => setResolveSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request resubmission');
    }
  };

  const handleOpenLegacyResolveModal = (inv) => {
    setSelectedLegacyInv(inv);
    const now = new Date();
    const defaultMaturity = new Date();
    defaultMaturity.setMonth(now.getMonth() + 12);

    const firstPlan = plans[0];
    setLegacyForm({
      planId: firstPlan?.id || '',
      durationMonths: 12,
      lockedRate: firstPlan?.variableRate || 8.00,
      startDate: now.toISOString().slice(0, 16),
      maturityDate: defaultMaturity.toISOString().slice(0, 16)
    });
  };

  const handleResolveLegacySubmit = async (e) => {
    e.preventDefault();
    if (!selectedLegacyInv || !legacyForm.planId) return;

    try {
      setResolving(true);
      await api.put(`/admin/investments/${selectedLegacyInv.id}/resolve-legacy`, {
        planId: Number(legacyForm.planId),
        durationMonths: Number(legacyForm.durationMonths),
        lockedRate: Number(legacyForm.lockedRate),
        startDate: legacyForm.startDate ? new Date(legacyForm.startDate).toISOString() : new Date().toISOString(),
        maturityDate: legacyForm.maturityDate ? new Date(legacyForm.maturityDate).toISOString() : new Date().toISOString()
      });

      setResolveSuccessMsg(`Legacy Investment #${selectedLegacyInv.id} successfully verified and activated!`);
      setSelectedLegacyInv(null);
      await fetchData();
      setTimeout(() => setResolveSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve legacy investment');
    } finally {
      setResolving(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);

  const filteredData = useMemo(() => {
    let list = data;
    if (activeTab === 'Loans') {
      list = data.filter(item => item.type === 'Loan');
    } else if (activeTab === 'Investments') {
      list = data.filter(item => item.type === 'Investment');
    } else if (activeTab === 'Withdrawals') {
      list = data.filter(item => item.type === 'Withdrawal');
    } else if (activeTab === 'Legacy Unverified') {
      list = [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.id.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => (b.originalId || 0) - (a.originalId || 0));
  }, [data, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    return filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filteredData, page]);

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-10">
      
      {resolveSuccessMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">{resolveSuccessMsg}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">Financial Approvals & Management</h1>
        <p className="text-sm text-gray-500 mt-1">Review live loan applications, document attachments, rate-locking approvals, and withdrawal requests.</p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          {['All', 'Loans', 'Investments', 'Withdrawals', 'Legacy Unverified'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === tab 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'Legacy Unverified' && <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
              {tab}
              {tab === 'Legacy Unverified' && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full">
                  {legacyInvestments.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#106354] transition-all"
          />
        </div>
      </div>

      {/* Main Table View */}
      {activeTab === 'Legacy Unverified' ? (
        /* Legacy Unverified Rows Portal */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-amber-50/50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                Legacy Unverified Investment Rows ({legacyInvestments.length})
              </h3>
              <p className="text-xs text-gray-500 mt-1">These legacy rows lack verified duration & rate metadata. Review original records and assign terms to clear the flag.</p>
            </div>
          </div>

          {legacyInvestments.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              No legacy unverified investments remaining. All investments are fully verified!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase bg-gray-50/50">
                    <th className="py-3.5 px-6">ID</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Type Name</th>
                    <th className="py-3.5 px-6">Invested Amount</th>
                    <th className="py-3.5 px-6">Current Value</th>
                    <th className="py-3.5 px-6">Created At</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {legacyInvestments.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6 font-bold text-gray-900">INV-{inv.id}</td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900">{inv.userName}</p>
                        <p className="text-[10px] text-gray-400">{inv.userEmail}</p>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-700">{inv.type}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">₹{inv.investedAmount?.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6 font-bold text-emerald-600">₹{inv.currentValue?.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6 text-gray-500">{new Date(inv.createdAt).toLocaleDateString('en-GB')}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenLegacyResolveModal(inv)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                        >
                          Inspect & Verify Terms
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Regular Financial Approvals Table */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin w-8 h-8 border-4 border-[#106354] border-t-transparent rounded-full"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No applications found for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase bg-gray-50/50">
                    <th className="py-3.5 px-6">Application ID</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Type / Plan</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {paginatedData.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6 font-bold text-gray-900">{row.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{row.customer}</span>
                          {!row.isVerified && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded-sm uppercase tracking-wide">
                              Not Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-700">{row.planName || row.type}</td>
                      <td className="py-4 px-6 font-bold text-[#106354]">{row.amount}</td>
                      <td className="py-4 px-6 text-gray-500">{row.date}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          row.status === 'APPROVED' || row.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.status === 'RESUBMISSION_REQUIRED'
                            ? 'bg-amber-100 text-amber-800'
                            : row.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleSelectApp(row)}
                          className="px-3 py-1.5 text-xs font-bold text-[#106354] bg-[#e6f3f0] hover:bg-[#d0e8e2] rounded-lg transition-colors"
                        >
                          Review & Action
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination UI - Only rendered if total items > 15 */}
              {filteredData.length > PAGE_SIZE && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <span className="text-xs text-gray-500 font-medium">
                    Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length} records
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
          )}
        </div>
      )}

      {/* Action Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900 text-lg font-poppins">Application Review</h3>
                <p className="text-xs text-gray-500">{selectedApp.id} • Submitted by {selectedApp.customer}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                <div>
                  <label className="block text-gray-500 font-medium mb-0.5">Applicant</label>
                  <div className="font-bold text-gray-900">{selectedApp.customer}</div>
                  <div className="text-[10px] text-gray-400">{selectedApp.userEmail}</div>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium mb-0.5">Requested Amount</label>
                  <div className="font-bold text-[#106354] text-base">{selectedApp.amount}</div>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium mb-0.5">Plan / Type</label>
                  <div className="font-semibold text-gray-800">{selectedApp.planName}</div>
                </div>
                <div>
                  <label className="block text-gray-500 font-medium mb-0.5">Duration</label>
                  <div className="font-semibold text-gray-800">{selectedApp.durationMonths || 12} Months</div>
                </div>
              </div>

              {/* Document Review Section */}
              {selectedApp.type === 'Loan' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#106354]" />
                    <span>Submitted Verification Documents ({loanDocs.length})</span>
                  </h4>
                  {loanDocs.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No documents attached yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {loanDocs.map(doc => {
                        const targetId = doc.documentId || doc.id;
                        const isReused = doc.isNewlyUploaded === false || doc.verificationStatus === 'VERIFIED';
                        return (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-900">{doc.documentType}</p>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isReused 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {isReused ? '✓ Previously Verified' : '⏳ Newly Submitted — Under Review'}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {doc.fileName} • Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'} (v{doc.version || 1})
                              </p>
                            </div>
                            <a
                              href={`/api/documents/${targetId}/download`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-sm"
                            >
                              <Download className="w-3 h-3" />
                              <span>View File</span>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Withdrawal Details & Action Buttons */}
              {selectedApp.type === 'Withdrawal' && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                    <div className="font-bold text-gray-900 border-b border-gray-200 pb-1">Destination Bank Details</div>
                    <div><span className="text-gray-500">Bank Name:</span> <strong className="text-gray-900">{selectedApp.bankName}</strong></div>
                    <div><span className="text-gray-500">Account Number:</span> <strong className="text-gray-900">{selectedApp.accountNumberMasked}</strong></div>
                    <div><span className="text-gray-500">Account Holder:</span> <strong className="text-gray-900">{selectedApp.accountHolderName}</strong></div>
                    <div><span className="text-gray-500">IFSC Code:</span> <strong className="text-gray-900">{selectedApp.ifscCode}</strong></div>
                    <div><span className="text-gray-500">Reference:</span> <strong className="text-gray-900">{selectedApp.referenceNumber}</strong></div>
                  </div>

                  {selectedApp.status === 'PENDING' && (
                    <div className="pt-2 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleApproveWithdrawal(selectedApp.originalId)}
                        className="py-3 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve & Complete</span>
                      </button>
                      <button
                        onClick={() => handleRejectWithdrawal(selectedApp.originalId)}
                        className="py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                      >
                        Reject Withdrawal
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons based on explicit LoanStatus */}
              {selectedApp.type === 'Loan' && (
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                  {selectedApp.raw?.status === 'APPLICATION_SUBMITTED' && (
                    <button
                      onClick={() => handleStartReview(selectedApp.originalId)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Start Application Review</span>
                    </button>
                  )}

                  {selectedApp.raw?.status === 'DOCUMENTS_REQUIRED' && (
                    <button
                      onClick={() => handleStartReview(selectedApp.originalId)}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Mark Under Review</span>
                    </button>
                  )}

                  {selectedApp.raw?.status === 'UNDER_REVIEW' && (
                    <>
                      <button
                        onClick={() => handleApproveLoan(selectedApp.originalId, selectedApp.rawAmount)}
                        className="w-full py-3 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve Loan & Lock Rate (Awaiting Disbursement)</span>
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setShowResubmitModal(true)}
                          className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                        >
                          Request Documents
                        </button>
                        <button
                          onClick={() => handleRejectLoan(selectedApp.originalId)}
                          className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                        >
                          Reject Application
                        </button>
                      </div>
                    </>
                  )}

                  {selectedApp.raw?.status === 'APPROVED' && (
                    <button
                      onClick={() => handleDisburseLoan(selectedApp.originalId)}
                      className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Disburse Loan (Credit Wallet ₹{Number(selectedApp.rawAmount).toLocaleString()} & Generate EMI Schedule)</span>
                    </button>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resubmission Reason Modal */}
      {showResubmitModal && selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Request Document Resubmission</h3>
            <p className="text-xs text-gray-500">Provide specific instructions on which documents need to be re-uploaded by the applicant.</p>
            <textarea
              rows={3}
              value={resubmissionReason}
              onChange={e => setResubmissionReason(e.target.value)}
              placeholder="e.g. Please upload a clearer copy of your Bank Statement showing the last 6 months..."
              className="w-full p-3 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowResubmitModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">Cancel</button>
              <button
                onClick={() => handleRequestResubmission(selectedApp.originalId)}
                className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Send Request to Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legacy Resolve Modal */}
      {selectedLegacyInv && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-amber-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Verify Legacy Investment #{selectedLegacyInv.id}</h3>
                <p className="text-xs text-amber-800">Assign verified plan, return rate, and tenure dates</p>
              </div>
              <button onClick={() => setSelectedLegacyInv(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveLegacySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Customer</label>
                <input type="text" readOnly value={`${selectedLegacyInv.userName} (${selectedLegacyInv.userEmail})`} className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-800" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Invested Amount</label>
                <input type="text" readOnly value={`₹${selectedLegacyInv.investedAmount?.toLocaleString('en-IN')}`} className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-[#106354]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Investment Plan</label>
                <select
                  required
                  value={legacyForm.planId}
                  onChange={(e) => {
                    const pId = Number(e.target.value);
                    const p = plans.find(x => x.id === pId);
                    setLegacyForm(prev => ({
                      ...prev,
                      planId: pId,
                      lockedRate: p?.isVariable ? (p.variableRate || 10.00) : 8.00
                    }));
                  }}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Select Master Plan --</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.isVariable ? '(Variable)' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={legacyForm.durationMonths}
                    onChange={(e) => setLegacyForm({ ...legacyForm, durationMonths: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Locked Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={legacyForm.lockedRate}
                    onChange={(e) => setLegacyForm({ ...legacyForm, lockedRate: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={legacyForm.startDate}
                    onChange={(e) => setLegacyForm({ ...legacyForm, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Maturity Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={legacyForm.maturityDate}
                    onChange={(e) => setLegacyForm({ ...legacyForm, maturityDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedLegacyInv(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors shadow-md"
                >
                  {resolving ? 'Verifying...' : 'Verify & Clear Legacy Flag'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminFinancialApprovals;
