import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, ChevronDown, Wallet, Gift, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import Confetti from 'react-confetti';

const megaMenuData = [
  {
    title: 'DIGITAL FINANCE',
    items: [
      { name: 'Digital Finance Platform', path: '/services/digital-finance' },
      { name: 'Digital Gold Investment', path: '/services/digital-finance' },
      { name: 'Financial Analytics', path: '/services/digital-finance' }
    ]
  },
  {
    title: 'LENDING & CREDIT',
    items: [
      { name: 'Loan Management', path: '/services/lending-credit' },
      { name: 'Business Loan Management', path: '/services/lending-credit' },
      { name: 'Loan App & Approval', path: '/services/lending-credit' },
      { name: 'Credit Management', path: '/services/lending-credit' }
    ]
  },
  {
    title: 'INVESTMENT & WEALTH',
    items: [
      { name: 'Investment Management', path: '/services/investment-wealth' },
      { name: 'Wealth Management', path: '/services/investment-wealth' },
      { name: 'Startup Investment', path: '/services/investment-wealth' },
      { name: 'Portfolio Management', path: '/services/investment-wealth' }
    ]
  },
  {
    title: 'BUSINESS FINANCE',
    items: [
      { name: 'Business Finance Mgt', path: '/services/digital-finance' },
      { name: 'Working Capital Mgt', path: '/services/digital-finance' },
      { name: 'Cash Flow Management', path: '/services/digital-finance' },
      { name: 'Financial Planning', path: '/services/digital-finance' }
    ]
  },
  {
    title: 'RISK & COMPLIANCE',
    items: [
      { name: 'Risk Management', path: '/services/risk-compliance' },
      { name: 'Financial Monitoring', path: '/services/risk-compliance' },
      { name: 'Audit & Compliance', path: '/services/risk-compliance' },
      { name: 'Fraud & Risk Monitoring', path: '/services/risk-compliance' }
    ]
  }
];

const PublicLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const location = useLocation();
  const { user, isAuthenticated, logout, showBonusPopup, setShowBonusPopup } = useAuth();

  // Fetch live wallet balance from API (not stale auth context)
  const { data: walletBalance } = useQuery({
    queryKey: ['headerWalletBalance'],
    queryFn: async () => {
      const res = await api.get('/wallet/me');
      // API returns a Map object with 'availableBalance' key
      return parseFloat(res.data?.availableBalance) || 0;
    },
    enabled: isAuthenticated && user?.role === 'CUSTOMER',
    refetchInterval: 30000,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDarkHeroPage = location.pathname === '/' || 
    location.pathname === '/services' || 
    (location.pathname.startsWith('/services/') && 
     !['/services/risk-compliance', '/services/lending-credit', '/services/digital-finance', '/services/investment-wealth'].includes(location.pathname) && 
     !location.pathname.includes('/category/')) || 
    location.pathname === '/industries';

  const [footerHeight, setFooterHeight] = useState(0);
  const footerRef = useRef(null);

  useEffect(() => {
    if (footerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setFooterHeight(entry.target.offsetHeight);
        }
      });
      resizeObserver.observe(footerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-primary-light selection:text-white flex flex-col">
      <div 
        className="relative z-10 bg-[#FDFDFD] flex-grow shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)]" 
        style={{ marginBottom: footerHeight }}
      >
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-b border-transparent ${
          (isScrolled || !isDarkHeroPage) ? 'bg-[#12241F]/90 backdrop-blur-lg shadow-md py-[6px]' : 'bg-transparent py-2.5'
        }`}
      >
        <div className="w-full px-6 lg:px-12 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 flex-shrink-0">
            <img src="/kalpanaa-logo-new.png" alt="Kalpanaaa Finance" className="w-40 md:w-56 h-8 md:h-10 object-contain object-left drop-shadow-md" />
          </a>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center space-x-8">
            <Link to="/services" className={`relative group/services h-full flex items-center py-6 -my-6 text-xs font-bold tracking-wider transition-colors hover:text-primary gap-1 ${location.pathname.startsWith('/services') ? 'text-primary' : 'text-white'}`}>
              <span>SERVICES</span>
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#4E8B83] transition-all duration-300 group-hover/services:w-full"></span>
            </Link>

            <div className="relative group h-full flex items-center py-6 -my-6">
              <Link to="/consulting" className={`relative text-xs font-bold tracking-wider transition-colors hover:text-primary flex items-center gap-1 ${location.pathname === '/consulting' ? 'text-primary' : 'text-white'}`}>
                <span>CONSULTING</span>
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#4E8B83] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>

            <div className="relative group h-full flex items-center py-6 -my-6">
              <Link to="/blog" className={`relative text-xs font-bold tracking-wider transition-colors hover:text-primary flex items-center gap-1 ${location.pathname.startsWith('/blog') ? 'text-primary' : 'text-white'}`}>
                <span>BLOG</span>
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#4E8B83] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <div className="absolute top-full left-0 w-52 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                <div className="bg-white shadow-2xl py-3 rounded-sm min-w-[200px]">
                  {[
                    { name: 'LATEST NEWS', path: '/blog/latest-news' },
                    { name: 'FINANCIAL INSIGHTS', path: '/blog/insights' },
                    { name: 'COMPANY UPDATES', path: '/blog/company-updates' }
                  ].map(sub => (
                    <Link key={sub.name} to={sub.path} className="flex items-center px-6 py-3 text-xs font-bold text-[#1A1A1A] hover:text-[#4E8B83] transition-all duration-300 relative group/link">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-[#4E8B83] transition-all duration-300 group-hover/link:w-1"></span>
                      <span className="transform transition-transform duration-300 group-hover/link:translate-x-3">{sub.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/contact" className={`relative group/contact h-full flex items-center py-6 -my-6 text-xs font-bold tracking-wider transition-colors hover:text-primary gap-1 ${location.pathname === '/contact' ? 'text-primary' : 'text-white'}`}>
              <span>CONTACT</span>
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#4E8B83] transition-all duration-300 group-hover/contact:w-full"></span>
            </Link>

            <div className="relative group h-full flex items-center py-6 -my-6">
              <button className={`relative text-xs font-bold tracking-wider transition-colors hover:text-primary flex items-center gap-1 ${location.pathname.startsWith('/pages') ? 'text-primary' : 'text-white'}`}>
                <span>EXPLORE</span>
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#4E8B83] transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div className="absolute top-full left-0 w-52 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                <div className="bg-white shadow-2xl py-3 rounded-sm min-w-[200px]">
                  {[
                    { name: 'ABOUT US', path: '/about' },
                    { name: 'OUR TEAM', path: '/team' },
                    { name: 'TESTIMONIALS', path: '/testimonials' },
                    { name: 'FAQ', path: '/faq' }
                  ].map(sub => (
                    <Link key={sub.name} to={sub.path} className="flex items-center px-6 py-3 text-xs font-bold text-[#1A1A1A] hover:text-[#4E8B83] transition-all duration-300 relative group/link">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-[#4E8B83] transition-all duration-300 group-hover/link:w-1"></span>
                      <span className="transform transition-transform duration-300 group-hover/link:translate-x-3">{sub.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </nav>

          <div className="hidden md:flex items-center gap-5 relative z-50">
            <Link 
              to="/login" 
              className="text-xs font-bold tracking-wider text-white hover:text-[#4E8B83] transition-colors uppercase"
            >
              Sign Up
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold tracking-wider text-white transition-all bg-primary rounded-full hover:bg-primary-hover uppercase"
            >
              Log In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden overflow-y-auto pb-10">
          <nav className="flex flex-col text-lg font-bold">
            {/* Standard Links */}
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-[#1A1A1A] py-4 border-b border-gray-100">Home</Link>
            
            {/* Services Accordion */}
            <div className="border-b border-gray-100">
              <button 
                className="w-full py-4 flex items-center justify-between text-[#1A1A1A]"
                onClick={() => setExpandedMobileCategory(expandedMobileCategory === 'services' ? null : 'services')}
              >
                Services
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedMobileCategory === 'services' ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Nested Categories */}
              {expandedMobileCategory === 'services' && (
                <div className="pl-4 pb-4 space-y-4 border-l-2 border-gray-100 ml-2 mt-2">
                  <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold text-[#4E8B83] pb-2 border-b border-gray-100">
                    All Services Overview →
                  </Link>
                  {megaMenuData.map((category) => {
                    const slug = category.title.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-');
                    return (
                      <Link 
                        key={category.title} 
                        to={`/services/category/${slug}`} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full text-left py-2 text-[15px] font-bold text-[#1A1A1A] hover:text-[#4E8B83]"
                      >
                        {category.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link to="/solutions" onClick={() => setIsMobileMenuOpen(false)} className="text-[#1A1A1A] py-4 border-b border-gray-100">Solutions</Link>
            <Link to="/industries" onClick={() => setIsMobileMenuOpen(false)} className="text-[#1A1A1A] py-4 border-b border-gray-100">Industries</Link>
            <Link to="/features" onClick={() => setIsMobileMenuOpen(false)} className="text-[#1A1A1A] py-4 border-b border-gray-100">Features</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-[#1A1A1A] py-4 border-b border-gray-100">About</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-[#1A1A1A] py-4 border-b border-gray-100">Contact</Link>

            <Link 
              to="/contact" 
              className="inline-flex items-center justify-center px-6 py-4 mt-8 text-sm font-bold tracking-widest uppercase text-white bg-[#4E8B83] rounded shadow-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Talk to Our Experts
            </Link>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar Drawer */}
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-[420px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header & Close */}
        <div className="px-10 pt-10 flex justify-end">
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
          
          {/* Logo & Intro */}
          <div className="mb-10">
            <a href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 mb-6">
              <img src="/kalpanaa-logo-new.png" alt="Kalpanaaa Finance" className="w-[24rem] md:w-[32rem] h-24 md:h-28 object-contain mb-4 origin-left" />
            </a>
            <p className="text-sm text-gray-500 leading-relaxed">
              Kalpanaaa Finance process management of money and includes activities such as investing, borrowing, lending, budgeting, saving, and forecasting.
            </p>
          </div>

          {/* Our Services */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-1 bg-[#4E8B83] rounded-full"></div>
              <h4 className="text-lg font-bold text-[#12241F]">Our Services</h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { n: '.01', t: 'Consulting Service', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg> },
                { n: '.02', t: 'Projection Analysis', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg> },
                { n: '.03', t: 'Tax Planning Manage', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
              ].map(s => (
                <div key={s.n} className="bg-[#F5F7F7] rounded-lg p-4 flex flex-col group hover:bg-[#12241F] transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-[#4E8B83] group-hover:text-white transition-colors">{s.icon}</div>
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-white/50">{s.n}</span>
                  </div>
                  <span className="text-xs font-bold text-[#12241F] group-hover:text-white leading-snug">{s.t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-1 bg-[#4E8B83] rounded-full"></div>
              <h4 className="text-lg font-bold text-[#12241F]">Newsletter</h4>
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              our expertise, as well as our passion for web design, sets us apart from other agencies.
            </p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-white border border-gray-200 text-gray-700 text-sm px-4 py-3 pr-12 rounded outline-none focus:border-[#4E8B83] transition-colors"
              />
              <button className="absolute right-1 top-1 bottom-1 px-3 bg-[#4E8B83] text-white rounded hover:bg-[#12241F] transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>

          {/* Follow Us */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-1 bg-[#4E8B83] rounded-full"></div>
              <h4 className="text-lg font-bold text-[#12241F]">Follow Us</h4>
            </div>
            <div className="flex items-center gap-2">
              {['Facebook', 'Twitter', 'Instagram', 'Youtube', 'Linkedin'].map(social => (
                <Link key={social} to="#" className="w-8 h-8 rounded-full bg-[#4E8B83]/90 flex items-center justify-center text-white hover:bg-[#12241F] transition-colors">
                   {social === 'Facebook' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>}
                   {social === 'Twitter' && <span className="font-bold text-[10px]">X</span>}
                   {social === 'Instagram' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>}
                   {social === 'Youtube' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>}
                   {social === 'Linkedin' && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>}
                </Link>
              ))}
            </div>
          </div>
          
        </div>

        {/* Contact Footer Blocks */}
        <div className="grid grid-cols-2 mt-auto">
          <div className="bg-[#1A312B] p-6 flex flex-col justify-center text-center">
             <span className="text-[#4E8B83] text-[9px] font-bold tracking-widest uppercase block mb-1">24/7 EMAIL US</span>
             <a href="mailto:info@kalpanaafinance.com" className="text-white text-sm font-bold hover:text-[#4E8B83] transition-colors">info@kalpanaafinance.com</a>
          </div>
          <div className="bg-[#12241F] p-6 flex flex-col justify-center text-center">
             <span className="text-[#4E8B83] text-[9px] font-bold tracking-widest uppercase block mb-1">24/7 CALL US</span>
             <a href="tel:+5284567592" className="text-white text-sm font-bold hover:text-[#4E8B83] transition-colors">+(528) 456-7592</a>
          </div>
        </div>

      </div>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer
        ref={footerRef}
        className="text-white fixed bottom-0 left-0 w-full z-0"
        style={{
          backgroundImage: `url('/hero-bg.jpg?v=2')`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        {/* Emerald dark overlay */}
        <div className="absolute inset-0 bg-[#0C1A17]/90 pointer-events-none" />

        {/* Main Footer */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Left: Logo & Tagline */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/kalpanaa-logo-new.png" alt="Kalpanaaa Finance" className="w-32 md:w-48 h-8 md:h-12 object-contain object-left drop-shadow-md" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-[220px] mt-2">
              Empowering your financial future with smart investments and trusted wealth management.
            </p>
          </div>

          {/* Middle: Company Links */}
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#4E8B83] mb-6">Company</h4>
            <ul className="space-y-4">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Our Team', path: '/team' },
                { name: 'Testimonials', path: '/testimonials' },
                { name: 'FAQ', path: '/faq' },
                { name: 'Contact', path: '/contact' },
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-300 hover:text-[#4E8B83] transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Services Links */}
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#4E8B83] mb-6">Services</h4>
            <ul className="space-y-4">
              {[
                { name: 'Digital Finance Platform', path: '/services/digital-finance' },
                { name: 'Loan Management', path: '/services/lending-credit' },
                { name: 'Investment Management', path: '/services/investment-wealth' },
                { name: 'Business Finance', path: '/services/digital-finance' },
                { name: 'Risk Management', path: '/services/risk-compliance' },
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-300 hover:text-[#4E8B83] transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-xs tracking-wide">
              © 2026 Kalpanaaa Finance. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0 text-sm">
              <Link to="/privacy-policy" className="hover:text-[#4E8B83] transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-[#4E8B83] transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
