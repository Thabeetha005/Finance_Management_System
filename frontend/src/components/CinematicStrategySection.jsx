import React from 'react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';

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
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export function CinematicStrategySection() {
  return (
    <section className="relative py-24 flex items-center overflow-hidden bg-[#111827]">
      
      {/* Classic CSS Parallax Layer */}
      <div 
        className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover bg-fixed"
        style={{ 
          backgroundImage: "url('/strategy-bg-4.jpg')",
          opacity: 0.65
        }}
      ></div>

      {/* Emerald Overlay — 50% opacity */}
      <div className="absolute inset-0 z-0" style={{ backgroundColor: 'rgba(16, 99, 84, 0.50)' }}></div>

      {/* Content Layer */}
      <motion.div 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8"
      >
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-16 lg:gap-12">
          
          {/* Phase 1: Intro Heading */}
          <motion.div variants={fadeInUp} className="w-full lg:w-1/2">
            <span className="text-xs font-bold tracking-widest text-[#87aba3] uppercase mb-4 block">FINANCE STRATEGY</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
              Building Resilient Financial Strategies for the Future
            </h2>
          </motion.div>

          {/* Phase 2: Floating Strategy Card */}
          <motion.div variants={fadeInUp} className="w-full lg:w-96 bg-[#111827]/30 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
                <Activity className="text-white w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-8 leading-tight drop-shadow-md">Financial Strategy & Plan</h3>
            
            <div className="space-y-6">
              {[
                { label: "VOLUNTEERING", value: 88 },
                { label: "10 YEARS OF EXPERIENCE", value: 75 },
                { label: "SUPPLEMENTAL SKILLS", value: 95 }
              ].map((skill, idx) => (
                <div key={idx}>
                  <div className="flex justify-start gap-4 items-center mb-3">
                    <span className="inline-flex justify-center items-center px-3 py-1 rounded-full bg-[#4E8B83] text-white text-xs font-bold w-12">{skill.value}%</span>
                    <span className="text-white/90 text-xs font-bold tracking-wider uppercase drop-shadow-sm">{skill.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-[#4E8B83] rounded-full" 
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Phase 3: Bottom Stats Grid */}
        <motion.div variants={fadeInUp} className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-white/20 bg-[#111827]/30 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center justify-center text-center p-8">
            <span className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-md"><AnimatedCounter end={98} />%</span>
            <span className="text-white/90 text-sm font-medium drop-shadow-sm uppercase tracking-wide">Skilled Advisors</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-8">
            <span className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-md"><AnimatedCounter end={30} />k+</span>
            <span className="text-white/90 text-sm font-medium drop-shadow-sm uppercase tracking-wide">Active Users</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-8">
            <span className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-md"><AnimatedCounter end={250} />+</span>
            <span className="text-white/90 text-sm font-medium drop-shadow-sm uppercase tracking-wide">Happy Clients</span>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
