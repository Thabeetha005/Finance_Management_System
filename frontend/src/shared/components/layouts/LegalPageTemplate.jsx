import React from 'react';

const LegalPageTemplate = ({ title, subtitle, lastUpdated, children }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-[#05231e] text-white pt-32 pb-20 border-b border-emerald-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-400">
            {title}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {subtitle}
          </p>
          {lastUpdated && (
            <p className="text-sm text-emerald-100/60 mt-8">
              Last Updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-12">
          {children}
        </div>
        
        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Have questions about our services?</h3>
          <a href="/contact" className="inline-flex items-center justify-center px-8 py-3 bg-[#05231e] hover:bg-emerald-800 text-white font-medium rounded-lg transition-colors">
            Contact Kalpanaaa Finance &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};

export const LegalSection = ({ number, title, children }) => {
  return (
    <section className="scroll-mt-24" id={`section-${number}`}>
      <div className="flex items-start gap-4 mb-6">
        <span className="flex-shrink-0 text-3xl font-bold text-[#887333] opacity-50">
          {number.toString().padStart(2, '0')}
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">
          {title}
        </h2>
      </div>
      <div className="text-gray-600 leading-relaxed space-y-4 ml-0 md:ml-12">
        {children}
      </div>
    </section>
  );
};

export default LegalPageTemplate;
