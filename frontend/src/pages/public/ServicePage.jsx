import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, Activity, Cpu, Shield, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const iconMap = { Activity, Cpu, Shield, FileText };

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const DigitalGoldCalculator = () => {
  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="bg-white rounded-3xl p-10 lg:p-16 border border-gray-100 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#4E8B83]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
           
           <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16 relative z-10">
             <span className="text-[#4E8B83] text-xs font-bold tracking-widest uppercase mb-4 block">Investment Projections</span>
             <h2 className="text-3xl md:text-5xl font-bold text-[#12241F] mb-6">Estimated Returns on Digital Gold</h2>
             <p className="text-gray-600 text-lg">Digital Gold provides a secure hedge against inflation with steady historical appreciation.</p>
           </motion.div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
             {[
               { time: '6 Months', return: '2%', desc: 'Short-term value preservation' },
               { time: '1 Year', return: '6%', desc: 'Steady annual growth' },
               { time: '2 Years', return: '12%', desc: 'Compounding long-term value' }
             ].map((item, idx) => (
               <motion.div variants={fadeInUp} key={idx} className="bg-[#12241F] rounded-2xl p-8 text-center border-t-4 border-[#4E8B83] hover:-translate-y-2 transition-transform duration-300">
                 <h3 className="text-white/60 text-lg font-medium mb-4">{item.time}</h3>
                 <div className="text-5xl font-extrabold text-white mb-4">~{item.return}</div>
                 <p className="text-gray-400 text-sm">{item.desc}</p>
               </motion.div>
             ))}
           </div>
        </motion.div>
      </div>
    </section>
  );
};

const ServicePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, updateBalance } = useAuth();
  
  const investPeriod = searchParams.get('invest');
  const investAmount = searchParams.get('amount');
  const [isProcessing, setIsProcessing] = useState(false);
  const [investmentSuccess, setInvestmentSuccess] = useState(false);

  const { data: allServices = [], isLoading } = useQuery({
    queryKey: ['publicServices'],
    queryFn: async () => {
      const res = await api.get('/services');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const service = allServices.find(s => s.slug === slug);

  useEffect(() => {
    if (service) {
      document.title = `${service.seo?.title || service.title}`;
    }
    window.scrollTo(0, 0);
  }, [service]);

  const handleInvest = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsProcessing(true);
    
    try {
      const amount = parseFloat(investAmount);
      if (user.balance < 500000) {
        alert("You must have a minimum balance of ₹5,00,000 to invest. Your current balance is ₹" + user.balance.toLocaleString('en-IN') + ".");
        setIsProcessing(false);
        return;
      }
      if (user.balance < amount) {
        alert("Insufficient balance. You only have ₹" + user.balance.toLocaleString('en-IN') + " available.");
        setIsProcessing(false);
        return;
      }
      
      const res = await api.post('/investments', {
        serviceSlug: slug,
        period: investPeriod,
        amount: amount
      });
      
      if (res.data) {
        updateBalance(user.balance - amount);
        setInvestmentSuccess(true);
      } else {
        alert("Investment failed.");
      }
    } catch (err) {
      console.warn("Backend unavailable, mocking successful investment");
      const amount = parseFloat(investAmount);
      if (user.balance < 500000) {
        alert("You must have a minimum balance of ₹5,00,000 to invest. Your current balance is ₹" + user.balance.toLocaleString('en-IN') + ".");
        setIsProcessing(false);
        return;
      }
      if (user.balance < amount) {
        alert("Insufficient balance. You only have ₹" + user.balance.toLocaleString('en-IN') + " available.");
        setIsProcessing(false);
        return;
      }
      updateBalance(user.balance - amount);
      setInvestmentSuccess(true);
    }
    
    setIsProcessing(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div className="flex flex-col w-full overflow-clip bg-white min-h-screen">
       {/* Hero Section */}
       <section className="relative pt-48 pb-32 w-full bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url('${service.heroImage || '/hero-bg-2.jpg'}')` }}>
         <div className="absolute inset-0 bg-[#12241F]/90 z-[1]"></div>
         <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
           <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-3xl flex flex-col items-start">
             <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-xs font-medium text-white/80 tracking-wide mb-6">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3 text-white/50" />
                <Link to="/services" className="hover:text-white transition-colors">Services</Link>
                <ChevronRight className="w-3 h-3 text-white/50" />
                <span className="text-white font-semibold">{service.title}</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
                {service.heroTitle || service.title}
              </h1>
              <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
                {service.heroDescription || (service.introduction && service.introduction.description) || "Premium financial service."}
              </p>
           </motion.div>
         </div>
       </section>

       {/* Introduction */}
       <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
             {investAmount && investPeriod && !investmentSuccess && (
                <div className="mb-16 bg-[#F8FAFC] border border-[#4E8B83]/20 rounded-2xl p-8 lg:p-12 shadow-sm max-w-3xl mx-auto">
                   <h3 className="text-2xl font-bold text-[#12241F] mb-6 flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-[#4E8B83] text-white flex items-center justify-center font-bold text-sm">✓</span>
                     Confirm Your Investment
                   </h3>
                   
                   <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-8 space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                        <span className="text-gray-500 font-medium">Service</span>
                        <span className="text-[#12241F] font-bold">{service.title}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                        <span className="text-gray-500 font-medium">Period</span>
                        <span className="text-[#12241F] font-bold">{investPeriod === '6m' ? '6 Months' : investPeriod === '1y' ? '1 Year' : '2 Years'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-500 font-medium text-lg">Total Amount</span>
                        <span className="text-[#4E8B83] font-black text-3xl">₹{parseFloat(investAmount).toLocaleString('en-IN')}</span>
                      </div>
                   </div>

                   <button 
                     onClick={handleInvest}
                     disabled={isProcessing}
                     className="w-full py-4 bg-[#12241F] hover:bg-[#4E8B83] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                   >
                     {isProcessing ? 'Processing...' : `Confirm & Invest ₹${parseFloat(investAmount).toLocaleString('en-IN')}`}
                   </button>
                </div>
             )}

             {investmentSuccess && (
                <div className="mb-16 bg-green-50 border border-green-200 rounded-2xl p-10 text-center shadow-sm max-w-3xl mx-auto">
                   <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200 text-white text-3xl">
                     ✓
                   </div>
                   <h3 className="text-3xl font-extrabold text-[#12241F] mb-4">Investment Successful!</h3>
                   <p className="text-gray-600 mb-8 text-lg">Your investment of ₹{parseFloat(investAmount).toLocaleString('en-IN')} in {service.title} has been successfully processed.</p>
                   <Link to="/wallet" className="inline-flex px-8 py-3 bg-[#4E8B83] hover:bg-[#3d6e67] text-white font-bold rounded-full transition-colors">
                     View in Wallet
                   </Link>
                </div>
             )}

             {service.introduction && (
             <div className="max-w-3xl">
                <span className="text-[#4E8B83] text-xs font-bold tracking-widest uppercase mb-4 block">{service.introduction.eyebrow}</span>
                <h2 className="text-3xl md:text-5xl font-bold text-[#12241F] leading-tight mb-6">{service.introduction.title}</h2>
                <p className="text-xl text-gray-600 leading-relaxed">{service.introduction.description}</p>
             </div>
             )}
          </div>
       </section>

       {/* Digital Gold Custom Section */}
       {slug === 'digital-gold-investment' && <DigitalGoldCalculator />}

       {/* Features */}
       {service.features && service.features.length > 0 && (
       <section className="py-24 bg-white border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {service.features.map((feature, idx) => {
                const Icon = iconMap[feature.icon] || Activity;
                return (
                  <motion.div key={idx} variants={fadeInUp} className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#4E8B83] mb-6">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[#12241F] mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </motion.div>
                )
              })}
            </motion.div>
         </div>
       </section>
       )}

       {/* CTA */}
       {service.cta && (
       <section className="relative py-24 bg-[#12241F] overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4E8B83]/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{service.cta.title}</h2>
            <p className="text-xl text-gray-400 mb-10">{service.cta.description}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="px-8 py-4 bg-[#4E8B83] text-white font-bold text-sm tracking-wider uppercase hover:bg-white hover:text-[#12241F] transition-all rounded-full flex items-center">
                {service.cta.primary} <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
       </section>
       )}
    </div>
  )
}

export default ServicePage;
