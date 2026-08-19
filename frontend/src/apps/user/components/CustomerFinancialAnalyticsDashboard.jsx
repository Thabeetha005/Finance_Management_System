import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../shared/api/axios';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Wallet, TrendingUp, ShieldCheck, FileText, Activity, ArrowUpRight,
  ArrowDownLeft, RefreshCw, AlertCircle, Award, CheckCircle2,
  PieChart, Lock, ChevronRight, Calculator, Clock, HelpCircle, Layers
} from 'lucide-react';

const CustomerFinancialAnalyticsDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [netWorthTimeframe, setNetWorthTimeframe] = useState('6M');
  const [cashFlowTimeframe, setCashFlowTimeframe] = useState('6M');

  // Fetch complete real-time database financial analytics
  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['customer-dashboard-analytics'],
    queryFn: async () => {
      const res = await api.get('/customer/dashboard/analytics');
      return res.data;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const formatCurrency = (amount) => {
    const val = Number(amount || 0);
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const overview = analytics?.overview || {};
  const portfolioPerf = analytics?.portfolioPerformance || {};
  const assetAlloc = Array.isArray(analytics?.assetAllocation) ? analytics.assetAllocation : [];
  const cashFlow = analytics?.cashFlow || {};
  const loanAnalytics = analytics?.loanAnalytics || {};
  const netWorthHistory = Array.isArray(analytics?.netWorthHistory) ? analytics.netWorthHistory : [];
  const monthlyTrend = Array.isArray(analytics?.monthlyFinancialTrend) ? analytics.monthlyFinancialTrend : [];
  const health = analytics?.financialHealth || {};
  const projection = analytics?.projection || {};

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="w-full space-y-8 animate-pulse pb-12">
        {/* Header Skeleton */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-3 w-full md:w-1/2">
            <div className="h-8 bg-gray-200 rounded-lg w-2/3"></div>
            <div className="h-4 bg-gray-100 rounded-lg w-full"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
        </div>

        {/* Top 5 Summary Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        {/* Chart Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 h-80"></div>
          <div className="bg-white rounded-3xl p-8 border border-gray-100 h-80"></div>
        </div>
      </div>
    );
  }

  // Error State with Retry
  if (isError) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-100 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Analytics Service Unavailable</h3>
          <p className="text-sm text-gray-500">
            {error?.response?.data?.message || error?.message || "Failed to load financial analytics from database."}
          </p>
          <button
            onClick={() => refetch()}
            className="w-full bg-[#12241F] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1a332c] transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Retry Analytics Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-12 font-sans">
      
      {/* 2. TOP FINANCIAL SUMMARY (5 DYNAMIC CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Net Worth */}
        <div className="bg-[#12241F] text-white rounded-3xl p-6 shadow-lg border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Net Worth</p>
              <Award className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white truncate" title={formatCurrency(overview.netWorth)}>
              {formatCurrency(overview.netWorth)}
            </h2>
            <p className="text-[11px] text-emerald-400 font-semibold mt-2">Assets - Liabilities</p>
          </div>
          <Link to="/wallet" className="text-xs text-gray-300 font-bold hover:text-white mt-4 flex items-center gap-1 pt-3 border-t border-white/10">
            View Wallet Breakdown <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Total Invested */}
        <div className="bg-white text-gray-900 rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Invested</p>
              <PieChart className="w-5 h-5 text-[#106354]" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#12241F] truncate" title={formatCurrency(overview.totalInvested)}>
              {formatCurrency(overview.totalInvested)}
            </h2>
            <p className="text-[11px] text-gray-500 font-semibold mt-2">{portfolioPerf.activeInvestmentCount || 0} Active Investments</p>
          </div>
          <Link to="/profile/investpage" className="text-xs text-[#106354] font-bold hover:text-[#0b473c] mt-4 flex items-center gap-1 pt-3 border-t border-gray-100">
            Investment Portal <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Total Investment Returns */}
        <div className="bg-white text-gray-900 rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Investment Returns</p>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-emerald-600 truncate" title={formatCurrency(overview.investmentReturns)}>
              +{formatCurrency(overview.investmentReturns)}
            </h2>
            <p className="text-[11px] text-emerald-700 font-semibold mt-2">{portfolioPerf.returnPercentage || 0}% Return Rate</p>
          </div>
          <Link to="/profile/investpage" className="text-xs text-[#106354] font-bold hover:text-[#0b473c] mt-4 flex items-center gap-1 pt-3 border-t border-gray-100">
            View Return History <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 4: Total Loan Outstanding */}
        <div className="bg-white text-gray-900 rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Loan Outstanding</p>
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-amber-700 truncate" title={formatCurrency(overview.loanOutstanding)}>
              {formatCurrency(overview.loanOutstanding)}
            </h2>
            <p className="text-[11px] text-gray-500 font-semibold mt-2">{loanAnalytics.activeLoanCount || 0} Active Loans</p>
          </div>
          <Link to="/profile/loans" className="text-xs text-[#106354] font-bold hover:text-[#0b473c] mt-4 flex items-center gap-1 pt-3 border-t border-gray-100">
            Manage Loans & EMIs <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 5: Available Wallet Balance */}
        <div className="bg-white text-gray-900 rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Available Cash</p>
              <Wallet className="w-5 h-5 text-[#106354]" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#12241F] truncate" title={formatCurrency(overview.walletBalance)}>
              {formatCurrency(overview.walletBalance)}
            </h2>
            <p className="text-[11px] text-gray-500 font-semibold mt-2">Liquid Wallet Balance</p>
          </div>
          <Link to="/wallet" className="text-xs text-[#106354] font-bold hover:text-[#0b473c] mt-4 flex items-center gap-1 pt-3 border-t border-gray-100">
            Add Funds / Withdraw <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* 3. NET WORTH GROWTH ANALYTICS & ASSET ALLOCATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Net Worth Growth Historical Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#12241F] mb-1">Net Worth Growth Analytics</h3>
              <p className="text-gray-500 text-xs">Calculated from historical asset and liability records</p>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              {['1M', '6M', '1Y', '3Y', '5Y', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setNetWorthTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    netWorthTimeframe === tf 
                      ? 'bg-[#106354] text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-72">
            {netWorthHistory.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Clock className="w-10 h-10 text-gray-300 mb-2" />
                <p className="font-bold text-gray-600 text-sm">Not enough financial history yet</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">Historical net worth trends will populate as transactions and investments accumulate over time.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#106354" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#106354" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    formatter={(val, name) => [`₹${(val || 0).toLocaleString('en-IN')}`, name === 'netWorth' ? 'Net Worth' : 'Portfolio Value']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="netWorth" stroke="#106354" strokeWidth={3} fillOpacity={1} fill="url(#netWorthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 5. ASSET ALLOCATION DONUT CHART */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-[#12241F] mb-1">Asset Allocation</h3>
            <p className="text-gray-500 text-xs">Dynamic percentage breakdown of your portfolio</p>
          </div>

          {assetAlloc.length === 0 ? (
            <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6">
              <PieChart className="w-10 h-10 text-gray-300 mb-2" />
              <p className="font-bold text-gray-600 text-sm">No investments yet</p>
              <p className="text-xs text-gray-400 mt-1">Add funds or select an investment plan to see asset allocation.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="w-full h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={assetAlloc}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="amount"
                      stroke="none"
                    >
                      {assetAlloc.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color || '#106354'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `₹${(val || 0).toLocaleString('en-IN')}`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Portfolio</span>
                  <span className="text-sm font-bold text-[#12241F]">
                    {formatCurrency((Number(overview.totalInvested) || 0) + (Number(overview.walletBalance) || 0))}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {assetAlloc.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#106354' }}></div>
                      <span className="font-bold text-gray-800">{item.category}</span>
                    </div>
                    <div className="text-right font-bold text-gray-900">
                      <span>{formatCurrency(item.amount)}</span>
                      <span className="text-gray-400 font-normal ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 4. INVESTMENT PERFORMANCE & 6. CASH FLOW ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Investment Performance Analytics Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-[#12241F]">Investment Performance</h3>
              <p className="text-xs text-gray-500">Database-backed active portfolio analytics</p>
            </div>
            <Link to="/profile/investpage" className="text-xs font-bold text-[#106354] hover:underline">
              Investment Details →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Invested</p>
              <p className="text-lg font-bold text-[#12241F]">{formatCurrency(portfolioPerf.investedAmount)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Current Value</p>
              <p className="text-lg font-bold text-emerald-700">{formatCurrency(portfolioPerf.currentValue)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Profit / Loss</p>
              <p className="text-lg font-bold text-emerald-600">+{formatCurrency(portfolioPerf.profitLoss)}</p>
            </div>
          </div>

          {portfolioPerf.activeInvestmentCount === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <PieChart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-600 text-sm">No active investments</p>
              <p className="text-xs text-gray-400 mt-1">Explore our database-backed investment plans to start growing your wealth.</p>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-900">Total Portfolio Return Rate</p>
                <p className="text-xs text-emerald-700 mt-0.5">{portfolioPerf.activeInvestmentCount} active plans contributing to returns</p>
              </div>
              <div className="text-xl font-black text-emerald-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-200">
                +{portfolioPerf.returnPercentage}%
              </div>
            </div>
          )}
        </div>

        {/* Cash Flow Analytics */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-[#12241F]">Cash Flow Analytics</h3>
              <p className="text-xs text-gray-500">Money in vs Money out from transaction logs</p>
            </div>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">Last 6 Months</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <p className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1">Total Inflow</p>
              <p className="text-lg font-bold text-emerald-700">{formatCurrency(cashFlow.totalInflow)}</p>
            </div>
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
              <p className="text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-1">Total Outflow</p>
              <p className="text-lg font-bold text-amber-700">{formatCurrency(cashFlow.totalOutflow)}</p>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <p className="text-blue-800 text-[10px] font-bold uppercase tracking-wider mb-1">Net Flow</p>
              <p className="text-lg font-bold text-blue-700">{formatCurrency(cashFlow.netCashFlow)}</p>
            </div>
          </div>

          <div className="w-full h-48">
            {(!cashFlow.monthlyData || cashFlow.monthlyData.length === 0) ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Activity className="w-8 h-8 text-gray-300 mb-2" />
                <p className="font-bold text-gray-600 text-xs">No transaction history yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlow.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip formatter={(v) => `₹${(v || 0).toLocaleString('en-IN')}`} />
                  <Bar dataKey="inflow" fill="#106354" radius={[4, 4, 0, 0]} name="Money In" />
                  <Bar dataKey="outflow" fill="#C47D57" radius={[4, 4, 0, 0]} name="Money Out" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 7. LOAN ANALYTICS & 9. FINANCIAL HEALTH INDICATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Loan Analytics */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-[#12241F]">Loan Analytics</h3>
              <p className="text-xs text-gray-500">Summary of active loans and repayment progress</p>
            </div>
            <Link to="/profile/loans" className="text-xs font-bold text-[#106354] hover:underline">
              Loan Portal →
            </Link>
          </div>

          {loanAnalytics.activeLoanCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <FileText className="w-10 h-10 text-gray-300 mb-2" />
              <p className="font-bold text-gray-600 text-sm">No Active Loans</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">You currently have no active loan balances or outstanding EMIs.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Borrowed</p>
                  <p className="text-base font-bold text-[#12241F]">{formatCurrency(loanAnalytics.totalBorrowed)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Repaid</p>
                  <p className="text-base font-bold text-emerald-700">{formatCurrency(loanAnalytics.totalRepaid)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Outstanding</p>
                  <p className="text-base font-bold text-amber-700">{formatCurrency(loanAnalytics.outstandingBalance)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Active Loans</p>
                  <p className="text-base font-bold text-[#12241F]">{loanAnalytics.activeLoanCount}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-600">Repayment Progress</span>
                  <span className="text-[#106354]">{loanAnalytics.repaymentPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-[#106354] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(Number(loanAnalytics.repaymentPercentage || 0), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Financial Health Indicator Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-[#12241F]">Financial Health Indicator</h3>
              <p className="text-xs text-gray-500">Calculated transparently from your active portfolio</p>
            </div>
            <Award className="w-5 h-5 text-[#887333]" />
          </div>

          {!health.hasEnoughData ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-600 text-sm">{health.statusMessage || "Financial health will be available after more activity."}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-6 bg-gradient-to-r from-[#12241F] to-[#05231e] text-white p-6 rounded-2xl shadow-md">
                <div className="w-20 h-20 rounded-2xl bg-[#106354] border border-white/20 flex flex-col items-center justify-center font-black text-2xl shadow-inner">
                  <span>{health.score}</span>
                  <span className="text-[10px] text-emerald-300 font-normal">/ 100</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white mb-1">Financial Health Score</h4>
                  <p className="text-xs text-gray-300">{health.statusMessage}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                  <span className="text-gray-500 font-semibold">Diversification</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">{health.diversification}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                  <span className="text-gray-500 font-semibold">Loan Utilization</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">{health.loanUtilization}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                  <span className="text-gray-500 font-semibold">EMI Consistency</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">{health.emiConsistency}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                  <span className="text-gray-500 font-semibold">Cash Flow Health</span>
                  <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">{health.cashFlowHealth}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 10. INVESTMENT GROWTH PROJECTION */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-[#12241F]">Investment Growth Projection</h3>
            <p className="text-xs text-gray-500">Estimated future returns calculated from your active investment rate</p>
          </div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Estimated projection — actual returns may vary.
          </span>
        </div>

        {!projection.hasProjections ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Calculator className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-600 text-sm">Projection unavailable</p>
            <p className="text-xs text-gray-400 mt-1">Start an active investment plan to calculate future growth projections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">6 Months Estimated Value</p>
              <p className="text-2xl font-black text-[#106354]">{formatCurrency(projection.sixMonths)}</p>
              <p className="text-xs text-gray-500">Based on configured {projection.returnRate}% return rate</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">1 Year Estimated Value</p>
              <p className="text-2xl font-black text-[#106354]">{formatCurrency(projection.oneYear)}</p>
              <p className="text-xs text-gray-500">Based on configured {projection.returnRate}% return rate</p>
            </div>
            <div className="p-6 bg-[#12241F] text-white rounded-2xl space-y-2 shadow-md">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">5 Years Estimated Value</p>
              <p className="text-2xl font-black text-white">{formatCurrency(projection.fiveYears)}</p>
              <p className="text-xs text-gray-300">Compounded return projection</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerFinancialAnalyticsDashboard;
