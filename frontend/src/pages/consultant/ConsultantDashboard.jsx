import React, { useState, useEffect } from 'react';
import { Video, Calendar, CheckCircle, Clock, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const ConsultantDashboard = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    pendingReports: 0
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashRes, profileRes] = await Promise.all([
          api.get('/consultant/dashboard'),
          api.get('/consultant/dashboard/profile')
        ]);
        if (dashRes.data?.stats) {
          setStats(dashRes.data.stats);
        }
        if (profileRes.data) {
          setProfile(profileRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleProfileUpdate = async (updates) => {
    try {
      setSaving(true);
      const res = await api.put('/consultant/dashboard/profile', updates);
      if (res.data) {
        setProfile(res.data);
        toast.success('Availability settings updated');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    { name: 'Total Sessions', value: stats.totalSessions, icon: Video, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Upcoming Sessions', value: stats.upcomingSessions, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Completed Sessions', value: stats.completedSessions, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Pending Reports', value: stats.pendingReports, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E8B83]"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consultant Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back. Here is an overview of your consultation sessions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {profile && (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Availability Settings</h2>
            <button
              onClick={() => handleProfileUpdate({ status: profile.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                profile.status === 'ACTIVE' 
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {profile.status === 'ACTIVE' ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5" />}
              {profile.status === 'ACTIVE' ? 'Status: Active (Available)' : 'Status: Inactive (Unavailable)'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
              <input
                type="text"
                value={profile.workingDays || ''}
                onChange={(e) => setProfile({ ...profile, workingDays: e.target.value })}
                placeholder="e.g. Mon - Fri"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4E8B83] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={profile.workingHoursStart || ''}
                onChange={(e) => setProfile({ ...profile, workingHoursStart: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4E8B83] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={profile.workingHoursEnd || ''}
                onChange={(e) => setProfile({ ...profile, workingHoursEnd: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4E8B83] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleProfileUpdate({
                workingDays: profile.workingDays,
                workingHoursStart: profile.workingHoursStart,
                workingHoursEnd: profile.workingHoursEnd
              })}
              disabled={saving}
              className="flex items-center gap-2 bg-[#4E8B83] hover:bg-[#3A6B64] text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantDashboard;
