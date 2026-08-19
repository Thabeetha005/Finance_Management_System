import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { 
  Building2, CheckCircle2, AlertCircle, IndianRupee, CalendarClock, Activity,
  Briefcase, Home, UserCheck, Upload, FileText, ArrowRight, ShieldCheck, ChevronRight, RefreshCw, AlertTriangle
} from 'lucide-react';

const CustomerLoansPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanDuration, setLoanDuration] = useState(12);
  const [loanPurpose, setLoanPurpose] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [emiEstimate, setEmiEstimate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [docType, setDocType] = useState('PAN_CARD');
  const [createdLoanId, setCreatedLoanId] = useState(null);
  const [resubmitModalLoan, setResubmitModalLoan] = useState(null);

  // Fetch Available Database Loan Plans & Rates
  const { data: loanPlans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['loanPlans'],
    queryFn: async () => {
      const res = await api.get('/loan-plans');
      return res.data;
    }
  });

  // Fetch Customer Loans
  const { data: loans = [], isLoading: loadingLoans } = useQuery({
    queryKey: ['myLoans'],
    queryFn: async () => {
      const res = await api.get('/loans/my');
      return res.data;
    }
  });

  const activeLoans = loans.filter(l => l.status === 'ACTIVE' || l.status === 'APPROVED');
  const pendingApplications = loans.filter(l => ['APPLIED', 'DOCUMENTS_SUBMITTED', 'UNDER_REVIEW', 'RESUBMISSION_REQUIRED', 'REJECTED'].includes(l.status));
  const activeLoan = activeLoans.length > 0 ? activeLoans[0] : null;

  const [shortfallData, setShortfallData] = useState(null);

  // Fetch EMI Overview ({ currentEmi, history }) for Active Loan
  const { data: emiOverview, isLoading: loadingEmis } = useQuery({
    queryKey: ['emiOverview', activeLoan?.id],
    queryFn: async () => {
      if (!activeLoan) return null;
      const res = await api.get(`/loans/${activeLoan.id}/emi-overview`);
      return res.data;
    },
    enabled: !!activeLoan
  });

  const currentEmi = emiOverview?.currentEmi;
  const emiHistory = emiOverview?.history || [];

  // Fetch Customer's Reuse-Eligible Verified Documents
  const { data: reuseEligibleDocs = [] } = useQuery({
    queryKey: ['reuseEligibleDocs'],
    queryFn: async () => {
      const res = await api.get('/documents/reuse-eligible');
      return res.data;
    }
  });

  // Calculate EMI dynamically whenever amount or duration changes
  const calculateEstimate = async (plan, amount, duration) => {
    if (!plan || !amount || !duration) return;
    setIsCalculating(true);
    try {
      const res = await api.post('/loans/calculate', {
        planId: plan.id,
        amount: Number(amount),
        durationMonths: Number(duration)
      });
      setEmiEstimate(res.data);
    } catch (err) {
      console.error(err);
      setEmiEstimate(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleOpenApplyModal = (plan) => {
    setSelectedPlan(plan);
    setLoanAmount(plan.minAmount);
    const defaultDuration = plan.rates && plan.rates.length > 0 ? plan.rates[0].durationMonths : 12;
    setLoanDuration(defaultDuration);
    const defaultPurposes = plan.allowedPurposes ? plan.allowedPurposes.split(',') : [];
    setLoanPurpose(defaultPurposes[0] || plan.name);
    setCurrentStep(1);
    setShowApplyModal(true);
    calculateEstimate(plan, plan.minAmount, defaultDuration);
  };

  const handleDurationChange = (d) => {
    setLoanDuration(d);
    calculateEstimate(selectedPlan, loanAmount, d);
  };

  const handleAmountChange = (amt) => {
    setLoanAmount(amt);
    calculateEstimate(selectedPlan, amt, loanDuration);
  };

  const handleDocumentUpload = async (e, customDocType) => {
    if (e) e.preventDefault();
    if (!docFile) {
      alert('Please select a file to upload');
      return;
    }
    setUploadingDoc(true);
    const targetDocType = customDocType || docType;
    const formData = new FormData();
    formData.append('file', docFile);
    formData.append('documentType', targetDocType);
    if (createdLoanId || resubmitModalLoan) {
      formData.append('applicationId', createdLoanId || resubmitModalLoan.id);
      formData.append('applicationType', 'LOAN');
    }

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Document uploaded successfully!');
      setDocFile(null);
      queryClient.invalidateQueries(['reuseEligibleDocs']);
      queryClient.invalidateQueries(['myLoans']);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleApplySubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/loans/apply', {
        planId: selectedPlan.id,
        amount: Number(loanAmount),
        durationMonths: Number(loanDuration),
        purpose: loanPurpose
      });
      setCreatedLoanId(res.data.id);
      queryClient.invalidateQueries(['myLoans']);
      queryClient.invalidateQueries(['reuseEligibleDocs']);
      setCurrentStep(4); // Move to Document Verification & Automatic Reuse Review
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit loan application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayEmi = async (emiId) => {
    if (!window.confirm('Confirm EMI Payment from your wallet balance?')) return;
    setShortfallData(null);
    try {
      await api.post(`/loans/emi/${emiId}/pay`);
      alert('EMI payment successful!');
      queryClient.invalidateQueries();
    } catch (err) {
      if (err.response?.data?.shortfall !== undefined || err.response?.data?.requiredAmount !== undefined) {
        setShortfallData(err.response.data);
      } else {
        alert(err.response?.data?.message || 'Failed to pay EMI');
      }
    }
  };

  const handlePayoffLoan = async (loanId) => {
    if (!window.confirm('Are you sure you want to pay off this loan early? This will calculate accrued interest and debit your wallet.')) return;
    try {
      await api.post(`/loans/${loanId}/payoff`);
      alert('Congratulations! Your loan has been paid off in full.');
      queryClient.invalidateQueries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to payoff loan');
    }
  };

  if (loadingPlans || loadingLoans) {
    return <div className="p-10 text-center text-gray-500 font-medium">Loading loan offerings & account dashboard...</div>;
  }

  // Required document categories for selected plan
  const requiredCategories = [
    { key: 'PAN_CARD', label: 'PAN Card (KYC Identity)' },
    { key: 'AADHAAR_CARD', label: 'Aadhaar Card (KYC Address)' },
    { key: 'BANK_STATEMENT', label: 'Bank Statement (Income Proof)' }
  ];
  if (selectedPlan?.requiresBusinessDoc) {
    requiredCategories.push({ key: 'BUSINESS_GST_DOC', label: 'Business / GST Registration' });
  }
  if (selectedPlan?.requiresPropertyDoc) {
    requiredCategories.push({ key: 'PROPERTY_DOC', label: 'Property / House Ownership Document' });
  }

  return (
    <div className="max-w-7xl mx-auto font-sans relative pb-12 space-y-10">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loans & Financing</h1>
        <p className="text-gray-500">Transparent, database-driven loans with automatic verified document detection & zero redundant uploads.</p>
      </div>

      {/* Resubmission Warning Banner */}
      {loans.some(l => l.status === 'RESUBMISSION_REQUIRED') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-lg">Action Required: Document Resubmission</h3>
              <p className="text-amber-700 text-sm">
                Admin requested document updates: "{loans.find(l => l.status === 'RESUBMISSION_REQUIRED')?.resubmissionReason || 'Additional documents required'}"
              </p>
            </div>
          </div>
          <button
            onClick={() => setResubmitModalLoan(loans.find(l => l.status === 'RESUBMISSION_REQUIRED'))}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
          >
            Re-upload Documents
          </button>
        </div>
      )}

      {/* Available Loan Plans */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Available Loan Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loanPlans.map(plan => (
            <div key={plan.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#106354]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#e6f3f0] text-[#106354] flex items-center justify-center mb-4 font-bold border border-[#106354]/20">
                  {plan.name.includes('Home') ? <Home className="w-6 h-6" /> : plan.name.includes('Business') ? <Briefcase className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">{plan.description}</p>
                
                <div className="space-y-3 border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Loan Limit</span>
                    <span className="font-bold text-[#106354]">₹{Number(plan.minAmount).toLocaleString()} – ₹{Number(plan.maxAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Durations</span>
                    <span className="font-semibold text-gray-800">
                      {plan.rates?.map(r => r.durationMonths >= 12 ? `${r.durationMonths/12}y` : `${r.durationMonths}m`).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Rates From</span>
                    <span className="font-bold text-[#D4AF37]">
                      {plan.rates?.length > 0 ? Math.min(...plan.rates.map(r => r.annualInterestRate)) + '%' : '10.5%'} p.a.
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenApplyModal(plan)}
                disabled={!user?.isVerified}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                  user?.isVerified 
                    ? 'bg-[#106354] hover:bg-[#0c4d41] text-white shadow-[#106354]/20' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Apply Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 1. ACTIVE LOANS SECTION */}
      {activeLoan && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Active Loan</h2>
            <button
              onClick={() => handlePayoffLoan(activeLoan.id)}
              className="px-4 py-2 bg-[#887333] hover:bg-[#6e5d29] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Payoff Loan Early
            </button>
          </div>

          <div className="bg-[#05231e] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              <div>
                <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">Loan Type & Plan</p>
                <h3 className="text-2xl font-bold text-white">{activeLoan.loanPlan?.name || activeLoan.purpose}</h3>
                <p className="text-xs text-gray-400 mt-1">Approved: {new Date(activeLoan.approvedAt || Date.now()).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">Approved Amount</p>
                <p className="text-3xl font-bold text-white">₹{Number(activeLoan.approvedAmount || activeLoan.amount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">Outstanding</p>
                <p className="text-3xl font-bold text-[#D4AF37]">₹{Number(activeLoan.outstandingBalance || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">Tenure & Monthly Due Day</p>
                <p className="text-xl font-bold text-white">{activeLoan.durationMonths} Months • Day {new Date(activeLoan.approvedAt || Date.now()).getDate()} of Month</p>
              </div>
            </div>
          </div>

          {/* Shortfall Error Banner */}
          {shortfallData && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>{shortfallData.message || 'Insufficient wallet balance'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-2xl border border-red-100 font-semibold">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Required Amount</span>
                  <span className="text-gray-900 font-extrabold text-sm">₹{Number(shortfallData.requiredAmount).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Available Balance</span>
                  <span className="text-emerald-700 font-extrabold text-sm">₹{Number(shortfallData.availableBalance).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Shortfall</span>
                  <span className="text-red-600 font-extrabold text-sm">₹{Number(shortfallData.shortfall).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <a
                  href="/profile/payments"
                  className="px-5 py-2.5 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  Add Funds
                </a>
              </div>
            </div>
          )}

          {/* 2. CURRENT EMI SECTION */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Current EMI</h3>
            {currentEmi ? (
              <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                currentEmi.status === 'OVERDUE' ? 'bg-red-50/80 border-red-200' :
                currentEmi.status === 'PAID' ? 'bg-emerald-50/80 border-emerald-200' :
                'bg-amber-50/80 border-amber-200'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    currentEmi.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                    currentEmi.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    <CalendarClock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 uppercase">
                        {currentEmi.monthYear || `Installment #${currentEmi.installmentNumber}`}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                        currentEmi.status === 'OVERDUE' ? 'bg-red-200 text-red-900' :
                        currentEmi.status === 'PAID' ? 'bg-emerald-200 text-emerald-900' :
                        'bg-amber-200 text-amber-900'
                      }`}>
                        {currentEmi.status === 'OVERDUE' ? '⚠ OVERDUE' :
                         currentEmi.status === 'PAID' ? '✓ EMI PAID' :
                         'STATUS: PENDING'}
                      </span>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mt-1">₹{Number(currentEmi.amount).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Due Date: {currentEmi.dueDate}</p>
                    {currentEmi.status === 'PAID' && (
                      <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                        Paid on: {currentEmi.paidDate ? new Date(currentEmi.paidDate).toLocaleDateString() : 'N/A'} • Transaction ID: TXN-#{currentEmi.transactionId || 'N/A'}
                      </p>
                    )}
                  </div>
                </div>

                {(currentEmi.status === 'PENDING' || currentEmi.status === 'OVERDUE') && (
                  <button
                    onClick={() => handlePayEmi(currentEmi.id)}
                    className="px-8 py-3.5 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
                  >
                    PAY NOW
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center">
                ✓ All scheduled monthly EMIs for this active loan have been fully paid!
              </div>
            )}
          </div>

          {/* 3. EMI HISTORY SECTION */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900">EMI Payment History</h3>
            {emiHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl">
                No completed EMI payments recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {emiHistory.map((emi) => (
                  <div key={emi.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{emi.monthYear || `Installment #${emi.installmentNumber}`}</p>
                      <p className="text-gray-400 text-[11px]">Due: {emi.dueDate} • Transaction TXN-#{emi.transactionId || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-emerald-700 text-sm">₹{Number(emi.amount).toLocaleString()}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-0.5">
                        ✓ PAID ({emi.paidDate ? new Date(emi.paidDate).toLocaleDateString() : 'Paid'})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. LOAN STATUS SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Loan Status</h2>
        {loans.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl">
            No loan applications found.
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map(app => {
              const status = app.status || app.applicationStatus;
              return (
                <div key={app.id} className="p-6 bg-gray-50/80 rounded-3xl border border-gray-100 space-y-3">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                        status === 'APPLICATION_SUBMITTED' ? 'bg-blue-600' :
                        status === 'UNDER_REVIEW' ? 'bg-indigo-600' :
                        status === 'DOCUMENTS_REQUIRED' ? 'bg-amber-600' :
                        status === 'APPROVED' ? 'bg-emerald-600' :
                        status === 'DISBURSED' || status === 'ACTIVE' ? 'bg-teal-700' :
                        status === 'OVERDUE' ? 'bg-red-600' :
                        status === 'COMPLETED' ? 'bg-gray-700' : 'bg-red-700'
                      }`}>
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 text-lg">{app.loanPlan?.name || app.purpose}</span>
                          <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider ${
                            status === 'APPLICATION_SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                            status === 'UNDER_REVIEW' ? 'bg-indigo-100 text-indigo-800' :
                            status === 'DOCUMENTS_REQUIRED' ? 'bg-amber-100 text-amber-900' :
                            status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            status === 'DISBURSED' || status === 'ACTIVE' ? 'bg-teal-100 text-teal-900' :
                            status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                            status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {status === 'APPLICATION_SUBMITTED' ? 'APPLICATION SUBMITTED' :
                             status === 'UNDER_REVIEW' ? 'UNDER REVIEW' :
                             status === 'DOCUMENTS_REQUIRED' ? 'DOCUMENTS REQUIRED' :
                             status === 'APPROVED' ? 'LOAN APPROVED' :
                             status === 'DISBURSED' ? 'LOAN DISBURSED' :
                             status === 'COMPLETED' ? 'LOAN COMPLETED' :
                             status === 'REJECTED' ? 'LOAN REJECTED' : status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied: {new Date(app.appliedAt || Date.now()).toLocaleDateString()} • Tenure: {app.durationMonths} Months
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Amount</p>
                      <p className="text-2xl font-black text-gray-900">₹{Number(app.approvedAmount || app.amount).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Status-specific descriptions and actions */}
                  <div className="pt-2 border-t border-gray-200/60 text-xs">
                    {status === 'APPLICATION_SUBMITTED' && (
                      <p className="text-blue-900 font-semibold">Your application has been successfully submitted.</p>
                    )}
                    {status === 'UNDER_REVIEW' && (
                      <p className="text-indigo-900 font-semibold">Our team is currently reviewing your application.</p>
                    )}
                    {status === 'DOCUMENTS_REQUIRED' && (
                      <div className="space-y-2">
                        <p className="text-amber-900 font-bold">Please submit the required documents to continue.</p>
                        {app.resubmissionReason && (
                          <p className="text-amber-800 text-[11px] bg-amber-50 p-2 rounded-xl border border-amber-200">
                            Reason: {app.resubmissionReason}
                          </p>
                        )}
                        <button
                          onClick={() => setResubmitModalLoan(app)}
                          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                        >
                          View & Submit Documents
                        </button>
                      </div>
                    )}
                    {status === 'APPROVED' && (
                      <p className="text-emerald-900 font-bold">Your loan has been approved and is awaiting disbursement.</p>
                    )}
                    {status === 'DISBURSED' && (
                      <p className="text-teal-900 font-bold">Your loan amount has been credited to your wallet.</p>
                    )}
                    {status === 'ACTIVE' && (
                      <p className="text-emerald-800 font-semibold">Loan is active and EMI repayment schedule is in progress.</p>
                    )}
                    {status === 'OVERDUE' && (
                      <p className="text-red-700 font-extrabold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> ⚠ Payment overdue. Please pay the required EMI.
                      </p>
                    )}
                    {status === 'COMPLETED' && (
                      <p className="text-gray-700 font-bold">Your loan has been fully repaid.</p>
                    )}
                    {status === 'REJECTED' && (
                      <div className="space-y-1">
                        <p className="text-red-900 font-bold">Your loan application has been rejected.</p>
                        {app.resubmissionReason && (
                          <p className="text-red-700 text-[11px] bg-red-50 p-2 rounded-xl border border-red-200">
                            Reason: {app.resubmissionReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Wizard Modal */}
      {showApplyModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Apply for {selectedPlan.name}</h3>
                <p className="text-xs text-gray-500">Step {currentStep} of 4</p>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Select Duration & Purpose */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Loan Duration</label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedPlan.rates?.map(r => (
                      <button
                        key={r.durationMonths}
                        type="button"
                        onClick={() => handleDurationChange(r.durationMonths)}
                        className={`p-3 rounded-xl font-bold text-xs border transition-all text-center ${
                          loanDuration === r.durationMonths
                            ? 'bg-[#106354] text-white border-[#106354] shadow-md'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-500'
                        }`}
                      >
                        {r.durationMonths >= 12 ? `${r.durationMonths / 12} Year(s)` : `${r.durationMonths} Months`} ({r.annualInterestRate}% p.a.)
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Loan Purpose</label>
                  <select
                    value={loanPurpose}
                    onChange={e => setLoanPurpose(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-sm font-medium"
                  >
                    {selectedPlan.allowedPurposes?.split(',').map(p => (
                      <option key={p.trim()} value={p.trim()}>{p.trim()}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2.5 bg-[#106354] text-white font-bold rounded-xl text-sm shadow-md"
                  >
                    Next: Enter Amount
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Amount & Server-Side EMI Calculation */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Requested Amount (₹)</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={e => handleAmountChange(Number(e.target.value))}
                    min={selectedPlan.minAmount}
                    max={selectedPlan.maxAmount}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-bold outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1 font-medium">
                    <span>Min: ₹{Number(selectedPlan.minAmount).toLocaleString()}</span>
                    <span>Max: ₹{Number(selectedPlan.maxAmount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Server-Side Reducing Balance Calculator Card */}
                {emiEstimate && (
                  <div className="bg-[#e6f3f0] border border-[#106354]/20 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-center border-b border-[#106354]/10 pb-2">
                      <span className="text-xs font-bold text-[#106354] uppercase tracking-wider">Estimated Monthly EMI</span>
                      <span className="text-2xl font-extrabold text-[#106354]">₹{Number(emiEstimate.estimatedMonthlyEmi).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                      <div><span className="text-gray-500">Interest Rate:</span> <strong>{emiEstimate.annualInterestRate}% p.a.</strong></div>
                      <div><span className="text-gray-500">Total Repayment:</span> <strong>₹{Number(emiEstimate.estimatedTotalRepayment).toLocaleString()}</strong></div>
                      <div><span className="text-gray-500">First EMI Date:</span> <strong>{emiEstimate.firstEmiDate}</strong></div>
                      <div><span className="text-gray-500">Final EMI Date:</span> <strong>{emiEstimate.finalEmiDate}</strong></div>
                    </div>
                    <p className="text-[10px] text-gray-500 italic">* All pre-approval calculations are Estimated EMI. Final rate is locked at Admin Approval.</p>
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setCurrentStep(1)} className="px-5 py-2 text-gray-600 font-bold text-sm">Back</button>
                  <button
                    onClick={handleApplySubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#106354] text-white font-bold rounded-xl text-sm shadow-md"
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Application & Review Documents'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Automatic Document Reuse & Status Review */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Document Status & Verification</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Your profile's verified documents are automatically attached to this application.</p>
                </div>

                {/* Automatic Document Reuse Card List */}
                <div className="space-y-3">
                  {requiredCategories.map(cat => {
                    const verifiedMatch = reuseEligibleDocs.find(d => cat.key.equalsIgnoreCase(d.documentType));
                    return (
                      <div key={cat.key} className={`p-4 rounded-2xl border transition-all ${
                        verifiedMatch 
                          ? 'bg-emerald-50/60 border-emerald-200' 
                          : 'bg-amber-50/60 border-amber-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {verifiedMatch ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{cat.label}</p>
                              {verifiedMatch ? (
                                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                                  ✓ Verified document automatically attached ({verifiedMatch.fileName})
                                </p>
                              ) : (
                                <p className="text-xs font-semibold text-amber-700 mt-0.5">
                                  ⚠ Document required — Upload missing file
                                </p>
                              )}
                            </div>
                          </div>

                          {!verifiedMatch && (
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                id={`file-${cat.key}`}
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => {
                                  setDocFile(e.target.files[0]);
                                  setDocType(cat.key);
                                }}
                                className="hidden"
                              />
                              <label
                                htmlFor={`file-${cat.key}`}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                              >
                                Select File
                              </label>
                              {docFile && docType === cat.key && (
                                <button
                                  type="button"
                                  onClick={(e) => handleDocumentUpload(e, cat.key)}
                                  disabled={uploadingDoc}
                                  className="px-3 py-1.5 bg-[#106354] hover:bg-[#0c4d41] text-white font-bold rounded-xl text-xs shadow-sm"
                                >
                                  Upload
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#e6f3f0] p-4 rounded-2xl border border-[#106354]/20 text-xs text-[#106354] flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <span>All verified documents from your Profile are securely referenced without binary duplication.</span>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-6 py-2.5 bg-[#106354] text-white font-bold rounded-xl text-sm shadow-md"
                  >
                    Complete & Return to Loans Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLoansPage;
