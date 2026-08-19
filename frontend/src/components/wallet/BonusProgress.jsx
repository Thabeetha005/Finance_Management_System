import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Target, TrendingUp, Award, Lock, Unlock } from 'lucide-react';

const BonusProgress = ({ currentValue = 342500, targetValue = 500000, startValue = 100000 }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    if (currentValue >= targetValue) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [currentValue, targetValue]);

  const progressPercentage = Math.min(
    ((currentValue - startValue) / (targetValue - startValue)) * 100, 
    100
  );

  const remaining = Math.max(targetValue - currentValue, 0);
  const isUnlocked = currentValue >= targetValue;

  const milestones = [
    { label: '₹2L', value: 200000 },
    { label: '₹3L', value: 300000 },
    { label: '₹4L', value: 400000 },
    { label: '₹5L', value: 500000 },
  ];

  return (
    <div className="bg-[#12241F] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl border border-white/10">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 rounded-3xl overflow-hidden">
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} colors={['#4E8B83', '#C47D57', '#FFFFFF']} />
        </div>
      )}

      {/* Decorative gradient blob */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#4E8B83] opacity-20 rounded-full blur-[80px]"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-[#C47D57] mb-4">
              {isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {isUnlocked ? 'Bonus Unlocked' : 'Promotional Bonus Challenge'}
            </div>
            <h2 className="text-3xl md:text-4xl font-serif mb-2">Grow Your Portfolio</h2>
            <p className="text-white/60 text-sm max-w-md leading-relaxed">
              Reach the ₹5,00,000 milestone to convert your promotional sign-up capital into withdrawable funds.
            </p>
          </div>
          
          <div className="text-left md:text-right bg-white/5 rounded-2xl p-4 border border-white/5 w-full md:w-auto">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Current Value</p>
            <p className="text-3xl font-bold text-white">₹{currentValue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="relative pt-6 pb-2">
          {/* Milestone markers on top */}
          <div className="absolute top-0 left-0 w-full flex justify-between px-1 text-[10px] font-bold text-white/40 uppercase">
            <span style={{ position: 'absolute', left: '0%' }}>₹1L</span>
            {milestones.map((ms, idx) => {
              const pos = ((ms.value - startValue) / (targetValue - startValue)) * 100;
              return (
                <span key={idx} style={{ position: 'absolute', left: `${pos}%`, transform: 'translateX(-50%)' }} className={currentValue >= ms.value ? 'text-[#C47D57]' : ''}>
                  {ms.label}
                </span>
              );
            })}
          </div>

          {/* Track */}
          <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden mt-2 relative">
            {/* Fill */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#4E8B83] to-[#C47D57] rounded-full relative"
            >
              {/* Animated highlight */}
              <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 rounded-full blur-[2px]"></div>
            </motion.div>
          </div>

          {/* Milestone Nodes */}
          <div className="absolute top-[28px] left-0 w-full flex justify-between pointer-events-none">
            <div className="w-4 h-4 rounded-full bg-[#4E8B83] border-4 border-[#12241F] -ml-2"></div>
            {milestones.map((ms, idx) => {
              const pos = ((ms.value - startValue) / (targetValue - startValue)) * 100;
              const isReached = currentValue >= ms.value;
              return (
                <div 
                  key={idx} 
                  className={`w-4 h-4 rounded-full border-4 border-[#12241F] absolute top-0 -mt-[0px] ${isReached ? 'bg-[#C47D57] shadow-[0_0_10px_#C47D57]' : 'bg-white/20'}`}
                  style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                ></div>
              );
            })}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-white/40" />
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Target</p>
              <p className="text-white font-bold">₹{targetValue.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          <div className="text-right">
            {!isUnlocked ? (
              <>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Remaining</p>
                <p className="text-[#C47D57] font-bold">₹{remaining.toLocaleString('en-IN')}</p>
              </>
            ) : (
              <div className="inline-flex items-center gap-2 text-[#4E8B83] font-bold">
                <Award className="w-5 h-5" /> Reward Unlocked
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BonusProgress;
