import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, ArrowRight, ShieldCheck, X, Check,
  Briefcase, LineChart, Coins, Activity, Calculator,
  Lock, Calendar, DollarSign, Clock, AlertCircle, Award
} from 'lucide-react';

const durationOptions = [
  { label: '6 Months', value: 6 },
  { label: '1 Year', value: 12 },
  { label: '3 Years', value: 36 },
  { label: '5 Years', value: 60 }
];

const getIconForPlan = (name) => {
  switch (name) {
    case 'Mutual Funds': return Activity;
    case 'Fixed Deposit': return ShieldCheck;
    case 'Bonds': return Briefcase;
    case 'Equity': return TrendingUp;
    case 'SIP Plans': return LineChart;
    case 'Gold Funds': return Coins;
    default: return Briefcase;
  }
};

const CustomerInvestPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, refreshBalance } = useAuth();
  
  // Selection States
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investAmount, setInvestAmount] = useState(10000);
  const [selectedDuration, setSelectedDuration] = useState(12);
  
  // UI Modal State
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch verification status from backend DB
  const { data: verificationInfo } = useQuery({
    queryKey: ['verificationStatus'],
    queryFn: async () => {
      const res = await api.get('/profile/verification');
      return res.data;
    }
  });

  const isVerified = verificationInfo?.overallStatus === 'VERIFIED' || user?.isVerified;
  const isUnderReview = verificationInfo?.overallStatus === 'UNDER_REVIEW';
  const isResubmission = verificationInfo?.overallStatus === 'RESUBMISSION_REQUIRED';
  const isNotSubmitted = !isVerified && !isUnderReview && !isResubmission;

  // Fetch active plans from backend DB
  const { data: dbPlans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['investmentPlans'],
    queryFn: async () => {
      const res = await api.get('/investments/plans');
      return res.data;
    }
  });

  // Fetch my investments from backend DB
  const { data: myInvestments = [], isLoading: loadingInvestments } = useQuery({
    queryKey: ['myInvestments'],
    queryFn: async () => {
      const res = await api.get('/investments/me');
      return res.data;
    }
  });

  // Live Server-Side Preview Query
  const { data: previewData, isLoading: loadingPreview, error: previewError } = useQuery({
    queryKey: ['investmentPreview', selectedPlan?.id, investAmount, selectedDuration],
    queryFn: async () => {
      if (!selectedPlan || !investAmount || investAmount <= 0 || !selectedDuration) return null;
      const res = await api.post('/investments/preview', {
        planId: selectedPlan.id,
        investedAmount: Number(investAmount),
        durationMonths: Number(selectedDuration)
      });
      return res.data;
    },
    enabled: !!selectedPlan && Number(investAmount) > 0 && !!selectedDuration
  });

  // Confirmation Mutation
  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/investments/confirm', {
        planId: selectedPlan.id,
        investedAmount: Number(investAmount),
        durationMonths: Number(selectedDuration)
      });
      return res.data;
    },
    onSuccess: async () => {
      setSuccessMsg('Investment created successfully!');
      setShowInvestModal(false);
      setSelectedPlan(null);
      queryClient.invalidateQueries(['myInvestments']);
      if (refreshBalance) await refreshBalance();
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.response?.data?.errorCode || 'Investment failed');
    }
  });

  // Redemption Mutation
  const redeemMutation = useMutation({
    mutationFn: async (investmentId) => {
      const res = await api.post(`/investments/${investmentId}/redeem`);
      return res.data;
    },
    onSuccess: async (data) => {
      setSuccessMsg(`Investment #${data.id} redeemed successfully! ₹${data.maturityValue?.toLocaleString('en-IN')} credited to wallet.`);
      queryClient.invalidateQueries(['myInvestments']);
      if (refreshBalance) await refreshBalance();
      setTimeout(() => setSuccessMsg(''), 5000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.response?.data?.errorCode || 'Redemption failed');
    }
  });

  const totalInvestmentValue = myInvestments.reduce((acc, inv) => acc + (inv.currentValue || inv.investedAmount || 0), 0);

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    if (Array.isArray(dateVal)) {
      const [y, m, d, h=0, min=0] = dateVal;
      return new Date(y, m - 1, d, h, min).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isFormValid = selectedPlan && Number(investAmount) > 0 && selectedDuration;

  return (
    <div className="max-w-6xl mx-auto font-sans relative pb-10">
      
      {/* Messages */}
      {successMsg && (
        <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-semibold text-red-800">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Portal</h1>
        <p className="text-gray-500">Select an investment plan, duration, and amount to generate a live return projection.</p>
      </div>

      {/* Total Portfolio Banner */}
      <div className="bg-[#05231e] rounded-2xl p-8 mb-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div className="z-10 w-full md:w-1/2">
          <p className="text-gray-400 text-sm font-semibold mb-2">TOTAL PORTFOLIO VALUE</p>
          <h2 className="text-4xl font-bold text-white mb-3">₹{totalInvestmentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
          <div className="flex items-center text-emerald-400 text-sm font-bold gap-2">
            <Award className="w-4 h-4" />
            <span>Database-backed live maturity portfolio</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Plan */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">1</span>
          <h3 className="text-xl font-bold text-gray-900">Select Investment Type</h3>
        </div>

        {loadingPlans ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbPlans.map((plan) => {
              const IconComponent = getIconForPlan(plan.name);
              const isSelected = selectedPlan?.id === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan);
                    setErrorMsg('');
                  }}
                  className={`
                    rounded-xl p-6 border transition-all cursor-pointer flex flex-col justify-between h-48 relative
                    ${isSelected 
                      ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md'}
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-emerald-600 text-white p-1 rounded-full">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{plan.name}</h4>
                        {plan.isVariable && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                            Variable Rate ({plan.variableRate}% locked at invest)
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold pt-3 border-t border-gray-100 text-emerald-700">
                    <span>{plan.isVariable ? `Current Rate: ${plan.variableRate}%` : `${plan.rates?.length || 4} Tenure Options`}</span>
                    <span className="text-emerald-600">Select Plan &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STEP 2 & 3: Amount and Duration Selection (only shown when plan selected) */}
      {selectedPlan && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-10 shadow-sm animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* STEP 2: Amount Input */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">2</span>
                <label className="text-lg font-bold text-gray-900">Investment Amount (₹)</label>
              </div>
              <input
                type="number"
                min="1000"
                step="1000"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-bold text-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="Enter amount (e.g. 50000)"
              />
              <p className="text-xs text-gray-400 mt-2">Minimum investment: ₹1,000</p>
            </div>

            {/* STEP 3: Duration Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">3</span>
                <label className="text-lg font-bold text-gray-900">Investment Duration</label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {durationOptions.map((opt) => {
                  const isDurSelected = selectedDuration === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedDuration(opt.value)}
                      className={`
                        py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2
                        ${isDurSelected 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}
                      `}
                    >
                      <Clock className="w-4 h-4" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Live Preview Card */}
          {loadingPreview ? (
            <div className="mt-8 p-8 border border-gray-100 rounded-xl flex items-center justify-center bg-gray-50">
              <div className="animate-spin w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full mr-3"></div>
              <span className="text-sm font-semibold text-gray-600">Calculating live database rates...</span>
            </div>
          ) : previewData ? (
            <div className="mt-8 bg-gradient-to-br from-[#05231e] to-[#0d3b34] text-white rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">LIVE RETURN PREVIEW</h4>
                  <p className="text-xl font-bold text-white">{previewData.planName} ({previewData.durationMonths} Months)</p>
                </div>
                <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>{previewData.returnRate}% Annual Return</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase mb-1">Invested Amount</p>
                  <p className="text-lg font-bold text-white">₹{previewData.investedAmount?.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase mb-1">Estimated Profit</p>
                  <p className="text-lg font-bold text-emerald-400">+₹{previewData.estimatedProfit?.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase mb-1">Maturity Value</p>
                  <p className="text-2xl font-black text-amber-300">₹{previewData.maturityValue?.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase mb-1">Maturity Date</p>
                  <p className="text-sm font-semibold text-gray-200">{formatDate(previewData.maturityDate)}</p>
                </div>
              </div>

              {/* Document Verification Requirement Banners */}
              {isVerified && (
                <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-300">✓ Documents Verified</p>
                      <p className="text-xs text-gray-300">You are eligible to invest.</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                    Eligible to Invest
                  </span>
                </div>
              )}

              {isNotSubmitted && (
                <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                      ⚠
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-300">⚠ Documents Required</p>
                      <p className="text-xs text-gray-300">Please submit your required documents before making an investment.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/profile/documents')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap"
                  >
                    Go to Documents <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isUnderReview && (
                <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                      ⏳
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-300">⏳ Verification in Progress</p>
                      <p className="text-xs text-gray-300">Your documents are currently being reviewed. You can invest once your documents are verified.</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                    Under Review
                  </span>
                </div>
              )}

              {isResubmission && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm">
                      ⚠
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-300">⚠ Resubmission Required</p>
                      <p className="text-xs text-gray-300">{verificationInfo?.rejectionReason || "Please update your documents based on admin review feedback."}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/profile/documents')}
                    className="bg-red-500 hover:bg-red-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap"
                  >
                    Update Documents <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/10 gap-4">
                <div className="text-xs text-gray-300">
                  <span>Available Wallet Balance: </span>
                  <span className="font-bold text-white">₹{previewData.currentWalletBalance?.toLocaleString('en-IN')}</span>
                </div>

                <button
                  disabled={!isFormValid || !isVerified || confirmMutation.isPending}
                  onClick={() => confirmMutation.mutate()}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-[#05231e] py-3.5 px-8 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {confirmMutation.isPending ? 'Confirming...' : !isVerified ? 'Verification Required' : 'Confirm & Invest Now'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}

        </div>
      )}

      {/* Customer Active Investments List */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Active Investments</h3>
            <p className="text-xs text-gray-500 mt-1">Fixed returns portfolio active investments.</p>
          </div>
        </div>

        {loadingInvestments ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
          </div>
        ) : myInvestments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
            <p className="text-gray-500 font-semibold text-sm">No Active Investments.</p>
            <p className="text-gray-400 text-xs mt-1">Select an investment option above to start investing.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {myInvestments.map((inv) => {
              const isMatured = inv.status === 'MATURED';
              const isRedeemed = inv.status === 'REDEEMED';
              const isLegacy = inv.legacyUnverified;

              return (
                <div key={inv.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-gray-900 text-lg">{inv.type || inv.planName}</h4>
                      
                      {/* Status Badges */}
                      {isLegacy ? (
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1" title="Pending administrative verification of original terms">
                          <Lock className="w-3 h-3" /> Legacy - Under Review
                        </span>
                      ) : isRedeemed ? (
                        <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          REDEEMED
                        </span>
                      ) : isMatured ? (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                          MATURED (Eligible for Redeem)
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          ACTIVE ({inv.durationMonths || 12}m @ {inv.lockedRate || 0}%)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                      <span>Invested: <strong className="text-gray-800">₹{inv.investedAmount?.toLocaleString('en-IN')}</strong></span>
                      <span>Maturity Value: <strong className="text-emerald-700">₹{inv.maturityValue?.toLocaleString('en-IN')}</strong></span>
                      <span>Start Date: <strong>{formatDate(inv.startDate)}</strong></span>
                      <span>Maturity Date: <strong>{formatDate(inv.maturityDate)}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    {/* Redeem Now Button: ONLY shown for MATURED investments that are NOT legacy unverified */}
                    {isMatured && !isLegacy && !isRedeemed && (
                      <button
                        disabled={redeemMutation.isPending}
                        onClick={() => redeemMutation.mutate(inv.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-2"
                      >
                        {redeemMutation.isPending ? 'Redeeming...' : 'Redeem Now'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {isRedeemed && (
                      <span className="text-xs font-semibold text-gray-400">
                        Redeemed on {formatDate(inv.redeemedAt)}
                      </span>
                    )}

                    {!isMatured && !isRedeemed && !isLegacy && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        Active Investment
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerInvestPage;
