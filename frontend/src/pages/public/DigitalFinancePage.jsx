import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ChevronRight, Plus, 
  Server, Share2, Eye, Zap, 
  Layers, CreditCard, Activity, LineChart, 
  Settings, UserCheck, FileText, Link, 
  Search, PenTool, Code, Puzzle, CheckCircle,
  Building2, MonitorSmartphone, Rocket, TrendingUp, Building, UserPlus,
  Shield, Cloud, BarChart, Lock, Target, Users
} from 'lucide-react';

const DigitalFinancePage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [showCaseStudy, setShowCaseStudy] = useState(false);
  const navigate = useNavigate();

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Digital Finance?",
      answer: "Digital finance encompasses all financial services delivered via digital channels, including payments, credit, savings, and wealth management, utilizing advanced technologies for better efficiency and accessibility."
    },
    {
      question: "Who can use Digital Finance solutions?",
      answer: "Our solutions are designed for a wide range of organizations including traditional financial institutions, FinTech startups, growing businesses, and enterprise finance teams looking to modernize their operations."
    },
    {
      question: "Can it integrate with existing financial systems?",
      answer: "Yes, our digital finance platforms are built with API-first architectures, allowing seamless integration with your existing legacy systems, CRMs, and third-party financial services."
    },
    {
      question: "Can the platform scale with business growth?",
      answer: "Absolutely. Our cloud-native architecture ensures that the platform can scale automatically to handle increased transaction volumes and new user bases without performance degradation."
    },
    {
      question: "Is financial data secure?",
      answer: "Security is our top priority. We implement bank-grade encryption, multi-factor authentication, and continuous security monitoring to ensure all financial data and transactions are fully protected."
    },
    {
      question: "Can the solution be customized to our needs?",
      answer: "Yes, we offer highly customizable solutions tailored to your specific operational workflows, compliance requirements, and brand guidelines."
    }
  ];

  const coreCapabilities = [
    { icon: Layers, label: "Digital Finance Platform" },
    { icon: CreditCard, label: "Payment Infrastructure" },
    { icon: Activity, label: "Transaction Processing" },
    { icon: LineChart, label: "Financial Analytics" },
    { icon: Settings, label: "Financial Automation" },
    { icon: UserCheck, label: "Account Management" },
    { icon: FileText, label: "Financial Reporting" },
    { icon: Link, label: "API Integration" }
  ];

  const processSteps = [
    { id: '01', title: 'Understand', desc: 'We analyze your business needs and financial challenges.', icon: Search },
    { id: '02', title: 'Design', desc: 'We design the right financial architecture and digital workflows.', icon: PenTool },
    { id: '03', title: 'Build', desc: 'We build secure, scalable and performant financial platforms.', icon: Code },
    { id: '04', title: 'Integrate', desc: 'We integrate with existing systems, APIs and third-party services.', icon: Puzzle },
    { id: '05', title: 'Optimize', desc: 'We monitor performance and continuously optimize for better outcomes.', icon: CheckCircle }
  ];

  return (
    <div className="font-sans text-gray-800 bg-[#FDFDFD]">
      {/* Hero Section */}
      <section className="pt-28 pb-16 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
              <span>Home</span>
              <ChevronRight className="w-4 h-4" />
              <span>Services</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#12241F] font-bold">Digital Finance</span>
            </div>
            
            <p className="text-[#4E8B83] font-bold tracking-wider text-xs uppercase mb-4">Platforms & Digital Infrastructure</p>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-[#12241F] leading-tight mb-6">
              Digital Finance
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-xl leading-relaxed">
              End-to-end digital finance platforms built for scale, from payment processing to financial analytics.
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
                className="border border-gray-300 text-[#12241F] px-8 py-3.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                Explore Capabilities <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                alt="Digital Finance Analytics Dashboard" 
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-8 px-6 lg:px-12 max-w-[1400px] mx-auto -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: '01', title: 'Digital Finance Platform', desc: 'End-to-end platform for managing financial operations, accounts, users and workflows.' },
            { id: '02', title: 'Digital Gold Investment', desc: 'Secure digital gold investment platform with real-time tracking and transparency.' },
            { id: '03', title: 'Payment & Transactions', desc: 'Scalable payment infrastructure with secure transactions and real-time settlements.' },
            { id: '04', title: 'Financial Analytics', desc: 'Advanced analytics and reporting tools for actionable financial insights.' }
          ].map((card, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col h-full">
              <div className="text-gray-300 font-bold text-xl mb-4">{card.id}</div>
              <h3 className="text-lg font-bold text-[#12241F] mb-3">{card.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">{card.desc}</p>
              <div className="mt-auto">
                <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-[#12241F] group-hover:text-white group-hover:border-[#12241F] transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Infrastructure Section */}
      <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3">
            <p className="text-[#4E8B83] font-bold tracking-wider text-xs uppercase mb-4">Digital Finance</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#12241F] mb-6 leading-tight">
              Building the Digital Financial Infrastructure for Modern Businesses
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed text-sm lg:text-base">
              Our Digital Finance solutions help businesses digitize, automate and scale their financial operations with secure platforms, real-time data and intelligent workflows.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
              From payment processing and account management to analytics and reporting, we build connected financial ecosystems that drive growth and efficiency.
            </p>
          </div>
          
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {[
                { icon: Server, num: '01', title: 'Scalable Infrastructure', desc: 'Build platforms that grow with your business and handle millions of transactions seamlessly.' },
                { icon: Share2, num: '02', title: 'Connected Systems', desc: 'Integrate payments, accounts, analytics and workflows into a unified financial ecosystem.' },
                { icon: Eye, num: '03', title: 'Real-Time Visibility', desc: 'Gain real-time visibility across transactions, accounts and financial performance.' },
                { icon: Zap, num: '04', title: 'Intelligent Automation', desc: 'Automate repetitive processes and reduce operational costs with smart workflows.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-[#4E8B83]">
                      <item.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#C47D57] font-bold text-sm">{item.num}</span>
                      <h3 className="font-bold text-[#12241F] text-lg">{item.title}</h3>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dark Green Banner */}
      <section className="w-full bg-[#12241F] relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop" alt="Finance Data Background" className="w-full h-full object-cover mix-blend-overlay" />
        </div>
        <div className="max-w-[1400px] mx-auto relative z-10 text-center lg:text-left">
          <p className="text-[#4E8B83] font-bold tracking-wider text-xs uppercase mb-4">Digital Finance Infrastructure</p>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white max-w-2xl leading-tight">
            Technology that connects every part of the financial journey.
          </h2>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <p className="text-[#4E8B83] font-bold tracking-wider text-xs uppercase mb-2">What We Deliver</p>
        <h2 className="text-3xl font-extrabold text-[#12241F] mb-12">Our Core Capabilities</h2>
        
        <div className="flex flex-wrap md:grid md:grid-cols-4 lg:flex lg:flex-nowrap justify-between gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {coreCapabilities.map((cap, idx) => (
            <div key={idx} className="flex flex-col items-center text-center min-w-[120px] group cursor-default">
              <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-[#12241F] mb-4 group-hover:border-[#4E8B83] group-hover:text-[#4E8B83] transition-colors">
                <cap.icon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="font-bold text-sm text-[#12241F] leading-tight mb-3">{cap.label}</p>
              <ArrowRight className="w-4 h-4 text-[#C47D57] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </section>


      {/* Who Can Benefit */}
      <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto bg-gray-50/50 rounded-3xl mt-12 mb-20">
        <p className="text-[#4E8B83] font-bold tracking-wider text-xs uppercase mb-2">Built for Different Financial Needs</p>
        <h2 className="text-3xl font-extrabold text-[#12241F] mb-12">Who Can Benefit</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Building2, title: 'Financial Institutions', desc: 'Modernize core systems and enhance customer experience.' },
            { icon: Rocket, title: 'FinTech Companies', desc: 'Build innovative financial products with scalable infrastructure.' },
            { icon: UserPlus, title: 'Startups', desc: 'Launch and scale faster with robust digital financial solutions.' },
            { icon: TrendingUp, title: 'Growing Businesses', desc: 'Streamline operations and gain real-time financial visibility.' },
            { icon: LineChart, title: 'Investment Platforms', desc: 'Manage investments, transactions and portfolios efficiently.' },
            { icon: Users, title: 'Enterprise Finance Teams', desc: 'Improve reporting, control and financial performance.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <item.icon className="w-8 h-8 text-[#12241F]" />
                <h3 className="font-bold text-[#12241F] text-lg leading-tight">{item.title}</h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Strip */}
      <section className="py-10 px-6 border-y border-gray-100 mb-20">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-8 text-center">Technology Behind the Solution</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
            {[
              { icon: Shield, label: 'Secure APIs' },
              { icon: Cloud, label: 'Cloud Architecture' },
              { icon: BarChart, label: 'Data Analytics' },
              { icon: Settings, label: 'Automation' },
              { icon: Lock, label: 'Authentication' },
              { icon: FileText, label: 'Reporting' },
              { icon: Target, label: 'Monitoring' }
            ].map((tech, idx) => (
              <div key={idx} className="flex items-center gap-2 text-gray-600">
                <tech.icon className="w-5 h-5 text-[#4E8B83]" />
                <span className="font-medium text-sm">{tech.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-12 px-6 lg:px-12 max-w-[1400px] mx-auto mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 order-2 lg:order-1">
            <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop" 
              alt="Team reviewing financial data" 
              className="w-full h-[450px] object-cover"
            />
          </div>
          
          <div className="order-1 lg:order-2">
            <p className="text-[#4E8B83] font-bold tracking-wider text-xs uppercase mb-4">Case Study</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#12241F] mb-8 leading-tight">
              Transforming Manual Financial Operations into a Connected Digital Platform
            </h2>
            
            <div className="space-y-6 mb-10">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h4 className="font-bold text-[#12241F] mb-2 text-sm uppercase tracking-wider">Challenge</h4>
                <p className="text-gray-600 text-sm leading-relaxed">Manual processes, disconnected systems and limited visibility across financial operations.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50/50 p-6 rounded-xl border border-green-100">
                  <h4 className="font-bold text-[#12241F] mb-2 text-sm uppercase tracking-wider">Solution</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">We built a unified digital finance platform with automation, integrations and real-time analytics.</p>
                </div>
                
                <div className="bg-[#12241F] text-white p-6 rounded-xl shadow-lg">
                  <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">Outcome</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">70% reduction in manual effort, real-time visibility and improved financial decision making.</p>
                </div>
              </div>
            </div>
            
            {!showCaseStudy ? (
              <button 
                onClick={() => setShowCaseStudy(true)}
                className="bg-[#12241F] text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#1a332c] transition-colors"
              >
                Explore Case Study <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-[#12241F] mb-6 border-b border-gray-100 pb-4">Detailed Case Study Breakdown</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-[#4E8B83] mb-2 flex items-center gap-2"><Building2 className="w-4 h-4" /> Client Background</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">A mid-sized regional bank struggling with legacy on-premise systems that required heavy manual data entry, leading to high operational costs and slow customer onboarding times.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#4E8B83] mb-2 flex items-center gap-2"><Layers className="w-4 h-4" /> Our Strategic Implementation</h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">We deployed a phased digital transformation approach:</p>
                      <ul className="list-disc pl-5 text-gray-600 text-sm space-y-2">
                        <li>Migrated core infrastructure to a secure cloud environment.</li>
                        <li>Implemented an API gateway to seamlessly integrate third-party payment providers and credit bureaus.</li>
                        <li>Built a custom automated workflow engine for loan origination and KYC compliance.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-[#4E8B83] mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Final Business Impact</h4>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-2xl font-black text-[#12241F]">3x</p>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Faster Onboarding</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-2xl font-black text-[#12241F]">$1.2M</p>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Annual Savings</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowCaseStudy(false)}
                    className="mt-8 text-sm font-bold text-gray-500 hover:text-[#12241F] flex items-center gap-2 transition-colors"
                  >
                    Hide Case Study
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default DigitalFinancePage;
