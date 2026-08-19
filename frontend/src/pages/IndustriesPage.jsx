import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const IndustriesPage = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 mt-16 bg-white">
        <section className="bg-slate-900 text-white py-20 px-6 border-b-8 border-emerald-600">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Industries We Serve</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tailored financial structuring for the world's most critical sectors.
            </p>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition duration-300 hover:border-emerald-200">
              <div className="h-48 bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-2xl font-bold text-emerald-400">Manufacturing</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  Fueling industrial growth with raw material financing and extended payables solutions, allowing manufacturers to scale production without capital constraints.
                </p>
              </div>
            </div>

            <div className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition duration-300 hover:border-[#b87333]">
              <div className="h-48 bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-2xl font-bold" style={{ color: '#b87333' }}>Technology</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  Agile working capital solutions for hardware and component supply chains, mitigating lead time risks and supporting rapid inventory turnover.
                </p>
              </div>
            </div>

            <div className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition duration-300 hover:border-emerald-200">
              <div className="h-48 bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-2xl font-bold text-emerald-400">Commodities</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  Structuring complex cross-border transactions for energy, metals, and agricultural products with robust risk mitigation and structured trade finance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IndustriesPage;
