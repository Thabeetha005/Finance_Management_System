import React, { useEffect, useState } from 'react';
import { transactionService } from '../../services/transactionService';
import { ArrowRightLeft } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const data = await transactionService.getAllTransactions();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 mt-1">View and manage all system transactions.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Txn ID</th>
                <th className="px-6 py-4 font-medium">Account ID</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 animate-pulse rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                  </tr>
                ))
              ) : transactions.length > 0 ? (
                transactions.map(tx => (
                  <tr key={tx.id || tx.transactionId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{tx.id || String(tx.transactionId).substring(0,8)}</td>
                    <td className="px-6 py-4 text-gray-600">{tx.accountId || tx.account_id || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{tx.type || 'Transfer'}</td>
                    <td className={`px-6 py-4 font-medium ${tx.type === 'DEPOSIT' || tx.amount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'COMPLETED' || tx.status === 'completed' || tx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                        tx.status === 'PENDING' || tx.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {tx.status || 'COMPLETED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {tx.created_at || tx.transactionDate ? new Date(tx.created_at || tx.transactionDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <ArrowRightLeft className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">No transactions found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
