import React from 'react';
import { FileText } from 'lucide-react';

const Invoices = () => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices Module</h1>
        <p className="text-gray-500 mt-1">Generate and manage invoices.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-500 text-center max-w-md">
          The Invoicing module is currently under development. Soon you'll be able to create, send, and track professional invoices directly from the portal.
        </p>
      </div>
    </div>
  );
};

export default Invoices;
