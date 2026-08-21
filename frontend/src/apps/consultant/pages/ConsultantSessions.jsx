import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar, Clock, Eye } from 'lucide-react';
import api from '../../../shared/api/axios';

const ConsultantSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/consultant/sessions');
      if (Array.isArray(response.data)) {
        setSessions(response.data);
      } else if (response.data?.success) {
        setSessions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const isCompleted = status === 'COMPLETED';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
        isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-[#e0f2fe] text-[#0369a1]'
      }`}>
        {isCompleted ? 'COMPLETED' : 'SCHEDULED'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b4d3e]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
          <p className="text-xs text-gray-500 mt-1">Manage your assigned consultation sessions and submit completion reports.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50/60 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Topic</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-xs font-medium">
                    No consultation sessions assigned yet.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => {
                  const consultation = session.assignment?.consultation;
                  const clientName = consultation?.user?.name || consultation?.user?.username || 'Client';
                  const topic = consultation?.type || 'General Consultation';

                  return (
                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {topic}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {clientName}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{consultation?.preferredDate ? new Date(consultation.preferredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 font-medium text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{consultation?.preferredTime || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/consultant/sessions/${session.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#1b4d3e] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-xl transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConsultantSessions;
