import React, { useState } from 'react';
import { X, Download, Calendar, Filter, FileText, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import api from '../../../shared/api/axios';

const StatementDownloadModal = ({ isOpen, onClose }) => {
  const [period, setPeriod] = useState('LAST_30_DAYS');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactionType, setTransactionType] = useState('ALL');
  const [format, setFormat] = useState('PDF');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [noDataState, setNoDataState] = useState(false);

  if (!isOpen) return null;

  const handleResetState = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setNoDataState(false);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    handleResetState();

    if (period === 'CUSTOM') {
      if (!fromDate || !toDate) {
        setErrorMsg('Please select both From Date and To Date for custom date range.');
        return;
      }
      if (new Date(fromDate) > new Date(toDate)) {
        setErrorMsg('From Date cannot be after To Date.');
        return;
      }
      if (new Date(fromDate) > new Date()) {
        setErrorMsg('From Date cannot be in the future.');
        return;
      }
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (period === 'CUSTOM') {
        params.append('fromDate', fromDate);
        params.append('toDate', toDate);
      }
      if (transactionType) params.append('transactionType', transactionType);

      const endpoint = format === 'CSV' ? '/payments/statement/csv' : '/payments/statement/pdf';

      const response = await api.get(`${endpoint}?${params.toString()}`, {
        responseType: 'blob'
      });

      // Trigger automatic browser file download
      const fileExtension = format === 'CSV' ? 'csv' : 'pdf';
      const defaultFilename = `Finance-Statement-${new Date().toISOString().slice(0, 10)}.${fileExtension}`;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = defaultFilename;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const blob = new Blob([response.data], {
        type: format === 'CSV' ? 'text/csv' : 'application/pdf'
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setSuccessMsg('Statement downloaded successfully.');
      setTimeout(() => {
        onClose();
        handleResetState();
      }, 2000);

    } catch (err) {
      if (err.response && err.response.status === 404) {
        setNoDataState(true);
      } else {
        setErrorMsg('Statement could not be generated. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-100 relative text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#106354] flex items-center justify-center mb-3">
            <Download className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#05231e]">Download Financial Statement</h2>
          <p className="text-xs text-gray-500 mt-1">Select the period and transaction types you want to include.</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-5 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 font-bold">{successMsg}</p>
          </div>
        )}

        {/* Empty Result Notification */}
        {noDataState ? (
          <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center space-y-4">
            <Clock className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="font-bold text-gray-800 text-sm">No transactions found for the selected period.</h4>
            <p className="text-xs text-gray-500">There are no completed financial transactions recorded matching your date range or filter choices.</p>
            <button
              onClick={() => setNoDataState(false)}
              className="px-5 py-2.5 bg-[#106354] text-white rounded-xl font-bold text-xs hover:bg-[#0c4d41] transition-colors shadow-md"
            >
              Change Date Range
            </button>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-5">
            
            {/* Statement Period */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Statement Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#106354] focus:bg-white transition-all"
              >
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="LAST_3_MONTHS">Last 3 Months</option>
                <option value="LAST_6_MONTHS">Last 6 Months</option>
                <option value="CURRENT_FY">Current Financial Year</option>
                <option value="PREVIOUS_FY">Previous Financial Year</option>
                <option value="CUSTOM">Custom Date Range</option>
              </select>
            </div>

            {/* Custom Date Range Inputs */}
            {period === 'CUSTOM' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">From Date *</label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#106354]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">To Date *</label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#106354]"
                  />
                </div>
              </div>
            )}

            {/* Transaction Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#106354] focus:bg-white transition-all"
              >
                <option value="ALL">All Transactions</option>
                <option value="DEPOSIT">Wallet Deposits</option>
                <option value="WITHDRAWAL">Wallet Withdrawals</option>
                <option value="INVESTMENT">Investments</option>
                <option value="LOAN_DISBURSEMENT">Loan Disbursements</option>
                <option value="EMI_PAYMENT">EMI Payments</option>
                <option value="WALLET_TRANSFER">Wallet Transfers</option>
              </select>
            </div>

            {/* Statement Format */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Statement Format
              </label>
              <div className="flex items-center gap-6 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="PDF"
                    checked={format === 'PDF'}
                    onChange={() => setFormat('PDF')}
                    className="w-4 h-4 text-[#106354] focus:ring-[#106354]"
                  />
                  <span>PDF Document</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="CSV"
                    checked={format === 'CSV'}
                    onChange={() => setFormat('CSV')}
                    className="w-4 h-4 text-[#106354] focus:ring-[#106354]"
                  />
                  <span>CSV Spreadsheet</span>
                </label>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating statement...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generate Statement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default StatementDownloadModal;
