import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../shared/api/axios';

const fetchAllocation = async () => {
  try {
    const res = await api.get('/wallet/me/allocation');
    return Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    return [];
  }
};

const PortfolioAllocation = () => {
  const { data: rawAllocation = [], isLoading } = useQuery({
    queryKey: ['walletAllocation'],
    queryFn: fetchAllocation,
    staleTime: 1000 * 60 * 5,
  });

  const portfolioAllocation = Array.isArray(rawAllocation) ? rawAllocation : [];

  if (isLoading) return <div>Loading allocation...</div>;
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
      <h3 className="text-xl font-bold text-[#12241F] mb-6">Asset Allocation</h3>
      
      {portfolioAllocation.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <PieChart className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-bold text-gray-500 mb-2">No assets allocated yet</p>
          <p className="text-sm text-gray-400">Add funds and start investing to see your portfolio breakdown here.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Donut Chart */}
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={portfolioAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {portfolioAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#4E8B83'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `₹${(value || 0).toLocaleString('en-IN')}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total</span>
              <span className="text-lg font-bold text-[#12241F]">
                ₹{portfolioAllocation.reduce((a, b) => a + (b?.value || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Legend List */}
          <div className="flex-1 w-full flex flex-col gap-3">
            {portfolioAllocation.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#4E8B83' }}></div>
                  <div>
                    <p className="text-sm font-bold text-[#12241F]">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#12241F]">₹{(item.value || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioAllocation;
