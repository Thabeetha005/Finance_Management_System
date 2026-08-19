import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, User, Eye, Edit, Trash2 } from 'lucide-react';
import api from '../../../shared/api/axios';
import { toast } from 'react-hot-toast';

const AdminConsultants = () => {
  const navigate = useNavigate();
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModalStep, setDeleteModalStep] = useState(0);
  const [selectedConsultantForDelete, setSelectedConsultantForDelete] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    experienceYears: 0,
    qualification: '',
    bio: '',
    workingDays: 'Mon-Fri',
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    maxSessionsPerDay: 5
  });

  const handleConfirmPermanentDelete = async () => {
    if (!selectedConsultantForDelete || !deletionReason.trim()) return;
    try {
      setDeleting(true);
      const targetId = selectedConsultantForDelete.id || selectedConsultantForDelete._id;
      await api.delete(`/admin/consultants/${targetId}?reason=${encodeURIComponent(deletionReason.trim())}`);
      toast.success('Consultant permanently deleted successfully.');
      setDeleteModalStep(0);
      setSelectedConsultantForDelete(null);
      setDeletionReason('');
      fetchConsultants();
    } catch (error) {
      console.error('Failed to delete consultant:', error);
      toast.error(error.response?.data?.message || 'Failed to delete consultant');
    } finally {
      setDeleting(false);
    }
  };

  const fetchConsultants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/consultants');
      if (Array.isArray(response.data)) {
        setConsultants(response.data);
      } else if (response.data?.success) {
        setConsultants(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch consultants:', error);
      toast.error('Failed to load consultants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredConsultants = consultants.filter(c => 
    c.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredConsultants.length / PAGE_SIZE);
  const paginatedConsultants = filteredConsultants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddConsultant = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/consultants', formData);
      if (response.data) {
        toast.success('Consultant added successfully!');
        setIsAddModalOpen(false);
        fetchConsultants();
        setFormData({
          name: '', email: '', phone: '', specialization: '', experienceYears: 0,
          qualification: '', bio: '', workingDays: 'Mon-Fri', workingHoursStart: '09:00',
          workingHoursEnd: '17:00', maxSessionsPerDay: 5
        });
      }
    } catch (error) {
      console.error('Failed to add consultant:', error);
      toast.error('Failed to add consultant');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultants</h1>
          <p className="text-gray-500 mt-1">Manage platform consultants and their profiles</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4E8B83] text-white rounded-xl hover:bg-[#3A6B65] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Consultant
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search consultants by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4E8B83] focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50/50 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">Consultant</th>
                <th className="px-6 py-4 font-medium">Specialization</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Loading consultants...
                  </td>
                </tr>
              ) : filteredConsultants.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No consultants found
                  </td>
                </tr>
              ) : (
                paginatedConsultants.map((consultant) => (
                  <tr 
                    key={consultant.id} 
                    onClick={() => navigate(`/admin/consultants/${consultant.id || consultant._id}`)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {(consultant.user?.name?.[0] || consultant.name?.[0] || 'C').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{consultant.user?.name || consultant.name}</div>
                          <div className="text-gray-500">{consultant.user?.email || consultant.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {consultant.specialization || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        consultant.status === 'PENDING_TERMINATION' 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : consultant.isActive !== false && (consultant.status === 'ACTIVE' || !consultant.status) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {consultant.status === 'PENDING_TERMINATION' 
                          ? 'Pending Termination' 
                          : consultant.isActive !== false && (consultant.status === 'ACTIVE' || !consultant.status) 
                          ? 'Active' 
                          : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/admin/consultants/${consultant.id || consultant._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-gray-500 hover:text-[#4E8B83] hover:bg-[#4E8B83]/10 rounded-lg transition-colors cursor-pointer relative z-10 inline-flex"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedConsultantForDelete(consultant);
                            setDeletionReason('');
                            setDeleteModalStep(1);
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer relative z-10 inline-flex"
                          title="Delete Consultant"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI - Only rendered if total items > 15 */}
        {filteredConsultants.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredConsultants.length)} of {filteredConsultants.length} consultants
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

      {/* Add Consultant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Add New Consultant</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddConsultant} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83]" placeholder="Leave blank for auto-generated" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input type="text" name="specialization" required value={formData.specialization} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                  <input type="number" name="experienceYears" min="0" required value={formData.experienceYears} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Sessions/Day</label>
                  <input type="number" name="maxSessionsPerDay" min="1" required value={formData.maxSessionsPerDay} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea name="bio" rows="3" value={formData.bio} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83]"></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#4E8B83] text-white rounded-lg hover:bg-[#3A6B65]">
                  Add Consultant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2-STEP CONSULTANT DELETION CONFIRMATION MODAL */}
      {deleteModalStep > 0 && selectedConsultantForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 border border-gray-100">
            {/* STEP 1: Enter Mandatory Reason */}
            {deleteModalStep === 1 && (
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-xl font-bold text-gray-900">Delete Consultant?</h3>
                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    Consultant: <span className="font-bold text-red-700">{selectedConsultantForDelete.user?.name || selectedConsultantForDelete.name}</span>
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
                    onClick={() => {
                      setDeleteModalStep(0);
                      setSelectedConsultantForDelete(null);
                    }}
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
                    Consultant: <span className="font-bold">{selectedConsultantForDelete.user?.name || selectedConsultantForDelete.name}</span>
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

export default AdminConsultants;
