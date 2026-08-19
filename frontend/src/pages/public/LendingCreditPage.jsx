import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ArrowRight, Clock, Users, FileCheck, FastForward, ShieldCheck,
  FileText, Search, CheckCircle, Banknote, Activity, XOctagon,
  Briefcase, Calendar, Shield, CreditCard, User
} from 'lucide-react';

const LendingCreditPage = () => {
  const navigate = useNavigate();

  return (
    <div className="font-sans text-gray-800 bg-[#FDFDFD] pb-20">
      
      {/* Breadcrumbs */}
      <div className="pt-28 pb-8 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Link to="/" className="hover:text-gray-800 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link to="/services" className="hover:text-gray-800 transition-colors">Services</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-[#12241F] font-bold">Lending & Credit</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-20">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2 w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#12241F] flex items-center justify-center text-white">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-[#4E8B83] font-bold tracking-wider text-xs uppercase">Loan Lifecycle & Credit Solutions</p>
            </div>
            
            <h1 className="text-4xl lg:text-5xl xl:text-[56px] font-extrabold text-[#12241F] leading-[1.1] mb-6 font-serif">
              Lending & Credit
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-xl leading-relaxed">
              Comprehensive lending solutions that streamline origination, underwriting, and collections with complete visibility and control.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => navigate('/contact')}
                className="bg-[#12241F] text-white px-8 py-3.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#1a332c] transition-colors"
              >
                Talk to Our Experts <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/services')}
                className="border border-[#C47D57] text-[#C47D57] px-8 py-3.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#C47D57]/5 transition-colors"
              >
                Explore Capabilities <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <img 
                src="/lending-credit-hero.jpg" 
                alt="Lending and Credit Professionals" 
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Section (6 cards) */}
      <section className="py-12 px-6 lg:px-12 max-w-[1400px] mx-auto mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              id: '01', 
              icon: FileText, 
              title: 'Loan Management', 
              desc: 'End-to-end loan lifecycle management with real-time tracking, monitoring, and complete control.'
            },
            { 
              id: '02', 
              icon: User, 
              title: 'Personal Loan Management', 
              desc: 'Streamline personal loan processes from application to closure with complete visibility.'
            },
            { 
              id: '03', 
              icon: Briefcase, 
              title: 'Business Loan Management', 
              desc: 'Manage business loans efficiently with customized workflows, risk assessment, and real-time insights.'
            },
            { 
              id: '04', 
              icon: FileCheck, 
              title: 'Loan Application & Approval', 
              desc: 'Digitize loan applications and automate approvals with intelligent rules and seamless workflows.'
            },
            { 
              id: '05', 
              icon: Calendar, 
              title: 'Repayment Management', 
              desc: 'Automate repayment schedules, track EMIs, and manage collections with accuracy.'
            },
            { 
              id: '06', 
              icon: Activity, 
              title: 'Credit Management', 
              desc: 'Manage credit limits, utilization, score monitoring, and credit decisioning with robust control.'
            }
          ].map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl p-8 border border-gray-100 flex gap-6 hover:shadow-lg transition-all group">
              <div className="flex-shrink-0 mt-2">
                <div className="w-14 h-14 rounded-full bg-[#12241F] flex items-center justify-center text-white shadow-md">
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex flex-col flex-grow relative">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[#4E8B83] font-bold text-sm tracking-wider">{card.id}</span>
                  <h3 className="text-[17px] font-bold text-[#12241F]">{card.title}</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {card.desc}
                </p>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-[#4E8B83] group-hover:text-[#4E8B83] transition-colors cursor-pointer">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dark Banner Stats */}
      <section className="w-full bg-[#0a1512] py-20 relative overflow-hidden mb-20 border-t-4 border-[#4E8B83]">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop" alt="Finance Data Background" className="w-full h-full object-cover mix-blend-overlay" />
        </div>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-between">
            <div className="lg:w-1/3">
              <p className="text-[#4E8B83] font-bold tracking-wider text-[10px] uppercase mb-4">Built for Financial Institutions</p>
              <h2 className="text-3xl lg:text-4xl font-serif text-white leading-tight mb-4">
                Smarter Lending.<br/>Stronger Relationships.
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Our lending & credit solutions help you reduce risk, improve efficiency, and deliver exceptional customer experiences.
              </p>
            </div>
            
            <div className="lg:w-2/3 w-full grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center">
                <Users className="w-8 h-8 text-[#C47D57] mb-4" />
                <span className="text-3xl font-bold text-white mb-2">30K+</span>
                <span className="text-sm font-bold text-white mb-1">Active Borrowers</span>
                <span className="text-xs text-gray-400">Across all platforms</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <FileCheck className="w-8 h-8 text-[#C47D57] mb-4" />
                <span className="text-3xl font-bold text-white mb-2">98%</span>
                <span className="text-sm font-bold text-white mb-1">Application Accuracy</span>
                <span className="text-xs text-gray-400">With automated validation</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <FastForward className="w-8 h-8 text-[#C47D57] mb-4" />
                <span className="text-3xl font-bold text-white mb-2">60%</span>
                <span className="text-sm font-bold text-white mb-1">Faster Approvals</span>
                <span className="text-xs text-gray-400">Through automation</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="w-8 h-8 text-[#C47D57] mb-4" />
                <span className="text-3xl font-bold text-white mb-2">25%</span>
                <span className="text-sm font-bold text-white mb-1">Lower Risk</span>
                <span className="text-xs text-gray-400">Better credit assessment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lending Workflow */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto pb-20">
        <div className="flex flex-col lg:flex-row gap-12 items-start mb-16">
          <div className="lg:w-1/3">
            <p className="text-[#4E8B83] font-bold tracking-wider text-[10px] uppercase mb-4">Our Lending Workflow</p>
            <h2 className="text-3xl lg:text-4xl font-serif text-[#12241F] leading-tight mb-4">
              From Application<br/>to Closure
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              A streamlined lending process designed for efficiency and transparency.
            </p>
          </div>
          
          <div className="lg:w-2/3 w-full">
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute top-8 left-6 right-6 h-[1px] bg-gray-200 hidden md:block"></div>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6 relative z-10">
                {[
                  { num: '01', icon: FileText, title: 'Apply', desc: 'Customer applies with secure digital application.' },
                  { num: '02', icon: Search, title: 'Evaluate', desc: 'Assess eligibility, credit score & risk factors.' },
                  { num: '03', icon: CheckCircle, title: 'Approve', desc: 'Automated approvals with credit policies.' },
                  { num: '04', icon: Banknote, title: 'Disburse', desc: 'Loans disbursed quickly and securely.' },
                  { num: '05', icon: Activity, title: 'Repay & Monitor', desc: 'Track repayments and monitor performance.' },
                  { num: '06', icon: XOctagon, title: 'Close', desc: 'Loan closure with complete settlement records.' }
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col text-left">
                    <div className="w-16 h-16 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-6 mx-auto md:mx-0 text-[#12241F]">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 mb-1">{step.num}</span>
                    <h4 className="text-sm font-bold text-[#12241F] mb-2">{step.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed pr-2">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LendingCreditPage;
