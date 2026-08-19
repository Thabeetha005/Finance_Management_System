import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Navbar';
import Footer from '../Footer';

const CustomerLayout = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex gap-6 mt-20">
        <aside className="w-64 bg-white rounded-lg shadow-sm border border-gray-100 h-fit flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">Welcome,</p>
            <p className="font-semibold text-slate-800 truncate">{user?.username}</p>
          </div>
          <nav className="mt-8 space-y-2">
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
    </div>
  );
};

export default CustomerLayout;
