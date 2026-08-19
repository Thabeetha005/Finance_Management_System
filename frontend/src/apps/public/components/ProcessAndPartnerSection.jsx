import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Users, PieChart, Settings, LineChart, TrendingUp, UsersRound, DollarSign, Cloud, Handshake } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Discovery\nConsultation',
    desc: "We start with an in-depth conversation to understand your business, current financial systems, challenges, and growth objectives.",
    icon: Users,
    nodeX: 650,
    nodeY: 250,
    textLeft: '70%',
    textAlign: 'left'
  },
  {
    num: '02',
    title: 'Detailed Strategy\n& Plan',
    desc: 'We analyze your financial landscape and develop a tailored strategy with clear priorities, actionable steps, and measurable outcomes.',
    icon: PieChart,
    nodeX: 350,
    nodeY: 700,
    textLeft: '5%',
    textAlign: 'left'
  },
  {
    num: '03',
    title: 'Implementation\n& Execution',
    desc: 'We put the plan into action—streamlining processes, integrating the right tools, and managing the details so you can focus on your business.',
    icon: Settings,
    nodeX: 650,
    nodeY: 1150,
    textLeft: '70%',
    textAlign: 'left'
  },
  {
    num: '04',
    title: 'Monitoring &\nOptimization',
    desc: 'We continuously monitor performance, identify opportunities, and refine strategies to ensure you stay on track and ahead of change.',
    icon: LineChart,
    nodeX: 350,
    nodeY: 1600,
    textLeft: '5%',
    textAlign: 'left'
  },
  {
    num: '05',
    title: 'Long-Term\nGrowth',
    desc: "We remain a trusted partner, providing ongoing insight, guidance, and strategic support as your business evolves and grows.",
    icon: TrendingUp,
    nodeX: 650,
    nodeY: 2050,
    textLeft: '70%',
    textAlign: 'left'
  }
];

const desktopPath = `
M 280 65
L 380 65
C 550 65, 650 150, 650 250
C 650 475, 350 475, 350 700
C 350 925, 650 925, 650 1150
C 650 1375, 350 1375, 350 1600
C 350 1825, 650 1825, 650 2050
C 650 2225, 100 2225, 100 2400
`;

const mobilePath = `
M 50 0
L 50 2500
`;

