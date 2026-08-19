import React from 'react';
import LegalPageTemplate, { LegalSection } from '../../components/layouts/LegalPageTemplate';

const PrivacyPolicyPage = () => {
  return (
    <LegalPageTemplate
      title="Privacy Policy"
      subtitle="How Kalpanaa Finance collects, uses, protects, and manages your information."
      lastUpdated="August 15, 2026"
    >
      <LegalSection number={1} title="Introduction">
        <p>
          Kalpanaa Finance ("we," "our," or "us") respects your privacy and is committed to protecting your personal and financial information. This Privacy Policy explains how we handle your data when you access our website and use our authenticated finance platform.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Information We Collect">
        <p>We collect information necessary to provide our financial services effectively. This includes:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Identity information (Name, Email address, Phone number)</li>
          <li>Account and Authentication information (Login credentials)</li>
          <li>KYC-related information where applicable</li>
          <li>Transaction and Wallet information</li>
          <li>Investment portfolio information</li>
          <li>Loan application and repayment information</li>
          <li>Payment history and details</li>
          <li>Support requests, messages, and communications</li>
          <li>Device, browser, and website usage information</li>
        </ul>
      </LegalSection>

      <LegalSection number={3} title="How We Use Information">
        <p>Your information is used strictly for the operation and improvement of our platform, including:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Creating and managing customer accounts</li>
          <li>Processing investments and tracking returns</li>
          <li>Processing loan applications and managing EMIs</li>
          <li>Processing payments and managing wallet transactions</li>
          <li>Providing customer support and responding to inquiries</li>
          <li>Sending account notifications and important alerts</li>
          <li>Maintaining platform security and preventing fraud</li>
          <li>Improving platform functionality and user experience</li>
          <li>Meeting applicable legal and regulatory obligations</li>
        </ul>
      </LegalSection>

      <LegalSection number={4} title="Financial Information">
        <p>
          We handle all financial information securely. Your investment, loan, and wallet data is used exclusively for legitimate platform operations and to deliver the financial services you request. We employ industry-standard encryption and security practices to safeguard this sensitive data.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Authentication & Account Security">
        <p>
          Our platform uses robust authentication mechanisms to secure your account. You are responsible for maintaining the confidentiality of your login credentials. We strongly advise against sharing your password with anyone, including our support staff.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Customer Support Information">
        <p>
          When you submit an issue through our Support system, the information you provide (including ticket details and messages) is stored to investigate, track, and resolve your issue efficiently. This history helps us provide better service on subsequent inquiries.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Notifications & Communications">
        <p>To keep you informed about your account, we may send you the following types of communications:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Transaction and payment notifications</li>
          <li>Loan status and EMI updates</li>
          <li>Investment performance updates</li>
          <li>Support-ticket resolutions and replies</li>
          <li>Important account and security communications</li>
        </ul>
      </LegalSection>

      <LegalSection number={8} title="Data Sharing">
        <p>
          We do not sell your personal data. We only share information when absolutely necessary to provide our services, which includes sharing with:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Trusted service providers facilitating our operations</li>
          <li>Payment processors and financial infrastructure providers</li>
          <li>Authorized internal personnel handling operations and support</li>
          <li>Legal or regulatory authorities, strictly when required by law</li>
        </ul>
      </LegalSection>

      <LegalSection number={9} title="Data Retention">
        <p>
          We retain your personal and financial information for as long as necessary to fulfill the purposes outlined in this policy, provide our services, maintain accurate financial records, resolve disputes, comply with legal obligations, and protect the integrity of the platform.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Cookies & Analytics">
        <p>
          We use essential cookies to maintain your authenticated session and ensure the secure operation of the platform. We may also use standard analytics tools to understand website traffic patterns and improve our user interface.
        </p>
      </LegalSection>

      <LegalSection number={11} title="User Rights">
        <p>
          You have the right to access the personal information we hold about you and to request corrections to any inaccurate data. Depending on your jurisdiction, you may have additional rights regarding your data. For any privacy-related inquiries or to exercise your rights, please use our contact channels.
        </p>
      </LegalSection>

      <LegalSection number={12} title="Contact Us">
        <p>
          If you have questions about this Privacy Policy or how we handle your data, please reach out to us through the Support section of your dashboard or via our Contact page.
        </p>
      </LegalSection>
    </LegalPageTemplate>
  );
};

export default PrivacyPolicyPage;
