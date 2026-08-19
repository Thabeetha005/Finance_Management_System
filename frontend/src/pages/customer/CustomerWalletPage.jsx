import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import AddFundsModal from '../../components/wallet/AddFundsModal';
import { 
  Wallet, TrendingUp, HandCoins, PieChart, ArrowUpRight, ArrowDownLeft, 
  Search, Filter, ChevronLeft, ChevronRight, CheckCircle2, 
  AlertTriangle, ShieldCheck, ArrowRightLeft, Lock, Building, Check, X, Info, FileText, Clock
} from 'lucide-react';

export const invalidateAllFinancialQueries = (queryClient) => {
  queryClient.invalidateQueries(['headerWalletBalance']);
  queryClient.invalidateQueries(['walletSummary']);
  queryClient.invalidateQueries(['walletEligibility']);
  queryClient.invalidateQueries(['myWithdrawals']);
  queryClient.invalidateQueries(['walletTransactions']);
  queryClient.invalidateQueries(['recentActivity']);
  queryClient.invalidateQueries(['myInvestments']);
  queryClient.invalidateQueries(['myLoans']);
  queryClient.invalidateQueries(['loanEmis']);
  queryClient.invalidateQueries(['dashboardStats']);
};

const CustomerWalletPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Filters & Pagination State for Transactions
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Deposit & Withdrawal Modals State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState('FORM'); // 'FORM' | 'CONFIRM'
  
  const [depositAmountInput, setDepositAmountInput] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [withdrawAmountInput, setWithdrawAmountInput] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawalSuccessMessage, setWithdrawalSuccessMessage] = useState('');

  // 1. Fetch Source of Truth Wallet Summary
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['walletSummary'],
    queryFn: async () => {
      try {
        const res = await api.get('/wallet/summary');
        return res.data || {};
      } catch (err) {
        return {};
      }
    }
  });

  // 2. Fetch Withdrawal Eligibility & Verified Bank Accounts
  const { data: eligibility, isLoading: loadingEligibility } = useQuery({
    queryKey: ['walletEligibility'],
    queryFn: async () => {
      try {
        const res = await api.get('/withdrawals/eligibility');
        return res.data || {};
      } catch (err) {
        return null;
      }
    }
  });

  // Safe verified bank accounts array
  const verifiedBankAccounts = Array.isArray(eligibility?.verifiedBankAccounts) 
    ? eligibility.verifiedBankAccounts 
    : [];

  // Auto-select first verified bank account when eligibility loads
  React.useEffect(() => {
    if (verifiedBankAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(String(verifiedBankAccounts[0].bankAccountId));
    }
  }, [verifiedBankAccounts, selectedAccountId]);

  // 3. Live Server-Side Withdrawal Preview Query
  const { data: previewData, isFetching: fetchingPreview } = useQuery({
    queryKey: ['withdrawPreview', selectedAccountId, withdrawAmountInput],
    queryFn: async () => {
      if (!selectedAccountId || !withdrawAmountInput || parseFloat(withdrawAmountInput) < 500) return null;
      try {
        const res = await api.post('/withdrawals/preview', {
          bankAccountId: parseInt(selectedAccountId),
          amount: parseFloat(withdrawAmountInput)
        });
        return res.data;
      } catch (err) {
        return null;
      }
    },
    enabled: !!selectedAccountId && !!withdrawAmountInput && parseFloat(withdrawAmountInput) >= 500
  });

  // 4. Fetch Customer's Withdrawal History
  const { data: rawMyWithdrawals, isLoading: loadingMyWithdrawals } = useQuery({
    queryKey: ['myWithdrawals'],
    queryFn: async () => {
      try {
        const res = await api.get('/withdrawals/my');
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
    }
  });
  const myWithdrawals = Array.isArray(rawMyWithdrawals) ? rawMyWithdrawals : [];

  // 5. Fetch Active Investments
  const { data: rawInvestments, isLoading: loadingInvestments } = useQuery({
    queryKey: ['myInvestments'],
    queryFn: async () => {
      try {
        const res = await api.get('/investments/my');
        return Array.isArray(res.data) ? res.data : (res.data?.content || []);
      } catch (err) {
        return [];
      }
    }
  });
  const investments = Array.isArray(rawInvestments) ? rawInvestments : [];
  const activeInvestments = investments.filter(inv => inv && inv.status === 'ACTIVE');

  // 6. Fetch Loans & Current EMI
  const { data: rawLoans, isLoading: loadingLoans } = useQuery({
    queryKey: ['myLoans'],
    queryFn: async () => {
      try {
        const res = await api.get('/loans/my');
        return Array.isArray(res.data) ? res.data : (res.data?.content || []);
      } catch (err) {
        return [];
      }
    }
  });

  const loans = Array.isArray(rawLoans) ? rawLoans : [];
  const activeLoan = loans.find(l => l && (l.status === 'ACTIVE' || l.status === 'APPROVED'));
  const pendingLoan = loans.find(l => l && ['APPLIED', 'DOCUMENTS_SUBMITTED', 'UNDER_REVIEW', 'RESUBMISSION_REQUIRED'].includes(l.status));

  // Re-use exact same Loan system service endpoint for EMIs
  const { data: rawLoanEmis, isLoading: loadingEmis } = useQuery({
    queryKey: ['loanEmis', activeLoan?.id],
    queryFn: async () => {
      if (!activeLoan) return [];
      try {
        const res = await api.get(`/loans/${activeLoan.id}/emis`);
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
    },
    enabled: !!activeLoan
  });

  const loanEmis = Array.isArray(rawLoanEmis) ? rawLoanEmis : [];
  const currentActionableEmi = loanEmis.find(e => e && e.status === 'PENDING');

  // 7. Fetch Paginated Backend Filtered Wallet Transactions
  const { data: txPageData, isLoading: loadingTx } = useQuery({
    queryKey: ['walletTransactions', search, typeFilter, statusFilter, startDate, endDate, sortOrder, page],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (typeFilter !== 'ALL') params.append('type', typeFilter);
        if (statusFilter !== 'ALL') params.append('status', statusFilter);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('sort', sortOrder);
        params.append('page', page);
        params.append('size', pageSize);

        const res = await api.get(`/wallet/transactions?${params.toString()}`);
        return res.data || {};
      } catch (err) {
        return {};
      }
    }
  });

  const transactions = Array.isArray(txPageData?.content) ? txPageData.content : (Array.isArray(txPageData) ? txPageData : []);
  const totalPages = txPageData?.totalPages || 0;
  const totalElements = txPageData?.totalElements || transactions.length || 0;

  // Handlers
  const handleDeposit = async (e) => {
    e.preventDefault();
    const num = parseFloat(depositAmountInput);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid positive deposit amount');
      return;
    }
    setActionLoading(true);
    try {
      await api.post('/wallet/me/deposit', { amount: num });
      setShowDepositModal(false);
      setDepositAmountInput('');
      invalidateAllFinancialQueries(queryClient);
      alert(`Successfully added ₹${num.toLocaleString('en-IN')} to your wallet!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Deposit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenWithdrawModal = () => {
    setWithdrawError('');
    setWithdrawStep('FORM');
    setWithdrawAmountInput('');
    if (verifiedBankAccounts.length > 0) {
      setSelectedAccountId(String(verifiedBankAccounts[0].bankAccountId));
    }
    setShowWithdrawModal(true);
  };

  const handleContinueToConfirm = (e) => {
    e.preventDefault();
    setWithdrawError('');
    const amt = parseFloat(withdrawAmountInput);
    if (isNaN(amt) || amt < 500) {
      setWithdrawError('Minimum withdrawal amount is ₹500.00.');
      return;
    }
    if (amt > 200000) {
      setWithdrawError('Maximum single transaction limit is ₹2,00,000.00.');
      return;
    }
    if (!selectedAccountId) {
      setWithdrawError('Please select a verified destination bank account.');
      return;
    }
    if (previewData && !previewData.isEligible) {
      setWithdrawError(previewData.rejectionReasons?.join(' ') || 'Withdrawal validation failed.');
      return;
    }
    setWithdrawStep('CONFIRM');
  };

  const handleConfirmWithdrawal = async () => {
    setWithdrawError('');
    setActionLoading(true);
    try {
      const res = await api.post('/withdrawals/request', {
        bankAccountId: parseInt(selectedAccountId),
        amount: parseFloat(withdrawAmountInput)
      });
      invalidateAllFinancialQueries(queryClient);
      setShowWithdrawModal(false);
      setWithdrawStep('FORM');
      setWithdrawAmountInput('');
      setWithdrawalSuccessMessage(`Withdrawal Request (Ref: ${res.data.referenceNumber}) submitted for ₹${Number(res.data.amount).toLocaleString('en-IN')}. Pending Admin Review.`);
    } catch (err) {
      setWithdrawError(err.response?.data?.message || 'Failed to submit withdrawal request.');
      setWithdrawStep('FORM');
    } finally {
      setActionLoading(false);
    }
  };

  const formatINR = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '₹0.00';
    return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return 'N/A';
    if (Array.isArray(dtStr)) {
      const [y, m, d, h=0, min=0] = dtStr;
      return new Date(y, m - 1, d, h, min).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    try {
      const dt = new Date(dtStr);
      if (isNaN(dt.getTime())) return String(dtStr);
      return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch(e) {
      return String(dtStr);
    }
  };

  // Eligibility evaluation for 3 UI states:
  const isUnlocked = eligibility?.isWithdrawalUnlocked === true;
  const availableToWithdrawVal = Number(eligibility?.availableToWithdraw || 0);
  const isAvailableBalanceSufficient = availableToWithdrawVal >= 500;

  return (
    <div className="max-w-7xl mx-auto font-sans pb-16 space-y-8">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Financial Wallet</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time wallet balance, withdrawal management, and transaction history.</p>
      </div>

      {/* Success Notification Banner */}
      {withdrawalSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-sm font-semibold shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{withdrawalSuccessMessage}</span>
          </div>
          <button onClick={() => setWithdrawalSuccessMessage('')} className="text-emerald-600 hover:text-emerald-900 font-bold text-xs uppercase cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* SECTION 1: WALLET SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Wallet Balance */}
        <div className="bg-[#05231e] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#106354]/30 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Total Wallet Balance</span>
              <div className="w-8 h-8 rounded-full bg-[#106354] flex items-center justify-center text-emerald-300">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {loadingSummary ? '...' : formatINR(summary?.availableWalletBalance)}
            </h2>
            <p className="text-[11px] text-emerald-400/80 mt-2 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Database Balance</span>
            </p>
          </div>
          
          <div className="pt-4 border-t border-emerald-900/40 mt-4 flex items-center gap-3">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex-1 py-2.5 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" /> Add Funds
            </button>
            <button
              onClick={handleOpenWithdrawModal}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw Funds
            </button>
          </div>
        </div>

        {/* Available Balance (Available to Withdraw) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Balance</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#106354] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#12241F]">
              {loadingEligibility ? '...' : formatINR(eligibility?.availableToWithdraw)}
            </h2>
            <p className="text-[11px] text-emerald-700 mt-2 font-semibold">Eligible Liquid Funds</p>
          </div>
          <p className="text-[11px] text-gray-400 border-t border-gray-100 pt-3 mt-4">
            Unencumbered wallet funds eligible for instant withdrawal request.
          </p>
        </div>

        {/* Pending Withdrawal Amount */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Withdrawal Amount</span>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-amber-800">
              {loadingEligibility ? '...' : formatINR(eligibility?.pendingWithdrawalAmount)}
            </h2>
            <p className="text-[11px] text-amber-700 mt-2 font-semibold">In Admin Review</p>
          </div>
          <p className="text-[11px] text-gray-400 border-t border-gray-100 pt-3 mt-4">
            Withdrawal requests undergoing administrative compliance verification.
          </p>
        </div>

      </div>

      {/* WITHDRAWAL ELIGIBILITY & STATUS CARD (3 SPECIFIED STATES) */}
      {!loadingEligibility && eligibility && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          
          {/* STATE 1: NOT ELIGIBLE — UNVERIFIED ACCOUNT OR UNVERIFIED BANK */}
          {!isUnlocked ? (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-amber-50/70 border border-amber-200/80 p-5 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-base">🔒 Withdrawals Unavailable</h3>
                  <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                    Complete your account verification and meet the withdrawal eligibility requirements to withdraw funds.
                  </p>
                  {eligibility?.lockReasons && eligibility.lockReasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {eligibility.lockReasons.map((reason, idx) => (
                        <span key={idx} className="text-[11px] bg-amber-100/80 text-amber-900 px-2.5 py-1 rounded-full font-semibold border border-amber-200">
                          • {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Link
                to="/profile/documents"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shrink-0 shadow-sm"
              >
                Verification Required
              </Link>
            </div>
          ) : !isAvailableBalanceSufficient ? (
            /* STATE 2: VERIFIED BUT INSUFFICIENT AVAILABLE BALANCE */
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-50 border border-gray-200 p-5 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">Withdrawal Unavailable</h3>
                    <span className="px-2.5 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-extrabold rounded-full">INSUFFICIENT BALANCE</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Your available balance is insufficient. Available to Withdraw: <strong className="text-gray-900 font-bold">{formatINR(eligibility.availableToWithdraw)}</strong> (Minimum ₹500.00 required).
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Invested principal, pending withdrawals, and active loan reserves are not withdrawable. Only Available Wallet Balance is withdrawable.
                  </p>
                </div>
              </div>
              
              <button
                disabled={true}
                className="px-6 py-3 bg-gray-200 text-gray-400 font-bold text-xs rounded-xl cursor-not-allowed flex items-center gap-2 shrink-0"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Insufficient Available Balance</span>
              </button>
            </div>
          ) : (
            /* STATE 3: ELIGIBLE — UNLOCKED & SUFFICIENT BALANCE */
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">Withdrawal Status: Unlocked & Verified</h3>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">✓ ELIGIBLE</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Available to Withdraw: <strong className="text-gray-900 font-bold">{formatINR(eligibility.availableToWithdraw)}</strong> • Daily Limit Remaining Today: <strong className="text-gray-900 font-bold">{formatINR(eligibility.dailyLimitRemaining)}</strong>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Platform Limits: Min ₹500 • Max ₹2,00,000/txn • Daily Limit ₹2,00,000 (IST Calendar Day)
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleOpenWithdrawModal}
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw Money</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* WITHDRAWAL HISTORY SECTION */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Withdrawal History</h2>
            <p className="text-xs text-gray-500">Track requested, approved, completed, and rejected wallet withdrawals.</p>
          </div>
        </div>

        {loadingMyWithdrawals ? (
          <div className="py-8 text-center text-sm text-gray-400">Loading withdrawal history...</div>
        ) : myWithdrawals.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            No withdrawal history found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Requested Date</th>
                  <th className="py-3 px-4">Destination Bank Account</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {myWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{w.referenceNumber}</td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">{formatDateTime(w.requestedAt)}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-bold text-gray-900">{w.bankName} ({w.accountNumberMasked})</div>
                      <div className="text-[10px] text-gray-400">{w.accountHolderName} • IFSC: {w.ifscCode}</div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-gray-900">{formatINR(w.amount)}</td>
                    <td className="py-3.5 px-4">
                      {w.status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                        </span>
                      )}
                      {w.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> PENDING ADMIN REVIEW
                        </span>
                      )}
                      {w.status === 'REJECTED' && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-50 text-red-700 border border-red-200">
                            <X className="w-3.5 h-3.5" /> REJECTED
                          </span>
                          {w.rejectionReason && (
                            <p className="text-[11px] text-red-600 mt-1 font-normal max-w-xs">Reason: {w.rejectionReason}</p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>



      {/* SECTION 4 & 5: BACKEND FILTERED WALLET TRANSACTIONS */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Wallet Transaction Audit Trail</h2>
            <p className="text-xs text-gray-500">Server-side paginated & indexed history including completed & audit-only failed attempts.</p>
          </div>
          <span className="text-xs font-bold text-gray-400">Total Records: {totalElements}</span>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Description / Ref..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#106354]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="INVESTMENT">Investment</option>
              <option value="LOAN_EMI">Loan EMI</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Sort Order</label>
            <select
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setPage(0); }}
              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => { setSearch(''); setTypeFilter('ALL'); setStatusFilter('ALL'); setStartDate(''); setEndDate(''); setSortOrder('newest'); setPage(0); }}
              className="w-full py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        {loadingTx ? (
          <div className="py-8 text-center text-sm text-gray-400">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            No transactions match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Ref ID / Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Balance (Before → After)</th>
                  <th className="py-3 px-4">Withdrawable (Before → After)</th>
                  <th className="py-3 px-4">Withdrawal Eligible?</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {transactions.map((tx) => {
                  const isBonus = tx.type === 'BONUS' || (tx.description || '').toLowerCase().includes('bonus');
                  const isEligible = tx.withdrawalEligible !== false && !isBonus;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-gray-900">#{tx.id}</div>
                        <div className="text-[10px] text-gray-400">{formatDateTime(tx.date || tx.createdAt)}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{tx.description}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isBonus ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 font-extrabold ${tx.amount >= 0 ? 'text-emerald-700' : 'text-gray-900'}`}>
                        {tx.amount >= 0 ? `+${formatINR(tx.amount)}` : formatINR(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-600">
                        {formatINR(tx.balanceBefore)} → <span className="font-bold text-gray-900">{formatINR(tx.balanceAfter)}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-600">
                        {formatINR(tx.withdrawableBalanceBefore || 0)} → <span className="font-bold text-emerald-800">{formatINR(tx.withdrawableBalanceAfter || 0)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isEligible ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            YES (Eligible)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-200">
                            NO (Bonus)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          tx.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {tx.status || 'COMPLETED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DEPOSIT MODAL */}
      <AddFundsModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />

      {/* WITHDRAWAL FORM & CONFIRMATION MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {withdrawStep === 'FORM' ? 'Withdraw Money' : 'Confirm Withdrawal Request'}
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer">✕</button>
            </div>

            {withdrawError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
                ⚠️ {withdrawError}
              </div>
            )}

            {withdrawStep === 'FORM' ? (
              <form onSubmit={handleContinueToConfirm} className="space-y-4">
                
                {/* Available Balance Summary */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Available to Withdraw</span>
                    <div className="text-lg font-extrabold text-gray-900">{formatINR(eligibility?.availableToWithdraw)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Daily Limit Remaining</span>
                    <div className="text-sm font-bold text-emerald-700">{formatINR(eligibility?.dailyLimitRemaining)}</div>
                  </div>
                </div>

                {/* Verified Bank Account Selector */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Destination Bank Account</label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#106354]"
                    required
                  >
                    {verifiedBankAccounts.map((acc) => (
                      <option key={acc.bankAccountId} value={acc.bankAccountId}>
                        {acc.bankName} ({acc.accountNumberMasked}) — {acc.accountHolderName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Withdrawal Amount Input */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    min="500"
                    max="200000"
                    step="1"
                    placeholder="Min ₹500, Max ₹2,00,000"
                    value={withdrawAmountInput}
                    onChange={(e) => setWithdrawAmountInput(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#106354]"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Single transaction limit: ₹500 – ₹2,00,000</p>
                </div>

                {/* Live Server-Side Preview */}
                {fetchingPreview ? (
                  <div className="p-3 text-center text-xs text-gray-400">Calculating preview...</div>
                ) : previewData ? (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between text-emerald-900 font-medium">
                      <span>Amount to Withdraw:</span>
                      <span className="font-extrabold">{formatINR(previewData.requestedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-900 font-medium">
                      <span>Remaining Wallet Balance Preview:</span>
                      <span className="font-extrabold text-emerald-700">{formatINR(previewData.remainingBalancePreview)}</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium pt-1 border-t border-emerald-200/50">
                      ✓ Reserved at request, atomically debited upon Admin approval.
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold rounded-xl text-xs shadow-md shadow-[#106354]/20 cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </form>
            ) : (
              /* CONFIRMATION SCREEN */
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Amount to Withdraw</span>
                    <span className="font-extrabold text-gray-900 text-base">{formatINR(withdrawAmountInput)}</span>
                  </div>
                  
                  {previewData?.bankAccount && (
                    <div className="pt-2 border-t border-gray-200/60 text-xs space-y-1">
                      <div className="text-gray-500 font-medium">Destination Bank Account:</div>
                      <div className="font-bold text-gray-900">{previewData.bankAccount.bankName} ({previewData.bankAccount.accountNumberMasked})</div>
                      <div className="text-[11px] text-gray-500">Holder: {previewData.bankAccount.accountHolderName} • IFSC: {previewData.bankAccount.ifscCode}</div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Processing Status</span>
                    <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">PENDING ADMIN APPROVAL</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-800 font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>256-bit encrypted transfer. Atomic balance decrement executes upon Admin approval.</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawStep('FORM')}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleConfirmWithdrawal}
                    className="px-6 py-2.5 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold rounded-xl text-xs shadow-md shadow-[#106354]/20 cursor-pointer"
                  >
                    {actionLoading ? 'Submitting...' : 'Confirm Withdrawal'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerWalletPage;
