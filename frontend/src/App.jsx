import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './shared/components/ScrollToTop';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import HomePage from './apps/public/pages/HomePage';
import SignInPage from './apps/public/pages/SignInPage';
import LoginPage from './apps/public/pages/LoginPage';
import AboutPage from './apps/public/pages/AboutPage';
import ContactPage from './apps/public/pages/ContactPage';
import IndustriesPage from './apps/public/pages/IndustriesPage';
import AdminLayout from './apps/admin/layouts/AdminLayout';
import AdminDashboard from './apps/admin/pages/AdminDashboard';
import CustomerDashboard from './apps/user/pages/CustomerDashboard';
import Transactions from './apps/admin/pages/Transactions';
import Accounts from './apps/admin/pages/Accounts';
import Clients from './apps/admin/pages/Clients';
import Income from './apps/admin/pages/Income';
import Expenses from './apps/admin/pages/Expenses';
import Invoices from './apps/admin/pages/Invoices';
import AllCustomers from './apps/admin/pages/Users';

import AdminBlogCategories from './apps/admin/pages/AdminBlogCategories';
import AdminUserDetails from './apps/admin/pages/AdminUserDetails';
import BlogManagement from './apps/admin/pages/BlogManagement';
import ConsultationManagement from './apps/admin/pages/ConsultationManagement';
import ContactRequestManagement from './apps/admin/pages/ContactRequestManagement';
import AdminVerificationQueue from './apps/admin/pages/AdminVerificationQueue';
import AdminFinancialApprovals from './apps/admin/pages/AdminFinancialApprovals';
import AdminAnnouncements from './apps/admin/pages/AdminAnnouncements';
import AdminSupportPage from './apps/admin/pages/AdminSupportPage';
import AdminConsultants from './apps/admin/pages/AdminConsultants';
import AdminConsultantDetails from './apps/admin/pages/AdminConsultantDetails';
import AdminAuditLogsPage from './apps/admin/pages/AdminAuditLogsPage';
import AdminSettings from './apps/admin/pages/AdminSettings';
import AdminProfilePage from './apps/admin/pages/AdminProfilePage';

import PublicLayout from './apps/public/layouts/PublicLayout';
import DashboardLayout from './shared/components/layouts/DashboardLayout';
import CustomerProfilePage from './apps/user/pages/CustomerProfilePage';
import CustomerWalletPage from './apps/user/pages/CustomerWalletPage';
import CustomerInvestPage from './apps/user/pages/CustomerInvestPage';
import CustomerLoansPage from './apps/user/pages/CustomerLoansPage';
import CustomerPaymentsPage from './apps/user/pages/CustomerPaymentsPage';
import CustomerConsultPage from './apps/user/pages/CustomerConsultPage';
import CustomerEmiRepaymentsPage from './apps/user/pages/CustomerEmiRepaymentsPage';
import CustomerInboxPage from './apps/user/pages/CustomerInboxPage';
import CustomerDocumentsPage from './apps/user/pages/CustomerDocumentsPage';
import CustomerSupportPage from './apps/user/pages/CustomerSupportPage';
import CustomerSettings from './apps/user/pages/CustomerSettings';

import ServicesLandingPage from './apps/public/pages/ServicesLandingPage';
import CategoryPage from './apps/public/pages/CategoryPage';
import ServicePage from './apps/public/pages/ServicePage';
import TestimonialsPage from './apps/public/pages/TestimonialsPage';
import DigitalFinancePage from './apps/public/pages/DigitalFinancePage';
import ConsultingPage from './apps/public/pages/ConsultingPage';
import TeamPage from './apps/public/pages/TeamPage';
import FaqPage from './apps/public/pages/FaqPage';

import LatestNewsPage from './apps/public/pages/LatestNewsPage';
import FinancialInsightsPage from './apps/public/pages/FinancialAnalyticsPage';
import CompanyUpdatesPage from './apps/public/pages/CompanyUpdatesPage';

import RiskCompliancePage from './apps/public/pages/RiskCompliancePage';
import LendingCreditPage from './apps/public/pages/LendingCreditPage';
import InvestmentWealthPage from './apps/public/pages/InvestmentWealthPage';

import PrivacyPolicyPage from './apps/public/pages/PrivacyPolicyPage';
import TermsOfServicePage from './apps/public/pages/TermsOfServicePage';

