import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/public/HomePage';
import SignInPage from './pages/public/SignInPage';
import LoginPage from './pages/public/LoginPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import IndustriesPage from './pages/IndustriesPage';
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Transactions from './pages/admin/Transactions';
import Accounts from './pages/admin/Accounts';
import Clients from './pages/admin/Clients';
import Income from './pages/admin/Income';
import Expenses from './pages/admin/Expenses';
import Invoices from './pages/admin/Invoices';
import AllCustomers from './pages/admin/Users';

import AdminBlogCategories from './pages/admin/AdminBlogCategories';
import AdminUserDetails from './pages/admin/AdminUserDetails';
import BlogManagement from './pages/admin/BlogManagement';
import ConsultationManagement from './pages/admin/ConsultationManagement';
import ContactRequestManagement from './pages/admin/ContactRequestManagement';
import AdminVerificationQueue from './pages/admin/AdminVerificationQueue';
import AdminFinancialApprovals from './pages/admin/AdminFinancialApprovals';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AdminConsultants from './pages/admin/AdminConsultants';
import AdminConsultantDetails from './pages/admin/AdminConsultantDetails';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfilePage from './pages/admin/AdminProfilePage';

import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';
import CustomerWalletPage from './pages/customer/CustomerWalletPage';
import CustomerInvestPage from './pages/customer/CustomerInvestPage';
import CustomerLoansPage from './pages/customer/CustomerLoansPage';
import CustomerPaymentsPage from './pages/customer/CustomerPaymentsPage';
import CustomerConsultPage from './pages/customer/CustomerConsultPage';
import CustomerEmiRepaymentsPage from './pages/customer/CustomerEmiRepaymentsPage';
import CustomerInboxPage from './pages/customer/CustomerInboxPage';
import CustomerDocumentsPage from './pages/customer/CustomerDocumentsPage';
import CustomerSupportPage from './pages/customer/CustomerSupportPage';
import CustomerSettings from './pages/customer/CustomerSettings';

import ServicesLandingPage from './pages/public/ServicesLandingPage';
import CategoryPage from './pages/public/CategoryPage';
import ServicePage from './pages/public/ServicePage';
import TestimonialsPage from './pages/public/TestimonialsPage';
import DigitalFinancePage from './pages/public/DigitalFinancePage';
import ConsultingPage from './pages/public/ConsultingPage';
import TeamPage from './pages/public/TeamPage';
import FaqPage from './pages/public/FaqPage';

import LatestNewsPage from './pages/public/blog/LatestNewsPage';
import FinancialInsightsPage from './pages/public/blog/FinancialInsightsPage';
import CompanyUpdatesPage from './pages/public/blog/CompanyUpdatesPage';

import RiskCompliancePage from './pages/public/RiskCompliancePage';
import LendingCreditPage from './pages/public/LendingCreditPage';
import InvestmentWealthPage from './pages/public/InvestmentWealthPage';

import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsOfServicePage from './pages/public/TermsOfServicePage';

import ConsultantLayout from './components/layouts/ConsultantLayout';
import ConsultantDashboard from './pages/consultant/ConsultantDashboard';
import ConsultantSessions from './pages/consultant/ConsultantSessions';
import ConsultantSessionDetails from './pages/consultant/ConsultantSessionDetails';
import ConsultantSettings from './pages/consultant/ConsultantSettings';
import ConsultantLogs from './pages/consultant/ConsultantLogs';
import ConsultantReports from './pages/consultant/ConsultantReports';

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
  const isAdmin = role === 'ADMIN';
  const isConsultant = role === 'CONSULTANT';

  // Admin access guard
  if (isAdmin) {
    if (allowedRoles && allowedRoles.includes('CUSTOMER')) {
      return <Navigate to="/admin" replace />;
    }
    return children;
  }

  // Consultant access guard
  if (isConsultant) {
    if (allowedRoles && allowedRoles.includes('CUSTOMER')) {
      return <Navigate to="/consultant" replace />;
    }
    return children;
  }

  // Customer / User access guard
  if (allowedRoles && allowedRoles.includes('ADMIN')) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

const ConsultantRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CONSULTANT') return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Standalone Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/register" element={<SignInPage />} />

      {/* Public Pages with Header/Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/industries" element={<IndustriesPage />} />
        <Route path="/blog/latest-news" element={<LatestNewsPage />} />
        <Route path="/blog/insights" element={<FinancialInsightsPage />} />
        <Route path="/blog/company-updates" element={<CompanyUpdatesPage />} />
        {/* We also need a redirect from /blog to /blog/latest-news since the user clicked "BLOG" */}
        <Route path="/blog" element={<Navigate to="/blog/latest-news" replace />} />
        <Route path="/consulting" element={<ConsultingPage />} />
        <Route path="/services" element={<ServicesLandingPage />} />
        <Route path="/services/digital-finance" element={<DigitalFinancePage />} />
        <Route path="/services/risk-compliance" element={<RiskCompliancePage />} />
        <Route path="/services/lending-credit" element={<LendingCreditPage />} />
        <Route path="/services/investment-wealth" element={<InvestmentWealthPage />} />
        <Route path="/services/category/:slug" element={<CategoryPage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/faq" element={<FaqPage />} />
        
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      </Route>

      {/* Customer Dashboard Route */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['CUSTOMER', 'customer']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CustomerDashboard />} />
      </Route>

      {/* Standalone Wallet Route */}
      <Route path="/wallet" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CustomerWalletPage />} />
      </Route>

      {/* Customer Profile Layout */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CustomerProfilePage />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="wallet" element={<CustomerWalletPage />} />
        <Route path="investpage" element={<CustomerInvestPage />} />
        <Route path="loans" element={<CustomerLoansPage />} />
        <Route path="emi-repayments" element={<CustomerEmiRepaymentsPage />} />
        <Route path="payments" element={<CustomerPaymentsPage />} />
        <Route path="consult" element={<CustomerConsultPage />} />
        <Route path="documents" element={<CustomerDocumentsPage />} />
        <Route path="inbox" element={<CustomerInboxPage />} />
        <Route path="support" element={<CustomerSupportPage />} />
        <Route path="settings" element={<CustomerSettings />} />
        <Route path="*" element={<CustomerProfilePage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="clients" element={<Clients />} />
        <Route path="consultants" element={<AdminConsultants />} />
        <Route path="consultants/:id" element={<AdminConsultantDetails />} />
        <Route path="users" element={<AllCustomers />} />
        <Route path="users/:userId" element={<AdminUserDetails />} />
        <Route path="income" element={<Income />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="blogs" element={<BlogManagement />} />
        <Route path="blog-categories" element={<AdminBlogCategories />} />
        <Route path="consultations" element={<ConsultationManagement />} />
        <Route path="contact-requests" element={<ContactRequestManagement />} />
        <Route path="verification-queue" element={<AdminVerificationQueue />} />
        <Route path="approvals" element={<AdminFinancialApprovals />} />
        <Route path="notifications" element={<AdminAnnouncements />} />
        <Route path="support" element={<AdminSupportPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="settings" element={<AdminProfilePage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      {/* Consultant Routes */}
      <Route path="/consultant" element={
        <ConsultantRoute>
          <ConsultantLayout />
        </ConsultantRoute>
      }>
        <Route index element={<ConsultantDashboard />} />
        <Route path="sessions" element={<ConsultantSessions />} />
        <Route path="sessions/:id" element={<ConsultantSessionDetails />} />
        <Route path="settings" element={<ConsultantSettings />} />
        <Route path="logs" element={<ConsultantLogs />} />
        <Route path="reports" element={<ConsultantReports />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Toaster position="top-right" />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
