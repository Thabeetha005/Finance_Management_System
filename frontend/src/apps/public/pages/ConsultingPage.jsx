import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const fetchConsultants = async () => {
  try {
    const res = await api.get('/public/consultants');
    return Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    return [];
  }
};

const ConsultingPage = () => {
  const { data: consultants = [], isLoading } = useQuery({
    queryKey: ['publicConsultants'],
    queryFn: fetchConsultants,
  });

  return (
    <div className="pt-24 pb-12 font-sans bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-20">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2">
            <p className="text-emerald-700 font-bold tracking-wider text-sm mb-4 uppercase">Consulting Services</p>
            <h1 className="text-5xl lg:text-6xl font-bold text-[#05231e] leading-tight mb-6">
              Expert Guidance.<br/>
              <span className="text-emerald-700">Measurable Impact.</span>
            </h1>
            <p className="text-gray-600 text-lg mb-10 max-w-xl">
              Our experienced consultants help you solve complex challenges, optimize operations, and unlock new growth opportunities with confidence.
            </p>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-[#05231e] flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 text-sm">✓</div>
                  Industry Experts
                </h4>
              </div>
              <div>
                <h4 className="font-bold text-[#05231e] flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 text-sm">✓</div>
                  Proven Strategies
                </h4>
              </div>
              <div>
                <h4 className="font-bold text-[#05231e] flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 text-sm">✓</div>
                  Results Focused
                </h4>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="rounded-3xl overflow-hidden shadow-2xl relative h-[400px] w-full bg-slate-200">
              <img src="/consulting-hero-new.png?v=3" alt="Consulting Excellence" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-24">
        <div className="text-center mb-12">
          <p className="text-emerald-700 font-bold tracking-wider text-sm mb-2 uppercase">Our Consulting Services</p>
          <h2 className="text-4xl font-bold text-[#05231e]">Solutions Designed for Your Growth</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-shadow group">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6">
              <span className="font-bold text-xl">₹</span>
            </div>
            <h3 className="text-xl font-bold text-[#05231e] mb-4">Financial Strategy</h3>
            <p className="text-gray-600 mb-6 text-sm">Build a strong financial foundation and create strategies that drive sustainable growth and long-term value.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium"><div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">✓</div> Financial Planning & Analysis</li>
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium"><div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">✓</div> Business Growth Strategy</li>
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium"><div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">✓</div> Risk Assessment & Mitigation</li>
            </ul>

          </div>

          {/* Card 2 */}
          <div className="bg-[#fdf9f3] rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-shadow group">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-6">
              <span className="font-bold text-xl">⚙</span>
            </div>
            <h3 className="text-xl font-bold text-[#05231e] mb-4">Operational Consulting</h3>
            <p className="text-gray-600 mb-6 text-sm">Improve efficiency, streamline processes, and enhance operational performance across your organization.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium"><div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px]">✓</div> Process Improvement</li>
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium"><div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px]">✓</div> Supply Chain Optimization</li>
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium"><div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px]">✓</div> Cost Reduction Strategies</li>
            </ul>

          </div>

          {/* Card 3 */}
          <div className="bg-[#f5fbf9] rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-shadow group">
            <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mb-6">
              <span className="font-bold text-xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-[#05231e] mb-4">Digital Transformation</h3>
            <p className="text-gray-600 mb-6 text-sm">Leverage technology to modernize your business, improve customer experiences, and stay ahead in a digital world.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium"><div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center text-white text-[10px]">✓</div> Digital Strategy & Roadmap</li>
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium"><div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center text-white text-[10px]">✓</div> Technology Integration</li>
              <li className="flex items-center gap-2 text-sm text-gray-700 font-medium"><div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center text-white text-[10px]">✓</div> Automation & AI Solutions</li>
            </ul>

          </div>
        </div>
      </div>

      {/* Consultants Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="text-center mb-12">
          <p className="text-emerald-700 font-bold tracking-wider text-sm mb-2 uppercase">Our Consultants</p>
          <h2 className="text-4xl font-bold text-[#05231e] mb-4">Meet Our Expert Consultants</h2>
          <p className="text-gray-600 text-lg">Experienced professionals dedicated to delivering the best solutions for you.</p>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500">Loading consultants...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {consultants.slice(0, 8).map(consultant => (
              <div key={consultant.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  {consultant.user?.name ? consultant.user.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <h3 className="font-bold text-[#05231e] text-lg mb-1">{consultant.user?.name}</h3>
                <p className="text-sm font-semibold text-emerald-700 mb-1">{consultant.specialization}</p>
                <p className="text-xs text-gray-500 mb-4">{consultant.experienceYears || 0}+ Years Exp.</p>
                <div className="mt-auto pt-4 border-t border-gray-50 w-full flex justify-center">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl text-sm font-bold">
                    <Star className="w-4 h-4 fill-amber-500" />
                    {consultant.rating || 4.8}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && consultants.length > 6 && (
          <div className="mt-12 text-center">
            <Link to="/consultants" className="inline-flex items-center gap-2 bg-[#05231e] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0a362e] transition-colors">
              View All Consultants <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default ConsultingPage;
