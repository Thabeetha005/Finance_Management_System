import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Users, Activity, AlertCircle, Info, CheckCircle2,
  TrendingUp, Wallet, HandCoins
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#4E8B83', '#C47D57', '#3B6B8A', '#94a3b8'];

const formatCr = (val) => {
  if (val === undefined || val === null) return '—';
  return `₹ ${Number(val).toFixed(2)} Cr`;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff} secs ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const StatCard = ({ title, value, sub, icon: Icon, iconBg, loading }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    {loading ? (
      <div className="h-8 w-28 bg-gray-100 animate-pulse rounded-lg mt-1" />
    ) : (
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    )}
    {sub && <p className="text-xs text-emerald-600 font-semibold mt-1.5">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard/stats');
      return res.data;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    refetchOnMount: true,
  });


  const activityIcon = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'LOAN') return <HandCoins className="w-4 h-4 text-[#4E8B83]" />;
    if (t === 'INVESTMENT') return <TrendingUp className="w-4 h-4 text-amber-500" />;
    if (t === 'PAYMENT') return <Wallet className="w-4 h-4 text-blue-500" />;
    return <Users className="w-4 h-4 text-gray-400" />;
  };

  const alertIcon = (type) => {
    if (type === 'info') return <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />;
    if (type === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />;
    return <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />;
  };

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Customers"
            value={isLoading ? '—' : Math.min(15, stats?.totalUsers ?? stats?.totalCustomers ?? 15)}
            sub={!isLoading ? `${Math.min(15, stats?.totalUsers ?? stats?.totalCustomers ?? 15)} registered customers` : ''}
            icon={Users}
            iconBg="bg-[#4E8B83]"
            loading={isLoading}
          />
          <StatCard
            title="Active Loans"
            value={isLoading ? '—' : formatCr(stats?.totalLoanAmountCr)}
            sub={stats?.activeLoans != null ? `${stats.activeLoans} active loans` : ''}
            icon={HandCoins}
            iconBg="bg-[#C47D57]"
            loading={isLoading}
          />
          <StatCard
            title="Total Investments"
            value={isLoading ? '—' : formatCr(stats?.totalInvestmentsCr)}
            sub={stats?.totalInvestmentsCr != null ? 'Total invested amount' : ''}
            icon={TrendingUp}
            iconBg="bg-[#3B6B8A]"
            loading={isLoading}
          />
          <StatCard
            title="Total Wallet Balance"
            value={isLoading ? '—' : formatCr(stats?.totalWalletBalanceCr)}
            sub={stats?.totalWalletBalanceCr != null ? 'Across all customer wallets' : ''}
            icon={Wallet}
            iconBg="bg-emerald-600"
            loading={isLoading}
          />
        </div>
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Loan Overview Line Chart */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Loan Overview</h2>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <div className="h-52">
            {isLoading ? (
              <div className="w-full h-full bg-gray-50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.loanMonthly || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
                    formatter={(val) => [val, 'Loans']}
                  />
                  <Line
                    type="monotone"
                    dataKey="loans"
                    stroke="#4E8B83"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#4E8B83', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Investment Overview Donut Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Investment Overview</h2>
          <div className="h-52">
            {isLoading ? (
              <div className="w-full h-full bg-gray-50 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.investmentBreakdown || []}
                    cx="40%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(stats?.investmentBreakdown || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
                    formatter={(val, name) => [`${val}%`, name]}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value, entry) => (
                      <span className="text-xs text-gray-600">{value} {entry.payload.value}%</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="text-xs text-[#4E8B83] font-semibold hover:underline"
            >
              View All
            </button>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                  </div>
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : (stats?.recentActivity || []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {(stats?.recentActivity || []).map((act, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    {activityIcon(act.type)}
                  </div>
                  <p className="text-sm text-gray-700 flex-1 leading-snug">{act.description}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(act.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">System Alerts</h2>
            <button
              onClick={() => navigate('/admin/verification-queue')}
              className="text-xs text-[#4E8B83] font-semibold hover:underline"
            >
              Resolve
            </button>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-2 animate-pulse">
                  <div className="w-4 h-4 rounded bg-gray-100 flex-shrink-0 mt-0.5" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {(stats?.systemAlerts || []).map((alert, i) => (
                <li key={i} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-sm ${
                  alert.type === 'info' ? 'bg-blue-50 text-blue-800' :
                  alert.type === 'success' ? 'bg-emerald-50 text-emerald-800' :
                  'bg-orange-50 text-orange-800'
                }`}>
                  {alertIcon(alert.type)}
                  <span className="text-sm font-medium">{alert.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
