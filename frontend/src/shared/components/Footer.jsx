import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">Kalpanaaa Finance</h2>
          <p className="text-sm">
            Empowering global supply chains with strategic capital and innovative financial structuring.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-emerald-400 transition">About Us</Link></li>
            <li><Link to="/industries" className="hover:text-emerald-400 transition">Industries</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-400 transition">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy-policy" className="hover:text-emerald-400 transition">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-emerald-400 transition">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} Kalpanaaa Finance. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
