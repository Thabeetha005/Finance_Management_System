import React from 'react';
import { ShieldCheck, Award, TrendingUp, Users, CheckCircle, ArrowRight, Target, Compass, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC] font-sans">
      {/* Hero Banner */}
      <section className="bg-[#05231e] text-white py-20 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-emerald-700/20 pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-emerald-400 font-semibold tracking-wider uppercase text-sm mb-3"
          >
            Empowering Your Financial Future
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            About Kalpanaaa Finance
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Delivering cutting-edge wealth management, flexible credit solutions, and institutional financial consulting with uncompromising integrity and precision.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-[0_10px_30px_rgb(0,0,0,0.03)]"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6">
              <Target className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-[#05231e] mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              To democratize access to institutional-grade wealth management and transparent lending, providing individuals and business enterprises with the tools and advisory needed to achieve sustainable financial growth.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-[0_10px_30px_rgb(0,0,0,0.03)]"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6">
              <Compass className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-[#05231e] mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              To become India's most trusted financial services ecosystem, pioneering data-driven wealth intelligence, seamless capital deployment, and client-first financial stewardship.
            </p>
          </motion.div>
        </div>

        {/* Statistical Achievements */}
        <div className="bg-[#05231e] text-white rounded-3xl p-10 md:p-12 mb-20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            <div>
              <p className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-2">₹500Cr+</p>
              <p className="text-gray-300 text-xs md:text-sm uppercase tracking-wider font-medium">Assets Under Advisory</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-2">50,000+</p>
              <p className="text-gray-300 text-xs md:text-sm uppercase tracking-wider font-medium">Active Clients</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-2">99.8%</p>
              <p className="text-gray-300 text-xs md:text-sm uppercase tracking-wider font-medium">Client Retention Rate</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-2">15+</p>
              <p className="text-gray-300 text-xs md:text-sm uppercase tracking-wider font-medium">Years of Excellence</p>
            </div>
          </div>
        </div>

        {/* Core Pillars / Values */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-emerald-700 font-bold text-sm tracking-wider uppercase mb-2">OUR GUIDING PRINCIPLES</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#05231e]">Core Values That Drive Us</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Complete Transparency</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Zero hidden charges or opaque terms. Every rate, fee, and investment policy is clearly communicated upfront.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Disciplined Growth</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Our investment and lending strategies prioritize long-term stability and risk mitigation over short-term speculation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Client Centricity</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Every financial plan and consulting session is custom-engineered around your specific wealth objectives.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Bank-Grade Security</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Encrypted data storage and multi-layer security filters protect your assets and private data around the clock.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#05231e] text-white p-10 md:p-14 rounded-3xl text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Accelerate Your Financial Goals?</h2>
          <p className="text-gray-300 text-base max-w-2xl mx-auto mb-8">
            Connect with our expert team today to discover tailored investment plans, flexible loans, and strategic financial advice.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/services" 
              className="px-8 py-3.5 bg-emerald-500 text-[#05231e] font-bold rounded-xl text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              Explore Our Services
            </Link>
            <Link 
              to="/contact" 
              className="px-8 py-3.5 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition-all border border-white/20"
            >
              Contact Advisory Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
