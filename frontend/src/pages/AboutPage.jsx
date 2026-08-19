import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  ArrowRight, 
  Users, 
  Handshake, 
  TrendingUp, 
  Award,
  Lightbulb,
  ShieldCheck,
  Leaf,
  Coins,
  PieChart,
  CircleDollarSign
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-12 flex items-center gap-2">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="text-gray-900">About Us</span>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[#008f7a] tracking-widest uppercase">
              ABOUT US
            </h3>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Building Trust.<br />Creating Financial Futures.
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
              At Kalpanaaa Finance, we empower individuals and businesses to achieve their financial goals through innovative solutions, expert guidance, and technology-driven services.
            </p>
            <div className="pt-4">
              <Link to="/blog/company-updates" className="bg-[#12241F] text-white px-8 py-3.5 rounded-lg flex items-center justify-center w-fit gap-3 font-medium hover:bg-[#0a1411] transition-colors">
                Our Journey <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="/service-business-finance.jpg" 
              alt="Kalpanaaa Finance Building" 
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <button className="w-20 h-20 bg-[#008f7a] rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-xl">
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 mb-24 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#008f7a] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">30K+</div>
              <div className="text-sm text-gray-500">Happy Customers</div>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-gray-100 pl-8">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#008f7a] flex items-center justify-center shrink-0">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">250+</div>
              <div className="text-sm text-gray-500">Long-Term Clients</div>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-gray-100 pl-8">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#008f7a] flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">98%</div>
              <div className="text-sm text-gray-500">Client Satisfaction</div>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-gray-100 pl-8">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#008f7a] flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">10+</div>
              <div className="text-sm text-gray-500">Years of Excellence</div>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-24">
          <div className="relative rounded-2xl overflow-hidden shadow-xl h-full">
            <img 
              src="/service-digital-finance.jpg" 
              alt="Our Story" 
              className="w-full h-full min-h-[500px] object-cover"
            />
          </div>
          
          <div className="space-y-8 py-4">
            <div>
              <h3 className="text-sm font-bold text-[#008f7a] tracking-widest uppercase mb-4">
                OUR STORY
              </h3>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
                Driven by Purpose.<br />Guided by Values.
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                <p>
                  Founded with a mission to make financial growth accessible to everyone, Kalpanaaa Finance combines deep industry expertise with cutting-edge technology. We focus on transparency, security, and building long-term relationships with our clients.
                </p>
                <p>
                  From investment planning to loans and digital wealth solutions, we provide everything you need to grow with confidence.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-200">
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <Users className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Client-Centric Approach</h4>
                  <p className="text-sm text-gray-500">Your goals are our priority.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <Lightbulb className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Innovation First</h4>
                  <p className="text-sm text-gray-500">We embrace technology to simplify finance.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <ShieldCheck className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Trusted & Secure</h4>
                  <p className="text-sm text-gray-500">We ensure safety and transparency in all transactions.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <Leaf className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Sustainable Growth</h4>
                  <p className="text-sm text-gray-500">We help you build wealth for a better future.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What We Do Section */}
        <div className="mb-20">
          <div className="mb-12 max-w-2xl">
            <h3 className="text-sm font-bold text-[#008f7a] tracking-widest uppercase mb-4">
              WHAT WE DO
            </h3>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Comprehensive Financial Solutions
            </h2>
            <p className="text-gray-600 text-lg">
              We offer a wide range of services tailored to meet your personal and business financial needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-[#008f7a] flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Investments</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Grow your wealth with smart investment options.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-[#008f7a] flex items-center justify-center mb-6">
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Loans</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Flexible loan solutions for your every need.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-[#008f7a] flex items-center justify-center mb-6">
                <Coins className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Digital Gold</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Invest in 24K digital gold and secure your future.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-[#008f7a] flex items-center justify-center mb-6">
                <PieChart className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Financial Planning</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Plan today for a stronger and secure tomorrow.
              </p>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Link to="/services" className="bg-[#12241F] text-white px-8 py-3.5 rounded-lg flex items-center gap-3 font-medium hover:bg-[#0a1411] transition-colors">
              Explore Our Services <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
