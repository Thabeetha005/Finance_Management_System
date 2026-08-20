import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CheckCircle, Banknote, ArrowUpRight, Star } from 'lucide-react';
import api from '../../../shared/api/axios';

const EARNING_PER_SESSION = 150;

const ConsultantEarnings = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    pendingReports: 0
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, profileRes] = await Promise.all([
        api.get('/consultant/dashboard'),
        api.get('/consultant/dashboard/profile').catch(() => ({ data: null }))
      ]);
      if (dashRes.data?.stats) setStats(dashRes.data.stats);
      if (profileRes.data) setProfile(profileRes.data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E8B83]"></div>
      </div>
    );
  }

  const totalEarnings = stats.completedSessions * EARNING_PER_SESSION;
  const monthlyEstimate = Math.round(totalEarnings / 12);
  const avgPerSession = EARNING_PER_SESSION;

  const earningsBreakdown = [
    { label: 'This Month (Est.)', amount: monthlyEstimate, note: 'Based on completed sessions' },
    { label: 'Per Session Rate', amount: avgPerSession, note: 'Fixed consultation rate' },
    { label: 'Pending Payout', amount: 0, note: 'Will reflect after gateway setup' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your income summary and payout details</p>
        </div>
        {profile?.rating && (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1.5 text-sm font-semibold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {Number(profile.rating).toFixed(1)} Rating
          </div>
        )}
      </div>

      {/* Hero total card */}
      <div className="bg-gradient-to-br from-[#12241F] to-[#1e4037] rounded-2xl p-7 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-[#D4AF37]/10 rounded-full" />
        <div className="relative">
          <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-wider">Total Lifetime Earnings</p>
          <div className="flex items-end gap-3 mb-4">
            <h2 className="text-5xl font-extrabold tracking-tight">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </h2>
            <div className="flex items-center gap-1 text-green-400 text-sm font-semibold pb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+{stats.completedSessions} sessions</span>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-xs text-white/50">Completed Sessions</p>
              <p className="text-xl font-bold">{stats.completedSessions}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-xs text-white/50">Rate Per Session</p>
              <p className="text-xl font-bold">₹{EARNING_PER_SESSION}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-xs text-white/50">Upcoming Sessions</p>
              <p className="text-xl font-bold">{stats.upcomingSessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative">
            <div className="w-11 h-11 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Total Earnings</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{totalEarnings.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative">
            <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Completed Sessions</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.completedSessions}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative">
            <div className="w-11 h-11 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Avg. Per Session</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{avgPerSession}</h3>
          </div>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
          <Banknote className="w-4 h-4 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">Earnings Breakdown</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {earningsBreakdown.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>
              </div>
              <span className="text-base font-bold text-gray-900">₹{item.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Payout History</h2>
        <div className="text-center py-10 text-gray-400 text-sm flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
            <Banknote className="w-6 h-6 text-gray-300" />
          </div>
          <p>Payout history will appear here once connected to a payment gateway.</p>
        </div>
      </div>
    </div>
  );
};

export default ConsultantEarnings;
