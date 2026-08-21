import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, ChevronRight, Plus, 
  Briefcase, TrendingUp, DollarSign, PieChart,
  Layers, CreditCard, Activity, LineChart, 
  Settings, UserCheck, FileText, CheckCircle,
  Building2, Shield, Cloud, Lock, Target, Users, BarChart
} from 'lucide-react';

const BusinessFinancePage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Business Finance & Corporate Treasury?",
      answer: "Business Finance encompasses working capital optimization, cash flow planning, corporate treasury operations, and strategic financial planning designed to optimize capital allocation for growing businesses."
    },
    {
      question: "How does Business Finance help scaling enterprises?",
      answer: "It provides real-time visibility into cash reserves, automates accounts receivable/payable, minimizes liquidity bottlenecks, and provides scenario-based forecasting for capital investments."
    },
    {
      question: "Can it integrate with existing ERP and accounting software?",
      answer: "Yes, our business finance tools integrate seamlessly with SAP, Oracle, Tally, QuickBooks, Zoho Books, and corporate banking APIs for automated reconciliation."
    },
    {
      question: "What working capital solutions are included?",
      answer: "We support invoice discounting, supply chain financing, line-of-credit management, and dynamic cash forecasting."
    },
    {
      question: "How secure is corporate financial data?",
      answer: "We maintain SOC2 Type II, ISO 27001 compliance with 256-bit AES encryption and role-based corporate authorization matrices."
    }
  ];

  const coreCapabilities = [
    { icon: Briefcase, label: "Working Capital Optimization" },
    { icon: LineChart, label: "Cash Flow Forecasting" },
    { icon: DollarSign, label: "Corporate Liquidity Management" },
    { icon: PieChart, label: "Budgeting & Financial Planning" },
    { icon: Settings, label: "Automated Accounts Payable/Receivable" },
    { icon: FileText, label: "Tax & Compliance Reporting" },
    { icon: BarChart, label: "Capital Structure Planning" },
    { icon: Building2, label: "Enterprise ERP Integration" }
  ];

  return (
    <div className="flex flex-col w-full overflow-clip bg-white">
      {/* Hero Header */}
      <section 
        className="relative pt-48 pb-32 w-full bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/hero-bg-2.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#12241F]/90 z-[1]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#12241F] to-transparent z-[1] opacity-70"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl flex flex-col items-start">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
              Business Finance Solutions
            </h1>
            <p className="text-lg text-gray-200 mb-8 leading-relaxed font-light">
              Working capital, cash flow optimization, and strategic financial planning tools built for scaling corporate enterprises.
            </p>

            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-xs font-medium text-white/80 tracking-wide">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-white/50" />
              <Link to="/services" className="hover:text-white transition-colors">Services</Link>
              <ChevronRight className="w-3 h-3 text-white/50" />
              <span className="text-white font-semibold">Business Finance</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#4E8B83] text-sm font-bold uppercase tracking-wider">Corporate Treasury & Growth</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                Empower your enterprise with intelligent business capital operations.
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-6">
                Kalpanaaa Business Finance tools deliver continuous visibility into corporate cash flow, enabling finance teams to manage working capital, optimize liquidity, and make informed capital allocation decisions.
              </p>
              <div className="space-y-3">
                {['Real-time cash flow monitoring & liquidity analytics', 'Automated vendor payments & invoice discounting', 'Multi-entity corporate consolidation & tax compliance'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm font-semibold text-gray-800">
                    <CheckCircle className="w-5 h-5 text-[#4E8B83] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <img src="/service-business-finance.jpg" alt="Business Finance" className="w-full h-80 object-cover" />
            </div>
          </div>

          {/* Capabilities Grid */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Core Business Finance Capabilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {coreCapabilities.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#4E8B83]/10 text-[#4E8B83] rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900">{cap.label}</h4>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-5 bg-white hover:bg-gray-50 font-bold text-gray-900 flex justify-between items-center transition-colors text-sm"
                  >
                    <span>{faq.question}</span>
                    <Plus className={`w-5 h-5 transition-transform ${openFaq === idx ? 'rotate-45' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="p-5 bg-gray-50 text-gray-600 text-xs leading-relaxed border-t border-gray-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-[#12241F] rounded-3xl p-10 text-center text-white space-y-4">
            <h3 className="text-2xl font-bold">Ready to streamline your business finances?</h3>
            <p className="text-xs text-gray-300 max-w-xl mx-auto">
              Schedule a personalized consultation with our business finance experts to optimize your capital strategy today.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => navigate('/contact')}
                className="px-6 py-3 bg-[#4E8B83] hover:bg-[#3d7069] text-white font-bold rounded-xl text-xs transition-colors shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessFinancePage;
