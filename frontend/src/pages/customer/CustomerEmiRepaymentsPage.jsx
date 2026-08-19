import React, { useState } from 'react';
import { Home, CheckCircle2, RotateCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

const CustomerEmiRepaymentsPage = () => {
  const [successMessage, setSuccessMessage] = useState('');
  
  const { data: loans = [], isLoading: loadingLoans } = useQuery({
    queryKey: ['myLoans'],
    queryFn: async () => {
      const res = await api.get('/loans/me');
      return res.data;
    }
  });

  const activeLoan = loans.find(l => l.status === 'ACTIVE') || loans[0];
  const loanId = activeLoan?.id;

  const { data: currentEmi, isLoading: loadingEmi } = useQuery({
    queryKey: ['currentEmi', loanId],
    queryFn: async () => {
      if (!loanId) return null;
      try {
        const res = await api.get(`/loans/${loanId}/current-emi`);
        return res.data;
      } catch (err) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!loanId
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['emiHistory', loanId],
    queryFn: async () => {
      if (!loanId) return [];
      const res = await api.get(`/loans/${loanId}/emi-history`);
      return res.data;
    },
    enabled: !!loanId
  });

  const handlePay = () => {
    setSuccessMessage(`Payment Successful for EMI!`);
    setTimeout(() => setSuccessMessage(''), 4000);
    // In a real app, this would trigger a refetch or payment gateway
  };

  if (loadingLoans || loadingEmi || loadingHistory) {
    return <div className="p-6">Loading repayment details...</div>;
  }

  if (!loadingLoans && !loanId) {
    return <div className="p-6">No active loans found.</div>;
  }

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

  return (
    <div className="max-w-4xl mx-auto font-sans relative pb-10">
      
      {successMessage && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <p className="font-bold">{successMessage}</p>
        </div>
      )}

      {/* Current EMI */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Active Repayment</h3>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {!currentEmi ? (
            <p className="text-gray-500">No active EMI pending.</p>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center gap-4 mb-4 md:mb-0 md:w-1/3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Loan EMI</h4>
                  <p className="text-xs text-gray-500 font-medium">Installment #{currentEmi.installmentNumber || 1}</p>
                </div>
              </div>

              <div className="flex justify-between md:w-2/3 md:ml-8 items-center gap-4">
                <div className="w-1/3">
                  <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">Current EMI</p>
                  <p className="font-bold text-gray-900 text-lg">₹{(currentEmi.amountDue || currentEmi.amount || 0).toLocaleString('en-IN')}</p>
                </div>

                <div className="w-1/3">
                  <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">Due Date</p>
                  <p className="font-bold text-gray-900 text-sm">
                    {parseDate(currentEmi.dueDate)}
                  </p>
                  <span className={`text-xs font-bold ${currentEmi.status === 'OVERDUE' ? 'text-red-600' : 'text-yellow-600'}`}>
                    Status: {currentEmi.status || 'DUE'}
                  </span>
                </div>

                <div className="w-1/3 flex justify-end">
                  <button 
                    onClick={handlePay}
                    className="px-6 py-2.5 bg-[#05231e] hover:bg-[#0a362e] text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
                  >
                    Pay EMI
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-2">
          {history.length === 0 ? (
            <div className="p-6 text-gray-500">No payment history found.</div>
          ) : (
            <div className="flex flex-col">
              {history.map((payment, idx) => (
                <div 
                  key={payment.id || idx} 
                  className={`flex items-center justify-between p-6 ${idx !== history.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-4 w-1/2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Installment #{payment.installmentNumber || idx + 1}</h4>
                      <span className="text-xs text-gray-500 font-medium">
                        {parseDate(payment.dueDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-1/2 pr-2">
                    <span className="font-bold text-gray-900">₹{(payment.amountDue || payment.amount || 0).toLocaleString('en-IN')}</span>
                    <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {payment.status || 'PAID'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default CustomerEmiRepaymentsPage;
