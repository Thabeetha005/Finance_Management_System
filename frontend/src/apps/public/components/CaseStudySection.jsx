import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Layers, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  }
};

const CaseStudySection = ({ image = '/service-digital-finance.jpg' }) => {
  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Case Study Feature Image */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-50px" }} 
            variants={fadeInUp} 
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 group">
              <img 
                src={image} 
                alt="Kalpanaaa Finance Case Study" 
                className="w-full h-[450px] md:h-[550px] object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brandBlack-soft/80 via-transparent to-transparent" />
              
              {/* Badge overlay on image */}
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gold">Enterprise Transformation</span>
                </div>
                <p className="text-sm font-semibold text-white/90">Multi-portal FinTech ecosystem architecture</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Content and 3 Stacked Cards */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-50px" }} 
            variants={fadeInUp} 
            className="lg:col-span-6 flex flex-col justify-center space-y-6"
          >
            {/* Small uppercase label */}
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-[2px] bg-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                CASE STUDY
              </span>
            </div>

            {/* Bold Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-brandBlack-soft leading-tight tracking-tight">
              Building a Unified Financial Platform for Loans, Deposits, and Advisory Services
            </h2>

            {/* Three Stacked Cards */}
            <div className="space-y-4 pt-2">
              
              {/* Card 1: CHALLENGE */}
              <div className="p-6 rounded-2xl bg-brandWhite-off border border-gray-200/70 transition-all duration-300 hover:shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    CHALLENGE
                  </h4>
                </div>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium">
                  Managing loans, deposits, investments, and consultations across disconnected tools and manual processes — with no unified view for admins, consultants, or clients.
                </p>
              </div>

              {/* Card 2: SOLUTION */}
              <div className="p-6 rounded-2xl bg-primary-light border border-primary/20 transition-all duration-300 hover:shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    SOLUTION
                  </h4>
                </div>
                <p className="text-xs md:text-sm text-primary-hover leading-relaxed font-medium">
                  We built Kalpanaaa Finance: a single platform with dedicated Admin, Consultant, and Client portals — covering loan management, deposits, investments, wallet transactions, and consultation scheduling with role-based access and real-time data.
                </p>
              </div>

              {/* Card 3: OUTCOME */}
              <div className="p-6 rounded-2xl bg-brandBlack-soft border border-brandBlack-muted text-white shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold">
                    OUTCOME
                  </h4>
                </div>
                <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-medium">
                  Unified three separate workflows into one platform with role-based access for Admins, Consultants, and Clients.
                </p>
              </div>

            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link 
                to="/services" 
                className="inline-flex items-center gap-3 px-7 py-4 rounded-xl bg-brandBlack-soft hover:bg-black text-white text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl hover:translate-x-1 group"
              >
                <span>Explore Case Study</span>
                <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default CaseStudySection;
