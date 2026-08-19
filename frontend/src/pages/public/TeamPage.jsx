import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { motion } from 'framer-motion';

const fetchTeam = async () => {
  try {
    const res = await api.get('/public/consultants');
    return Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    return [];
  }
};

const TeamPage = () => {
  const { data: team = [], isLoading } = useQuery({
    queryKey: ['publicTeam'],
    queryFn: fetchTeam,
  });

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto min-h-screen bg-white font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <p className="text-emerald-700 font-bold text-sm tracking-wider uppercase mb-4">OUR TEAM</p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#05231e] leading-tight mb-6 max-w-3xl">
          The Experts Behind<br/>Your Financial Growth
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Our team of passionate professionals is dedicated to delivering innovative financial solutions with integrity and excellence.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="h-64 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden group">
                {/* Image Placeholder if profileImageUrl is null */}
                {member.profileImageUrl ? (
                   <img src={member.profileImageUrl} alt={member.user?.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
                ) : (
                   <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-5xl font-bold transition-transform duration-500 group-hover:scale-110 shadow-inner">
                     {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 'M'}
                   </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300"></div>
              </div>
              <div className="p-6 bg-white flex-1">
                <h3 className="font-bold text-[#05231e] text-lg mb-1">{member.user?.name}</h3>
                <p className="text-sm font-medium text-gray-500">{member.specialization || 'Consultant'}</p>
                {/* Email and LinkedIn removed as per user request */}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamPage;