import ConsultantLayout from './apps/consultant/layouts/ConsultantLayout';
import ConsultantDashboard from './apps/consultant/pages/ConsultantDashboard';
import ConsultantSessions from './apps/consultant/pages/ConsultantSessions';
import ConsultantSessionDetails from './apps/consultant/pages/ConsultantSessionDetails';
import ConsultantSettings from './apps/consultant/pages/ConsultantSettings';
import ConsultantLogs from './apps/consultant/pages/ConsultantLogs';
import ConsultantReports from './apps/consultant/pages/ConsultantReports';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || 'CUSTOMER').toUpperCase();

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/industries" element={<IndustriesPage />} />
        <Route path="/services" element={<ServicesLandingPage />} />
        <Route path="/services/category/:category" element={<CategoryPage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/services/digital-finance-platform" element={<DigitalFinancePage />} />
        <Route path="/services/consulting" element={<ConsultingPage />} />
        <Route path="/consulting" element={<ConsultingPage />} />
        <Route path="/consultants" element={<ConsultingPage />} />
        <Route path="/services/risk-management" element={<RiskCompliancePage />} />
        <Route path="/services/loan-management" element={<LendingCreditPage />} />
        <Route path="/services/investment-management" element={<InvestmentWealthPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/blog/latest-news" element={<LatestNewsPage />} />
        <Route path="/blog/financial-insights" element={<FinancialInsightsPage />} />
        <Route path="/blog/company-updates" element={<CompanyUpdatesPage />} />
      </Route>

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/register" element={<SignInPage />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AllCustomers />} />
        <Route path="customers" element={<AllCustomers />} />
        <Route path="users/:userId" element={<AdminUserDetails />} />
        <Route path="loans" element={<AdminFinancialApprovals />} />
        <Route path="approvals" element={<AdminFinancialApprovals />} />
        <Route path="deposits" element={<AdminFinancialApprovals />} />
        <Route path="withdrawals" element={<AdminFinancialApprovals />} />
        <Route path="investments" element={<AdminFinancialApprovals />} />
        <Route path="consultations" element={<ConsultationManagement />} />
        <Route path="verifications" element={<AdminVerificationQueue />} />
        <Route path="verification-queue" element={<AdminVerificationQueue />} />
        <Route path="contact-requests" element={<ContactRequestManagement />} />
        <Route path="blogs" element={<BlogManagement />} />
        <Route path="blog-categories" element={<AdminBlogCategories />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="support" element={<AdminSupportPage />} />
        <Route path="consultants" element={<AdminConsultants />} />
        <Route path="consultants/:id" element={<AdminConsultantDetails />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="clients" element={<Clients />} />
        <Route path="income" element={<Income />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="invoices" element={<Invoices />} />
      </Route>

      {/* Protected Customer Routes */}
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CustomerDashboard />} />
        <Route path="account" element={<CustomerProfilePage />} />
        <Route path="wallet" element={<CustomerWalletPage />} />
        <Route path="investments" element={<CustomerInvestPage />} />
        <Route path="investpage" element={<CustomerInvestPage />} />
        <Route path="loans" element={<CustomerLoansPage />} />
        <Route path="payments" element={<CustomerPaymentsPage />} />
        <Route path="consultation" element={<CustomerConsultPage />} />
        <Route path="consult" element={<CustomerConsultPage />} />
        <Route path="emi-repayments" element={<CustomerEmiRepaymentsPage />} />
        <Route path="inbox" element={<CustomerInboxPage />} />
        <Route path="documents" element={<CustomerDocumentsPage />} />
        <Route path="support" element={<CustomerSupportPage />} />
        <Route path="settings" element={<CustomerSettings />} />
        <Route path="dashboard" element={<Navigate to="/profile" replace />} />
      </Route>

      {/* Top-Level Shortcuts */}
      <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
      <Route path="/wallet" element={<Navigate to="/profile/wallet" replace />} />

      {/* Protected Consultant Routes */}
      <Route path="/consultant" element={
        <ProtectedRoute allowedRoles={['CONSULTANT', 'ADMIN']}>
          <ConsultantLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ConsultantDashboard />} />
        <Route path="sessions" element={<ConsultantSessions />} />
        <Route path="sessions/:id" element={<ConsultantSessionDetails />} />
        <Route path="settings" element={<ConsultantSettings />} />
        <Route path="logs" element={<ConsultantLogs />} />
        <Route path="reports" element={<ConsultantReports />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Toaster position="top-right" />
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
