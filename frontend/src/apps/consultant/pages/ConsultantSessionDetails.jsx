import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, Calendar, Clock, User, ArrowLeft, FileText, CheckCircle, 
  Lock, AlertTriangle, MessageSquare, ShieldCheck 
} from 'lucide-react';
import api from '../../../shared/api/axios';
import { toast } from 'react-hot-toast';

const ConsultantSessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [clientHistory, setClientHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState('');
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
      setReport(found?.report || found?.assignment?.notes || '');

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

  const handleConfirmSubmitReport = async () => {
    if (!report.trim()) {
      toast.error('Please enter the report details before submitting.');
      return;
    }

    try {
      setSaving(true);
      // 1. Save Report / Notes
      await api.post(`/consultant/sessions/${id}/notes`, { 
        content: report,
        noteType: 'GENERAL' 
      });

      // 2. Mark Session as Completed
      await api.patch(`/consultant/sessions/${id}/complete`);

      toast.success('Consultation report submitted & session marked as COMPLETED.');
      setSession({ ...session, status: 'COMPLETED', report });
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast.error(error.response?.data?.message || 'Failed to finalize report.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b4d3e]"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12 text-gray-500">
        Session not found.
      </div>
    );
  }

  const consultation = session.assignment?.consultation;
  const clientUser = consultation?.user;
  const isCompleted = session.status === 'COMPLETED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/consultant/sessions')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Consultation Session #{session.id}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Session Overview and Consultation Completion Report</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
          isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {isCompleted ? 'COMPLETED' : 'SCHEDULED'}
        </span>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Details */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-[#1b4d3e]" />
            Client Details
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-400 font-medium">Customer Name</p>
              <p className="font-bold text-gray-900 mt-0.5">{clientUser?.name || 'N/A'}</p>
            </div>

            <div>
              <p className="text-gray-400 font-medium">Customer ID</p>
              <p className="font-bold text-emerald-700 mt-0.5">{clientUser?.customerId || `CUS10${clientUser?.id || ''}`}</p>
            </div>

            <div>
              <p className="text-gray-400 font-medium">Username / Email</p>
              <p className="font-semibold text-gray-800 mt-0.5 truncate">{clientUser?.username || clientUser?.email || 'N/A'}</p>
            </div>

            <div>
              <p className="text-gray-400 font-medium">Consultation Type</p>
              <p className="font-bold text-indigo-700 mt-0.5 capitalize">{consultation?.type || consultation?.communicationMethod || 'Audio Call'}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-1">Client Message / Notes</p>
            <p className="p-3 bg-gray-50 rounded-xl text-xs font-medium text-gray-700 leading-relaxed border border-gray-100">
              {consultation?.message || 'No specific notes provided by client.'}
            </p>
          </div>
        </div>

        {/* Session & Meeting Details */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1b4d3e]" />
            Meeting Schedule
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-400 font-medium">Date</p>
                <p className="font-bold text-gray-900 mt-0.5">
                  {consultation?.preferredDate ? new Date(consultation.preferredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-400 font-medium">Time Slot</p>
                <p className="font-bold text-gray-900 mt-0.5">{consultation?.preferredTime || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs">
              <Video className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <p className="text-gray-400 font-medium">Communication Channel</p>
                <p className="font-bold text-purple-900 capitalize">{consultation?.communicationMethod || 'Video Call'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Completion Report Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1b4d3e]" />
            Consultation Report
          </h2>
          {isCompleted && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-gray-200">
              <Lock className="w-3.5 h-3.5 text-gray-500" />
              Report Finalized (Read Only)
            </span>
          )}
        </div>

        {/* Warning Banner before submission */}
        {!isCompleted && (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Important Notice</p>
              <p className="text-amber-800 mt-0.5 font-medium">
                Once you submit this consultation report, the session will be marked as <strong className="text-amber-900">COMPLETED</strong> and this report <strong className="underline">CANNOT BE EDITED</strong>. Please review your entry carefully.
              </p>
            </div>
          </div>
        )}

        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          disabled={isCompleted}
          placeholder={isCompleted ? "Consultation report has been submitted and locked." : "Enter your consultation findings, financial advice, and recommended next steps for the client..."}
          className={`w-full h-40 p-4 border rounded-xl text-xs leading-relaxed font-medium transition-all ${
            isCompleted 
              ? 'bg-gray-50 text-gray-700 border-gray-200 cursor-not-allowed' 
              : 'border-gray-200 focus:ring-2 focus:ring-[#1b4d3e] focus:border-transparent'
          }`}
        />

        {!isCompleted && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                if (!report.trim()) {
                  toast.error('Please write a consultation report first.');
                  return;
                }
                setShowConfirmModal(true);
              }}
              disabled={saving}
              className="px-6 py-2.5 bg-[#1b4d3e] hover:bg-[#153a2f] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Submit Report & Complete Session
            </button>
          </div>
        )}
      </div>

      {/* Warning Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-amber-100">
            <div className="flex items-center gap-3 text-amber-700 border-b border-amber-100 pb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold">Confirm Report Submission</h3>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed font-medium bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
              Are you sure you want to submit this consultation report?
              <br /><br />
              <strong className="text-red-700">Warning: Once submitted, you CANNOT edit or alter this report.</strong> The session status will be permanently changed to <strong>COMPLETED</strong>.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Go Back & Edit
              </button>
              <button
                onClick={handleConfirmSubmitReport}
                disabled={saving}
                className="px-5 py-2.5 bg-[#1b4d3e] hover:bg-[#153a2f] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Submitting...' : 'Yes, Confirm & Finalize'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantSessionDetails;
