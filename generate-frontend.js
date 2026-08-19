import fs from 'fs';
import path from 'path';

const publicPagesDir = path.join(process.cwd(), 'frontend/src/pages/public');
const adminPagesDir = path.join(process.cwd(), 'frontend/src/pages/admin');

if (!fs.existsSync(publicPagesDir)) fs.mkdirSync(publicPagesDir, { recursive: true });
if (!fs.existsSync(adminPagesDir)) fs.mkdirSync(adminPagesDir, { recursive: true });

const publicPages = [
  'SolutionsPage', 'IndustriesPage', 'FeaturesPage', 'AboutPage', 'ContactPage',
  'SecurityPage', 'InsightsPage', 'FaqPage', 'SupportPage', 'LegalPage'
];

const adminPages = [
  'Income', 'Expenses', 'Clients', 'Vendors', 'Accounts', 'Budgets', 
  'Reports', 'Notifications', 'Users', 'AuditLogs', 'Settings'
];

publicPages.forEach(page => {
  const content = `import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ${page} = () => {
  return (
    <div className="pt-24 min-h-screen bg-[#FDFDFD]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">${page.replace('Page', '')}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">Premium Kalpanaa Finance solutions and insights.</p>
        <Link to="/contact" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-light transition-all shadow-md">
          Talk to Our Experts <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default ${page};
`;
  fs.writeFileSync(path.join(publicPagesDir, `${page}.jsx`), content);
});

adminPages.forEach(page => {
  const content = `import React, { useState, useEffect } from 'react';

const ${page} = () => {
  const [data, setData] = useState([]);
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">${page}</h1>
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

export default ${page};
`;
  fs.writeFileSync(path.join(adminPagesDir, `${page}.jsx`), content);
});

console.log('Frontend pages generated.');
