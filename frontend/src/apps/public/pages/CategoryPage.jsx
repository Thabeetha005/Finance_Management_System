import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { ChevronRight, ArrowRight, X, TrendingUp, AlertCircle } from 'lucide-react';
import { categoryConfig } from './ServicesLandingPage';

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [suggestionModal, setSuggestionModal] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [goldPrice, setGoldPrice] = useState(null);
  const [isLoadingGold, setIsLoadingGold] = useState(false);

  // Find the category based on the slug
  const category = categoryConfig.find(
    cat => cat.name.replace(/&/g, 'and').replace(/\s+/g, '-').toLowerCase() === slug
  );

  const { data: allServices = [], isLoading } = useQuery({
    queryKey: ['publicServices'],
    queryFn: async () => {
      const res = await api.get('/services');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  useEffect(() => {
    if (category) {
      document.title = `${category.name} | Kalpanaa Finance`;
    }
    window.scrollTo(0, 0);
  }, [category]);

  // Fetch Real-time Gold Price (using PAXG via CoinGecko as a proxy for 1oz Gold)
  useEffect(() => {
    if (suggestionModal && (suggestionModal.slug === 'digital-gold-investment' || suggestionModal.title?.toLowerCase().includes('gold'))) {
      setIsLoadingGold(true);
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd')
        .then(res => res.json())
        .then(data => {
          if (data['pax-gold'] && data['pax-gold'].usd) {
            setGoldPrice(data['pax-gold'].usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
          }
          setIsLoadingGold(false);
        })
        .catch(err => {
          console.error("Failed to fetch gold price:", err);
          setIsLoadingGold(false);
        });
    } else {
      setGoldPrice(null);
    }
  }, [suggestionModal]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12 bg-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#12241F] mb-4">Category Not Found</h1>
          <Link to="/services" className="text-[#4E8B83] hover:underline font-medium flex items-center justify-center gap-2">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  // Get all services belonging to this category
  const services = allServices.filter(s => s.category?.name === category.name || s.category === category.name);
  const IconComp = category.icon;

  const handleServiceClick = (e, service) => {
    // If it's a digital finance or investment related service, show suggestion
    if (service.slug === 'digital-gold-investment' || service.slug === 'digital-finance-platform' || service.title.toLowerCase().includes('investment')) {
      e.preventDefault();
      setSuggestionModal(service);
    }
  };

  return (
    <div className="flex flex-col w-full overflow-clip bg-white min-h-screen">
      
      {/* ── INLINE STYLES for hover animations ── */}
      <style>{`
        .svc-card {
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .svc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px -10px rgba(78, 139, 131, 0.2);
        }
        .svc-card:hover .svc-line {
          width: 100%;
        }
        .svc-line {
          width: 0;
          transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pulse-text {
          animation: pulse-opacity 2s infinite;
        }
        @keyframes pulse-opacity {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════
          SUGGESTION MODAL
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {suggestionModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[999] backdrop-blur-sm"
              onClick={() => {
                setSuggestionModal(null);
                setSelectedPeriod(null);
              }}
            />
            <div 
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
              onClick={() => {
                setSuggestionModal(null);
                setSelectedPeriod(null);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-full flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#12241F] to-[#1A312B] p-5 sm:p-6 relative flex-shrink-0">
                  <button 
                    onClick={() => {
                      setSuggestionModal(null);
                      setSelectedPeriod(null);
                    }}
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-3 text-[#4E8B83]">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">Investment Projection</span>
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-3 pr-6">
                    {suggestionModal.title} Potential Returns
                  </h3>
                  
                  {/* Live Rate Box */}
                  {(isLoadingGold || goldPrice) && (
                    <div className="bg-black/20 border border-white/10 rounded-lg p-3 flex justify-between items-center mt-2">
                      <span className="text-white/80 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Live Market Rate (1 oz)</span>
                      {isLoadingGold ? (
                        <span className="text-[#4E8B83] text-xs sm:text-sm font-bold pulse-text">Fetching...</span>
                      ) : (
                        <span className="text-[#4E8B83] text-sm sm:text-lg font-bold">{goldPrice}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 sm:p-6 overflow-y-auto">
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-4 sm:mb-5">
                    Enter an investment amount to estimate your potential returns based on our financial models:
                  </p>

                  {/* Estimate Input */}
                  <div className="mb-5">
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Investment Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input 
                        type="number" 
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-8 pr-4 text-[#12241F] font-bold focus:outline-none focus:border-[#4E8B83] focus:ring-1 focus:ring-[#4E8B83] transition-all"
                        placeholder="e.g. 100000"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      { id: '6m', label: '6 Months', rate: 0.02, displayRate: '+2%' },
                      { id: '1y', label: '1 Year', rate: 0.06, displayRate: '+6%' },
                      { id: '2y', label: '2 Years', rate: 0.12, displayRate: '+12%' }
                    ].map((period) => {
                      const estimatedReturn = investmentAmount && !isNaN(investmentAmount) && Number(investmentAmount) > 0
                        ? (parseFloat(investmentAmount) * period.rate).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
                        : period.displayRate;

                      const totalValue = investmentAmount && !isNaN(investmentAmount) && Number(investmentAmount) > 0
                        ? (parseFloat(investmentAmount) + (parseFloat(investmentAmount) * period.rate)).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
                        : null;

                      return (
                        <button
                          key={period.id}
                          onClick={() => {
                            setSuggestionModal(null);
                            const url = investmentAmount 
                              ? `/services/${suggestionModal.slug}?invest=${period.id}&amount=${investmentAmount}`
                              : `/services/${suggestionModal.slug}?invest=${period.id}`;
                            navigate(url);
                          }}
                          className={`w-full flex justify-between items-center p-3 sm:p-4 rounded-lg border transition-all text-left bg-gray-50 border-gray-100 hover:border-[#4E8B83] hover:shadow-md hover:bg-white group`}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm sm:text-base font-semibold text-gray-700 group-hover:text-[#12241F] transition-colors">
                              {period.label}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                              {period.displayRate} return rate
                            </span>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className={`text-base sm:text-lg font-extrabold ${investmentAmount ? 'text-[#4E8B83]' : 'text-gray-400 group-hover:text-[#4E8B83] transition-colors'}`}>
                              {investmentAmount ? '+' : ''}{estimatedReturn}
                            </span>
                            {totalValue && (
                              <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                                Total: {totalValue}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-start gap-3 bg-blue-50 text-blue-800 p-3 sm:p-4 rounded-lg text-[10px] sm:text-xs leading-relaxed">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                    <p>These projections are estimated based on market trends. Click a row to proceed with your investment.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          PAGE PADDING / TOP NAV
      ══════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="pt-32 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link to="/" className="hover:text-[#4E8B83] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/services" className="hover:text-[#4E8B83] transition-colors">Services</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#12241F] font-semibold">{category.name}</span>
          </nav>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════
          CATEGORY HERO ROW
      ══════════════════════════════════════════════ */}
      <section className="pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex flex-col md:flex-row gap-12 items-center mb-16">
            {/* Image */}
            <div className="w-full md:w-1/2 group overflow-hidden relative">
              <img src={category.image} alt={category.name} className="w-full h-[320px] object-cover transition-transform duration-[6s] group-hover:scale-105" />
              <div className="absolute inset-0 bg-[#12241F]/30 group-hover:bg-[#12241F]/10 transition-colors duration-700"></div>
            </div>
            {/* Info */}
            <div className="w-full md:w-1/2">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#12241F] flex items-center justify-center text-[#4E8B83]">
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="text-[#4E8B83] text-[10px] font-bold tracking-[0.25em] uppercase">{category.tagline}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#12241F] tracking-tight mb-4 leading-tight">{category.name}</h2>
              <p className="text-gray-600 leading-relaxed mb-8">{category.desc}</p>

            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════
              SERVICE CARDS GRID
          ══════════════════════════════════════════════ */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ staggerChildren: 0.1, delayChildren: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service, sIdx) => (
              <motion.div key={service.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div 
                  onClick={(e) => {
                    if(service.slug === 'digital-gold-investment' || service.slug === 'digital-finance-platform' || service.title.toLowerCase().includes('investment')) {
                      handleServiceClick(e, service);
                    }
                  }}
                  className="svc-card group relative bg-white border border-gray-100 p-7 flex flex-col overflow-hidden h-full cursor-default"
                >
                  <div className="svc-line absolute top-0 left-0 h-[2px] bg-[#4E8B83]"></div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-extralight text-gray-100 font-serif group-hover:text-[#4E8B83]/20 transition-colors">
                      {String(sIdx + 1).padStart(2, '0')}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-[#4E8B83] group-hover:border-[#4E8B83] transition-all duration-300">
                      <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#12241F] mb-3 group-hover:text-[#4E8B83] transition-colors">{service.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">
                    {service.introduction.description.substring(0, 100)}...
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

    </div>
  );
};

export default CategoryPage;
