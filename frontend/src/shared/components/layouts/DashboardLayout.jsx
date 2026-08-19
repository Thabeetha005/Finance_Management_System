import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { 
  Menu, X, Bell, Mail, ChevronDown, LogOut, HelpCircle, 
  User, LayoutDashboard, PieChart, Landmark, ArrowRightLeft, 
  MessageSquare, FileText, Gift
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, showBonusPopup, setShowBonusPopup } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const res = await api.get('/profile');
        return res.data;
      } catch (err) {
        return null;
      }
    },
    staleTime: 30000,
  });
  
  const { data: rawAnnouncements = [] } = useQuery({
    queryKey: ['activeAnnouncements'],
    queryFn: async () => {
      const res = await api.get('/announcements/active');
      return res.data;
    },
    refetchInterval: 60000,
  });

  const announcements = (Array.isArray(rawAnnouncements) ? rawAnnouncements : []).filter(ann => {
    if (!user?.createdAt) return true;
    return new Date(ann.createdAt) >= new Date(user.createdAt);
  });

  const [lastReadAnnouncementAt, setLastReadAnnouncementAt] = useState(() => {
    return localStorage.getItem('lastReadAnnouncementAt') || null;
  });

  const unreadAnnouncementsCount = announcements.filter(a => {
    if (!lastReadAnnouncementAt) return true;
    return new Date(a.createdAt) > new Date(lastReadAnnouncementAt);
  }).length;

  const handleOpenAnnouncements = () => {
    setAnnouncementsOpen(!announcementsOpen);
    if (!announcementsOpen && announcements.length > 0) {
      const latestDate = announcements[0].createdAt;
      setLastReadAnnouncementAt(latestDate);
      localStorage.setItem('lastReadAnnouncementAt', latestDate);
    }
  };

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadMessageCount'],
    queryFn: async () => {
      const res = await api.get('/messages/me/unread-count');
      return res.data.count || 0;
    },
    refetchInterval: 30000,
  });

  const navItems = [
    { name: 'Dashboard', path: '/profile', icon: LayoutDashboard, exact: true },
    { name: 'Wallet', path: '/profile/wallet', icon: Landmark },
    { name: 'Invest', path: '/profile/investments', icon: PieChart },
    { name: 'Loans', path: '/profile/loans', icon: FileText },
    { name: 'Payments', path: '/profile/payments', icon: ArrowRightLeft },
    { name: 'Consult', path: '/profile/consultation', icon: MessageSquare },
    { name: 'Documents', path: '/profile/documents', icon: FileText },
    { name: 'Support', path: '/profile/support', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#051e17] text-white flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:static lg:flex
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <Link to="/" className="flex items-center">
            <img src="/kalpanaa-logo-new.png" alt="Kalpanaa" className="h-10 w-auto object-contain" />
          </Link>
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((item, itemIdx) => {
            const isActive = item.exact 
                ? (location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/profile/dashboard'))
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={itemIdx}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all duration-200
                  ${isActive 
                    ? 'bg-[#106354] text-white shadow-md border-l-4 border-[#D4AF37]' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="p-1 -ml-1 rounded-md hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">

            
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={handleOpenAnnouncements}
                  className="relative p-1.5 text-gray-500 hover:text-slate-800 transition-colors focus:outline-none"
                >
                  <Bell className="w-5 h-5" />
                  {unreadAnnouncementsCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-white">
                      {unreadAnnouncementsCount > 9 ? '9+' : unreadAnnouncementsCount}
                    </span>
                  )}
                </button>

                {announcementsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAnnouncementsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-sm">Announcements</h3>
                        <span className="text-xs bg-[#4E8B83] text-white px-2 py-0.5 rounded-full font-medium">{announcements.length}</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {announcements.length === 0 ? (
                          <div className="p-6 text-center text-gray-500 text-sm">
                            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            No active announcements.
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {announcements.map((ann) => (
                              <div key={ann.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <h4 className="text-sm font-bold text-gray-900 mb-1">{ann.title}</h4>
                                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">{new Date(ann.createdAt).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <Link to="/profile/inbox" className="relative p-1.5 text-gray-500 hover:text-slate-800 transition-colors">
                <Mail className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
            
            <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              {/* PROFILE USERNAME MENU DROPDOWN (SECTION 1 & 16) */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100 transition-all focus:outline-none cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#12241F] text-emerald-400 flex items-center justify-center font-bold text-sm shadow-sm border border-emerald-900/30">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {profile?.name || user?.name || 'User'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium leading-tight">
                      @{profile?.username || (user?.email ? user.email.split('@')[0] : 'customer')}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
                </button>

                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Header Avatar / Info */}
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-emerald-50/50 via-white to-gray-50/30">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-[#12241F] text-emerald-400 flex items-center justify-center font-bold text-base shadow-sm">
                            {profile?.name ? profile.name.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-gray-900 truncate">
                              {profile?.name || user?.name || 'Customer'}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {profile?.email || user?.email}
                            </p>
                          </div>
                        </div>

                        {/* Verified vs Verification Pending Badge & Application Status */}
                        <div className="mt-2 flex flex-wrap gap-2 items-center">
                          {profile?.isVerified ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Verified Account
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-100/80 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Not Verified
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full border border-gray-200">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              user?.applicationStatus === 'APPROVED' ? 'bg-emerald-500' :
                              user?.applicationStatus === 'UNDER_REVIEW' ? 'bg-amber-500' : 'bg-blue-500'
                            }`}></span>
                            STATUS: {user?.applicationStatus ? user.applicationStatus.replace('_', ' ') : 'PENDING KYC'}
                          </span>
                        </div>
                      </div>

                      {/* Section 16 Final Menu Structure */}
                      <div className="py-2 text-xs font-medium text-gray-700">
                        <Link
                          to="/profile/account"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors"
                        >
                          <User className="w-4 h-4 text-emerald-600" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/profile/account?tab=edit"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors"
                        >
                          <User className="w-4 h-4 text-amber-600" />
                          <span>Edit Profile</span>
                        </Link>
                        <Link
                          to="/profile/documents"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>Documents</span>
                        </Link>
                        <Link
                          to="/profile/account?tab=verification"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors"
                        >
                          <Landmark className="w-4 h-4 text-purple-600" />
                          <span>Verification Status</span>
                        </Link>
                        <Link
                          to="/profile/account?tab=password"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-[#0f172a] px-4 py-2.5 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-rose-600" />
                          <span>Change Password</span>
                        </Link>
                      </div>

                      {/* Logout Button */}
                      <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                        <button
                          onClick={() => { setProfileMenuOpen(false); logout(); }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {showBonusPopup && (location.pathname === '/dashboard' || location.pathname === '/profile/dashboard') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={500}
              gravity={0.15}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#12241F] border border-[#887333]/30 rounded-xl max-w-md w-full p-8 text-center relative shadow-2xl"
            >
              <button
                onClick={() => setShowBonusPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="w-20 h-20 bg-gradient-to-br from-[#887333] to-[#C5A85A] rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-[#887333]/20">
                <Gift className="w-10 h-10 text-[#12241F]" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2 font-poppins tracking-wide uppercase">
                Congratulations!
              </h2>
              
              <p className="text-gray-300 text-lg mb-8 font-light">
                YOU GOT <span className="font-bold text-[#C5A85A]">₹1,00,000</span> AS A BONUS
              </p>
              
              <button
                onClick={() => setShowBonusPopup(false)}
                className="w-full bg-[#106354] hover:bg-[#0D5246] text-white py-3 rounded uppercase text-sm tracking-widest font-semibold transition-colors"
              >
                Claim Now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
