import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { Video, Check, X, Clock, UserCheck, MoreVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ConsultationManagement = () => {
  const queryClient = useQueryClient();
  const [consultants, setConsultants] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, action: null, consId: null });
  const [modalData, setModalData] = useState({ reason: '', date: '', time: '', consultantId: '' });




  useEffect(() => {
    // Fetch consultants for assignment
    const fetchConsultants = async () => {
      try {
        const res = await api.get('/admin/consultants');
        if (Array.isArray(res.data)) {
          setConsultants(res.data.filter(c => c.isActive !== false));
        } else if (res.data?.success && Array.isArray(res.data.data)) {
          setConsultants(res.data.data.filter(c => c.isActive !== false));
        }
      } catch (err) {
        console.error("Failed to fetch consultants", err);
      }
    };
    fetchConsultants();
  }, []);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['adminConsultations'],
    queryFn: async () => {
      const res = await api.get('/admin/consultations');
      return res.data;
    }
  });

  const totalPages = Math.ceil(consultations.length / PAGE_SIZE);
  const paginatedConsultations = consultations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, payload }) => {
      if (action === 'APPROVE') return await api.patch(`/admin/consultations/${id}/approve`);
      if (action === 'DENY') return await api.patch(`/admin/consultations/${id}/reject`);
      if (action === 'RESCHEDULE') return await api.patch(`/admin/consultations/${id}/reschedule`, payload);
      if (action === 'ASSIGN') return await api.patch(`/admin/consultations/${id}/assign`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminConsultations']);
      toast.success('Consultation updated successfully');
    },
    onError: () => {
      toast.error('Failed to update consultation');
    }
  });

  const handleConfirmAction = () => {
    const { action, consId } = modalState;
    if (action === 'DENY') {
      actionMutation.mutate({ id: consId, action, payload: { reason: modalData.reason } });
    } else if (action === 'APPROVE') {
      actionMutation.mutate({ id: consId, action });
    } else if (action === 'RESCHEDULE') {
      if (!modalData.date || !modalData.time) return toast.error("Date and time are required");
      actionMutation.mutate({ id: consId, action, payload: { date: modalData.date, time: modalData.time } });
    } else if (action === 'ASSIGN') {
      if (!modalData.consultantId) return toast.error("Please select a consultant");
      actionMutation.mutate({ id: consId, action, payload: { consultantId: Number(modalData.consultantId) } });
    }
    setModalState({ isOpen: false, action: null, consId: null });
    setModalData({ reason: '', date: '', time: '', consultantId: '' });
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consultation Requests</h1>
        <p className="text-gray-500 mt-1">Review and assign consultants to client consultation bookings.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Client Info</th>
                <th className="px-6 py-4 font-medium">Topic / Date</th>
                <th className="px-6 py-4 font-medium">Message / Notes</th>
                <th className="px-6 py-4 font-medium">Consultant</th>
                <th className="px-6 py-4 font-medium">Consultant Status</th>
                <th className="px-6 py-4 font-medium">Client Seen Status</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32 mb-2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24 mb-2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 animate-pulse rounded-full w-20"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : consultations.length > 0 ? (
                paginatedConsultations.map(cons => (
                  <tr key={cons._id || cons.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{cons.user?.name || cons.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{cons.user?.email || cons.email}</p>
                      <p className="text-xs text-gray-500">{cons.user?.phone || cons.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{cons.type || cons.topic || 'General Consultation'} / {cons.communicationMethod || 'Audio'}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(cons.preferredDate || cons.date || cons.createdAt).toLocaleDateString()} / {cons.preferredTime}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      <p className="line-clamp-2 text-xs">{cons.message || 'No additional message.'}</p>
                      {cons.notes && <p className="text-xs text-gray-500 mt-1">{cons.notes}</p>}
                      {cons.responseNote && <p className="text-xs text-blue-600 mt-1">Admin: {cons.responseNote}</p>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {cons.assignedConsultantName ? (
                         <div className="flex items-center gap-2">
                           <UserCheck className="w-4 h-4 text-emerald-600" />
                           <span className="text-xs font-medium">{cons.assignedConsultantName}</span>
                         </div>
                      ) : (
                         <span className="text-xs font-medium text-amber-700">
                           {cons.notes && cons.notes.includes('Expert: ') && cons.notes.split('Expert: ')[1] !== 'Any'
                             ? cons.notes.split('Expert: ')[1] 
                             : 'Unassigned'}
                         </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {cons.status === 'CONSULTANT_ASSIGNED_PENDING_APPROVAL' ? (
                        <span className="text-xs font-medium text-amber-600">Pending Consultant</span>
                      ) : cons.assignedConsultantName ? (
                        <span className="text-xs font-medium text-emerald-600">Accepted</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {cons.adminActionTaken ? (
                        cons.clientSeenStatus ? (
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> Seen</span>
                        ) : (
                          <span className="text-xs font-medium text-gray-500">Unseen</span>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        cons.status === 'APPROVED' || cons.status === 'SCHEDULED' || cons.status === 'CONFIRMED' ? (
                          new Date(`${cons.preferredDate || cons.date}T${cons.preferredTime || '00:00'}`) < new Date() ? 'bg-gray-100 text-gray-700' : 'bg-emerald-100 text-emerald-700'
                        ) :
                        cons.status === 'REJECTED' || cons.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        cons.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {cons.status === 'APPROVED' || cons.status === 'SCHEDULED' || cons.status === 'CONFIRMED' ? (
                          new Date(`${cons.preferredDate || cons.date}T${cons.preferredTime || '00:00'}`) < new Date() ? 'ENDED' : 'UPCOMING'
                        ) : cons.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap min-w-[120px]">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setModalState({ isOpen: true, action: e.target.value, consId: cons.id });
                            e.target.value = ''; // Reset selection
                          }
                        }}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg focus:ring-[#106354] focus:border-[#106354] block w-full p-2 outline-none cursor-pointer font-semibold"
                        value=""
                      >
                        <option value="" disabled>Actions...</option>
                        <option value="APPROVE">Approve</option>
                        <option value="DENY">Deny / Cancel</option>
                        <option value="RESCHEDULE">Reschedule</option>
                        <option value="ASSIGN">
                          {cons.assignedConsultantName ? 'Reassign / Change Consultant' : 'Assign Consultant'}
                        </option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Video className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">No consultation requests</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI - Only rendered if total items > 15 */}
        {consultations.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, consultations.length)} of {consultations.length} consultations
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 rounded-xl text-xs font-bold transition-all text-gray-700 cursor-pointer shadow-sm"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-gray-700 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 rounded-xl text-xs font-bold transition-all text-gray-700 cursor-pointer shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal (Postcard) */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {modalState.action === 'APPROVE' && 'Confirm Approval'}
                {modalState.action === 'DENY' && 'Deny Consultation'}
                {modalState.action === 'RESCHEDULE' && 'Reschedule Consultation'}
                {modalState.action === 'ASSIGN' && 'Assign Consultant'}
              </h3>
              <button onClick={() => setModalState({ isOpen: false, action: null, consId: null })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {modalState.action === 'APPROVE' && (
                <p className="text-gray-600 text-sm">Are you sure you want to approve this consultation?</p>
              )}
              
              {modalState.action === 'DENY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for denial</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83] text-sm"
                    rows="3"
                    value={modalData.reason}
                    onChange={(e) => setModalData({...modalData, reason: e.target.value})}
                    placeholder="Enter reason..."
                  />
                </div>
              )}

              {modalState.action === 'RESCHEDULE' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83] text-sm"
                      value={modalData.date}
                      onChange={(e) => setModalData({...modalData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                    <input 
                      type="text"
                      placeholder="e.g. 10:00 AM"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83] text-sm"
                      value={modalData.time}
                      onChange={(e) => setModalData({...modalData, time: e.target.value})}
                    />
                  </div>
                </>
              )}

              {modalState.action === 'ASSIGN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Consultant</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83] text-sm"
                    value={modalData.consultantId}
                    onChange={(e) => setModalData({...modalData, consultantId: e.target.value})}
                  >
                    <option value="">-- Choose a Consultant --</option>
                    {consultants.map(c => (
                      <option key={c.id} value={c.id}>{c.user?.name || c.specialization}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    This will send a session request to the consultant's panel.
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-6 flex justify-end gap-3">
              <button 
                onClick={() => setModalState({ isOpen: false, action: null, consId: null })} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAction} 
                className="px-4 py-2 text-sm font-medium text-white bg-[#4E8B83] rounded-lg hover:bg-[#3A6B65] transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationManagement;
