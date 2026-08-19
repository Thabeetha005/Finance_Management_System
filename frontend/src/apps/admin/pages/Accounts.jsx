import React, { useEffect, useState, useMemo } from 'react';
import { accountService } from '../../../services/accountService';
import { Wallet, Search, ArrowUpRight, ShieldCheck } from 'lucide-react';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const data = await accountService.getAllAccounts();
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data?.content && Array.isArray(data.content)) {
          list = data.content;
        } else if (data?.data && Array.isArray(data.data)) {
          list = data.data;
        }
        setAccounts(list);
      } catch (err) {
        console.error("Failed to fetch admin accounts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const filteredAccounts = useMemo(() => {
    if (!searchTerm.trim()) return accounts;
    const q = searchTerm.toLowerCase();
    return accounts.filter(acc => {
      const accId = String(acc.id || '').toLowerCase();
      const userName = String(acc.userName || '').toLowerCase();
      const userEmail = String(acc.userEmail || '').toLowerCase();
      const type = String(acc.accountType || '').toLowerCase();
      return accId.includes(q) || userName.includes(q) || userEmail.includes(q) || type.includes(q);
    });
  }, [accounts, searchTerm]);

  const totalPages = Math.ceil(filteredAccounts.length / PAGE_SIZE);
  const paginatedAccounts = filteredAccounts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Bank & Wallet Accounts</h1>
        <p className="text-gray-500 text-sm mt-1">Live overview of customer accounts, wallet balances, and status.</p>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
          <Wallet className="w-4 h-4 text-[#106354]" />
          <span>Total Customer Accounts: {accounts.length}</span>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Account ID, customer name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#106354] transition-all"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">Account ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Available Balance</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 animate-pulse rounded-full w-16"></div></td>
                  </tr>
                ))
              ) : filteredAccounts.length > 0 ? (
                paginatedAccounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{acc.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{acc.userName}</p>
                      <p className="text-[10px] text-gray-400">{acc.userEmail}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{acc.accountType || 'Wallet & Savings'}</td>
                    <td className="px-6 py-4 font-bold text-[#106354] text-sm">{formatCurrency(acc.balance)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        acc.status === 'Active' || acc.status === 'ACTIVE' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : acc.status === 'PENDING_TERMINATION'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {acc.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Wallet className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">No accounts found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredAccounts.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredAccounts.length)} of {filteredAccounts.length} accounts
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

export default Accounts;
