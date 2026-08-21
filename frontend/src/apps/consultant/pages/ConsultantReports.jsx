import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, BarChart2, FileText, Calendar } from 'lucide-react';
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
        api.get('/consultant/dashboard').catch(() => ({ data: {} })),
        api.get('/consultant/sessions').catch(() => ({ data: [] }))
      ]);

      const fetchedSessions = Array.isArray(sessRes.data) 
        ? sessRes.data 
        : (sessRes.data?.success ? sessRes.data.data : []);

      setSessions(fetchedSessions);

      // Compute live stats directly from sessions list as robust source of truth
      const total = fetchedSessions.length;
      const completed = fetchedSessions.filter(s => s.status === 'COMPLETED').length;
      const upcoming = fetchedSessions.filter(s => s.status !== 'COMPLETED').length;
      const pending = fetchedSessions.filter(s => s.status !== 'COMPLETED').length;

      setStats({
        totalSessions: dashRes.data?.stats?.totalSessions || total,
        completedSessions: dashRes.data?.stats?.completedSessions || completed,
        upcomingSessions: dashRes.data?.stats?.upcomingSessions || upcoming,
        pendingReports: dashRes.data?.stats?.pendingReports || pending
      });
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b4d3e]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-xs text-gray-500 mt-0.5">Session performance and activity overview</p>
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

      {/* Recent Sessions Activity Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1b4d3e]" />
          <h2 className="text-base font-bold text-gray-900">Recent Session Activity</h2>
        </div>
        {sessions.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-xs">
            No sessions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 text-left">Customer</th>
                  <th className="px-6 py-3.5 text-left">Date & Time</th>
                  <th className="px-6 py-3.5 text-left">Type</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.slice(0, 10).map((s, i) => {
                  const consultation = s.assignment?.consultation;
                  const customerName = s.customerName || consultation?.user?.name || consultation?.user?.username || 'Client';
                  const dateStr = s.scheduledDate || consultation?.preferredDate;
                  const timeStr = consultation?.preferredTime;
                  const type = s.type || consultation?.type || consultation?.communicationMethod || 'Consultation';
                  const isCompleted = s.status === 'COMPLETED';

                  return (
                    <tr key={s.id || i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-gray-900">{customerName}</td>
                      <td className="px-6 py-3.5 text-gray-600 font-medium">
                        {dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        {timeStr ? ` (${timeStr})` : ''}
                      </td>
                      <td className="px-6 py-3.5 text-indigo-700 font-semibold capitalize">{type}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isCompleted ? 'COMPLETED' : 'SCHEDULED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantReports;
