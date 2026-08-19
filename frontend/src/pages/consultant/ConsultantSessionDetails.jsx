import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Calendar, Clock, User, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const ConsultantSessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [clientHistory, setClientHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSessionDetails();
  }, [id]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/consultant/sessions`);
      const allSessions = Array.isArray(response.data) ? response.data : (response.data?.success ? response.data.data : []);
      const found = allSessions.find(s => s.id.toString() === id);
      setSession(found);
      setReport(found?.report || '');

      if (found) {
        const clientId = found.assignment?.consultation?.user?.id;
        if (clientId) {
          const history = allSessions.filter(s => 
            s.assignment?.consultation?.user?.id === clientId && s.id.toString() !== id
          );
          setClientHistory(history);
        }
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setSaving(true);
      if (newStatus === 'COMPLETED') {
        const response = await api.patch(`/consultant/sessions/${id}/complete`);
        if (response.status === 200 || response.data?.success) {
          toast.success(`Session marked as ${newStatus}`);
          setSession({ ...session, status: newStatus });
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReport = async () => {
    try {
      setSaving(true);
      const response = await api.post(`/consultant/sessions/${id}/notes`, { 
        content: report,
        noteType: 'GENERAL' 
      });
      if (response.status === 200 || response.data?.success) {
        toast.success('Report saved successfully');
        setSession({ ...session, report });
      }
    } catch (error) {
      toast.error('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E8B83]"></div></div>;
  }

  if (!session) {
    return <div className="text-center py-12 text-gray-500">Session not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Session Details</h1>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {session.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Client Information</h2>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{session.assignment?.consultation?.user?.name || 'Unknown'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Topic</p>
              <p className="font-medium">{session.assignment?.consultation?.type || 'General'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Client Message</p>
            <p className="p-3 bg-gray-50 rounded-lg text-sm">{session.assignment?.consultation?.message || 'No message provided.'}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Meeting Details</h2>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{session.assignment?.consultation?.preferredDate ? new Date(session.assignment.consultation.preferredDate).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{session.assignment?.consultation?.preferredTime || 'N/A'}</p>
            </div>
          </div>
          {session.meetingLink && (
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Meeting Link</p>
                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-[#4E8B83] hover:underline font-medium break-all">
                  {session.meetingLink}
                </a>
              </div>
            </div>
          )}

          {session.status !== 'COMPLETED' && (
            <div className="pt-4">
              <button
                onClick={() => handleUpdateStatus('COMPLETED')}
                disabled={session.status !== 'ACCEPTED' || saving}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  session.status !== 'ACCEPTED' || saving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#4E8B83] text-white hover:bg-[#3A6B65]'
                }`}
                title={session.status !== 'ACCEPTED' ? 'Session must be ACCEPTED first' : ''}
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Completed
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Consultation Report</h2>
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          disabled={session.status !== 'ACCEPTED'}
          placeholder={session.status === 'ACCEPTED' ? "Enter your notes and recommendations from the session..." : "You can only write a report after accepting the session."}
          className={`w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4E8B83] focus:border-transparent resize-none ${
            session.status !== 'ACCEPTED' ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''
          }`}
        />
        <div className="flex justify-end">
          <button
            onClick={handleSaveReport}
            disabled={session.status !== 'ACCEPTED' || saving}
            className={`px-6 py-2 rounded-xl transition-colors ${
              session.status !== 'ACCEPTED' || saving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {saving ? 'Saving...' : 'Save Report'}
          </button>
        </div>
      </div>

      {clientHistory.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Previous Sessions with this Client</h2>
          <div className="space-y-4">
            {clientHistory.map(pastSession => (
              <div key={pastSession.id} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{pastSession.assignment?.consultation?.type || 'General'}</div>
                  <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {pastSession.assignment?.consultation?.preferredDate ? new Date(pastSession.assignment.consultation.preferredDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                    {pastSession.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantSessionDetails;
