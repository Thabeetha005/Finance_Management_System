import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield, ShieldAlert, MonitorSmartphone, ClipboardCheck, Search, CheckCircle, PieChart, Globe } from 'lucide-react';

const RiskCompliancePage = () => {
  return (
    <div className="font-sans text-gray-800 bg-[#FDFDFD] pb-20">
      
      {/* Breadcrumbs */}
      <div className="pt-28 pb-8 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Link to="/" className="hover:text-gray-800 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link to="/services" className="hover:text-gray-800 transition-colors">Services</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-[#12241F] font-bold">Risk & Compliance</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-20">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2 w-full">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                alt="Risk and Compliance Operations" 
                className="w-full h-[400px] object-cover filter brightness-90"
              />
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#12241F] flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <p className="text-[#4E8B83] font-bold tracking-wider text-xs uppercase">Governance & Regulatory Control</p>
            </div>
            
            <h1 className="text-4xl lg:text-5xl xl:text-[56px] font-extrabold text-[#12241F] leading-[1.1] mb-6">
              Risk & Compliance
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-xl leading-relaxed">
              Strengthen your organization with robust risk management and compliance frameworks. We help you identify risks, ensure regulatory adherence, and safeguard your business and customers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#4E8B83] shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#12241F] mb-1">Protect Your Business</h4>
                  <p className="text-sm text-gray-500">Identify, assess, and mitigate risks across all financial operations.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#4E8B83] shrink-0">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#12241F] mb-1">Stay Compliant</h4>
                  <p className="text-sm text-gray-500">Ensure adherence to regulatory standards and policies.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-12 px-6 lg:px-12 max-w-[1400px] mx-auto mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              id: '01', 
              icon: ShieldAlert, 
              title: 'Risk Management', 
              desc: 'Comprehensive risk management services to identify, assess, and mitigate potential risks to your financial operations and assets.',
              features: ['Risk Assessment', 'Risk Modeling', 'Risk Reporting', 'Risk Mitigation']
            },
            { 
              id: '02', 
              icon: MonitorSmartphone, 
              title: 'Financial Monitoring', 
              desc: 'Real-time monitoring and analytics to track financial performance and detect anomalies early.',
              features: ['Real-time Monitoring', 'Performance Tracking', 'Threshold Alerts', 'Financial Dashboards']
            },
            { 
              id: '03', 
              icon: ClipboardCheck, 
              title: 'Audit & Compliance', 
              desc: 'Ensure regulatory compliance and streamline audit processes with comprehensive controls.',
              features: ['Regulatory Compliance', 'Policy Management', 'Internal Controls', 'Audit Management']
            },
            { 
              id: '04', 
              icon: Search, 
              title: 'Fraud & Risk Monitoring', 
              desc: 'Advanced fraud detection and risk monitoring to prevent fraud and ensure secure operations.',
              features: ['Fraud Detection', 'Transaction Monitoring', 'Behavior Analysis', 'Incident Management']
            }
          ].map((card, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[#4E8B83] font-bold text-lg">{card.id}</span>
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#4E8B83]">
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#12241F] mb-4">{card.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{card.desc}</p>
              <div className="space-y-3 mt-auto">
                {card.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-[#4E8B83] shrink-0" />
                    <span className="text-sm text-gray-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights Section */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="bg-gray-50/80 rounded-3xl p-8 lg:p-12 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex gap-4 items-start">
              <div className="text-[#4E8B83] shrink-0">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-[#12241F] mb-2 text-sm uppercase tracking-wider">Secure Operations</h4>
                <p className="text-gray-500 text-sm leading-relaxed">Advanced security frameworks to protect your financial data and operations.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="text-[#4E8B83] shrink-0">
                <PieChart className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-[#12241F] mb-2 text-sm uppercase tracking-wider">Data-Driven Insights</h4>
                <p className="text-gray-500 text-sm leading-relaxed">Make informed decisions with accurate risk analytics and reporting.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="text-[#4E8B83] shrink-0">
                <ClipboardCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-[#12241F] mb-2 text-sm uppercase tracking-wider">Regulatory Assurance</h4>
                <p className="text-gray-500 text-sm leading-relaxed">Stay ahead with up-to-date compliance and regulatory requirements.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="text-[#4E8B83] shrink-0">
                <Globe className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-[#12241F] mb-2 text-sm uppercase tracking-wider">Enterprise Grade</h4>
                <p className="text-gray-500 text-sm leading-relaxed">Built for scale, reliability, and enterprise-level performance and governance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default RiskCompliancePage;
