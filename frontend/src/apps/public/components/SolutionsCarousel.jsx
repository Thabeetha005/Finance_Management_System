import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
// removed duplicate imports

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.7, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

const defaultImages = [
  '/service-digital-finance.jpg',
  '/service-lending-credit.jpg',
  '/service-investment-wealth.jpg',
  '/service-business-finance.jpg',
  '/service-risk-compliance.jpg',
  '/service-digital-finance.jpg'
];

const staticSolutionsData = [
  {
    id: '01',
    title: 'Digital Finance Platform',
    desc: 'Streamline your digital transactions with our robust and secure finance platform.',
    image: '/service-digital-finance.jpg',
    link: '/services/digital-finance'
  },
  {
    id: '02',
    title: 'Loan Management',
    desc: 'End-to-end loan lifecycle management, ensuring compliance and efficiency.',
    image: '/service-lending-credit.jpg',
    link: '/services/lending-credit'
  },
  {
    id: '03',
    title: 'Investment Management',
    desc: 'Grow your wealth with tailored investment strategies and expert guidance.',
    image: '/service-investment-wealth.jpg',
    link: '/services/investment-wealth'
  },
  {
    id: '04',
    title: 'Business Finance Management',
    desc: 'Comprehensive financial planning and analysis for corporate success.',
    image: '/service-business-finance.jpg',
    link: '/services/business-finance'
  },
  {
    id: '05',
    title: 'Risk Management',
    desc: 'Identify, assess, and mitigate financial risks with our advanced tools.',
    image: '/service-risk-compliance.jpg',
    link: '/services/risk-compliance'
  },
  {
    id: '06',
    title: 'Audit & Compliance',
    desc: 'Ensure full regulatory compliance with our thorough auditing services.',
    image: '/service-digital-finance.jpg',
    link: '/services/risk-compliance'
  }
];

export const SolutionsCarousel = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: containerRef });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const x = useTransform(smoothProgress, [0, 1], ['0%', '-62%']);

  return (
    <section ref={containerRef} className="h-[280vh] bg-white relative">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        
        {/* Full-width cards layer (behind text) */}
        <div className="absolute inset-0 flex items-center">
          {/* Left white mask so text is always readable */}
          <div className="absolute left-0 top-0 bottom-0 w-[38%] bg-white z-10 pointer-events-none" />

          {/* Cards track starts at 30% from left */}
          <div className="w-full h-full flex items-center pl-[32%]">
            <motion.div
              style={{ x }}
              className="flex gap-6 h-[75vh] items-center"
            >
              {staticSolutionsData.map((solution) => (
                <a
                  href={solution.link}
                  key={solution.id}
                  className="relative flex-shrink-0 w-[280px] md:w-[340px] lg:w-[400px] h-[65vh] rounded-2xl overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 block cursor-pointer"
                >
                  <img
                    src={solution.image}
                    alt={solution.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1b18]/95 via-[#0f1b18]/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <h3 className="text-white text-2xl font-bold mb-3 drop-shadow-md">
                        {solution.title}
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 line-clamp-3">
                        {solution.desc}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </motion.div>
          </div>
        </div>


        {/* Left Text Panel — always on top */}
        <div className="relative z-20 w-[36%] flex-shrink-0 px-8 lg:px-16 flex flex-col justify-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
              <div className="w-8 h-[1px] bg-gray-300" />
              <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                SOLUTIONS FOR EVERY NEED
              </span>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-[52px] font-bold text-[#0B1221] leading-[1.1] mb-10"
            >
              Our focus is on delivering superior value to our{' '}
              <span className="border-b-4 border-[#0B1221] pb-1">clients</span>{' '}
              for company consulting
            </motion.h2>

            <motion.div variants={fadeInUp}>
              <p className="text-gray-500 font-medium flex items-center gap-2">
                Scroll down to explore
                <ArrowRight className="w-5 h-5 animate-pulse" />
              </p>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
