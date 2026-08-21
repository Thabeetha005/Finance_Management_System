import React from 'react';
import LegalPageTemplate, { LegalSection } from '../../../shared/components/layouts/LegalPageTemplate';

const TermsOfServicePage = () => {
  return (
    <LegalPageTemplate
      title="Terms of Service"
      subtitle="Terms governing your use of the Kalpanaaa Finance platform and services."
      lastUpdated="August 15, 2026"
    >
      <LegalSection number={1} title="Acceptance of Terms">
        <p>
          By accessing or using the Kalpanaaa Finance platform, website, or any of our provided services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access the platform or utilize our services.
        </p>
      </LegalSection>

      <LegalSection number={2} title="About the Platform">
        <p>
          Kalpanaaa Finance provides digital financial services and technology-enabled financial management capabilities. Our platform serves as an interface for users to manage investments, apply for loans, conduct payments, and utilize digital wallet functionalities within the bounds of our service offerings.
        </p>
      </LegalSection>

      <LegalSection number={3} title="User Accounts">
        <p>
          To access our financial services, you must register for an account. By registering, you agree to:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Provide accurate, current, and complete information during registration.</li>
          <li>Maintain the security and confidentiality of your credentials.</li>
          <li>Accept full responsibility for all activities that occur under your account.</li>
          <li>Register only as a customer for personal or business use as permitted, without impersonating others.</li>
        </ul>
      </LegalSection>

      <LegalSection number={4} title="Investments">
        <p>
          Our platform offers various investment-related features. Please note:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>We do not promise guaranteed returns on any investments.</li>
          <li>Investments are not risk-free; market conditions and other factors may affect outcomes.</li>
          <li>Financial outcomes may vary based on market performance and individual choices.</li>
          <li>Applicable product terms govern each specific investment offering, and users must review these before participating.</li>
        </ul>
      </LegalSection>

      <LegalSection number={5} title="Loans">
        <p>
          Users may apply for loans through our platform. Regarding loans:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Submission of a loan application does not guarantee approval. All applications are subject to our eligibility criteria and review processes.</li>
          <li>Approved loans are bound by specific loan terms, including interest rates and duration.</li>
          <li>Users are responsible for timely EMI payments according to their repayment schedule.</li>
          <li>Applicable fees, charges, or penalties may apply for late payments as detailed in the loan agreement.</li>
        </ul>
      </LegalSection>

      <LegalSection number={6} title="Payments & Transfers">
        <p>
          The platform facilitates payments and transfers. Users must utilize these features strictly for lawful transactions. Any attempt to exploit, manipulate, or abuse the payment routing systems will result in immediate account suspension and potential legal action.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Wallet">
        <p>
          Your digital wallet reflects funds available for investments, loan repayments, and permitted platform transactions. The wallet must be used in accordance with our transaction limits and acceptable use policies.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Customer Support">
        <p>
          We provide a comprehensive support-ticket system for our users. You may:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Select a specific issue category when submitting a request.</li>
          <li>Track the status of your ticket through the dashboard.</li>
          <li>Receive responses and resolution notifications directly in your platform Inbox.</li>
        </ul>
      </LegalSection>

      <LegalSection number={9} title="Prohibited Activities">
        <p>While using our platform, you strictly must not:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Provide fraudulent, false, or misleading information.</li>
          <li>Attempt unauthorized access to the platform or underlying infrastructure.</li>
          <li>Manipulate transactions or exploit platform mechanics.</li>
          <li>Abuse financial services for money laundering or illicit activities.</li>
          <li>Circumvent security controls or authentication measures.</li>
          <li>Upload malicious content, scripts, or malware.</li>
          <li>Attempt to access, view, or modify another customer's information.</li>
        </ul>
      </LegalSection>

      <LegalSection number={10} title="Security">
        <p>
          Platform security is a shared responsibility. You must maintain credential confidentiality. Any unauthorized access attempts, probing of our infrastructure, or failure to secure your account credentials constitutes a breach of these Terms.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Service Availability">
        <p>
          While we strive for high reliability, we do not guarantee uninterrupted availability. Services may occasionally be unavailable due to:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Scheduled or emergency maintenance.</li>
          <li>Technical or infrastructure issues.</li>
          <li>Security events or threat mitigation.</li>
          <li>Circumstances outside our reasonable control (force majeure).</li>
        </ul>
      </LegalSection>

      <LegalSection number={12} title="Financial Disclaimer">
        <p>
          Kalpanaaa Finance provides technology and access to financial products, but does not provide guaranteed financial returns. Financial products and investments involve inherent risks. You should carefully review all applicable product terms, risks, and documentation before making any financial decisions on the platform.
        </p>
      </LegalSection>

      <LegalSection number={13} title="Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, Kalpanaaa Finance shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your access to or use of, or inability to access or use, our services.
        </p>
      </LegalSection>

      <LegalSection number={14} title="Changes to Terms">
        <p>
          We reserve the right to update or modify these Terms of Service when necessary to reflect changes in our services, regulatory requirements, or security practices. Users will be notified of material changes where appropriate, and continued use of the platform constitutes acceptance of the updated terms.
        </p>
      </LegalSection>

      <LegalSection number={15} title="Contact">
        <p>
          For any questions regarding these Terms of Service, please contact us through the Support system in your dashboard or via our public Contact page.
        </p>
      </LegalSection>
    </LegalPageTemplate>
  );
};

export default TermsOfServicePage;
