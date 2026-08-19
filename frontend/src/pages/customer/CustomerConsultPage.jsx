import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { 
  ShieldCheck, Clock, UserCheck, Calendar, ChevronDown, CheckCircle2, Star
} from 'lucide-react';


// Color palette for expert avatars (cycles through)
const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-orange-100 text-orange-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-rose-100 text-rose-700',
];

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const CustomerConsultPage = () => {
  const [isBooked, setIsBooked] = useState(false);
  const [formData, setFormData] = useState({
    expert: '',
    type: '',
    date: '',
    time: '',
    query: ''
  });

  // Fetch real consultants from the database (same source as public page)
  const { data: experts = [] } = useQuery({
    queryKey: ['publicConsultants'],
    queryFn: async () => {
      const res = await api.get('/public/consultants');
      return res.data;
    }
  });

  const { data: bookedConsults = [], refetch } = useQuery({
    queryKey: ['myConsultations'],
    queryFn: async () => {
      const res = await api.get('/customer/consultations');
      return res.data;
    }
  });

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customer/consultations', {
        expert: formData.expert,
        type: formData.type,
        date: formData.date,
        time: formData.time,
        query: formData.query
      });
      setIsBooked(true);
      setTimeout(() => setIsBooked(false), 5000);
      setFormData({ expert: '', type: '', date: '', time: '', query: '' });
      refetch();
    } catch (error) {
      console.error("Failed to book consultation", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto font-sans relative pb-10">
      
      {/* Header */}
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Consult an Expert</h1>
        <p className="text-gray-500">Book a session with our financial experts for guidance.</p>
      </div>

      {isBooked && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <div>
            <p className="font-bold">Consultation Booked Successfully!</p>
            <p className="text-sm opacity-90">An expert will reach out to you at the scheduled time.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left Column - Booking Form */}
        <div className="lg:col-span-5">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Book a Consultation</h3>
          
          <form onSubmit={handleBooking} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Expert</label>
              <div className="relative">
                <select 
                  required
                  value={formData.expert}
                  onChange={e => setFormData({...formData, expert: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
                >
                  <option value="">Choose Expert</option>
                  {experts.map((ex, i) => (
                    <option key={ex.id || i} value={ex.user?.name || ex.name}>
                      {ex.user?.name || ex.name} - {ex.specialization || 'Expert'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Consultation Type</label>
              <div className="relative">
                <select 
                  required
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
                >
                  <option value="">Select Type</option>
                  <option value="video">Video Call</option>
                  <option value="audio">Audio Call</option>
                  <option value="chat">Chat Support</option>
                </select>
                <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Date</label>
              <div className="relative">
                <input 
                  required
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Time</label>
              <div className="relative">
                <select 
                  required
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
                >
                  <option value="">Select Time</option>
                  <option value="morning">Morning (10 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (2 PM - 4 PM)</option>
                  <option value="evening">Evening (5 PM - 7 PM)</option>
                </select>
                <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Query (Optional)</label>
              <textarea 
                rows="3"
                value={formData.query}
                onChange={e => setFormData({...formData, query: e.target.value})}
                placeholder="Write your query..."
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-[#05231e] hover:bg-[#0a362e] text-white rounded-lg font-bold transition-colors mt-2"
            >
              Book Now
            </button>
          </form>
        </div>

        {/* Right Column - Experts List */}
        <div className="lg:col-span-7">
          
          {bookedConsults.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Booked Consultations</h3>
              <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 flex flex-col gap-3">
                {bookedConsults.map(consult => (
                  <div key={consult.id} className="p-5 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{consult.notes?.replace('Expert: ', '') || 'Any'}</h4>
                        <p className="text-xs text-gray-500 font-semibold capitalize">{consult.type} Consultation</p>
                      </div>
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
                        consult.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{consult.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-700 font-semibold bg-white p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-600" /> {new Date(consult.preferredDate).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> {consult.preferredTime}</div>
                    </div>
                    {consult.message && (
                      <div className="mt-3 text-sm text-gray-500">
                        <span className="font-semibold text-gray-700">Query:</span> {consult.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-xl font-bold text-gray-900 mb-6">Our Experts</h3>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex flex-col gap-2">
            {experts.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">Loading experts...</p>
              </div>
            ) : experts.map((expert, i) => (
              <div key={expert.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                    {getInitials(expert.user?.name || expert.name || '?')}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{expert.user?.name || expert.name || 'Expert'}</h4>
                    <p className="text-xs font-semibold text-gray-500 mb-1">{expert.specialization || 'Financial Expert'}</p>
                    <p className="text-xs text-gray-400">{expert.bio || `${expert.experienceYears || 5}+ years experience`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-center">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-sm font-bold">{expert.rating || 4.8}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Secure & Confidential</h4>
            <p className="text-xs text-gray-500">Your information is safe with us.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Expert Guidance</h4>
            <p className="text-xs text-gray-500">Get advice from certified experts.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Hassle Free</h4>
            <p className="text-xs text-gray-500">Easy booking and quick response.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerConsultPage;
