import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, BarChart2, FileText, Calendar, TrendingUp } from 'lucide-react';
import api from '../../../shared/api/axios';

const ConsultantReports = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    pendingReports: 0
  });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, sessRes] = await Promise.all([
        api.get('/consultant/dashboard'),
        api.get('/consultant/sessions').catch(() => ({ data: [] }))
      ]);
      if (dashRes.data?.stats) setStats(dashRes.data.stats);
      if (Array.isArray(sessRes.data)) setSessions(sessRes.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
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

  const completionRate = stats.totalSessions > 0
    ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Session performance and activity overview</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative">
            <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
              <BarChart2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Total Sessions</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalSessions}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative">
            <div className="w-11 h-11 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Completed</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.completedSessions}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative">
            <div className="w-11 h-11 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Upcoming</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.upcomingSessions}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative">
            <div className="w-11 h-11 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Pending Reports</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingReports}</h3>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4E8B83]" />
            Session Completion Rate
          </h2>
          <span className="text-sm font-bold text-[#4E8B83]">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#4E8B83] to-[#D4AF37] h-3 rounded-full transition-all duration-700"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {stats.completedSessions} of {stats.totalSessions} sessions completed
        </p>
      </div>

      {/* Recent Sessions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">Recent Session Activity</h2>
        </div>
        {sessions.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-sm">
            No sessions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sessions.slice(0, 10).map((s, i) => (
                  <tr key={s.id || i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-800">{s.customerName || s.userName || '—'}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-3 text-gray-500 capitalize">{s.type || s.sessionType || 'Consultation'}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        s.status === 'SCHEDULED' || s.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                        s.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {s.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantReports;
