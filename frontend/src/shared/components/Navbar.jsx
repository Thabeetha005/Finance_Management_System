import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  return (
    <nav className="fixed w-full z-50 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 text-xl font-bold text-emerald-400">
              <img src="/kalpanaa-logo-new.png" alt="Kalpanaaa Finance Logo" className="w-[24rem] md:w-[32rem] h-24 md:h-28 object-contain origin-left" />
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link to="/about" className="text-gray-300 hover:text-emerald-400 transition">About</Link>
            <Link to="/industries" className="text-gray-300 hover:text-emerald-400 transition">Industries</Link>
            <Link to="/contact" className="text-gray-300 hover:text-emerald-400 transition">Contact</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition font-medium">Log In</Link>
            <Link to="/register" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold transition shadow-sm text-sm">Sign Up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
