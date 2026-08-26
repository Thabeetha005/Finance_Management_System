import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Printer, Search, ArrowRight, CheckCircle2, ChevronRight, Lock, HelpCircle, Download } from 'lucide-react';

const LegalPageTemplate = ({ title, subtitle, documentId, lastUpdated, highlights, sections, children }) => {
  const [activeSection, setActiveSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      if (sections && sections.length > 0) {
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(`section-${sections[i].id}`);
          if (el && el.offsetTop <= scrollPosition) {
            setActiveSection(sections[i].id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 antialiased selection:bg-[#106354] selection:text-white">
      
      {/* ── 1. APPLE/MICROSOFT STYLE HERO HEADER ── */}
      <div className="bg-[#05231e] text-white pt-28 pb-16 border-b border-[#106354]/30 relative overflow-hidden">
        {/* Background Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05231e] via-[#05231e] to-[#08352e] opacity-90 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#106354]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Enterprise Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#106354]/30 border border-[#106354]/50 text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              Official Legal Document • {documentId || 'REF-LEGAL-2026'}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              {title}
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              {subtitle}
            </p>

            {/* Document Metadata Bar */}
            <div className="mt-8 pt-6 border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-100/70">
              <div className="flex items-center gap-6">
                <span>Effective Date: <strong className="text-white">{lastUpdated || 'August 15, 2026'}</strong></span>
                <span>•</span>
                <span>Jurisdiction: <strong className="text-white">India / International Digital Finance</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-[#106354] border border-emerald-800 text-emerald-200 hover:text-white font-semibold transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Document
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. EXECUTIVE HIGHLIGHTS SUMMARY BOX ── */}
      {highlights && highlights.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#e6f3f0] text-[#106354] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. MAIN DOCUMENT BODY WITH STICKY SIDEBAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── LEFT SIDEBAR: STICKY NAVIGATION (APPLE LEGAL STYLE) ── */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 space-y-6">
              
              {/* Quick Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search in document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#106354]"
                />
              </div>

              {/* Table of Contents */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
                  Table of Contents
                </h3>
                <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                  {sections && sections.map((sec) => {
                    const isMatchesSearch = !searchQuery || sec.title.toLowerCase().includes(searchQuery.toLowerCase());
                    if (!isMatchesSearch) return null;

                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => scrollToSection(sec.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isActive
                            ? 'bg-[#e6f3f0] text-[#106354] border-l-4 border-[#106354]'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate">{sec.number}. {sec.title}</span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'translate-x-0.5 text-[#106354]' : 'opacity-0'}`} />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Assistance Card */}
              <div className="bg-[#05231e] text-white p-5 rounded-2xl border border-emerald-950 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
                  <Lock className="w-4 h-4" /> Legal & Regulatory Office
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Questions about our terms or privacy governance? Our legal operations team is available to assist you.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Contact Legal Desk &rarr;
                </a>
              </div>

            </div>
          </div>

          {/* ── RIGHT COLUMN: LEGAL CONTENT ARTICLES ── */}
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-12 divide-y divide-slate-100">
              {children}
            </div>

            {/* Bottom Official Disclaimer Footer */}
            <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 text-xs text-slate-500 space-y-2 leading-relaxed">
              <p className="font-bold text-slate-700">Official Notice & Governance:</p>
              <p>
                Kalpanaaa Finance operating entities provide services under strict regulatory compliance frameworks. All operational rules, privacy controls, and data practices contained herein are binding upon access to the platform.
              </p>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                © {new Date().getFullYear()} Kalpanaaa Finance Technologies Ltd. All Rights Reserved.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export const LegalSection = ({ id, number, title, takeaway, children }) => {
  return (
    <section id={`section-${id}`} className="pt-8 first:pt-0 scroll-mt-28">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="px-2.5 py-1 rounded-lg bg-[#e6f3f0] text-[#106354] text-xs font-extrabold tracking-wide">
          Section {number.toString().padStart(2, '0')}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
      </div>

      {/* Key Takeaway Callout Box (Apple Style) */}
      {takeaway && (
        <div className="mb-5 p-4 rounded-xl bg-slate-50 border-l-4 border-[#106354] flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#106354] shrink-0 mt-0.5" />
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            <strong className="text-slate-900 font-bold">Key Summary: </strong>
            {takeaway}
          </p>
        </div>
      )}

      {/* Main Section Content */}
      <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-normal">
        {children}
      </div>
    </section>
  );
};

export default LegalPageTemplate;

