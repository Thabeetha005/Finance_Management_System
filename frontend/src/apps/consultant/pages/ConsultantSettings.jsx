import React from 'react';
import ProfileSettings from '../../../shared/components/ProfileSettings';

const ConsultantSettings = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
        <p className="text-gray-500 mt-1">Manage your consultant profile and security settings</p>
      </div>

      <ProfileSettings />
    </div>
  );
};

export default ConsultantSettings;
