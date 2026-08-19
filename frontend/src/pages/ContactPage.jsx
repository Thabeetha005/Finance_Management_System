import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Clock, Shield, Users, Handshake, MessageCircle, Calendar, Video, FileText, HelpCircle, CheckCircle, HeadphonesIcon, ArrowRight, User } from 'lucide-react';
import api from '../api/axios';

const ContactPage = () => {
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' or 'consultation'
  
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', topic: '', date: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'contact') {
        await api.post('/public/contact-requests', {
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message: form.message
        });
      } else {
        await api.post('/public/consultations', {
          name: form.name,
          email: form.email,
          phone: form.phone,
          topic: form.topic,
          date: form.date,
          message: form.message
        });
      }
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', topic: '', date: '', message: '' });
    } catch (err) {
      console.error('Failed to submit form:', err);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Top Section: Split Layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 mb-20">
          
          {/* Left Column */}
          <div className="w-full lg:w-7/12 flex flex-col">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#111827] mb-2 uppercase tracking-wide">
              {activeTab === 'contact' ? 'Contact Us' : 'Book Consultation'}
            </h1>
            <div className="w-16 h-1 bg-[#C47D57] mb-6"></div>
            
            <p className="text-[#4b5563] text-lg mb-10 max-w-xl leading-relaxed">
              We're here to help you with all your financial needs. <br className="hidden md:block" />
              {activeTab === 'contact' 
                ? 'Reach out to us and our team will get back to you shortly.'
                : 'Schedule a session with our experts to discuss your tailored strategy.'}
            </p>

            {/* Operations Base Box */}
            <div className="w-full bg-[#f8fafc] rounded-xl overflow-hidden border border-gray-200 p-8 md:p-12 flex flex-col justify-center shadow-sm mt-auto">
              <h3 className="text-[#4E8B83] font-bold text-sm tracking-wider uppercase mb-4">Operations base</h3>
              <p className="text-[#111827] font-bold text-xl mb-3">Kalpanaaa Software Solutions Pvt. Ltd.</p>
              <p className="text-gray-600 text-base mb-8 leading-relaxed max-w-lg">822, 9th Main, 1st C Cross, 1st Block, HRBR Layout, Kalyan Nagar, Banaswadi, Bengaluru, Karnataka, India — 560043</p>
              
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                    <Clock className="w-5 h-5 text-[#4E8B83]" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Hours</span>
                    <span className="text-sm text-gray-800 font-medium">Mon - Sat: 9:30 AM - 6:30 PM<br/>Sunday: Closed</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                    <Phone className="w-5 h-5 text-[#4E8B83]" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Phone</span>
                    <span className="text-sm text-gray-800 font-medium">+91 8050483560</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="w-full lg:w-5/12">
            <div className="bg-[#05281e] rounded-xl p-8 lg:p-10 h-auto min-h-full shadow-xl text-white relative overflow-hidden">
              
              {/* Form Toggle Tabs */}
              <div className="flex mb-8 border-b border-[#2a4d43] relative z-20">
                <button 
                  onClick={() => { setActiveTab('contact'); setSubmitted(false); }}
                  className={`pb-3 px-4 font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === 'contact' ? 'text-[#C47D57] border-b-2 border-[#C47D57]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
                >
                  Contact Us
                </button>
                <button 
                  onClick={() => { setActiveTab('consultation'); setSubmitted(false); }}
                  className={`pb-3 px-4 font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === 'consultation' ? 'text-[#C47D57] border-b-2 border-[#C47D57]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
                >
                  Book Consultation
                </button>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)] text-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-[#C47D57] flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">Request Sent!</h3>
                  <p className="text-gray-300">Thank you for reaching out. We will get back to you shortly.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-8 text-sm font-bold text-[#C47D57] hover:text-white transition-colors">
                    Send another message
                  </button>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col h-full">
                  <h2 className="text-2xl font-bold mb-2 uppercase">{activeTab === 'contact' ? 'SEND US A MESSAGE' : 'SCHEDULE A MEETING'}</h2>
                  <p className="text-sm text-gray-300 mb-8">
                    {activeTab === 'contact' ? 'Fill out the form below and we\'ll get back to you.' : 'Select a date and topic, and our advisor will reach out.'}
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        placeholder="Your Name*" 
                        className="w-full bg-transparent border border-[#2a4d43] rounded p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#C47D57] transition-colors"
                      />
                      <input 
                        type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                        placeholder="Your Email*" 
                        className="w-full bg-transparent border border-[#2a4d43] rounded p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#C47D57] transition-colors"
                      />
                    </div>
                    
                    <input 
                      type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      placeholder="Phone Number*" 
                      className="w-full bg-transparent border border-[#2a4d43] rounded p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#C47D57] transition-colors"
                    />

                    {activeTab === 'contact' ? (
                      <div className="relative">
                        <select 
                          required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                          className="w-full bg-transparent border border-[#2a4d43] rounded p-3 text-sm text-white appearance-none focus:outline-none focus:border-[#C47D57] transition-colors"
                        >
                          <option value="" disabled className="text-gray-800">Subject*</option>
                          <option value="General Inquiry" className="text-gray-800">General Inquiry</option>
                          <option value="Customer Support" className="text-gray-800">Customer Support</option>
                          <option value="Investment" className="text-gray-800">Investment</option>
                        </select>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <select 
                            required value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}
                            className="w-full bg-transparent border border-[#2a4d43] rounded p-3 text-sm text-white appearance-none focus:outline-none focus:border-[#C47D57] transition-colors"
                          >
                            <option value="" disabled className="text-gray-800">Topic*</option>
                            <option value="Financial Planning" className="text-gray-800">Financial Planning</option>
                            <option value="Wealth Management" className="text-gray-800">Wealth Management</option>
                            <option value="Loans & Credit" className="text-gray-800">Loans & Credit</option>
                          </select>
                        </div>
                        <input 
                          type="datetime-local" required value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                          className="w-full bg-transparent border border-[#2a4d43] rounded p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#C47D57] transition-colors"
                        />
                      </div>
                    )}

                    <textarea 
                      required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                      placeholder="Your Message*" 
                      className="w-full bg-transparent border border-[#2a4d43] rounded p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#C47D57] transition-colors resize-none flex-1 min-h-[120px]"
                    />

                    <div className="flex items-center gap-2 mt-2 mb-6">
                      <Shield className="w-4 h-4 text-[#C47D57]" />
                      <span className="text-xs text-gray-300">Your information is secure and will never be shared.</span>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 bg-[#C47D57] hover:bg-[#b0704e] text-white font-bold rounded flex items-center justify-center gap-2 transition-colors uppercase tracking-wider text-sm mt-auto disabled:opacity-50">
                      {loading ? 'SENDING...' : (activeTab === 'contact' ? 'SEND MESSAGE' : 'BOOK NOW')} <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* We Are Here To Help You */}
        <div className="mb-8 flex items-center justify-center">
          <div className="h-px bg-[#C47D57] w-12 hidden md:block"></div>
          <h2 className="mx-6 text-xl font-bold text-[#4E8B83] uppercase tracking-widest text-center">We Are Here To Help You</h2>
          <div className="h-px bg-[#C47D57] w-12 hidden md:block"></div>
        </div>

        <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 md:p-10 mb-12">
          {/* ... keeping the feature boxes ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row items-start gap-4 pt-4 md:pt-0 pl-0">
              <User className="w-10 h-10 text-[#4E8B83] shrink-0 stroke-[1.5]" />
              <div>
                <h4 className="text-[#12241F] font-bold text-sm mb-1">Expert Guidance</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Get professional advice from our financial experts.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row items-start gap-4 pt-6 md:pt-0 md:pl-6 lg:pl-4">
              <Shield className="w-10 h-10 text-[#4E8B83] shrink-0 stroke-[1.5]" />
              <div>
                <h4 className="text-[#12241F] font-bold text-sm mb-1">Secure & Trusted</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Bank-grade security for all your information.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row items-start gap-4 pt-6 md:pt-0 md:pl-0 lg:pl-4">
              <Clock className="w-10 h-10 text-[#4E8B83] shrink-0 stroke-[1.5]" />
              <div>
                <h4 className="text-[#12241F] font-bold text-sm mb-1">Quick Response</h4>
                <p className="text-xs text-gray-500 leading-relaxed">We respond to all inquiries within 24 hours.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row items-start gap-4 pt-6 md:pt-0 md:pl-6 lg:pl-4">
              <Users className="w-10 h-10 text-[#4E8B83] shrink-0 stroke-[1.5]" />
              <div>
                <h4 className="text-[#12241F] font-bold text-sm mb-1">Dedicated Support</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Our team is always ready to assist you.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row items-start gap-4 pt-6 md:pt-0 md:pl-0 lg:pl-4">
              <Handshake className="w-10 h-10 text-[#4E8B83] shrink-0 stroke-[1.5]" />
              <div>
                <h4 className="text-[#12241F] font-bold text-sm mb-1">Long Term Partnership</h4>
                <p className="text-xs text-gray-500 leading-relaxed">We build lasting relationships with our clients.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#05281e] rounded-2xl py-8 px-6 lg:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#154637]">
          
          <a href="https://wa.me/8050483560" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 pt-4 md:pt-0 pl-0 group cursor-pointer block">
            <MessageCircle className="w-10 h-10 text-[#C47D57] shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-[#C47D57] font-bold text-xs uppercase tracking-wider mb-1">WhatsApp Us</h4>
              <p className="text-white font-medium text-sm">+91 8050483560</p>
              <p className="text-gray-400 text-xs">Chat with us instantly</p>
            </div>
          </a>
          
          <div onClick={() => setActiveTab('consultation')} className="flex items-center gap-4 pt-6 md:pt-0 md:pl-6 lg:pl-4 group cursor-pointer">
            <Calendar className="w-10 h-10 text-[#C47D57] shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-[#C47D57] font-bold text-xs uppercase tracking-wider mb-1">Schedule a Meeting</h4>
              <p className="text-white font-medium text-xs leading-tight">Book a free consultation<br/>with our experts</p>
            </div>
          </div>
          
          <div onClick={() => setActiveTab('consultation')} className="flex items-center gap-4 pt-6 md:pt-0 md:pl-0 lg:pl-4 group cursor-pointer">
            <Video className="w-10 h-10 text-[#C47D57] shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-[#C47D57] font-bold text-xs uppercase tracking-wider mb-1">Video Consultation</h4>
              <p className="text-white font-medium text-xs leading-tight">Connect face-to-face<br/>with our advisors</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-6 md:pt-0 md:pl-6 lg:pl-4 group cursor-pointer">
            <FileText className="w-10 h-10 text-[#C47D57] shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-[#C47D57] font-bold text-xs uppercase tracking-wider mb-1">Download Brochure</h4>
              <p className="text-white font-medium text-xs leading-tight">Learn more about our<br/>services and solutions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-6 md:pt-0 md:pl-0 lg:pl-4 group cursor-pointer">
            <HelpCircle className="w-10 h-10 text-[#C47D57] shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-[#C47D57] font-bold text-xs uppercase tracking-wider mb-1">FAQs</h4>
              <p className="text-white font-medium text-xs leading-tight">Find answers to common<br/>questions</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ContactPage;
