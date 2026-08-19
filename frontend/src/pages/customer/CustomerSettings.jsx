import React from 'react';
import ProfileSettings from '../../components/shared/ProfileSettings';

const CustomerSettings = () => {
  return (
    <div className="max-w-[1600px] mx-auto pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Account Settings</h2>
        <p className="text-gray-500 mt-1">Manage your personal profile and security settings</p>
      </div>

      <ProfileSettings />
    </div>
  );
};

export default CustomerSettings;
