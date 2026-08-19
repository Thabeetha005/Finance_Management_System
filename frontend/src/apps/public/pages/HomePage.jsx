import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Activity, Link2, BarChart2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { motion } from 'framer-motion';
import { CinematicStrategySection } from '../components/CinematicStrategySection';
import { SolutionsCarousel } from '../components/SolutionsCarousel';
import { ProcessAndPartnerSection } from '../components/ProcessAndPartnerSection';
import CtaSection from '../components/CtaSection';

const fadeInUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.7, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.12, 
      delayChildren: 0.05 
    } 
  }
};

const heroImages = [
  '/hero-bg.jpg?v=2',
  '/hero-bg-2.jpg',
  '/hero-bg-3.jpg',
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();



  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col w-full overflow-clip">
      
      {/* HERO SECTION — 3-IMAGE SLIDESHOW */}
      <section className="relative min-h-[80vh] md:min-h-screen w-full flex items-center overflow-hidden">
        
        {/* Slideshow Background Images — all stacked, only opacity changes */}
        {heroImages.map((img, idx) => (
          <div
            key={img}
            className="absolute inset-0 bg-cover bg-center gpu-accelerate"
            style={{
              backgroundImage: `url('${img}')`,
              opacity: currentSlide === idx ? 1 : 0,
              zIndex: currentSlide === idx ? 1 : 0,
              transform: currentSlide === idx ? 'scale(1.05)' : 'scale(1)',
              transition: 'opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1), transform 7s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'opacity, transform',
            }}
          />
        ))}

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#12241F]/60 z-[1]"></div>
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#12241F]/80 via-[#12241F]/50 to-transparent z-[1]"></div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-3">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-[3px] rounded-full transition-all duration-500 ease-out cursor-pointer ${
                currentSlide === idx ? 'w-10 bg-[#4E8B83]' : 'w-5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
        
        {/* Content Wrapper */}
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="max-w-7xl mx-auto px-6 lg:px-8 relative z-[2] w-full flex flex-col items-start text-left mt-16 md:mt-24"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md mb-8">
            <span className="text-xs font-bold tracking-widest uppercase text-white">Kalpanaaa Finance</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-[80px] font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
            Building the Digital Future of Finance
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-white/90 max-w-2xl mb-10 leading-relaxed">
            Secure, scalable digital finance platforms designed for modern financial operations. We simplify workflows and automate operations.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/contact" className="px-8 py-4 bg-primary text-white rounded-full font-bold text-sm tracking-wider uppercase hover:bg-primary-hover smooth-button-hover shadow-xl flex items-center justify-center w-full sm:w-auto">
              Talk to Our Experts <ArrowRight className="ml-3 w-4 h-4" />
            </Link>
            <Link to="/services" className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-full font-bold text-sm tracking-wider uppercase hover:bg-white hover:text-primary smooth-button-hover flex items-center justify-center w-full sm:w-auto">
              Explore Solutions
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* INTRODUCTION SECTION */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/2">
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4 block">Digital Finance</span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Technology Designed Around Financial Operations
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Financial organizations require technology that is secure, reliable, scalable, and adaptable. Kalpanaaa Finance combines software engineering capabilities with financial-domain workflows to create digital platforms that simplify operations, connect data, and support better decision-making.
              </p>
              <Link to="/about" className="inline-flex items-center text-primary font-semibold hover:text-primary-light transition-colors">
                Discover Our Approach <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
              className="w-full md:w-1/2 bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-transform group-hover:scale-110" />
              <div className="grid grid-cols-2 gap-8 relative z-10">
                <motion.div variants={fadeInUp}>
                  <h3 className="text-4xl font-bold text-primary mb-2">99.9%</h3>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Uptime Reliability</p>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <h3 className="text-4xl font-bold text-primary mb-2">256-bit</h3>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Data Encryption</p>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <h3 className="text-4xl font-bold text-primary mb-2">Real-time</h3>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Transaction Processing</p>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <h3 className="text-4xl font-bold text-primary mb-2">API</h3>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">First Architecture</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* USER PORTAL QUICK ACCESS */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold tracking-widest text-primary uppercase mb-4 block">Secure Portal</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Access Your Financial Data</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 01 */}
            <div className="bg-white p-8 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border-t-[3px] border-transparent hover:border-[#4E8B83] relative group hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <span className="text-4xl font-serif text-gray-200 leading-none transition-colors">01</span>
                <Link to="/services/digital-finance" className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-[#4E8B83] group-hover:border-[#4E8B83] group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4 group-hover:rotate-0 transition-transform duration-300" />
                </Link>
              </div>
              <h3 className="text-lg font-bold text-[#12241F] mb-4">Digital Finance Platform</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                Our Digital Finance Platform services provide end-to-end visibility and control. Whether you're a scaling enterprise or a startup, we have you covered.
              </p>
            </div>

            {/* Card 02 */}
            <div className="bg-white p-8 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border-t-[3px] border-transparent hover:border-[#4E8B83] relative group hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <span className="text-4xl font-serif text-gray-200 leading-none transition-colors">02</span>
                <Link to="/services/digital-gold-investment" className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-[#4E8B83] group-hover:border-[#4E8B83] group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4 group-hover:rotate-0 transition-transform duration-300" />
                </Link>
              </div>
              <h3 className="text-lg font-bold text-[#12241F] mb-4">Digital Gold Investment</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                Our Digital Gold Investment services provide end-to-end visibility and control. Whether you're a scaling enterprise or a startup, we have you covered.
              </p>
            </div>

            {/* Card 03 - Redirects to Transactions */}
            <div className="bg-white p-8 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border-t-[3px] border-transparent hover:border-[#4E8B83] relative group hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <span className="text-4xl font-serif text-gray-200 leading-none group-hover:text-[#4E8B83]/30 transition-colors">03</span>
                <Link to="/services/payment-transactions" className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-[#4E8B83] group-hover:border-[#4E8B83] group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4 group-hover:rotate-0 transition-transform duration-300" />
                </Link>
              </div>
              <h3 className="text-lg font-bold text-[#12241F] group-hover:text-[#4E8B83] transition-colors mb-4">Payment & Transactions</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                Our Payment & Transactions services provide end-to-end visibility and control. Whether you're a scaling enterprise or a startup, we have you covered.
              </p>
            </div>
            
            {/* Card 04 - Redirects to Analytics */}
            <div className="bg-white p-8 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border-t-[3px] border-transparent hover:border-[#4E8B83] relative group hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <span className="text-4xl font-serif text-gray-200 leading-none transition-colors">04</span>
                <Link to="/services/financial-analytics" className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-[#4E8B83] group-hover:border-[#4E8B83] group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4 group-hover:rotate-0 transition-transform duration-300" />
                </Link>
              </div>
              <h3 className="text-lg font-bold text-[#12241F] mb-4">Financial Analytics</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                Our Financial Analytics services provide end-to-end visibility and control. Whether you're a scaling enterprise or a startup, we have you covered.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SOLUTIONS SECTION */}
      <div id="solutions">
        <SolutionsCarousel />
      </div>

      {/* WHY Kalpanaaa Finance */}
      <section className="py-24 bg-white border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center">Built for the Complexity of Finance</h2>
            
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-4 gap-8"
            >
              {[
                { icon: Shield, title: 'Secure', desc: 'Designed around security and controlled access.' },
                { icon: Activity, title: 'Scalable', desc: 'Built to grow with business operations and transaction volumes.' },
                { icon: Link2, title: 'Connected', desc: 'APIs, integrations, data, and systems working together.' },
                { icon: BarChart2, title: 'Intelligent', desc: 'Analytics and automation supporting better decisions.' }
              ].map((item, idx) => (
                <motion.div key={idx} variants={fadeInUp} className="text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
         </div>
      </section>

      {/* FINANCIAL STRATEGY SECTION */}
      <CinematicStrategySection />
      
      <div className="h-32 md:h-48 bg-white w-full"></div>

      {/* PROCESS AND PARTNER SECTION */}
      <ProcessAndPartnerSection />

      {/* CALL TO ACTION SECTION */}
      <CtaSection />

    </div>
  );
};

export default HomePage;
