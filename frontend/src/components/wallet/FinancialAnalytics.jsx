import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

const fetchHistory = async () => {
  try {
    const res = await api.get('/wallet/me/history');
    return res.data || [];
  } catch (e) {
    return [];
  }
};

const FinancialAnalytics = () => {
  const [filter, setFilter] = useState('1Y');

  const { data: portfolioHistory = [], isLoading } = useQuery({
    queryKey: ['walletHistory'],
    queryFn: fetchHistory,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div>Loading history...</div>;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#12241F] mb-1">Portfolio Performance</h3>
          <p className="text-gray-500 text-sm">Growth over time including bonus and returns</p>
        </div>
        <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-100">
          {['1W', '1M', '3M', '1Y', 'ALL'].map(t => (
            <button 
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === t ? 'bg-white shadow-sm text-[#12241F]' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Return</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#12241F]">₹0</span>
            <span className="flex items-center text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">0.0%</span>
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Best Asset</p>
          <p className="text-lg font-bold text-[#12241F]">N/A</p>
          <p className="text-xs text-gray-400 font-semibold mt-1">No data</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Bonus Contribution</p>
          <p className="text-lg font-bold text-[#12241F]">₹0</p>
          <p className="text-xs text-gray-400 font-semibold mt-1">0% of Portfolio</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Value</p>
          <p className="text-xl font-bold text-[#12241F]">₹0</p>
          <p className="text-xs text-gray-400 font-semibold mt-1">No investments yet</p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-72">
        {portfolioHistory.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
            <TrendingUp className="w-8 h-8 text-gray-300 mb-3" />
            <p className="font-bold text-gray-500 mb-1">No performance data</p>
            <p className="text-sm text-gray-400">Once you start investing, your portfolio growth will appear here.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioHistory} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4E8B83" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4E8B83" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val/1000}k`} dx={-10} />
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <Tooltip 
                formatter={(value) => [`₹${(value || 0).toLocaleString('en-IN')}`, 'Portfolio Value']}
                labelStyle={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: 'bold', color: '#12241F' }}
              />
              <Area type="monotone" dataKey="value" stroke="#4E8B83" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default FinancialAnalytics;
