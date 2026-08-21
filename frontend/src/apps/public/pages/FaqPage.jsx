import React, { useState } from 'react';
import { ArrowRight, ChevronUp, Plus, HeadphonesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: "What is Kalpanaaa Finance?",
    answer: "Kalpanaaa Finance is a financial technology platform that offers a wide range of financial solutions including investments, loans, digital gold, and wealth management to help you achieve your financial goals."
  },
  {
    question: "How can I start investing with Kalpanaaa Finance?",
    answer: "Getting started is easy. Simply create an account, complete your profile, add funds to your wallet, and navigate to the 'Invest' section to choose from our curated list of investment products."
  },
  {
    question: "Is my money safe with Kalpanaaa Finance?",
    answer: "Yes, security is our top priority. We use bank-level encryption, multi-factor authentication, and partner with regulated financial institutions to ensure your funds and data are always secure."
  },
  {
    question: "What types of loans do you offer?",
    answer: "We offer a variety of loan products including Personal Loans, Business Loans, Home Loans, and Loan Against Mutual Funds, all with competitive interest rates and flexible repayment terms."
  },
  {
    question: "How can I buy digital gold?",
    answer: "You can buy 24K digital gold directly through our platform starting with as little as ₹10. Your digital gold is backed by physical gold stored in secure vaults and can be sold or converted at any time."
  },
  {
    question: "How do I contact customer support?",
    answer: "Our support team is available 24/7. You can reach out to us via the 'Contact Us' page, use the live chat feature in your dashboard, or email us directly at support@kalpanaaafinance.com."
  }
];

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-12 flex items-center gap-2">
          <Link to="/" className="hover:text-emerald-700 transition-colors">Home</Link>
          <span>&gt;</span>
          <Link to="/about" className="hover:text-emerald-700 transition-colors">About Us</Link>
          <span>&gt;</span>
          <span className="font-medium text-gray-900">FAQ</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Left Column */}
          <div className="w-full lg:w-5/12 lg:sticky lg:top-32">
            <p className="text-emerald-600 font-bold uppercase text-sm tracking-wider mb-3">FAQ</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#05231e] leading-tight mb-6">
              Frequently Asked<br />Questions
            </h1>
            <p className="text-gray-600 text-lg mb-12 max-w-sm">
              Find answers to the most common questions about our services and products.
            </p>

            {/* Support Card */}
            <div className="bg-emerald-50/50 rounded-3xl p-8 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-[#05231e] mb-2">Still have questions?</h3>
                <p className="text-gray-600 mb-8">We're here to help.</p>
                <Link to="/contact" className="inline-flex items-center justify-between gap-4 bg-[#05231e] text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-[#0a362e] transition-colors shadow-lg shadow-emerald-900/10">
                  Contact Support <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 bg-emerald-100/70 rounded-full flex items-center justify-center">
                <HeadphonesIcon className="w-8 h-8 text-emerald-700" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Right Column - Accordion */}
          <div className="w-full lg:w-7/12 flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className={`rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
                    isOpen 
                      ? 'bg-[#f4f9f7] border border-transparent' 
                      : 'bg-white border border-gray-100 hover:border-emerald-100'
                  }`}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <div className="p-6 flex items-center justify-between gap-4">
                    <h4 className="text-[17px] font-bold text-[#05231e] leading-snug">{faq.question}</h4>
                    <div className="flex-shrink-0 text-gray-400">
                      {isOpen ? <ChevronUp className="w-5 h-5 text-emerald-700" /> : <Plus className="w-5 h-5" />}
                    </div>
                  </div>
                  
                  <div 
                    className={`px-6 pb-6 text-gray-600 text-[15px] leading-relaxed transition-all duration-300 ease-in-out ${
                      isOpen ? 'block opacity-100' : 'hidden opacity-0'
                    }`}
                  >
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FaqPage;

