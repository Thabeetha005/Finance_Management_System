import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Quote, ArrowRight, CheckCircle2 } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const testimonials = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "CFO",
    company: "TechNova Solutions",
    content: "Kalpanaaa Finance transformed our financial operations. Their digital infrastructure is incredibly robust, and the level of support we receive is unmatched in the industry.",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Founder",
    company: "NextGen Retail",
    content: "The lending and credit tools provided by Kalpanaaa have allowed us to scale our inventory faster than ever. It's a game-changer for growing businesses.",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=11"
  },
  {
    id: 3,
    name: "Emma Richards",
    role: "VP of Operations",
    company: "Global Logistics Inc.",
    content: "We were struggling with compliance and risk management across multiple regions. Kalpanaaa Finance's automated systems cleared up our audit trails entirely.",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: 4,
    name: "David Dubois",
    role: "Managing Director",
    company: "Dubois Wealth",
    content: "Their wealth management platforms are intuitive and powerful. Our advisors can now manage portfolios with a level of precision that was previously impossible.",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=8"
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "CEO",
    company: "Thompson Tech",
    content: "We've tried several financial platforms, but Kalpanaaa stands out for its elegant interface and deeply powerful analytics. Highly recommended.",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=9"
  },
  {
    id: 6,
    name: "Robert Fox",
    role: "Head of Growth",
    company: "Pioneer Startups",
    content: "Startup investment tracking used to be our biggest headache. Now, everything is centralized, transparent, and effortlessly easy to report to our board.",
    rating: 5,
    image: "https://i.pravatar.cc/150?img=12"
  }
];

const TestimonialsPage = () => {
  useEffect(() => {
    document.title = "Testimonials | Kalpanaaa Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full bg-[#FDFDFD] min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-[#12241F] pt-40 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,50 70,50 100,0 L100,100 Z" fill="#4E8B83" />
          </svg>
        </div>
        
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Star className="w-4 h-4 text-[#4E8B83] fill-[#4E8B83]" />
            <span className="text-white text-xs font-bold tracking-widest uppercase">Client Success Stories</span>
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Trusted by the <br />
            <span className="text-[#4E8B83]">visionaries.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl">
            Don't just take our word for it. Discover how Kalpanaaa Finance is driving growth and transforming businesses globally.
          </motion.p>
        </motion.div>
      </section>

      {/* FEATURED TESTIMONIAL */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="bg-[#F5F7F7] rounded-3xl p-10 md:p-16 relative overflow-hidden shadow-sm border border-gray-100">
            <Quote className="absolute -top-10 -right-10 w-48 h-48 text-[#4E8B83] opacity-5 rotate-12" />
            <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
              <div className="w-full lg:w-1/3">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white shadow-lg">
                  <img src="https://i.pravatar.cc/300?img=47" alt="Marcus Levin" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#4E8B83] fill-[#4E8B83]" />
                  ))}
                </div>
                <h3 className="text-2xl font-bold text-[#12241F]">Marcus Levin</h3>
                <p className="text-gray-500 font-medium">CEO at Zenith Enterprises</p>
              </div>
              <div className="w-full lg:w-2/3">
                <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#12241F] leading-tight mb-8">
                  "Kalpanaaa Finance didn't just provide us with software; they provided a strategic partnership that completely redefined our approach to global capital management."
                </h4>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#4E8B83]" />
                    <span className="text-sm font-bold text-gray-700">Verified Client</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="text-sm text-gray-500">Enterprise Digital Finance Plan</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* GRID SECTION */}
      <section className="pb-24 bg-[#FDFDFD]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#12241F] mb-4">More from our partners</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We're proud to support a diverse ecosystem of startups, enterprises, and financial institutions.</p>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <motion.div variants={fadeInUp} key={t.id} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative">
                <Quote className="absolute top-8 right-8 w-8 h-8 text-gray-100 group-hover:text-[#4E8B83]/20 transition-colors" />
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#4E8B83] fill-[#4E8B83]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 leading-relaxed relative z-10">
                  "{t.content}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-[#12241F] text-sm">{t.name}</h4>
                    <p className="text-xs text-gray-500">{t.role}, {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default TestimonialsPage;
