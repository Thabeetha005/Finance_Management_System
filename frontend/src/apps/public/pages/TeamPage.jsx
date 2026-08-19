import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { motion } from 'framer-motion';
import { Award, Briefcase, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultTeam = [
  {
    id: 1,
    user: { name: 'Ananya Rao' },
    specialization: 'Investment & Wealth Advisory',
    experienceYears: 8,
    rating: 4.9,
    bio: 'Senior wealth consultant specializing in portfolio diversification, fixed-income strategies, and long-term capital preservation.'
  },
  {
    id: 2,
    user: { name: 'Vikramaditya Sen' },
    specialization: 'Corporate Finance & Risk Strategy',
    experienceYears: 12,
    rating: 4.95,
    bio: 'Corporate advisory specialist with deep expertise in enterprise capital structure, risk mitigation, and M&A financing.'
  },
  {
    id: 3,
    user: { name: 'Priya Sharma' },
    specialization: 'Lending & Credit Solutions',
    experienceYears: 6,
    rating: 4.85,
    bio: 'Lending advisor helping individuals and SMBs structure optimal home loans, commercial credit lines, and refinancing options.'
  },
  {
    id: 4,
    user: { name: 'Rajesh Kumar' },
    specialization: 'Digital Wealth & Tax Intelligence',
    experienceYears: 10,
    rating: 4.88,
    bio: 'Fintech and wealth technology leader providing tax-optimized investment solutions and automated portfolio strategies.'
  }
];

const fetchTeam = async () => {
  try {
    const res = await api.get('/public/consultants');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return defaultTeam;
  } catch (e) {
    return defaultTeam;
  }
};

const TeamPage = () => {
  const { data: team = defaultTeam, isLoading } = useQuery({
    queryKey: ['publicTeam'],
    queryFn: fetchTeam,
  });

  const displayTeam = (Array.isArray(team) && team.length > 0) ? team : defaultTeam;

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto min-h-screen bg-white font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <p className="text-emerald-700 font-bold text-sm tracking-wider uppercase mb-3">OUR EXPERT ADVISORS</p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#05231e] leading-tight mb-6 max-w-3xl">
          The Financial Strategists Behind Your Growth
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
          Our team of certified wealth managers and financial consultants brings decades of combined industry experience to empower your financial journey.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayTeam.map((member, index) => {
            const name = member.user?.name || member.name || 'Financial Expert';
            const initial = name.charAt(0).toUpperCase();

            return (
              <motion.div 
                key={member.id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-56 w-full bg-gradient-to-br from-emerald-900 to-[#05231e] flex items-center justify-center relative overflow-hidden group">
                    {member.profileImageUrl ? (
                      <img src={member.profileImageUrl} alt={name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400/30 flex items-center justify-center text-4xl font-extrabold shadow-inner transition-transform duration-500 group-hover:scale-110">
                        {initial}
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center text-xs text-amber-300 font-semibold border border-amber-400/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                      {member.rating || 4.9}
                    </div>
                  </div>

                  <div className="p-6 bg-white">
                    <h3 className="font-bold text-[#05231e] text-xl mb-1">{name}</h3>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-3">
                      {member.specialization || 'Wealth Consultant'}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {member.bio || 'Expert advisor delivering custom financial strategies and capital growth management.'}
                    </p>

                    <div className="flex items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                      <span>{member.experienceYears || 5}+ Years Experience</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link 
                    to="/consulting" 
                    className="w-full py-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-700 hover:text-white transition-all flex items-center justify-center"
                  >
                    Book Session <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamPage;
