import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import Navbar from '../../../shared/components/Navbar';
import Footer from '../../../shared/components/Footer';
import api from '../../../shared/api/axios';
import { toast } from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

const CustomerLayout = () => {
  const { logout, user } = useAuth();
  const [purging, setPurging] = useState(false);

  const handleConfirmAccountPurge = async () => {
    try {
      setPurging(true);
      await api.post('/user/confirm-termination');
      toast.success('Your account and associated data have been permanently purged.');
      logout();
    } catch (err) {
      console.error('Account purge failed', err);
      // Hard fallback logout
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
        <aside className="w-64 bg-white rounded-lg shadow-sm border border-gray-100 h-fit flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">Welcome,</p>
            <p className="font-semibold text-slate-800 truncate">{user?.name || user?.username}</p>
          </div>
          <nav className="mt-8 space-y-2 p-2">
            <Link to="/wallet" className="block px-3 py-2 rounded-md hover:bg-emerald-50 hover:text-emerald-700 transition">Overview</Link>
            <Link to="/wallet/transactions" className="block px-3 py-2 rounded-md hover:bg-emerald-50 hover:text-emerald-700 transition">My Transactions</Link>
            <Link to="/wallet/invoices" className="block px-3 py-2 rounded-md hover:bg-emerald-50 hover:text-emerald-700 transition">Invoices</Link>
          </nav>
          <div className="p-2 border-t border-gray-100">
            <button onClick={logout} className="w-full text-left px-3 py-2 rounded-md hover:bg-red-50 text-red-600 transition">
              Logout
            </button>
          </div>
        </aside>
        <main className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
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
