import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturesPage = () => {
  return (
    <div className="pt-24 min-h-screen bg-[#FDFDFD]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Features</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">Premium Kalpanaaa Finance solutions and insights.</p>
        <Link to="/contact" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-light transition-all shadow-md">
          Talk to Our Experts <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default FeaturesPage;
