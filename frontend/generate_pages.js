import fs from 'fs';
import path from 'path';

const pages = [
  'DigitalFinancePage', 'LendingCreditPage', 'InvestmentWealthPage', 'FinancialAnalyticsPage', 'PaymentTransactionsPage',
  'CorporateFinancePage', 'RetailBankingPage', 'WealthManagementPage',
  'LatestNewsPage', 'BlogInsightsPage', 'CompanyUpdatesPage'
];

const dir = path.join(process.cwd(), 'src', 'pages', 'public');

pages.forEach(page => {
  const content = `import React from 'react';

const ${page} = () => {
  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-4xl font-bold mb-6">${page.replace('Page', '').replace(/([A-Z])/g, ' $1').trim()}</h1>
      <p className="text-gray-600">Content for this section goes here.</p>
    </div>
  );
};

export default ${page};
`;
  fs.writeFileSync(path.join(dir, `${page}.jsx`), content);
});

console.log('Dummy pages created.');
