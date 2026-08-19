import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Wallet, TrendingUp, Download, ArrowUpRight, Plus, Minus } from 'lucide-react';
import BonusProgress from './BonusProgress';
import PortfolioAllocation from './PortfolioAllocation';

const fetchWalletData = async () => {
  try {
    const res = await api.get('/wallet/me');
    // The backend returns a single Map object, not an array
    const data = res.data;
    return {
      totalPortfolioValue: parseFloat(data.totalPortfolioValue) || 0,
      availableBalance: parseFloat(data.availableBalance) || 0,
      investedAmount: parseFloat(data.investedAmount) || 0,
      totalProfit: parseFloat(data.totalProfit) || 0,
      targetMilestone: parseFloat(data.targetMilestone) || 500000,
      bonusBalance: parseFloat(data.bonusBalance) || 100000,
    };
  } catch (e) {
    return {
      totalPortfolioValue: 0,
      availableBalance: 0,
      investedAmount: 0,
      totalProfit: 0,
      targetMilestone: 500000,
      bonusBalance: 100000
    };
  }
};

const WalletOverview = ({ onOpenAdd, onOpenWithdraw }) => {
  const { data: walletMetrics, isLoading } = useQuery({
    queryKey: ['walletMe'],
    queryFn: fetchWalletData,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div>Loading wallet data...</div>;

  return (
    <div className="space-y-8">
      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="bg-[#12241F] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col min-w-0 h-full">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wallet className="w-16 h-16" />
          </div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Total Portfolio Value</p>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 truncate" title={`₹${(walletMetrics?.totalPortfolioValue || 0).toLocaleString('en-IN')}`}>
            ₹{(walletMetrics?.totalPortfolioValue || 0).toLocaleString('en-IN')}
          </h2>
          <div className="flex gap-2 mt-auto">
            <button onClick={onOpenAdd} className="flex-1 bg-white text-[#12241F] rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-100 transition-colors">
              <Plus className="w-4 h-4" /> Add Funds
            </button>
            <button onClick={onOpenWithdraw} className="flex-1 bg-white/10 text-white rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1 hover:bg-white/20 transition-colors truncate">
              <Minus className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Withdraw</span>
            </button>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col min-w-0 h-full">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Available Cash</p>
          <h3 className="text-3xl font-bold text-[#12241F] mb-2 truncate" title={`₹${(walletMetrics?.availableBalance || 0).toLocaleString('en-IN')}`}>
            ₹{(walletMetrics?.availableBalance || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-gray-400 font-semibold mt-auto flex items-end h-10">Ready to invest or withdraw</p>
        </div>

        {/* Invested Amount */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col min-w-0 h-full">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Invested</p>
          <h3 className="text-3xl font-bold text-[#12241F] mb-2 truncate" title={`₹${(walletMetrics?.investedAmount || 0).toLocaleString('en-IN')}`}>
            ₹{(walletMetrics?.investedAmount || 0).toLocaleString('en-IN')}
          </h3>
          <div className="text-xs font-semibold mt-auto flex items-end h-10 gap-1 text-[#4E8B83]">
            <TrendingUp className="w-4 h-4" /> Spread across 4 assets
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-[#F8FAF9] rounded-3xl p-6 border border-[#4E8B83]/20 shadow-sm flex flex-col min-w-0 h-full">
          <p className="text-[#4E8B83] text-xs font-bold uppercase tracking-wider mb-2">Total Profit</p>
          <h3 className="text-3xl font-bold text-[#12241F] mb-2 truncate" title={`+₹${(walletMetrics?.totalProfit || 0).toLocaleString('en-IN')}`}>
            +₹{(walletMetrics?.totalProfit || 0).toLocaleString('en-IN')}
          </h3>
          <div className="text-xs font-semibold mt-auto flex items-end h-10 gap-1 text-[#4E8B83]">
            <ArrowUpRight className="w-4 h-4" /> +14.2% All Time
          </div>
        </div>
      </div>

      {/* Bonus Progress */}
      <BonusProgress 
        currentValue={walletMetrics?.totalPortfolioValue || 0} 
        targetValue={walletMetrics?.targetMilestone || 10000} 
        startValue={walletMetrics?.bonusBalance || 0} 
      />

      {/* Allocation and Mini History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PortfolioAllocation />
        
        {/* Quick Actions / Security snippet */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
          <h3 className="text-xl font-bold text-[#12241F] mb-6">Recent Statements</h3>
          <div className="flex flex-col gap-4">
            <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-2xl">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No statements available yet.</p>
              <p className="text-xs mt-1">Your first statement will be generated at the end of the month.</p>
            </div>
          </div>
          <button className="mt-auto w-full py-3 text-sm font-bold text-[#4E8B83] hover:text-[#275c55] transition-colors">
            View All Statements →
          </button>
        </div>
      </div>
    </div>
  );
};

// Extracted icon for the quick actions snippet above
const FileText = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

export default WalletOverview;
