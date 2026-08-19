import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import AddFundsModal from '../../components/wallet/AddFundsModal';
import WithdrawModal from '../../components/wallet/WithdrawModal';
import { 
  ArrowUpRight, ArrowDownLeft, Download, Plus, Minus, Search, 
  Filter, Calendar, FileText, CheckCircle2, AlertCircle, X, ChevronLeft, ChevronRight, Eye, RefreshCw
} from 'lucide-react';

const CustomerPaymentsPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  // Filter & Pagination States
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Wallet Balance Summary
  const { data: walletSummary } = useQuery({
    queryKey: ['walletSummary'],
    queryFn: async () => {
      const res = await api.get('/wallet/me');
      return res.data;
    }
  });

  // 2. Fetch Customer Active Loans & EMI
  const { data: myLoans = [] } = useQuery({
    queryKey: ['myLoans'],
    queryFn: async () => {
      const res = await api.get('/loans/my');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const activeLoan = myLoans.find(l => l.status === 'ACTIVE' || l.status === 'APPROVED');

  const { data: loanEmis = [] } = useQuery({
    queryKey: ['loanEmis', activeLoan?.id],
    queryFn: async () => {
      if (!activeLoan) return [];
      const res = await api.get(`/loans/${activeLoan.id}/emis`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!activeLoan
  });

  const currentActionableEmi = loanEmis.find(e => e.status === 'PENDING');

  // 3. Fetch Paginated Transactions History from Backend
  const { data: txPageData, isLoading: loadingTx, refetch } = useQuery({
    queryKey: ['walletTxFiltered', page, typeFilter, statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 10);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/wallet/me/transactions/filtered?${params.toString()}`);
      return res.data;
    }
  });

  const transactions = txPageData?.content || [];
  const totalPages = txPageData?.totalPages || 1;
  const totalElements = txPageData?.totalElements || 0;

  // Format Helpers
  const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const parseDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    if (Array.isArray(dateVal)) {
      const [y, m, d, h = 0, min = 0] = dateVal;
      return new Date(y, m - 1, d, h, min).toLocaleString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Download Statement CSV Exporter
  const handleDownloadStatement = async () => {
    try {
      const res = await api.get('/wallet/me/transactions');
      const allTx = Array.isArray(res.data) ? res.data : [];

      if (allTx.length === 0) {
        alert('No transactions available to download.');
        return;
      }

      const headers = ['Transaction ID', 'Date', 'Type', 'Amount (INR)', 'Status', 'Balance Before', 'Balance After', 'Description'];
      const rows = allTx.map(t => [
        t.id,
        parseDate(t.date),
        t.type || 'N/A',
        t.amount || 0,
        t.status || 'COMPLETED',
        t.balanceBefore || 0,
        t.balanceAfter || 0,
        `"${(t.description || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Kalpanaa_Finance_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to download statement: ' + (err.message || 'Unknown error'));
    }
  };

  const availableBalance = walletSummary?.availableWalletBalance || 0;
  const recentPayments = transactions.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-16">
      
      {/* 1. HEADER & ACTIONS (Add Funds, Withdraw, Download Statement) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#12241F]">Payments & Transactions</h1>
          <p className="text-xs text-gray-500 mt-1">Manage payment methods, wallet transfers, and download statements.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDownloadStatement}
            className="px-5 py-3 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Statement
          </button>
        </div>
      </div>

      {/* 2. PAYMENT SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#12241F] text-white rounded-3xl p-6 shadow-md border border-white/10 flex flex-col justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Available Wallet Balance</p>
          <h2 className="text-3xl font-black text-white">{formatINR(availableBalance)}</h2>
          <p className="text-[11px] text-emerald-400 font-semibold mt-2">Liquid Balance</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Deposit Credits</p>
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-emerald-700">{formatINR(walletSummary?.totalDepositCredits)}</h2>
          <p className="text-[11px] text-gray-400 mt-2">Verified Inflows</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Debits / Withdrawals</p>
            <ArrowUpRight className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-3xl font-bold text-amber-700">{formatINR(walletSummary?.totalWithdrawalDebits)}</h2>
          <p className="text-[11px] text-gray-400 mt-2">Verified Outflows</p>
        </div>
      </div>

      {/* 3. LOAN EMI PAYMENTS SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#12241F]">Loan EMI Payments</h3>
            <p className="text-xs text-gray-500">Pay upcoming loan installments directly from your wallet balance.</p>
          </div>
          {activeLoan && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Active Loan: {activeLoan.purpose || 'Personal Loan'}
            </span>
          )}
        </div>

        {currentActionableEmi ? (
          <div className="bg-amber-50/80 border border-amber-200 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900 uppercase">Upcoming Installment #{currentActionableEmi.installmentNumber || 1}</span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-extrabold rounded-full">PAYMENT DUE</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{formatINR(currentActionableEmi.amount)}</p>
                <p className="text-xs text-gray-500">Due Date: {currentActionableEmi.dueDate}</p>
              </div>
            </div>

            <button
              onClick={async () => {
                if (availableBalance < currentActionableEmi.amount) {
                  alert('Insufficient wallet balance to pay this EMI. Please add funds first.');
                  return;
                }
                if (!confirm(`Confirm EMI Payment of ${formatINR(currentActionableEmi.amount)} from your wallet balance?`)) return;
                try {
                  await api.post(`/loans/emi/${currentActionableEmi.id}/pay`);
                  refetch();
                  alert('EMI Payment successful!');
                } catch (err) {
                  alert(err.response?.data?.message || 'EMI payment failed.');
                }
              }}
              className="px-6 py-3 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              Pay EMI Now
            </button>
          </div>
        ) : (
          <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-xs font-bold text-gray-500">
            {activeLoan ? '✓ All scheduled loan EMIs are currently up to date!' : 'No active loan balance requiring EMI payment.'}
          </div>
        )}
      </div>

      {/* 3. RECENT PAYMENTS QUICK CAROUSEL / LIST */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#12241F]">Recent Payments</h3>
          <span className="text-xs text-gray-400 font-semibold">Latest 5 Transactions</span>
        </div>

        {recentPayments.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl">
            No recent payment transactions recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {recentPayments.map(tx => {
              const isCredit = (tx.type || '').toUpperCase().includes('CREDIT') || (tx.type || '').toUpperCase().includes('DEPOSIT') || (tx.type || '').toUpperCase().includes('DISBURSEMENT');
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all cursor-pointer space-y-2 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tx.type || 'TX'}
                    </span>
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <p className="font-bold text-sm text-[#12241F] truncate">{tx.description || 'Payment'}</p>
                  <p className={`font-black text-base ${isCredit ? 'text-emerald-700' : 'text-amber-800'}`}>
                    {isCredit ? '+' : '-'}{formatINR(tx.amount)}
                  </p>
                  <p className="text-[10px] text-gray-400">{parseDate(tx.date)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. COMPLETE TRANSACTION HISTORY AUDIT TRAIL */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-[#12241F]">Complete Transaction History</h3>
            <p className="text-xs text-gray-500">Filter, search, and inspect all payment audit logs.</p>
          </div>
          <span className="text-xs font-bold text-gray-400">Total Records: {totalElements}</span>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search description/type..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#106354]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Type Filter</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
              className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#106354]"
            >
              <option value="">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="INVESTMENT_PURCHASE">Investment Purchase</option>
              <option value="EMI_PAYMENT">EMI Payment</option>
              <option value="LOAN_DISBURSEMENT">Loan Disbursement</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#106354]"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => { setSearchTerm(''); setTypeFilter(''); setStatusFilter(''); setPage(0); }}
              className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        {loadingTx ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading transaction history...</div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No transactions match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Ref ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {transactions.map((tx) => {
                  const isCredit = (tx.type || '').toUpperCase().includes('CREDIT') || (tx.type || '').toUpperCase().includes('DEPOSIT') || (tx.type || '').toUpperCase().includes('DISBURSEMENT');
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-500">#{tx.id}</td>
                      <td className="py-3.5 px-4 text-gray-600">{parseDate(tx.date)}</td>
                      <td className="py-3.5 px-4 font-bold text-[#12241F]">{tx.type}</td>
                      <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">{tx.description || '-'}</td>
                      <td className={`py-3.5 px-4 font-bold ${isCredit ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {isCredit ? '+' : '-'}{formatINR(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {tx.status || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[11px] rounded-lg transition-all"
                        >
                          View
                        </button>
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
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-xs">
            <span className="text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-800 font-bold rounded-lg transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-800 font-bold rounded-lg transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. PAYMENT DETAILS MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h3 className="text-xl font-black text-[#12241F]">Payment Receipt</h3>
              <p className="text-xs text-gray-400">Transaction #{selectedTx.id}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl space-y-3 text-xs border border-gray-100">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Amount</span>
                <span className="font-bold text-gray-900 text-sm">{formatINR(selectedTx.amount)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Type</span>
                <span className="font-bold text-gray-900">{selectedTx.type}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Date & Time</span>
                <span className="font-bold text-gray-900">{parseDate(selectedTx.date)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Status</span>
                <span className="font-bold text-emerald-700">{selectedTx.status || 'COMPLETED'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Balance Before</span>
                <span className="font-bold text-gray-800">{formatINR(selectedTx.balanceBefore)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Balance After</span>
                <span className="font-bold text-gray-800">{formatINR(selectedTx.balanceAfter)}</span>
              </div>
            </div>

            {selectedTx.description && (
              <div className="p-3 bg-gray-50 rounded-xl text-xs">
                <p className="text-gray-400 font-bold uppercase text-[10px] mb-1">Description</p>
                <p className="text-gray-700 font-medium">{selectedTx.description}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-3 bg-[#12241F] text-white font-bold text-xs rounded-xl hover:bg-[#1a332c] transition-colors"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Modals for Add Funds & Withdraw */}
      <AddFundsModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <WithdrawModal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} totalValue={availableBalance} targetValue={500000} />
    </div>
  );
};

export default CustomerPaymentsPage;
