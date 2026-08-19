import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../../../shared/api/axios';
import { useAuth } from '../../../../shared/context/AuthContext';

const WithdrawModal = ({ isOpen, onClose, totalValue = 0, targetValue = 500000 }) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { refreshBalance } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isLocked = totalValue < targetValue;

  const handleWithdraw = async () => {
    setErrorMsg('');
    try {
      if (!amount) return;
      
      if (parseFloat(amount) > totalValue) {
        setErrorMsg(`Insufficient funds. You only have ₹${totalValue.toLocaleString('en-IN')} available.`);
        return;
      }
      
      setIsProcessing(true);
      await api.post('/wallet/me/withdraw', { amount: parseFloat(amount) });
      queryClient.invalidateQueries();
      if (refreshBalance) await refreshBalance();
      onClose();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to process withdrawal. Please try again later.');
      console.error('Failed to withdraw funds', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#12241F]/80 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-xl font-bold text-[#12241F]">Withdraw Funds</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="p-6">
            {isLocked ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-amber-900">Funds Locked</h4>
                </div>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Your funds are currently locked. You must reach the <strong>₹{targetValue.toLocaleString('en-IN')} portfolio milestone</strong> to unlock withdrawals.
                </p>
                <div className="mt-4 pt-4 border-t border-amber-200/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Current</span>
                  <span className="font-bold text-amber-900">₹{totalValue.toLocaleString('en-IN')} / ₹{(targetValue/100000).toFixed(0)}L</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#4E8B83]/10 border border-[#4E8B83]/30 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#4E8B83] text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-[#12241F]">Withdrawals Unlocked</h4>
                </div>
                <p className="text-sm text-[#12241F]/70 leading-relaxed">
                  You have successfully reached the portfolio milestone. Your funds are available for withdrawal.
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-6 text-sm font-semibold">
                {errorMsg}
              </div>
            )}

            <div className={`mb-6 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Amount to Withdraw (₹)</label>
                <span className="text-xs font-bold text-emerald-600">Available: ₹{totalValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#12241F]">₹</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setErrorMsg(''); }}
                  disabled={isLocked || isProcessing}
                  className="w-full text-3xl font-bold text-[#12241F] pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl"
                  placeholder="0"
                />
              </div>
            </div>

            <div className={`mb-8 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Withdraw To</label>
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#12241F]">HDFC Bank</p>
                  <p className="text-xs text-gray-500">•••• •••• 1234</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleWithdraw} 
              disabled={isLocked || isProcessing}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-colors shadow-xl ${
                isLocked || isProcessing ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#12241F] text-white hover:bg-[#1a332c]'
              }`}
            >
              {isLocked ? 'Locked' : isProcessing ? 'Processing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WithdrawModal;
