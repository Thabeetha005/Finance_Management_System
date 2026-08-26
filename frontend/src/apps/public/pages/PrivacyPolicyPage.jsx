import React from 'react';
import LegalPageTemplate, { LegalSection } from '../../../shared/components/layouts/LegalPageTemplate';

const PrivacyPolicyPage = () => {
  const sections = [
    { id: 'intro', number: 1, title: 'Privacy Commitment & Scope' },
    { id: 'collection', number: 2, title: 'Categories of Information We Collect' },
    { id: 'usage', number: 3, title: 'Purpose of Data Processing' },
    { id: 'financial-data', number: 4, title: 'Financial & Ledger Data Safeguards' },
    { id: 'security', number: 5, title: 'Encryption & Account Security Standard' },
    { id: 'sharing', number: 6, title: 'Third-Party Disclosure & Data Sharing' },
    { id: 'retention', number: 7, title: 'Data Retention & Audit Preservation' },
    { id: 'cookies', number: 8, title: 'Cookies, Tokens & Session Analytics' },
    { id: 'rights', number: 9, title: 'User Data Rights & Privacy Controls' },
    { id: 'updates', number: 10, title: 'Policy Amendments & Notifications' },
    { id: 'contact', number: 11, title: 'Data Protection Officer Contact' },
  ];

  const highlights = [
    {
      title: 'No Sale of Personal Data',
      description: 'We do not sell, rent, or trade your personal or financial data to third-party advertisers.'
    },
    {
      title: 'Bank-Grade Encryption',
      description: 'All sensitive payload data, tokens, and ledger entries are encrypted in transit and at rest.'
    },
    {
      title: 'Full User Control',
      description: 'You maintain explicit control to request data access, export statements, or initiate corrections.'
    }
  ];

  return (
    <LegalPageTemplate
      title="Privacy Policy"
      subtitle="How Kalpanaaa Finance collects, processes, safeguards, and respects your financial and personal data."
      documentId="DOC-PRIV-2026-V3"
      lastUpdated="August 15, 2026"
      sections={sections}
      highlights={highlights}
    >
      <LegalSection 
        id="intro" 
        number={1} 
        title="Privacy Commitment & Scope"
        takeaway="We maintain strict financial privacy standards across all web, mobile, and API interfaces."
      >
        <p>
          At <strong>Kalpanaaa Finance Technologies Ltd.</strong> ("we," "our," or "us"), protecting your privacy and safeguarding your confidential financial data is our highest priority. This Privacy Policy details how we collect, process, store, and shield your information when you interact with our public portals and authenticated customer applications.
        </p>
        <p>
          By utilizing our financial platform, you consent to the data governance practices described in this policy, designed in accordance with global data protection frameworks and banking privacy directives.
        </p>
      </LegalSection>

      <LegalSection 
        id="collection" 
        number={2} 
        title="Categories of Information We Collect"
        takeaway="We collect only information necessary to deliver authentic, secure digital financial services."
      >
        <p>To operate a compliant digital wealth ecosystem, we collect the following categories of information:</p>
        <ul className="list-disc pl-5 space-y-1.5 mt-2 text-slate-700 font-medium">
          <li><strong>Identity & Contact Data:</strong> Full legal name, official email address, phone number, and mailing address.</li>
          <li><strong>Authentication Credentials:</strong> Passwords hashed with BCrypt, JWT session tokens, and security challenge logs.</li>
          <li><strong>Financial & Ledger Data:</strong> Digital wallet balances, deposit transactions, withdrawal histories, investment subscriptions, and loan EMI repayment schedules.</li>
          <li><strong>Verification & KYC Data:</strong> Government-issued ID numbers, proof of address, and verified document attachments where mandated.</li>
          <li><strong>Support & Advisory Records:</strong> Customer service ticket descriptions, direct advisor notes, and inbox messages.</li>
          <li><strong>Technical System Telemetry:</strong> IP addresses, browser types, operating system identifiers, and request timestamps.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="usage" 
        number={3} 
        title="Purpose of Data Processing"
        takeaway="Data processing is strictly tied to operationalizing your financial services and verifying transactions."
      >
        <p>Your information is processed strictly for legitimate business and regulatory purposes, including:</p>
        <ul className="list-disc pl-5 space-y-1.5 mt-2 text-slate-700 font-medium">
          <li>Authenticating your access and managing customer accounts.</li>
          <li>Processing real-time wallet deposits, funds withdrawals, and investment allocations.</li>
          <li>Evaluating loan eligibility, credit score risk, and servicing monthly EMI collections.</li>
          <li>Generating monthly, quarterly, and annual PDF/CSV financial statements.</li>
          <li>Delivering mandatory account notifications, transaction alerts, and security warnings.</li>
          <li>Detecting, preventing, and investigating fraudulent transactions or security incidents.</li>
          <li>Fulfilling legal, statutory, and anti-money laundering (AML) reporting obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="financial-data" 
        number={4} 
        title="Financial & Ledger Data Safeguards"
        takeaway="Financial transaction histories are stored in immutable, highly secure ledger structures."
      >
        <p>
          All transaction records, wallet balance deltas, and investment logs are protected with strict multi-layered database security controls. Access to production financial databases is restricted to authorized systems operating under audited security protocols.
        </p>
      </LegalSection>

      <LegalSection 
        id="security" 
        number={5} 
        title="Encryption & Account Security Standard"
        takeaway="We use TLS 1.3 encryption in transit and AES-256 bit storage encryption for sensitive records."
      >
        <p>
          We employ state-of-the-art security measures to prevent unauthorized access, disclosure, or alteration of data. All network traffic between your browser and our servers is encrypted using 256-bit SSL/TLS connections. Sensitive user credentials are stored using salted BCrypt hashing.
        </p>
      </LegalSection>

      <LegalSection 
        id="sharing" 
        number={6} 
        title="Third-Party Disclosure & Data Sharing"
        takeaway="We never sell data. We share only with verified financial infrastructure partners necessary for transaction settlement."
      >
        <p>
          We do not sell, rent, or monetize your personal or financial data under any circumstances. Information is disclosed to third parties only under the following limited conditions:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 mt-2 text-slate-700 font-medium">
          <li><strong>Payment Processors & Banking Partners:</strong> To settle payment deposits, withdrawals, and bank transfers.</li>
          <li><strong>Regulatory & Law Enforcement Authorities:</strong> Strictly when required by enforceable court orders, subpoenas, or statutory financial regulations.</li>
          <li><strong>Infrastructure Providers:</strong> Encrypted hosting providers operating under strict confidentiality contracts.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="retention" 
        number={7} 
        title="Data Retention & Audit Preservation"
        takeaway="Financial ledger data is retained in accordance with statutory banking archive requirements."
      >
        <p>
          We retain your identity and transaction data for the active duration of your account and for mandatory post-account retention periods dictated by financial record-keeping regulations.
        </p>
      </LegalSection>

      <LegalSection 
        id="cookies" 
        number={8} 
        title="Cookies, Tokens & Session Analytics"
        takeaway="We use essential HTTP session tokens to maintain your secure authenticated login session."
      >
        <p>
          Our platform utilizes secure session cookies and local storage tokens strictly to maintain your authenticated state across page views and preserve user preferences. We do not use intrusive cross-site tracking cookies.
        </p>
      </LegalSection>

      <LegalSection 
        id="rights" 
        number={9} 
        title="User Data Rights & Privacy Controls"
        takeaway="You have the right to review your data, request corrections, and export your statement history anytime."
      >
        <p>Subject to applicable law, you possess the following privacy rights:</p>
        <ul className="list-disc pl-5 space-y-1.5 mt-2 text-slate-700 font-medium">
          <li><strong>Access & Export:</strong> View your profile, active loans, investments, and download complete financial statements in PDF or CSV formats.</li>
          <li><strong>Correction:</strong> Update outdated personal or contact details through your Customer Dashboard settings.</li>
          <li><strong>Inquiry & Grievance:</strong> Lodge formal data privacy inquiries directly with our Data Protection Officer.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="updates" 
        number={10} 
        title="Policy Amendments & Notifications"
        takeaway="Significant policy updates will be highlighted via portal notifications prior to taking effect."
      >
        <p>
          We periodically update this Privacy Policy to reflect technical enhancements, security audits, or regulatory updates. Material modifications will be communicated via in-portal notices or direct email alerts.
        </p>
      </LegalSection>

      <LegalSection 
        id="contact" 
        number={11} 
        title="Data Protection Officer Contact"
        takeaway="Direct inquiries regarding privacy governance to our Privacy & Data Protection Desk."
      >
        <p>
          If you have questions, concerns, or formal requests regarding your data privacy, please contact our Data Protection Officer:
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1 font-mono">
          <p><strong>Office of Data Protection & Privacy Governance</strong></p>
          <p>Kalpanaaa Finance Technologies Ltd.</p>
          <p>Email: privacy@kalpanaaa-finance.com</p>
          <p>Grievance Escalation: Dashboard Support Desk (Category: Legal & Privacy)</p>
        </div>
      </LegalSection>
    </LegalPageTemplate>
  );
};

export default PrivacyPolicyPage;

