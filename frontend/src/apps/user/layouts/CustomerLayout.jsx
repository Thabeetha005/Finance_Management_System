import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../../shared/components/Navbar';
import Footer from '../../../shared/components/Footer';
import api from '../../../shared/api/axios';
import { toast } from 'react-hot-toast';
import { 
  AlertTriangle, LayoutDashboard, Wallet, ArrowRightLeft, 
  TrendingUp, HandCoins, Video, Activity, FileText, Mail, LogOut, ShieldCheck 
} from 'lucide-react';

const CustomerLayout = () => {
  const { logout, user } = useAuth();
  const [purging, setPurging] = useState(false);
  const location = useLocation();

  // Fetch live unread message count
  const { data: unreadData } = useQuery({
    queryKey: ['unreadMessageCount'],
    queryFn: async () => {
      try {
        const res = await api.get('/messages/me/unread-count');
        return res.data;
      } catch (err) {
        return { unreadCount: 0 };
      }
    },
    refetchInterval: 10000 // Refetch every 10s
  });

  const unreadCount = unreadData?.unreadCount || 0;

  const navItems = [
    { name: 'Overview', path: '/profile', icon: LayoutDashboard },
    { name: 'Wallet', path: '/profile/wallet', icon: Wallet },
    { name: 'Investments', path: '/profile/investments', icon: TrendingUp },
    { name: 'Loans', path: '/profile/loans', icon: HandCoins },
    { name: 'Consultations', path: '/profile/consultation', icon: Video },
    { name: 'Documents', path: '/profile/documents', icon: FileText },
    { name: 'Messages & Notifications', path: '/profile/inbox', icon: Mail, badge: unreadCount },
  ];

  const handleConfirmAccountPurge = async () => {
    try {
      setPurging(true);
      await api.post('/user/confirm-termination');
      toast.success('Your account and associated data have been permanently purged.');
      logout();
    } catch (err) {
      console.error('Account purge failed', err);
      toast.success('Account termination acknowledged.');
      logout();
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex gap-6 mt-20">
        <aside className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 h-fit flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-emerald-900 to-[#1b4d3e] text-white">
            <p className="text-xs text-emerald-200 uppercase font-semibold tracking-wider">Customer Portal</p>
            <p className="font-bold text-base truncate mt-0.5">{user?.name || user?.username || 'Customer'}</p>
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-700/60 text-emerald-100 rounded-full mt-2 border border-emerald-500/30">
              Verified Account
            </span>
          </div>
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/profile' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#1b4d3e] text-white shadow-md'
                      : 'text-gray-600 hover:bg-emerald-50/60 hover:text-[#1b4d3e]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {Boolean(item.badge) && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      isActive ? 'bg-amber-400 text-slate-900' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-gray-100 mt-2">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <Outlet />
        </main>
      </div>
      <Footer />


      {/* Customer Account Termination Pop-Up */}
      {user?.accountStatus === 'PENDING_TERMINATION' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-red-100">
            <div className="flex items-center gap-3 text-red-700 border-b border-red-100 pb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-xl font-bold">Account Scheduled for Deletion</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-red-50 p-3.5 rounded-2xl border border-red-200">
              Your customer account has been scheduled for permanent termination by Administration.
            </p>

            {user.terminationReason && (
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs">
                <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-1">Reason from Administration</p>
                <p className="text-gray-900 font-medium italic">"{user.terminationReason}"</p>
              </div>
            )}

            <p className="text-xs text-gray-500 leading-relaxed">
              Upon acknowledging this notice, your account and associated financial records will be permanently removed from the system.
            </p>

            <div className="pt-2">
              <button
                onClick={handleConfirmAccountPurge}
                disabled={purging}
                className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {purging ? 'Purging & Closing Account...' : 'Acknowledge & Confirm Account Closure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLayout;
