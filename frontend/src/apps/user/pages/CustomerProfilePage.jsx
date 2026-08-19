import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { 
  User, ShieldCheck, Lock, Mail, Phone, Calendar, 
  CheckCircle2, AlertTriangle, KeyRound, FileText, ArrowRight,
  RefreshCw, Check, Clock, UserCheck, CreditCard, Sparkles
} from 'lucide-react';

const CustomerProfilePage = () => {
  const { user, login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const queryClient = useQueryClient();

  // Confirmation token in URL query string (if arriving from confirmation link)
  const confirmToken = searchParams.get('token');

  // Fetch full live profile from Spring Boot backend (GET /api/profile)
  const { data: profile, isLoading: loadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await api.get('/profile');
      return res.data;
    },
  });

  // Fetch detailed verification status (GET /api/profile/verification)
  const { data: verificationData } = useQuery({
    queryKey: ['verificationStatus'],
    queryFn: async () => {
      const res = await api.get('/profile/verification');
      return res.data;
    },
  });

  // Form states
  const [editForm, setEditForm] = useState({
    fullName: '',
    username: '',
    phone: '',
  });

  const [usernameForm, setUsernameForm] = useState({ username: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });
  const [phoneForm, setPhoneForm] = useState({ newPhone: '', currentPassword: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [confirmEmailTokenInput, setConfirmEmailTokenInput] = useState('');

  // Status feedback messages
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      setEditForm({
        fullName: profile.name || '',
        username: profile.username || '',
        phone: profile.phone || '',
      });
      setUsernameForm({ username: profile.username || '' });
      setPhoneForm(prev => ({ ...prev, newPhone: profile.phone || '' }));
    }
  }, [profile]);

  // Handle email change confirmation via token if token parameter is present
  useEffect(() => {
    if (confirmToken) {
      handleConfirmEmailToken(confirmToken);
    }
  }, [confirmToken]);

  const handleConfirmEmailToken = async (token) => {
    try {
      const res = await api.get(`/profile/email/confirm?token=${token}`);
      setStatusMessage({ type: 'success', text: `Email address successfully updated to ${res.data.email}!` });
      queryClient.invalidateQueries(['userProfile']);
      queryClient.invalidateQueries(['auth']);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Email confirmation failed or link expired after 24 hours.' });
    }
  };

  // 1. UPDATE PROFILE MUTATION (Section 3 Field Allowlist)
  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/profile', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setStatusMessage({ type: 'success', text: 'Uploaded successfully' });
      queryClient.invalidateQueries(['userProfile']);
      queryClient.invalidateQueries(['auth']);
    },
    onError: (err) => {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    }
  });

  // 2. UPDATE USERNAME MUTATION
  const updateUsernameMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/profile/username', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setStatusMessage({ type: 'success', text: 'Uploaded successfully' });
      queryClient.invalidateQueries(['userProfile']);
      queryClient.invalidateQueries(['auth']);
    },
    onError: (err) => {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update username.' });
    }
  });

  // 3. DIRECT EMAIL CHANGE MUTATION
  const updateEmailMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/profile/email', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setStatusMessage({ type: 'success', text: 'Uploaded successfully' });
      setEmailForm({ newEmail: '', currentPassword: '' });
      queryClient.invalidateQueries(['userProfile']);
      queryClient.invalidateQueries(['auth']);
    },
    onError: (err) => {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update email address.' });
    }
  });

  // 4. UPDATE PHONE MUTATION
  const updatePhoneMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/profile/phone', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setStatusMessage({ type: 'success', text: 'Uploaded successfully' });
      setPhoneForm(prev => ({ ...prev, currentPassword: '' }));
      queryClient.invalidateQueries(['userProfile']);
      queryClient.invalidateQueries(['auth']);
    },
    onError: (err) => {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update phone number.' });
    }
  });

  // 5. CHANGE PASSWORD MUTATION (Section 7 Session Invalidation)
  const changePasswordMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/profile/password', payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setStatusMessage({ type: 'success', text: 'Uploaded successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      queryClient.invalidateQueries(['userProfile']);
      queryClient.invalidateQueries(['auth']);
    },
    onError: (err) => {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    }
  });

  const handleUpdateGeneralProfile = (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    updateProfileMutation.mutate({
      fullName: editForm.fullName,
      phoneNumber: editForm.phone,
    });
  };

  const handleUpdateUsernameSubmit = (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    updateUsernameMutation.mutate({ username: usernameForm.username });
  };

  const handleUpdateEmailSubmit = (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    updateEmailMutation.mutate(emailForm);
  };

  const handleUpdatePhoneSubmit = (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    updatePhoneMutation.mutate(phoneForm);
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation password do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    changePasswordMutation.mutate(passwordForm);
  };

  const parseDateStr = (dateVal) => {
    if (!dateVal) return 'N/A';
    if (Array.isArray(dateVal)) {
      const [y, m, d] = dateVal;
      return new Date(y, m - 1, d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  const isVerified = profile?.isVerified ?? false;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 text-left">
      
      {/* HEADER CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-50/60 via-amber-50/30 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#12241F] text-emerald-400 font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-md border-2 border-emerald-900/40 shrink-0">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {profile?.name || 'Customer Name'}
                </h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Customer
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    Verification Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                @{profile?.username || 'username'} • {profile?.email} • Customer ID: <span className="font-bold text-gray-700">{profile?.customerId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/profile/documents"
              className="flex-1 md:flex-none px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Document Hub</span>
            </Link>
          </div>
        </div>

        {/* FEEDBACK STATUS ALERT BANNER */}
        {statusMessage.text && (
          <div className={`mt-6 p-4 rounded-2xl border text-sm font-bold flex items-center gap-3 shadow-sm animate-in fade-in duration-200 ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-950 border-emerald-300' : 'bg-red-50 text-red-950 border-red-300'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        <button
          onClick={() => setSearchParams({ tab: 'overview' })}
          className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview' ? 'bg-[#12241F] text-emerald-400 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          My Profile Overview
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'edit' })}
          className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'edit' ? 'bg-[#12241F] text-emerald-400 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Edit Profile & Credentials
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'verification' })}
          className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'verification' ? 'bg-[#12241F] text-emerald-400 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Verification Status
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'password' })}
          className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'password' ? 'bg-[#12241F] text-emerald-400 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Security & Password
        </button>
      </div>

      {/* TAB 1: MY PROFILE OVERVIEW (SECTION 2 & 10) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Details Card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Account Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-500 font-medium uppercase text-[10px]">Full Name</span>
                <p className="font-bold text-gray-900 text-sm mt-1">{profile?.name || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-500 font-medium uppercase text-[10px]">Username</span>
                <p className="font-bold text-gray-900 text-sm mt-1">@{profile?.username || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-500 font-medium uppercase text-[10px]">Email Address</span>
                <p className="font-bold text-gray-900 text-sm mt-1">{profile?.email || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-500 font-medium uppercase text-[10px]">Phone Number</span>
                <p className="font-bold text-gray-900 text-sm mt-1">{profile?.phone || 'Not Provided'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-500 font-medium uppercase text-[10px]">Account Status</span>
                <div className="mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    profile?.accountStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {profile?.accountStatus || 'Active'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-500 font-medium uppercase text-[10px]">Account Created Date</span>
                <p className="font-bold text-gray-900 text-sm mt-1">{parseDateStr(profile?.createdAt)}</p>
              </div>
            </div>

            {/* VERIFICATION SECTION EXPLANATORY COPY */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Account Verification State</h3>
              {isVerified ? (
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-start gap-4">
                  <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-emerald-900 text-sm">✓ Your account is fully verified</h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Your identity documents (PAN / Aadhaar) and bank account have been reviewed and approved by Kalpanaa Finance compliance administrators. You have unlocked full access to instant loan processing, higher investment tiers, and wallet withdrawals.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4">
                  <AlertTriangle className="w-7 h-7 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-900 text-sm">🔒 Account Verification Required</h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Your account is currently in unverified status. Wallet balance view, investments, and loan browsing remain active, but wallet withdrawals and instant loan disbursements require document verification.
                    </p>
                    <div className="pt-2">
                      <Link
                        to="/profile/documents"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                      >
                        Complete Verification Now <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Side Card: Quick Actions & Document Reuse Banner */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#12241F] to-[#0A1613] text-white rounded-3xl p-6 shadow-md border border-emerald-900/40 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">Document Reuse System</h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Once your PAN and Aadhaar are verified in your Profile Master Source, they are automatically referenced during future loan and investment applications — zero re-uploading required.
              </p>
              <Link
                to="/profile/documents"
                className="block text-center w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Manage Master Documents
              </Link>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Management</h4>
              <button
                onClick={() => setSearchParams({ tab: 'edit' })}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 text-left transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-gray-800">Edit Username & Details</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => setSearchParams({ tab: 'password' })}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 text-left transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-gray-800">Security & Session Reset</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: EDIT PROFILE & CREDENTIALS (SECTIONS 3, 4, 5, 6) */}
      {activeTab === 'edit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 3 & 4: General Profile & Username Change */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              General Details & Username
            </h2>

            {/* General Details Form */}
            <form onSubmit={handleUpdateGeneralProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save General Details'}
                </button>
              </div>
            </form>

            {/* Section 4 Username Change Form */}
            <div className="pt-6 border-t border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Change Username</h3>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  30-Day Cooldown
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Usernames must be 3-30 characters long (letters, numbers, underscores). To prevent rapid impersonation, username changes are rate-limited to once every 30 days.
              </p>

              {profile?.lastUsernameChangedAt && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-semibold text-amber-900">
                  Last changed on: {parseDateStr(profile.lastUsernameChangedAt)}.
                </div>
              )}

              <form onSubmit={handleUpdateUsernameSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">New Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">@</span>
                    <input
                      type="text"
                      value={usernameForm.username}
                      onChange={(e) => setUsernameForm({ username: e.target.value })}
                      className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                      placeholder="username"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updateUsernameMutation.isPending}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {updateUsernameMutation.isPending ? 'Updating...' : 'Update Username'}
                </button>
              </form>
            </div>
          </div>

          {/* Section 5 & 6: Email & Phone Number Change Forms */}
          <div className="space-y-6">
            
            {/* Direct Email Change Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                Change Email Address
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Requires current password to update your account email address directly in the database.
              </p>

              <form onSubmit={handleUpdateEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">New Email Address</label>
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                    placeholder="newemail@domain.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Current Password (Security Check)</label>
                  <input
                    type="password"
                    value={emailForm.currentPassword}
                    onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateEmailMutation.isPending}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {updateEmailMutation.isPending ? 'Updating...' : 'Update Email Address'}
                </button>
              </form>
            </div>

            {/* Section 6 Phone Change Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" />
                Change Phone Number
              </h2>
              <form onSubmit={handleUpdatePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">New Phone Number</label>
                  <input
                    type="text"
                    value={phoneForm.newPhone}
                    onChange={(e) => setPhoneForm({ ...phoneForm, newPhone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                    placeholder="+919876543210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={phoneForm.currentPassword}
                    onChange={(e) => setPhoneForm({ ...phoneForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatePhoneMutation.isPending}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {updatePhoneMutation.isPending ? 'Updating...' : 'Update Phone Number'}
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: VERIFICATION STATUS (SECTION 8 & 9) */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                Identity & Compliance Verification
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Track your PAN, Aadhaar, and Bank Account verification statuses.
              </p>
            </div>
            <Link
              to="/profile/documents"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Go to Master Documents</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* PAN Status */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">PAN Card</span>
                {verificationData?.panStatus === 'VERIFIED' ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">
                    VERIFIED
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200">
                    PENDING
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {verificationData?.panStatus === 'VERIFIED'
                  ? 'Your PAN document is verified and linked to your credit profile.'
                  : 'PAN card verification is required for loan processing.'}
              </p>
            </div>

            {/* Aadhaar Status */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Aadhaar Identity</span>
                {verificationData?.aadhaarStatus === 'VERIFIED' ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">
                    VERIFIED
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200">
                    PENDING
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {verificationData?.aadhaarStatus === 'VERIFIED'
                  ? 'Your Aadhaar identity proof is verified and linked to your profile.'
                  : 'Aadhaar identity verification is required for KYC compliance.'}
              </p>
            </div>

            {/* Bank Account Status */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Bank Account</span>
                {verificationData?.bankAccountStatus === 'VERIFIED' ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">
                    VERIFIED
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200">
                    PENDING
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {verificationData?.bankAccountStatus === 'VERIFIED'
                  ? 'A verified destination bank account is active for withdrawals and loan payouts.'
                  : 'Link a destination bank account to enable wallet withdrawals.'}
              </p>
            </div>

          </div>

          {/* Section 9 Document Reuse Banner */}
          <div className="p-6 bg-gradient-to-r from-emerald-900 to-[#12241F] text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-emerald-400">Master Document Source Protection</h4>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
                All uploaded documents in your Profile Master Source are stored securely. Active loan and investment applications automatically reference these verified documents.
              </p>
            </div>
            <Link
              to="/profile/documents"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-xl shrink-0 transition-all"
            >
              Upload / Replace Documents
            </Link>
          </div>
        </div>
      )}

      {/* TAB 4: CHANGE PASSWORD & SESSION INVALIDATION (SECTION 7) */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-emerald-600" />
              Security & Password Management
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Update your account password and invalidate active sessions on other devices.
            </p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-semibold text-amber-900 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Session Revocation Policy:</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Changing your password will increment your account token version in MySQL and immediately invalidate ALL other active sessions and logged-in devices backend-side. Your current session will remain logged in with an updated secure token.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Password (Min 8 characters)</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full py-3 bg-[#12241F] hover:bg-[#0A1613] text-emerald-400 font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {changePasswordMutation.isPending ? 'Updating Password & Invalidating Other Sessions...' : 'Change Password & Revoke Other Sessions'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default CustomerProfilePage;
