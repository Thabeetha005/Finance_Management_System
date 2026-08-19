import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Save } from 'lucide-react';

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: '' // Email is usually readonly
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    // Fetch current profile data
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        setProfileData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          email: res.data.email || ''
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
        // Fallback to context user if API fails
        if (user) {
          setProfileData({
            name: user.name || '',
            phone: user.phone || '',
            email: user.email || ''
          });
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await api.put('/user/profile', {
        name: profileData.name,
        phone: profileData.phone,
        email: profileData.email
      });
      
      // Update local storage and context if the API returns updated user data
      if (res.data && res.data.token) {
          // If the backend issues a new token due to username change
          updateUser(res.data);
      } else {
          // Just update the user in context manually if we don't get a new token, 
          // though our backend currently always returns a new token for profile updates.
          updateUser({ ...user, ...res.data });
      }

      toast.success('updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsUpdatingPassword(true);
    try {
      await api.put('/user/password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      toast.success('updated password');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Details Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#4E8B83]/10 rounded-lg">
            <User className="w-6 h-6 text-[#4E8B83]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
            <p className="text-sm text-gray-500">Update your basic profile information</p>
          </div>
        </div>

        <form onSubmit={submitProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83] focus:border-transparent outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address / Username</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83] focus:border-transparent outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#12241F] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Security</h2>
            <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
          </div>
        </div>

        <form onSubmit={submitPassword} className="space-y-6">
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83] focus:border-transparent outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83] focus:border-transparent outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4E8B83] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex justify-start pt-4">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-70"
            >
              <Lock className="w-4 h-4" />
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default ProfileSettings;
