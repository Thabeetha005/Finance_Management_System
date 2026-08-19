import React from 'react';
import { TrendingDown } from 'lucide-react';

const Expenses = () => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expenses Module</h1>
        <p className="text-gray-500 mt-1">Track and manage system expenses.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <TrendingDown className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-500 text-center max-w-md">
          The Expenses tracking module is currently under development. Soon you'll be able to categorize, track, and report on all outgoing funds.
        </p>
      </div>
    </div>
  );
};

export default Expenses;
