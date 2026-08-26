import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const rings = [220, 270, 320, 370];

const badges = [
  { text: '15+ Years of Expertise', radius: 220, duration: 35, delay: 0 },
  { text: '200+ Happy Clients', radius: 270, duration: 40, delay: -15 },
  { text: 'Transparent Pricing', radius: 320, duration: 45, delay: -30 },
  { text: '100% Secure & Compliant', radius: 370, duration: 50, delay: -10 }
];

const CtaSection = () => {
  return (
    <section className="relative w-full overflow-hidden pt-24 bg-[#FDFDFD]">
      {/* Background Split - Upper is light, Lower is Dark */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#12241F] z-0"></div>
      
      {/* Glass Container */}
      <div className="relative z-10 max-w-[1400px] w-[90%] sm:w-[90%] mx-auto mb-10 sm:mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full rounded-[3.5rem] sm:rounded-[4.5rem] md:rounded-[5rem] overflow-hidden border border-white/15 shadow-2xl p-6 sm:p-12 md:p-20 text-center min-h-[480px] sm:min-h-[550px] md:min-h-[800px] flex flex-col justify-center items-center bg-[#4E8B83]"
        >
          {/* Glass background gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4E8B83]/90 via-[#275c55] to-[#12241F]/90 backdrop-blur-3xl"></div>
          
          {/* Center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 md:w-96 h-72 md:h-96 bg-white/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none"></div>

          {/* Concentric Circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50 md:opacity-100 scale-[0.6] sm:scale-75 md:scale-100">
            {rings.map(r => (
              <div 
                key={r}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15"
                style={{ width: r * 2, height: r * 2 }}
              ></div>
            ))}
          </div>

          {/* Orbiting Badges (Circular Motion on Mobile & Desktop) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 z-20 scale-[0.52] sm:scale-75 md:scale-100 origin-center">
            {badges.map((badge, idx) => (
              <div 
                key={idx}
                className="absolute top-0 left-0 w-0 h-0"
                style={{
                  animation: `spin ${badge.duration}s linear infinite`,
                  animationDelay: `${badge.delay}s`
                }}
              >
                <div 
                  className="absolute top-0 left-0 flex items-center justify-center"
                  style={{ transform: `translate(-50%, -50%) translateY(-${badge.radius}px)` }}
                >
                  <div 
                    className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-white/95 text-[#12241F] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.15)] whitespace-nowrap border border-white/20"
                    style={{ 
                      animation: `counter-spin ${badge.duration}s linear infinite`,
                      animationDelay: `${badge.delay}s`
                    }}
                  >
                     <Check className="w-3.5 h-3.5 text-[#4E8B83]" strokeWidth={3} />
                     <span className="text-[10px] sm:text-[11px] font-bold tracking-wide">{badge.text}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="relative z-30 flex flex-col items-center max-w-xs sm:max-w-sm md:max-w-[380px]">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-white/80 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-2 sm:mb-4 block"
            >
              Services
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-serif text-white mb-4 sm:mb-6 leading-tight"
            >
              Upgrade Your <br />Financial Operations
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/90 text-xs sm:text-[13px] md:text-sm mb-6 sm:mb-8 leading-relaxed font-light px-2 sm:px-4"
            >
              Schedule a consultation with Kalpanaaa Finance to discuss your needs and learn how we can support your growth.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
                <Link 
                  to="/contact" 
                  className="w-full sm:w-auto px-6 py-3 bg-[#12241F] text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xl hover:bg-[#0c1815] flex items-center justify-center"
                >
                  Book a Consultation
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link 
                  to="/contact" 
                  className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-white/80 transition-colors flex items-center gap-2 group py-2"
                >
                  Contact Us
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>

        </motion.div>
      </div>
      
      {/* Required Keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counter-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}} />
    </section>
  );
};

export default CtaSection;
