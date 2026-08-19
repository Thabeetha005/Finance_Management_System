import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ArrowRight, TrendingUp, PieChart, Briefcase, 
  LineChart, User, Users, CheckCircle, BarChart3, Rocket
} from 'lucide-react';

const InvestmentWealthPage = () => {
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
          <span className="text-[#12241F] font-bold">Investment & Wealth</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-16">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/2 w-full order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop" 
                alt="Investment Portfolio Overview" 
                className="w-full h-[450px] object-cover"
              />
            </div>
          </div>

          <div className="lg:w-1/2 w-full order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#12241F] flex items-center justify-center text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-[#4E8B83] font-bold tracking-wider text-xs uppercase">Portfolio & Wealth Management</p>
            </div>
            
            <h1 className="text-4xl lg:text-5xl xl:text-[56px] font-extrabold text-[#12241F] leading-[1.1] mb-6 font-serif">
              Investment & Wealth
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-xl leading-relaxed">
              Technology-driven investment tools for portfolio optimization and wealth advisory.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => navigate('/contact')}
                className="bg-[#12241F] text-white px-8 py-3.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#1a332c] transition-colors"
              >
                Talk to Our Advisors <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/services')}
                className="border border-[#C47D57] text-[#C47D57] px-8 py-3.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#C47D57]/5 transition-colors"
              >
                Explore Solutions <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
        </div>
      </section>

      {/* Info Cards Section (6 cards) */}
      <section className="py-8 px-6 lg:px-12 max-w-[1400px] mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              id: '01', 
              icon: PieChart, 
              title: 'Investment Management', 
              desc: "Our Investment Management services provide end-to-end visibility and control. Whether you're a scaling business or an individual investor, we help you grow smarter."
            },
            { 
              id: '02', 
              icon: Briefcase, 
              title: 'Wealth Management', 
              desc: "Our Wealth Management services provide end-to-end visibility and control. Whether you're a scaling business or an individual investor, we help you grow smarter."
            },
            { 
              id: '03', 
              icon: Rocket, 
              title: 'Startup Investment', 
              desc: "Our Startup Investment services provide end-to-end visibility and control. Whether you're a scaling business or an individual investor, we help you grow smarter."
            },
            { 
              id: '04', 
              icon: Briefcase, 
              title: 'Portfolio Management', 
              desc: "Our Portfolio Management services provide end-to-end visibility and control. Whether you're a scaling business or an individual investor, we help you grow smarter."
            },
            { 
              id: '05', 
              icon: BarChart3, 
              title: 'Investment Analytics', 
              desc: "Our Investment Analytics services provide end-to-end visibility and control. Whether you're a scaling business or an individual investor, we help you grow smarter."
            },
            { 
              id: '06', 
              icon: User, 
              title: 'Investor Management', 
              desc: "Our Investor Management services provide end-to-end visibility and control. Whether you're a scaling business or an individual investor, we help you grow smarter."
            }
          ].map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl p-8 border border-gray-100 flex gap-6 hover:shadow-lg transition-all group">
              <div className="flex-shrink-0 mt-2">
                <div className="w-14 h-14 rounded-full bg-[#12241F] flex items-center justify-center text-white shadow-md">
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex flex-col flex-grow relative pb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-gray-300 font-medium text-lg w-6">{card.id}</span>
                  <h3 className="text-[17px] font-bold text-[#12241F]">{card.title}</h3>
                </div>
                <p className="text-gray-500 text-[13px] leading-relaxed">
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
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="w-full bg-[#12241F] rounded-2xl py-12 px-8 lg:px-16 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative z-10">
            
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full border border-[#4E8B83]/30 flex items-center justify-center text-[#C47D57] shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-[#C47D57] mb-1">98%</h4>
                <p className="text-white font-bold text-sm mb-1">Satisfied Clients</p>
                <p className="text-gray-400 text-xs">Trust us for their financial growth</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full border border-[#4E8B83]/30 flex items-center justify-center text-[#C47D57] shrink-0">
                <LineChart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-[#C47D57] mb-1">30K+</h4>
                <p className="text-white font-bold text-sm mb-1">Active Investors</p>
                <p className="text-gray-400 text-xs">Growing their wealth with us</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full border border-[#4E8B83]/30 flex items-center justify-center text-[#C47D57] shrink-0">
                <span className="font-serif text-2xl">₹</span>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-[#C47D57] mb-1">₹250Cr+</h4>
                <p className="text-white font-bold text-sm mb-1">Assets Managed</p>
                <p className="text-gray-400 text-xs">Across diversified portfolios</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full border border-[#4E8B83]/30 flex items-center justify-center text-[#C47D57] shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-[#C47D57] mb-1">10+ Years</h4>
                <p className="text-white font-bold text-sm mb-1">Of Expertise</p>
                <p className="text-gray-400 text-xs">In investment & wealth advisory</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default InvestmentWealthPage;
