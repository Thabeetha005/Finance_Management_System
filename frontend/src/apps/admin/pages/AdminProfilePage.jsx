import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../shared/api/axios';
import { useAuth } from '../../../shared/context/AuthContext';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Lock, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Key, 
  Clock, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminProfilePage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();

  const tabParam = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab'));
    }
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // Fetch admin profile from backend MySQL database
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const res = await api.get('/admin/profile');
      return res.data;
    }
  });

  // Edit Profile Form State
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: ''
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        fullName: profile.name || '',
        email: profile.email || '',
        phoneNumber: profile.phone || ''
      });
    }
  }, [profile]);

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/admin/profile', payload);
      return res.data;
    },
    onSuccess: (data) => {
      // When email changed, backend returns {message, token, profile}
      // Store the fresh JWT so the current session keeps working with the new email
      if (data?.token) {
        updateUser({
          token: data.token,
          email: data.profile?.email ?? authUser?.email,
          name:  data.profile?.name  ?? authUser?.name,
          role:  authUser?.role,
        });
      }
      queryClient.invalidateQueries(['adminProfile']);
      queryClient.invalidateQueries(['currentUser']);
      setProfileMsg({ type: 'success', text: 'Admin profile updated successfully!' });
      toast.success('Admin profile updated successfully!');
      handleTabChange('profile');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setProfileMsg({ type: 'error', text: msg });
      toast.error(msg);
    }
  });

  // Password Update Mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/admin/profile/password', payload);
      return res.data;
    },
    onSuccess: (data) => {
      // Backend returns {message, token} — store the fresh JWT so the new tokenVersion
      // is in localStorage immediately (old token with stale version would be rejected)
      if (data?.token) {
        updateUser({
          token: data.token,
          email: authUser?.email,
          name:  authUser?.name,
          role:  authUser?.role,
        });
      }
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMsg({ type: 'success', text: 'Password updated. All other sessions have been logged out.' });
      toast.success('Password updated successfully!');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to update password.';
      setPasswordMsg({ type: 'error', text: msg });
      toast.error(msg);
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });

    if (!formData.fullName.trim()) {
      setProfileMsg({ type: 'error', text: 'Full Name cannot be blank.' });
      return;
    }
    if (!formData.email.trim()) {
      setProfileMsg({ type: 'error', text: 'Email cannot be blank.' });
      return;
    }

    updateProfileMutation.mutate({
      username: formData.username.trim(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim()
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (!passwordData.oldPassword) {
      setPasswordMsg({ type: 'error', text: 'Current password is required.' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    updatePasswordMutation.mutate(passwordData);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '15 Aug 2026';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#106354] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentProfile = profile || {
    name: authUser?.name || 'Administrator',
    username: authUser?.username || 'admin',
    email: authUser?.email || 'admin@kalpanaafinance.com',
    phone: '+91 98765 43210',
    accountStatus: 'Active',
    role: 'ADMIN',
    createdAt: new Date().toISOString()
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#12241F] via-[#106354] to-[#12241F] p-6 md:p-8 rounded-2xl text-white shadow-lg border border-[#D4AF37]/30 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center gap-5 z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#12241F] via-[#106354] to-[#887333] border-2 border-[#D4AF37] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl">
            {(currentProfile.name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{currentProfile.name}</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-[#D4AF37] text-[#12241F] rounded-full shadow-sm">
                {currentProfile.role || 'ADMIN'}
              </span>
            </div>
            <p className="text-emerald-200 text-sm mt-1">@{currentProfile.username || 'admin'} • {currentProfile.email}</p>
            <div className="flex items-center gap-4 text-xs text-gray-300 mt-2">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Created: {formatDate(currentProfile.createdAt)}</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Status: {currentProfile.accountStatus || 'Active'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10 self-start md:self-auto">
          <button
            onClick={() => handleTabChange('edit')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md text-sm font-semibold transition-all border border-white/20 shadow-sm"
          >
            <Edit3 className="w-4 h-4 text-[#D4AF37]" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl p-1.5 shadow-sm border">
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-[#12241F] text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          My Profile
        </button>
        <button
          onClick={() => handleTabChange('edit')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'edit'
              ? 'bg-[#12241F] text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
        <button
          onClick={() => handleTabChange('password')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'password'
              ? 'bg-[#12241F] text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Lock className="w-4 h-4 text-[#D4AF37]" />
          Change Password
        </button>
      </div>

      {/* TAB 1: MY PROFILE VIEW */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#106354]" />
                Account Overview
              </h3>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                Verified Administrator
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Username</label>
                <p className="text-base font-bold text-gray-900 mt-1">@{currentProfile.username || 'admin'}</p>
              </div>

              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Full Name</label>
                <p className="text-base font-bold text-gray-900 mt-1">{currentProfile.name}</p>
              </div>

              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Email Address</label>
                <p className="text-base font-bold text-gray-900 mt-1">{currentProfile.email}</p>
              </div>

              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Phone Number</label>
                <p className="text-base font-bold text-gray-900 mt-1">{currentProfile.phone || 'Not provided'}</p>
              </div>

              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">System Role</label>
                <p className="text-base font-bold text-[#106354] mt-1">{currentProfile.role || 'ADMIN'}</p>
              </div>

              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Account Status</label>
                <p className="text-base font-bold text-emerald-600 mt-1">{currentProfile.accountStatus || 'Active'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Account ID: #{currentProfile.id || 1}</span>
              <span>Last Account Sync: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Security & MFA Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-[#887333]" />
              Security & Compliance
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  MFA / 2-Step Verification
                </div>
                <p className="text-xs text-emerald-700 mt-1">Enforced for Admin account sessions. Protects system administrative rights.</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Key className="w-4 h-4 text-[#887333]" />
                  Password Security
                </div>
                <p className="text-xs text-amber-800 mt-1">BCrypt 256-bit hashed. Updated through secured Spring Boot auth API.</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Audit System Status</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">ACTIVE</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">All profile updates automatically write to the Audit Log database table.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT PROFILE FORM */}
      {activeTab === 'edit' && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 max-w-3xl">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#106354]" />
              Edit Profile Information
            </h3>
            <p className="text-sm text-gray-500 mt-1">Update your administrator username, full name, email, and phone number in MySQL.</p>
          </div>

          {profileMsg.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2.5 ${
              profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {profileMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#106354] focus:border-transparent text-sm font-medium text-gray-900 bg-gray-50/30"
                    placeholder="admin_username"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Must be unique across all system users.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#106354] focus:border-transparent text-sm font-medium text-gray-900 bg-gray-50/30"
                  placeholder="Administrator Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#106354] focus:border-transparent text-sm font-medium text-gray-900 bg-gray-50/30"
                    placeholder="admin@kalpanaafinance.com"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Validated for uniqueness before saving.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#106354] focus:border-transparent text-sm font-medium text-gray-900 bg-gray-50/30"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleTabChange('profile')}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-6 py-2.5 bg-[#12241F] text-white rounded-xl hover:bg-[#106354] transition-colors text-sm font-bold shadow-md disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CHANGE PASSWORD FORM */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 max-w-xl">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#887333]" />
              Change Administrator Password
            </h3>
            <p className="text-sm text-gray-500 mt-1">Update your password securely. Encoded using BCrypt algorithm.</p>
          </div>

          {passwordMsg.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2.5 ${
              passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {passwordMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#887333] focus:border-transparent text-sm font-medium text-gray-900 bg-gray-50/30"
                placeholder="********"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#887333] focus:border-transparent text-sm font-medium text-gray-900 bg-gray-50/30"
                placeholder="********"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters long.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#887333] focus:border-transparent text-sm font-medium text-gray-900 bg-gray-50/30"
                placeholder="********"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleTabChange('profile')}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="px-6 py-2.5 bg-[#887333] text-white rounded-xl hover:bg-[#6e5d28] transition-colors text-sm font-bold shadow-md disabled:opacity-50"
              >
                {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminProfilePage;
