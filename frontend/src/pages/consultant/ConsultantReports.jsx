import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/axios';

const ConsultantReports = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    pendingReports: 0
  });
  const [loading, setLoading] = useState(true);

  // Assuming a fixed earning rate per session for now
  const EARNING_PER_SESSION = 150;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/consultant/dashboard');
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E8B83]"></div></div>;
  }

  const totalEarnings = stats.completedSessions * EARNING_PER_SESSION;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Earnings & Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900">${totalEarnings.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Completed Sessions</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900">{stats.completedSessions}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Avg. Per Session</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900">${EARNING_PER_SESSION}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pending Reports</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900">{stats.pendingReports}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Payout History (Mock)</h2>
        <div className="text-center py-12 text-gray-500">
          Future feature: Payout history will be displayed here once connected to a payment gateway.
        </div>
      </div>
    </div>
  );
};

export default ConsultantReports;
