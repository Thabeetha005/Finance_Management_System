import React, { useEffect, useState, useMemo } from 'react';
import { transactionService } from '../../../services/transactionService';
import { ArrowRightLeft, Search, ArrowUpRight, ArrowDownLeft, ShieldCheck, Filter } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        setLoading(true);
        const data = await transactionService.getAllTransactions();
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data?.content && Array.isArray(data.content)) {
          list = data.content;
        } else if (data?.data && Array.isArray(data.data)) {
          list = data.data;
        }
        setTransactions(list);
      } catch (err) {
        console.error("Failed to fetch admin transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, []);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(Math.abs(amount));
  };

  const isCredit = (tx) => {
    if (tx.amount != null && tx.amount > 0) return true;
    const type = (tx.type || '').toUpperCase();
    return type.contains ? type.contains('CREDIT') || type.contains('DEPOSIT') || type.contains('BONUS') : (type.includes('CREDIT') || type.includes('DEPOSIT') || type.includes('BONUS'));
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Type Filter
      if (typeFilter === 'CREDIT' && !isCredit(tx)) return false;
      if (typeFilter === 'DEBIT' && isCredit(tx)) return false;

      // Search Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const userName = tx.user?.name || tx.account?.user?.name || '';
        const userEmail = tx.user?.email || tx.account?.user?.email || tx.accountUserEmail || '';
        const txId = `tx#${tx.id}`;
        const desc = tx.description || '';
        const type = tx.type || '';

        return (
          userName.toLowerCase().includes(q) ||
          userEmail.toLowerCase().includes(q) ||
          txId.toLowerCase().includes(q) ||
          desc.toLowerCase().includes(q) ||
          type.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [transactions, searchTerm, typeFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE);
  const paginatedTransactions = filteredTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, typeFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Transactions & Audit Trail</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time view of every transaction, credit, and deduction across all customer accounts.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              typeFilter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setTypeFilter('CREDIT')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              typeFilter === 'CREDIT' ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-200' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            Credits / Deposits
          </button>
          <button
            onClick={() => setTypeFilter('DEBIT')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              typeFilter === 'DEBIT' ? 'bg-amber-50 text-amber-800 shadow-sm border border-amber-200' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-amber-600" />
            Debits / Deductions
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, email, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#106354] transition-all"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">TXN ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Type / Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Balance After</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 animate-pulse rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                paginatedTransactions.map(tx => {
                  const credit = isCredit(tx);
                  const userName = tx.user?.name || tx.account?.user?.name || 'Customer #' + tx.userId;
                  const userEmail = tx.user?.email || tx.account?.user?.email || tx.accountUserEmail || '';
                  
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">#TXN-{tx.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{userName}</p>
                        {userEmail && <p className="text-[10px] text-gray-400">{userEmail}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800 uppercase tracking-wide text-[10px]">{tx.type || 'TRANSFER'}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{tx.description || '-'}</p>
                      </td>
                      <td className={`px-6 py-4 font-bold text-xs ${credit ? 'text-emerald-600' : 'text-amber-800'}`}>
                        {credit ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-700">
                        {tx.balanceAfter != null ? `₹${Number(tx.balanceAfter).toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'COMPLETED' || tx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                          tx.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {tx.date || tx.createdAt ? new Date(tx.date || tx.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <ArrowRightLeft className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">No transactions found</p>
                      <p className="text-xs text-gray-400 mt-1">Try clearing search filters or checking customer wallet activity.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {filteredTransactions.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredTransactions.length)} of {filteredTransactions.length} transactions
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
    </div>
  );
};

export default Transactions;
