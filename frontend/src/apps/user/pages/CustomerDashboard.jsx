import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import CustomerFinancialAnalyticsDashboard from '../components/CustomerFinancialAnalyticsDashboard';
import TransactionHistory from '../components/wallet/TransactionHistory';
import AddFundsModal from '../components/wallet/AddFundsModal';
import WithdrawModal from '../components/wallet/WithdrawModal';
import { LayoutDashboard, PieChart, Activity, BadgeCheck } from 'lucide-react';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'Overview');

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Fetch live wallet balance to pass into WithdrawModal
  const { data: liveBalance = 0 } = useQuery({
    queryKey: ['walletAccounts'],
    queryFn: async () => {
      const res = await api.get('/wallet/me');
      // API returns a Map object with 'availableBalance' key
      return parseFloat(res.data?.availableBalance) || 0;
    },
    refetchInterval: 30000,
  });

  const tabs = [
    { id: 'Overview', icon: LayoutDashboard },
    { id: 'Transactions', icon: Activity },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Night';
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        {/* Top Navigation & Time-Based Greeting Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#12241F] text-emerald-400 flex items-center justify-center font-bold text-xl shadow-md border border-emerald-900/30 overflow-hidden">
              <span className="font-black text-emerald-400 text-lg">KF</span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[#12241F] tracking-tight">
                {getGreeting()}, {user?.name || 'Valued Customer'} 👋
              </h2>
              <p className="text-xs text-gray-500 font-medium">Welcome back to your financial analytics portal</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#12241F] text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#12241F]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.id}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <main className="w-full">
          {activeTab === 'Overview' && (
            <CustomerFinancialAnalyticsDashboard />
          )}

          {activeTab === 'Transactions' && (
            <div className="space-y-8">
              <TransactionHistory />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AddFundsModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <WithdrawModal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} totalValue={liveBalance} targetValue={500000} />
    </div>
  );
};

export default CustomerDashboard;
