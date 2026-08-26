import React from 'react';
import LegalPageTemplate, { LegalSection } from '../../../shared/components/layouts/LegalPageTemplate';

const TermsOfServicePage = () => {
  const sections = [
    { id: 'acceptance', number: 1, title: 'Acceptance of Terms' },
    { id: 'platform', number: 2, title: 'About the Platform & Scope' },
    { id: 'accounts', number: 3, title: 'User Account Responsibilities & Security' },
    { id: 'investments', number: 4, title: 'Investment Products & Risk Disclosures' },
    { id: 'loans', number: 5, title: 'Loan Origination & Repayment Terms' },
    { id: 'payments', number: 6, title: 'Payment Processing & Wallet Rules' },
    { id: 'prohibited', number: 7, title: 'Prohibited Activities & Conduct' },
    { id: 'security', number: 8, title: 'Account Security & Shared Responsibility' },
    { id: 'availability', number: 9, title: 'Service Availability & SLA Disclaimer' },
    { id: 'disclaimer', number: 10, title: 'Financial Disclaimer & No Guarantee' },
    { id: 'liability', number: 11, title: 'Limitation of Liability & Indemnification' },
    { id: 'governance', number: 12, title: 'Governing Law & Dispute Resolution' },
    { id: 'modifications', number: 13, title: 'Modifications to Agreement' },
    { id: 'contact', number: 14, title: 'Official Legal Contact' },
  ];

  const highlights = [
    {
      title: 'Binding Agreement',
      description: 'Accessing Kalpanaaa Finance constitutes a legally binding agreement under financial regulations.'
    },
    {
      title: 'Risk Awareness',
      description: 'All financial investments carry market risks. Past yield rates do not guarantee future returns.'
    },
    {
      title: 'Strict Security',
      description: 'Users are strictly responsible for maintaining credential secrecy and authenticating transactions.'
    }
  ];

  return (
    <LegalPageTemplate
      title="Terms of Service"
      subtitle="Governing terms and conditions for accessing the Kalpanaaa Finance platform, wealth tools, and digital advisory."
      documentId="DOC-TOS-2026-V4"
      lastUpdated="August 15, 2026"
      sections={sections}
      highlights={highlights}
    >
      <LegalSection 
        id="acceptance" 
        number={1} 
        title="Acceptance of Terms"
        takeaway="By registering or utilizing our digital portal, you confirm complete acceptance of these binding terms."
      >
        <p>
          These Terms of Service ("Agreement") govern your access to and use of the website, mobile applications, API endpoints, digital wallet, and financial services provided by <strong>Kalpanaaa Finance Technologies Ltd.</strong> ("Kalpanaaa Finance," "we," "us," or "our").
        </p>
        <p>
          By creating an account, logging into the platform, or submitting financial applications, you acknowledge that you have read, understood, and agree to be bound by this Agreement in full compliance with applicable financial laws and electronic signature mandates. If you do not agree to these terms, you must immediately cease all access and use of our platform.
        </p>
      </LegalSection>

      <LegalSection 
        id="platform" 
        number={2} 
        title="About the Platform & Scope"
        takeaway="Kalpanaaa Finance offers digital wealth management, loan processing, advisory sessions, and automated wallet services."
      >
        <p>
          Kalpanaaa Finance provides an integrated digital wealth and financial management platform. Our services include personal and corporate wealth planning, automated loan application processing, investment subscription tracking, financial consultant advisory scheduling, and digital wallet accounting.
        </p>
        <p>
          We reserve the absolute right to modify, enhance, restrict, or discontinue any feature, endpoint, or service component at our discretion to maintain system security, operational efficiency, or legal compliance.
        </p>
      </LegalSection>

      <LegalSection 
        id="accounts" 
        number={3} 
        title="User Account Responsibilities & Security"
        takeaway="Account creation requires true identity data. Impersonation or fraudulent registration is illegal."
      >
        <p>
          To access authenticated features, you must complete user registration. You represent and warrant that:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 mt-2 text-slate-700 font-medium">
          <li>All registration data, contact details, and identity documents provided are accurate, truthful, and current.</li>
          <li>You are of legal age in your jurisdiction (minimum 18 years of age) to enter into binding financial contracts.</li>
          <li>You will maintain strict confidentiality over your authentication credentials (password, JWT tokens, OTPs).</li>
          <li>You will notify our Security Desk immediately upon suspecting any unauthorized access to your account.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="investments" 
        number={4} 
        title="Investment Products & Risk Disclosures"
        takeaway="Financial investments involve risk. Market yields fluctuate and past performance is not indicative of future returns."
      >
        <p>
          Kalpanaaa Finance offers access to structured investment plans (e.g. Fixed Returns, Equity Growth, High Yield). All investments are subject to market conditions and specific product offer documents.
        </p>
        <div className="bg-[#e6f3f0] p-4 rounded-xl border border-[#106354]/20 text-[#106354] font-semibold text-xs space-y-1">
          <p className="font-bold uppercase tracking-wider text-[11px]">Important Risk Notice:</p>
          <p>Kalpanaaa Finance does not guarantee fixed capital protection against market downturns unless explicitly stated in a certified sovereign or fixed-deposit contract. Subscribers must evaluate their risk tolerance before subscribing.</p>
        </div>
      </LegalSection>

      <LegalSection 
        id="loans" 
        number={5} 
        title="Loan Origination & Repayment Terms"
        takeaway="Loan approval depends on credit verification. EMI repayments must be executed according to the approved schedule."
      >
        <p>
          Loan applications submitted via the Customer Portal undergo automated credit evaluation, document verification, and administrative review. Submission of an application does not guarantee funding.
        </p>
        <p>
          Upon disbursement into your digital wallet, you agree to make timely EMI repayments according to the agreed schedule. Failure to pay EMIs by the due date may incur late penalty fees, affect your credit score, and initiate recovery proceedings as permitted by law.
        </p>
      </LegalSection>

      <LegalSection 
        id="payments" 
        number={6} 
        title="Payment Processing & Wallet Rules"
        takeaway="Wallet funds are maintained strictly for legitimate financial transactions, investments, and repayments."
      >
        <p>
          Digital wallet ledger entries reflect cleared funds deposited, interest credited, loan disbursements, or withdrawals processed. All transaction requests are logged with immutable audit timestamps and transaction references.
        </p>
        <p>
          We enforce strict anti-money laundering (AML) and counter-terrorist financing (CTF) protocols. Deposits or transfer attempts originating from unverified or suspicious payment sources will be held pending investigation.
        </p>
      </LegalSection>

      <LegalSection 
        id="prohibited" 
        number={7} 
        title="Prohibited Activities & Conduct"
        takeaway="Zero tolerance for fraud, system exploitation, unauthorized API scraping, or identity misrepresentation."
      >
        <p>While utilizing Kalpanaaa Finance, you strictly agree NOT to:</p>
        <ul className="list-disc pl-5 space-y-1.5 mt-2 text-slate-700 font-medium">
          <li>Engage in fraudulent transactions, identity theft, or unauthorized credit usage.</li>
          <li>Decompile, reverse-engineer, probe, or attempt to exploit platform code, APIs, or database queries.</li>
          <li>Bypass or attempt to circumvent authentication filters or role-based permission boundaries.</li>
          <li>Upload malicious code, automated bots, scrapers, or Denial-of-Service (DoS) payloads.</li>
          <li>Manipulate financial numbers, wallet balances, or transaction parameters.</li>
        </ul>
      </LegalSection>

      <LegalSection 
        id="security" 
        number={8} 
        title="Account Security & Shared Responsibility"
        takeaway="Security is a joint responsibility. Keep your secret keys and device passwords protected."
      >
        <p>
          We employ enterprise 256-bit SSL encryption, JWT authentication tokens, and strict database firewalls. However, account protection depends equally on your security hygiene. You are solely responsible for actions originating from your account credentials.
        </p>
      </LegalSection>

      <LegalSection 
        id="availability" 
        number={9} 
        title="Service Availability & SLA Disclaimer"
        takeaway="We maintain high uptime, but service may undergo brief maintenance windows or scheduled upgrades."
      >
        <p>
          While Kalpanaaa Finance strives for 99.9% service availability, we do not guarantee uninterrupted access. System maintenance, security upgrades, internet infrastructure outages, or emergency fixes may temporarily affect portal access.
        </p>
      </LegalSection>

      <LegalSection 
        id="disclaimer" 
        number={10} 
        title="Financial Disclaimer & No Guarantee"
        takeaway="Consultant advice provided on the platform is advisory in nature and does not constitute a legal guarantee."
      >
        <p>
          Advisory sessions, articles, market analysis, and calculator estimations are provided for informational and planning purposes only. Users should consult their independent legal or tax advisors for specialized personal guidance.
        </p>
      </LegalSection>

      <LegalSection 
        id="liability" 
        number={11} 
        title="Limitation of Liability & Indemnification"
        takeaway="Our total liability is strictly limited as allowed under financial regulations and governing law."
      >
        <p>
          To the fullest extent permitted by law, Kalpanaaa Finance, its officers, directors, employees, and partners shall not be liable for any indirect, punitive, incidental, or consequential damages arising from service interruption, data loss, or market yield fluctuations.
        </p>
      </LegalSection>

      <LegalSection 
        id="governance" 
        number={12} 
        title="Governing Law & Dispute Resolution"
        takeaway="Disputes are resolved through binding arbitration under applicable banking and financial laws."
      >
        <p>
          This Agreement shall be governed by and construed in accordance with applicable financial regulation laws. Any dispute or claim arising out of or in connection with these terms shall first be submitted to informal resolution through our Legal Ombudsman before formal arbitration.
        </p>
      </LegalSection>

      <LegalSection 
        id="modifications" 
        number={13} 
        title="Modifications to Agreement"
        takeaway="Material changes to terms will be communicated via portal announcements and email notifications."
      >
        <p>
          We reserve the right to revise these Terms of Service at any time. Updated versions will display an updated "Effective Date" at the top of this document. Continued use of the platform following notice constitutes full acceptance.
        </p>
      </LegalSection>

      <LegalSection 
        id="contact" 
        number={14} 
        title="Official Legal Contact"
        takeaway="For legal inquiries or regulatory communications, contact our legal compliance office."
      >
        <p>
          For questions, formal notices, or regulatory inquiries regarding these Terms of Service, please reach out to:
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1 font-mono">
          <p><strong>Kalpanaaa Finance Legal & Regulatory Compliance Desk</strong></p>
          <p>Email: legal@kalpanaaa-finance.com</p>
          <p>Support Portal: Dashboard Support Desk (Category: Legal / Privacy)</p>
        </div>
      </LegalSection>
    </LegalPageTemplate>
  );
};

export default TermsOfServicePage;

