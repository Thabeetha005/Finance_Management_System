import React from 'react';
import { TrendingUp } from 'lucide-react';

const Income = () => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Income Module</h1>
        <p className="text-gray-500 mt-1">Track and manage system income.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <TrendingUp className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-500 text-center max-w-md">
          The Income tracking module is currently under development. Check back soon for updates on your revenue streams and analytical reports.
        </p>
      </div>
    </div>
  );
};

export default Income;
