import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../shared/api/axios';
import { ArrowDownLeft, ArrowUpRight, Search, FileText } from 'lucide-react';

const fetchTransactions = async () => {
  try {
    const res = await api.get('/wallet/me/transactions');
    return Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    return [];
  }
};

const TransactionHistory = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { data: transactionHistory = [], isLoading } = useQuery({
    queryKey: ['walletTransactions'],
    queryFn: fetchTransactions,
    staleTime: 1000 * 60 * 5,
  });

  const parseDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    if (Array.isArray(dateVal)) {
      const [y, m, d, h=0, min=0, s=0] = dateVal;
      return new Date(y, m - 1, d, h, min, s).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filters = ['All', 'Deposits', 'Withdrawals', 'Investments', 'Returns'];

  const filteredTransactions = (transactionHistory || []).filter(tx => {
    const matchesFilter = filter === 'All' || tx.type === filter || tx.type + 's' === filter;
    const matchesSearch = (tx.description || '').toLowerCase().includes(search.toLowerCase()) || String(tx.id || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) return <div>Loading transactions...</div>;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#12241F] mb-1">Transaction History</h3>
          <p className="text-gray-500 text-sm">Review your deposits, withdrawals, and returns.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search ID or description" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#4E8B83]/20"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#12241F] hover:bg-gray-50 transition-colors">
            <FileText className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-2 gap-2 hide-scrollbar">
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === f ? 'bg-[#12241F] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction</th>
              <th className="py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date & ID</th>
              <th className="py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-gray-500">No transactions found matching your criteria.</td>
              </tr>
            ) : filteredTransactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-[#4E8B83]/10 text-[#4E8B83]' : 'bg-[#C47D57]/10 text-[#C47D57]'}`}>
                      {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-[#12241F]">{tx.description}</p>
                      <p className="text-xs text-gray-500 font-semibold">{tx.type}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <p className="text-sm font-semibold text-[#12241F]">{parseDate(tx.date)}</p>
                  <p className="text-xs text-gray-400 font-mono">{tx.id}</p>
                </td>
                <td className="py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    tx.status === 'Completed' ? 'bg-[#4E8B83]/10 text-[#4E8B83]' : 
                    tx.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <p className={`font-bold ${tx.amount > 0 ? 'text-[#4E8B83]' : 'text-[#12241F]'}`}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