export const ProcessAndPartnerSection = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section className="bg-[#0A1612] text-white font-sans w-full overflow-hidden border-t border-white/5 pt-20 pb-32">
      
      <div ref={containerRef} className="relative w-full max-w-[1200px] mx-auto hidden md:block" style={{ aspectRatio: '1000 / 2800' }}>
        
        {/* SVG Drawing Layer */}
        <svg viewBox="0 0 1000 2800" className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="xMidYMid meet">
          <path d={desktopPath} fill="none" stroke="#1A2D27" strokeWidth="3" strokeLinecap="round" />
          <motion.path 
            d={desktopPath} fill="none" stroke="#C47D57" strokeWidth="4" strokeLinecap="round"
            style={{ pathLength: smoothProgress }}
          />
        </svg>

        {/* Top Heading */}
        <div className="absolute" style={{ left: '5%', top: '2%', width: '35%' }}>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs font-bold tracking-widest text-[#C47D57] uppercase">How We Work Together</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-serif mb-6 leading-[1.1] text-gray-200">
            A Clear Path<br/>From Strategy to<br/><span className="text-[#C47D57]">Sustainable</span> Growth
          </h2>
          <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
            Our process is designed to bring clarity to complexity and build lasting financial strength for your business.
          </p>
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const yPercent = (step.nodeY / 2800) * 100;
          const isRight = idx % 2 === 0;

          return (
            <div key={step.num}>
              {/* Node Circle */}
              <motion.div 
                className="absolute w-12 h-12 rounded-full border-2 border-[#C47D57] flex items-center justify-center text-[#C47D57] bg-[#0A1612] z-10 font-bold"
                style={{ 
                  left: `${(step.nodeX / 1000) * 100}%`, 
                  top: `${yPercent}%`, 
                  transform: 'translate(-50%, -50%)',
                  opacity: useTransform(smoothProgress, [Math.max(0, (yPercent/100) - 0.1), yPercent/100], [0.3, 1]),
                  scale: useTransform(smoothProgress, [Math.max(0, (yPercent/100) - 0.1), yPercent/100], [0.8, 1])
                }}
              >
                {step.num}
              </motion.div>

              {/* Text Block */}
              <motion.div 
                className="absolute flex flex-col" 
                style={{ 
                  left: step.textLeft, 
                  top: `${yPercent}%`, 
                  width: '25%', 
                  transform: 'translateY(-20%)',
                  opacity: useTransform(smoothProgress, [Math.max(0, (yPercent/100) - 0.1), yPercent/100], [0, 1]),
                  y: useTransform(smoothProgress, [Math.max(0, (yPercent/100) - 0.1), yPercent/100], [20, 0])
                }}
              >
                <div className="flex items-center text-[#C47D57] text-sm mb-3 font-mono font-bold tracking-widest">
                  {step.num}. 
                  <div className="ml-4 flex-grow border-b border-dashed border-[#C47D57]/50 max-w-[100px]"></div>
                </div>
                <h3 className="text-3xl md:text-4xl font-serif mb-4 text-white leading-tight">
                  {step.title.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.desc}
                </p>

                {/* Faint Background Icon */}
                <div className={`absolute ${isRight ? '-bottom-40 -left-20' : '-bottom-40 -right-10'} opacity-[0.03] pointer-events-none`}>
                  <step.icon size={180} strokeWidth={1} />
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* Bottom Partner Section */}
        <div className="absolute w-full h-[400px]" style={{ top: '85%' }}>
          
          {/* Partner Heading */}
          <div className="absolute" style={{ left: '5%', width: '35%' }}>
            <div className="w-8 border-b-2 border-[#C47D57] mb-6"></div>
            <h2 className="text-5xl font-serif mb-6 leading-tight text-white">
              Your Trustworthy<br/>Financial <span className="text-[#C47D57]">Growth Partner</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              We bridge the gap between traditional accounting expertise and modern financial technology so you get the clarity, efficiency, and confidence you need to grow.
            </p>
          </div>

          {/* Partner Grid */}
          <div className="absolute grid grid-cols-2 gap-6" style={{ left: '45%', width: '50%' }}>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-5 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full border border-[#C47D57] flex items-center justify-center text-[#C47D57] shrink-0">
                <UsersRound size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-lg font-serif text-white mb-2">Licensed CPAs on Every Account</h4>
                <p className="text-xs text-gray-400 leading-relaxed">You'll work directly with certified professionals who understand accounting principles and your technology.</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-5 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full border border-[#C47D57] flex items-center justify-center text-[#C47D57] shrink-0">
                <DollarSign size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-lg font-serif text-white mb-2">Transparent Fixed Pricing</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Know exactly what you'll pay monthly, with no surprise fees or scope creep.</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-5 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full border border-[#C47D57] flex items-center justify-center text-[#C47D57] shrink-0">
                <Cloud size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-lg font-serif text-white mb-2">Technology & Platform Expertise</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Deep expertise in leading financial platforms to streamline your operations and drive better outcomes.</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-5 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full border border-[#C47D57] flex items-center justify-center text-[#C47D57] shrink-0">
                <Handshake size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-lg font-serif text-white mb-2">Ongoing Financial Partnership</h4>
                <p className="text-xs text-gray-400 leading-relaxed">We stay with you—offering proactive insights, continuous improvement, and long-term support.</p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Mobile Layout (Simplified Stacked) */}
      <div className="md:hidden px-6 relative">
        <div className="mb-16">
          <span className="text-xs font-bold tracking-widest text-[#C47D57] uppercase mb-4 block">How We Work Together</span>
          <h2 className="text-4xl font-serif mb-6 leading-tight text-white">
            A Clear Path<br/>From Strategy to<br/><span className="text-[#C47D57]">Sustainable</span> Growth
          </h2>
        </div>

        <div className="relative border-l-2 border-[#1A2D27] ml-6 pl-10 pb-16 space-y-16">
          <motion.div className="absolute top-0 bottom-0 left-[-2px] w-[2px] bg-[#C47D57] origin-top" style={{ scaleY: smoothProgress }} />
          
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <div className="absolute -left-[60px] top-0 w-10 h-10 rounded-full border-2 border-[#C47D57] flex items-center justify-center text-[#C47D57] bg-[#0A1612] font-bold text-sm">
                {step.num}
              </div>
              <div className="flex items-center text-[#C47D57] text-xs mb-2 font-mono font-bold tracking-widest">
                {step.num}. <div className="ml-2 w-10 border-b border-dashed border-[#C47D57]/50"></div>
              </div>
              <h3 className="text-2xl font-serif mb-3 text-white leading-tight">
                {step.title.split('\n').join(' ')}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-16 border-t border-white/10">
          <h2 className="text-4xl font-serif mb-6 leading-tight text-white">
            Your Trustworthy<br/>Financial <span className="text-[#C47D57]">Growth Partner</span>
          </h2>
          <div className="space-y-6 mt-10">
            {[
              { icon: UsersRound, title: 'Licensed CPAs', desc: "Work directly with certified professionals." },
              { icon: DollarSign, title: 'Fixed Pricing', desc: "Know exactly what you'll pay monthly." },
              { icon: Cloud, title: 'Platform Expertise', desc: "Deep expertise in leading financial tools." },
              { icon: Handshake, title: 'Ongoing Partnership', desc: "Proactive insights and continuous support." }
            ].map((card, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 flex gap-4">
                <card.icon className="text-[#C47D57] shrink-0" />
                <div>
                  <h4 className="text-lg font-serif text-white mb-1">{card.title}</h4>
                  <p className="text-xs text-gray-400">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default ProcessAndPartnerSection;
