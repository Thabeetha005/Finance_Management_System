import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Briefcase, Calendar, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const AdminConsultantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultant, setConsultant] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [deleteModalStep, setDeleteModalStep] = useState(0);
  const [deletionReason, setDeletionReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchConsultantDetails();
  }, [id]);

  const fetchConsultantDetails = async () => {
    try {
      setLoading(true);
      const [consultantRes, sessionsRes] = await Promise.all([
        api.get(`/admin/consultants/${id}`),
        api.get(`/admin/consultants/${id}/sessions`)
      ]);
      if (consultantRes.data?.success) {
        setConsultant(consultantRes.data.data);
      } else if (consultantRes.data) {
         setConsultant(consultantRes.data);
      }
      if (sessionsRes.data) {
        setSessions(sessionsRes.data);
      }
      
      const userId = consultantRes.data?.data?.user?.id || consultantRes.data?.user?.id;
      if (userId) {
        try {
          const notifRes = await api.get(`/admin/users/${userId}/messages`);
          setNotifications(notifRes.data || []);
        } catch (e) {
          console.error('Failed to load notifications', e);
        }
      }
    } catch (error) {
      console.error('Failed to fetch consultant:', error);
      setErrorMsg(error.message + (error.response ? ` - ${JSON.stringify(error.response.data)}` : ''));
      toast.error(`Failed to load consultant details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!deletionReason.trim()) return;
    try {
      setDeleting(true);
      await api.delete(`/admin/consultants/${id}?reason=${encodeURIComponent(deletionReason.trim())}`);
      toast.success('Consultant permanently deleted successfully.');
      navigate('/admin/consultants');
    } catch (error) {
      console.error('Failed to delete consultant:', error);
      toast.error(error.response?.data?.message || 'Failed to delete consultant');
      setDeleting(false);
      setDeleteModalStep(0);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4E8B83]"></div>
      </div>
    );
  }

  if (!consultant) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="mb-2">No consultant data found or an error occurred. (ID: {id})</p>
        {errorMsg && <p className="text-red-500 font-mono text-sm bg-red-50 p-4 rounded-lg inline-block text-left whitespace-pre-wrap">{errorMsg}</p>}
        <div className="mt-6">
          <button onClick={() => navigate('/admin/consultants')} className="text-[#4E8B83] underline">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Consultant Profile</h1>
        <button
          onClick={() => {
            setDeletionReason('');
            setDeleteModalStep(1);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm cursor-pointer"
        >
          <XCircle className="w-4 h-4" />
          Delete Account
        </button>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-4xl flex-shrink-0">
            {(consultant.user?.name?.[0] || consultant.name?.[0] || 'C').toUpperCase()}
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{consultant.user?.name || consultant.name || 'Unknown Consultant'}</h2>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                consultant.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {consultant.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium text-gray-900">{consultant.user?.email || consultant.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Specialization</p>
                  <p className="font-medium text-gray-900">{consultant.specialization || 'General Financial Advisory'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="font-medium text-gray-900">
                    {consultant.createdAt ? new Date(consultant.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {consultant.bio && (
              <div>
                <h3 className="text-sm text-gray-500 mb-2">Biography</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{consultant.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mt-8 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'upcoming' ? 'border-[#4E8B83] text-[#4E8B83]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Upcoming Sessions
        </button>
        <button
          onClick={() => setActiveTab('ended')}
          className={`pb-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'ended' ? 'border-[#4E8B83] text-[#4E8B83]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Ended Sessions
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'notifications' ? 'border-[#4E8B83] text-[#4E8B83]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Notifications
        </button>
      </div>

      {activeTab === 'upcoming' && (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Upcoming Scheduled Sessions</h3>
          {sessions.filter(s => s.status !== 'COMPLETED').length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming sessions scheduled.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Client Name</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Time</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {sessions.filter(s => s.status !== 'COMPLETED').map(session => (
                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {session.assignment?.consultation?.user?.name || 'Unknown Client'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {session.assignment?.consultation?.preferredDate}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {session.assignment?.consultation?.preferredTime}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          session.status === 'SCHEDULED' ? 'bg-emerald-100 text-emerald-700' : 
                          session.status === 'REQUESTED' ? 'bg-amber-100 text-amber-700' : 
                          session.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ended' && (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Ended Sessions</h3>
          {sessions.filter(s => s.status === 'COMPLETED').length === 0 ? (
            <p className="text-gray-500 text-sm">No ended sessions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Client Name</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Time</th>
                    <th className="px-6 py-4 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {sessions.filter(s => s.status === 'COMPLETED').map(session => (
                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {session.assignment?.consultation?.user?.name || 'Unknown Client'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {session.assignment?.consultation?.preferredDate}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {session.assignment?.consultation?.preferredTime}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700">COMPLETED</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No notifications found.</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((msg, i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">{msg.type || msg.messageType}</span>
                      <h4 className="font-bold text-gray-900 inline">{msg.subject}</h4>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message || msg.body || msg.messageContent}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs font-medium ${msg.isRead ? "text-emerald-600" : "text-gray-500"}`}>
                      {msg.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* 2-STEP CONSULTANT DELETION CONFIRMATION MODAL */}
      {deleteModalStep > 0 && consultant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 border border-gray-100">
            {/* STEP 1: Enter Mandatory Reason */}
            {deleteModalStep === 1 && (
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-xl font-bold text-gray-900">Delete Consultant?</h3>
                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    Consultant: <span className="font-bold text-red-700">{consultant.user?.name || consultant.name}</span>
                  </p>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed bg-amber-50 p-3 rounded-2xl border border-amber-200">
                  This action will deactivate the consultant and permanently remove their account and associated records.
                </p>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Deletion Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    placeholder="Enter reason for deactivation/deletion..."
                    className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteModalStep(0)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!deletionReason.trim()}
                    onClick={() => setDeleteModalStep(2)}
                    className={`px-5 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-md ${
                      deletionReason.trim()
                        ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Final Confirmation */}
            {deleteModalStep === 2 && (
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-xl font-bold text-red-700">Confirm Permanent Deletion</h3>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    Consultant: <span className="font-bold">{consultant.user?.name || consultant.name}</span>
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-xs space-y-1">
                  <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Reason</p>
                  <p className="text-gray-900 italic font-medium">"{deletionReason.trim()}"</p>
                </div>

                <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-800 font-semibold leading-relaxed">
                  ⚠️ Warning: This consultant will be deactivated and their account will be permanently removed from the system.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteModalStep(1)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                  >
                    Go Back
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleConfirmPermanentDelete}
                    className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs transition-all shadow-lg cursor-pointer"
                  >
                    {deleting ? 'Deactivating & Deleting...' : 'Deactivate & Delete Permanently'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminConsultantDetails;
