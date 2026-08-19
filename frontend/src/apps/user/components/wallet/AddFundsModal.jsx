import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, CreditCard, Building2, CheckCircle2, AlertCircle, RefreshCw, ShieldAlert, ArrowRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../../../shared/api/axios';
import { useAuth } from '../../../../shared/context/AuthContext';

const AddFundsModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { refreshBalance } = useAuth();

  const [step, setStep] = useState('FORM'); // 'FORM' | 'DEMO_GATEWAY' | 'SUMMARY_SUCCESS' | 'SUMMARY_FAILED'
  const [amount, setAmount] = useState('10000');
  const [method, setMethod] = useState('UPI');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDeposit, setActiveDeposit] = useState(null);

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['walletSummary'] });
    queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
    queryClient.invalidateQueries({ queryKey: ['walletTxFiltered'] });
    queryClient.invalidateQueries({ queryKey: ['walletMe'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    if (refreshBalance) {
      refreshBalance();
    }
  };

  const handleReset = () => {
    setStep('FORM');
    setAmount('10000');
    setMethod('UPI');
    setErrorMessage('');
    setIsProcessing(false);
    setActiveDeposit(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Step 1: Initiate Deposit on Backend (POST /api/wallet/deposits)
  const handleInitiateDeposit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const num = parseFloat(amount);

    if (isNaN(num) || num < 500) {
      setErrorMessage('Minimum deposit amount is ₹500.00');
      return;
    }
    if (num > 100000) {
      setErrorMessage('Maximum deposit limit per transaction is ₹1,00,000.00');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await api.post('/wallet/deposits', {
        amount: num,
        paymentMethod: method
      });
      setActiveDeposit(res.data);
      setStep('DEMO_GATEWAY');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Unable to initiate deposit. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2A: Demo Success Simulation (POST /api/wallet/deposits/{id}/demo-success)
  const handleSimulateSuccess = async () => {
    if (!activeDeposit?.id) return;
    setErrorMessage('');
    try {
      setIsProcessing(true);
      const res = await api.post(`/wallet/deposits/${activeDeposit.id}/demo-success`);
      setActiveDeposit(res.data);
      invalidateQueries();
      setStep('SUMMARY_SUCCESS');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to process deposit success');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2B: Demo Failure Simulation (POST /api/wallet/deposits/{id}/demo-failure)
  const handleSimulateFailure = async () => {
    if (!activeDeposit?.id) return;
    setErrorMessage('');
    try {
      setIsProcessing(true);
      const res = await api.post(`/wallet/deposits/${activeDeposit.id}/demo-failure`, {
        reason: 'Simulated payment gateway rejection'
      });
      setActiveDeposit(res.data);
      invalidateQueries();
      setStep('SUMMARY_FAILED');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to process deposit failure');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#12241F]/80 backdrop-blur-sm"
          onClick={handleClose}
        ></motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-xl font-bold text-[#12241F]">Add Wallet Funds</h3>
              <p className="text-xs text-gray-500 font-medium">Database-Backed Secured Wallet Funding</p>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: FORM INPUT */}
            {step === 'FORM' && (
              <form onSubmit={handleInitiateDeposit} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount to Add (₹)</label>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Min ₹500 • Max ₹1,00,000
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#12241F]">₹</span>
                    <input 
                      type="number" 
                      min="500"
                      max="100000"
                      step="100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full text-3xl font-bold text-[#12241F] pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#106354] focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[1000, 5000, 10000, 50000].map(val => (
                      <button 
                        type="button" 
                        key={val} 
                        onClick={() => setAmount(val.toString())} 
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer"
                      >
                        +₹{val.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Funding Method</label>
                  <div className="space-y-2.5">
                    <div 
                      onClick={() => setMethod('UPI')} 
                      className={`flex items-center gap-4 p-3.5 rounded-2xl border cursor-pointer transition-all ${method === 'UPI' ? 'border-[#106354] bg-emerald-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${method === 'UPI' ? 'bg-[#106354] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-[#12241F]">UPI Payment</p>
                        <p className="text-[11px] text-gray-500">Google Pay, PhonePe, Paytm, BHIM</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'UPI' ? 'border-[#106354]' : 'border-gray-300'}`}>
                        {method === 'UPI' && <div className="w-2.5 h-2.5 rounded-full bg-[#106354]"></div>}
                      </div>
                    </div>

                    <div 
                      onClick={() => setMethod('DEBIT_CARD')} 
                      className={`flex items-center gap-4 p-3.5 rounded-2xl border cursor-pointer transition-all ${method === 'DEBIT_CARD' ? 'border-[#106354] bg-emerald-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${method === 'DEBIT_CARD' ? 'bg-[#106354] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-[#12241F]">Debit Card</p>
                        <p className="text-[11px] text-gray-500">Visa, Mastercard, RuPay</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'DEBIT_CARD' ? 'border-[#106354]' : 'border-gray-300'}`}>
                        {method === 'DEBIT_CARD' && <div className="w-2.5 h-2.5 rounded-full bg-[#106354]"></div>}
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => setMethod('NET_BANKING')} 
                      className={`flex items-center gap-4 p-3.5 rounded-2xl border cursor-pointer transition-all ${method === 'NET_BANKING' ? 'border-[#106354] bg-emerald-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${method === 'NET_BANKING' ? 'bg-[#106354] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-[#12241F]">Net Banking</p>
                        <p className="text-[11px] text-gray-500">HDFC, ICICI, SBI, Axis & All Major Banks</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'NET_BANKING' ? 'border-[#106354]' : 'border-gray-300'}`}>
                        {method === 'NET_BANKING' && <div className="w-2.5 h-2.5 rounded-full bg-[#106354]"></div>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={handleClose}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Initiating...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Payment</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: DEMO PAYMENT GATEWAY SIMULATION */}
            {step === 'DEMO_GATEWAY' && activeDeposit && (
              <div className="space-y-5">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-amber-900 font-black text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Demo Payment Environment</span>
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Simulated gateway environment for project demonstration. Select an outcome to test database transaction processing.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium">Reference Number</span>
                    <span className="font-mono font-bold text-gray-900">{activeDeposit.referenceNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium">Deposit Amount</span>
                    <span className="font-extrabold text-[#106354] text-base">₹{Number(activeDeposit.amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium">Selected Method</span>
                    <span className="font-bold text-gray-800 uppercase">{activeDeposit.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full uppercase">
                      PENDING
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleSimulateSuccess}
                    disabled={isProcessing}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Simulate Payment Success (Credit Wallet)</span>
                  </button>

                  <button
                    onClick={handleSimulateFailure}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Simulate Payment Failure</span>
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-full py-2 text-gray-500 hover:text-gray-700 font-bold text-xs cursor-pointer"
                  >
                    Keep Pending & Close
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3A: SUCCESS SUMMARY */}
            {step === 'SUMMARY_SUCCESS' && activeDeposit && (
              <div className="space-y-5 text-center py-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h4 className="text-xl font-extrabold text-gray-900">Payment Successful!</h4>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    ₹{Number(activeDeposit.amount).toLocaleString('en-IN')} has been atomically credited to your wallet.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-2 text-left">
                  <div className="flex justify-between border-b border-emerald-200/60 pb-1.5">
                    <span className="text-emerald-800 font-medium">Reference</span>
                    <span className="font-mono font-bold text-emerald-950">{activeDeposit.referenceNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200/60 pb-1.5">
                    <span className="text-emerald-800 font-medium">Method</span>
                    <span className="font-bold text-emerald-950 uppercase">{activeDeposit.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-800 font-medium">Status</span>
                    <span className="font-extrabold text-emerald-700 uppercase">COMPLETED</span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}

            {/* STEP 3B: FAILURE SUMMARY */}
            {step === 'SUMMARY_FAILED' && activeDeposit && (
              <div className="space-y-5 text-center py-2">
                <div className="w-16 h-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <X className="w-10 h-10" />
                </div>

                <div>
                  <h4 className="text-xl font-extrabold text-gray-900">Payment Failed</h4>
                  <p className="text-xs text-red-700 mt-1 font-medium">
                    Your payment of ₹{Number(activeDeposit.amount).toLocaleString('en-IN')} could not be completed. Your wallet balance was NOT changed.
                  </p>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs space-y-2 text-left">
                  <div className="flex justify-between border-b border-red-200 pb-1.5">
                    <span className="text-red-800 font-medium">Reference</span>
                    <span className="font-mono font-bold text-red-950">{activeDeposit.referenceNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-red-200 pb-1.5">
                    <span className="text-red-800 font-medium">Reason</span>
                    <span className="font-bold text-red-950">{activeDeposit.failureReason || 'Gateway Declined'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-800 font-medium">Status</span>
                    <span className="font-extrabold text-red-700 uppercase">FAILED</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddFundsModal;
