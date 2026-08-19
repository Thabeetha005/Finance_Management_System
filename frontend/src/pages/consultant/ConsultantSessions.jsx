import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar, Clock, Eye, Check, X } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

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

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/consultant/sessions/${id}/${action}`);
      toast.success(`Session ${action}ed successfully`);
      fetchSessions();
    } catch (error) {
      console.error(`Failed to ${action} session:`, error);
      toast.error(`Failed to ${action} session`);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'REQUESTED': 'bg-yellow-100 text-yellow-800',
      'SCHEDULED': 'bg-blue-100 text-blue-800',
      'ACCEPTED': 'bg-green-100 text-green-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-purple-100 text-purple-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E8B83]"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
          <p className="text-gray-500 mt-1">Manage your upcoming and past consultation sessions</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50/50 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">Topic</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No sessions found
                  </td>
                </tr>
              ) : (
                sessions.map((session) => {
                  const consultation = session.assignment?.consultation;
                  return (
                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{consultation?.type || 'General'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {consultation?.user?.name || 'Unknown Client'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{consultation?.preferredDate ? new Date(consultation.preferredDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{consultation?.preferredTime || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {session.status === 'REQUESTED' || session.status === 'PENDING' || session.status === 'SCHEDULED' ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAction(session.id, 'accept'); }}
                              className="relative z-10 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAction(session.id, 'reject'); }}
                              className="relative z-10 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        ) : null}
                        <Link 
                          to={`/consultant/sessions/${session.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#4E8B83] bg-[#4E8B83]/10 rounded-lg hover:bg-[#4E8B83]/20 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
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
