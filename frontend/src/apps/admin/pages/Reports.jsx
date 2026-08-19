import React, { useState, useEffect } from 'react';

const Reports = () => {
  const [data, setData] = useState([]);
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium">Add New</button>
      </div>
      
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-500">
              <th className="pb-3 font-medium">ID</th>
              <th className="pb-3 font-medium">Details</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="4" className="py-8 text-center text-gray-500">No records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
