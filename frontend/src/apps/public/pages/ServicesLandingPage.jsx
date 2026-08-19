import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { ArrowRight, ChevronRight, Activity, Shield, PieChart, Briefcase, TrendingUp } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export const categoryConfig = [
  {
    name: 'Digital Finance',
    icon: Activity,
    tagline: 'Platforms & Digital Infrastructure',
    image: '/service-digital-finance.jpg',
    desc: 'End-to-end digital finance platforms built for scale, from payment processing to financial analytics.',
  },
  {
    name: 'Lending & Credit',
    icon: PieChart,
    tagline: 'Loan Lifecycle & Credit Solutions',
    image: '/service-lending-credit.jpg',
    desc: 'Comprehensive lending solutions that streamline origination, underwriting, and collections.',
  },
  {
    name: 'Investment & Wealth',
    icon: TrendingUp,
    tagline: 'Portfolio & Wealth Management',
    image: '/service-investment-wealth.jpg',
    desc: 'Technology-driven investment tools for portfolio optimization and wealth advisory.',
  },
  {
    name: 'Business Finance',
    icon: Briefcase,
    tagline: 'Operations & Financial Planning',
    image: '/service-business-finance.jpg',
    desc: 'Working capital, cash flow optimization, and financial planning tools for growing businesses.',
  },
  {
    name: 'Risk & Compliance',
    icon: Shield,
    tagline: 'Governance & Regulatory Control',
    image: '/service-risk-compliance.jpg',
    desc: 'Enterprise-grade risk management and compliance monitoring for financial operations.',
  },
];

const ServicesLandingPage = () => {
  useEffect(() => {
    document.title = 'Our Services | Kalpanaa Finance';
    window.scrollTo(0, 0);
  }, []);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['publicServices'],
    queryFn: async () => {
      const res = await api.get('/services');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  return (
    <div className="flex flex-col w-full overflow-clip">

      {/* ── INLINE STYLES for scroll animations ── */}
      <style>{`
        .img-zoom {
          transition: transform 6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .group:hover .img-zoom {
          transform: scale(1.08);
        }

        .cat-card {
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 60px -15px rgba(18, 36, 31, 0.25);
        }
      `}</style>

      {/* ══════════════════════════════════════════════
          HERO SECTION (Internal Page Style)
      ══════════════════════════════════════════════ */}
      <section 
        className="relative pt-48 pb-32 w-full bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/hero-bg-2.jpg')" }}
      >
        {/* Heavy Dark Teal Overlay to match screenshot */}
        <div className="absolute inset-0 bg-[#12241F]/90 z-[1]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#12241F] to-transparent z-[1] opacity-70"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-3xl flex flex-col items-start">
            
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-none mb-6">
              Services
            </h1>

            {/* Breadcrumb Pill */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-xs font-medium text-white/80 tracking-wide">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-white/50" />
              <span className="text-white font-semibold">Services</span>
            </div>
            
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5 CATEGORY CARDS — IMAGE + TEXT (Finxpert style)
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryConfig.map((cat, idx) => {
              const IconComp = cat.icon;
              const categorySlug = cat.name.replace(/&/g, 'and').replace(/\s+/g, '-').toLowerCase();
              const targetLink = cat.name === 'Digital Finance' ? '/services/digital-finance' : cat.name === 'Risk & Compliance' ? '/services/risk-compliance' : cat.name === 'Lending & Credit' ? '/services/lending-credit' : cat.name === 'Investment & Wealth' ? '/services/investment-wealth' : `/services/category/${categorySlug}`;
              
              return (
                <motion.div variants={fadeInUp} key={cat.name}>
                  <Link 
                    to={targetLink}
                    className="cat-card group relative bg-white border border-gray-100 rounded-xl flex flex-col cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 h-full"
                  >
                    {/* Image with padding to match reference */}
                    <div className="relative h-48 w-full p-4 pb-0">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-lg img-zoom" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-gray-500 mt-1">
                          <IconComp className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-[#4E8B83] transition-colors duration-300">
                          {cat.name}
                        </h3>
                      </div>
                      
                      <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-8">
                        {cat.desc}
                      </p>
                      
                      {/* Arrow Button */}
                      <div className="mt-auto">
                        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-[#4E8B83] group-hover:text-[#4E8B83] text-gray-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>



      {/* ══════════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════════ */}
      <section className="relative py-24 bg-white border-t border-gray-100">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-serif text-[#0c1a24] mb-6 leading-[1.15]">
            Work with CPAs Who <br className="hidden md:block" /> Understand Your Growth <br className="hidden md:block" /> Challenges
          </h2>
          <p className="text-slate-600 text-[15px] md:text-base leading-relaxed mb-10 max-w-2xl mx-auto">
            Stop struggling with accounting systems that don't fit your business.
            Schedule your free consultation to learn how our CPA expertise and
            NetSuite knowledge can transform your financial operations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/contact" className="px-6 py-3 bg-[#0c1a24] text-white font-medium text-sm rounded hover:bg-[#152a3b] transition-colors">
              Book a Consultation
            </Link>
            <Link to="/contact" className="text-[#0c1a24] font-medium text-sm hover:text-slate-600 transition-colors border-b border-[#0c1a24] hover:border-slate-600 pb-0.5">
              Contact Us
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default ServicesLandingPage;
