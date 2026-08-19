import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, BarChart3, Shield, Zap, Globe, Clock, ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    image: "/hero-bg.jpg?v=2",
    subtitle: "Kalpanaa Finance",
    title: "Building the Digital Future of Finance",
    desc: "Secure, scalable digital finance platforms designed for modern financial operations. We simplify workflows and automate operations."
  },
  {
    image: "/hero-bg.jpg?v=2",
    subtitle: "GLOBAL REACH",
    title: "Empowering Your Business Without Borders.",
    desc: "Manage multiple entities, currencies, and regulatory requirements across different regions from a single unified platform."
  },
  {
    image: "/hero-bg.jpg?v=2",
    subtitle: "SMART ANALYTICS",
    title: "Data-Driven Decisions For Modern Teams.",
    desc: "Gain deep insights into your financial health with customizable dashboards, real-time reporting, and predictive modeling."
  }
];

function AnimatedCounter({ end, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const endVal = parseFloat(end);
          if (start === endVal) return;
          let startTime = null;

          const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // ease out quad
            const easeProgress = progress * (2 - progress);
            setCount(easeProgress * endVal);
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  const isDecimal = end.toString().includes('.');
  return <span ref={ref}>{isDecimal ? count.toFixed(1) : Math.floor(count)}</span>;
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Scroll animations effect
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('scroll-animate')) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.style.opacity = '1';
          }
          if (entry.target.classList.contains('scroll-animate-width')) {
            const targetWidth = entry.target.getAttribute('data-width');
            entry.target.style.width = targetWidth;
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.scroll-animate, .scroll-animate-width').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="flex flex-col">
      {/* Hero Slider Section */}
      <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-secondary-dark">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Background Image with slight zoom animation on active */}
            <div 
              className={`absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              {/* The teal/sage overlay layer requested */}
              <div className="absolute inset-0 bg-primary/75 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-secondary-dark/40"></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full h-full flex flex-col justify-center mt-12">
              <div className="max-w-3xl">
                <h3 className={`text-white/90 font-bold tracking-widest text-xs md:text-sm uppercase mb-4 transition-all duration-700 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  {slide.subtitle}
                </h3>
                <h1 className={`text-5xl md:text-6xl lg:text-[72px] font-bold text-white tracking-tight mb-6 leading-[1.1] transition-all duration-700 delay-100 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  {slide.title}
                </h1>
                <p className={`text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl transition-all duration-700 delay-200 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  {slide.desc}
                </p>
                <div className={`flex flex-wrap gap-4 transition-all duration-700 delay-300 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  <Link to="/contact" className="group inline-flex items-center justify-center px-8 py-3.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-full transition-all duration-300 ease-in-out uppercase tracking-wider">
                    Talk to Our Experts
                    <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link to="/solutions" className="group inline-flex items-center justify-center px-8 py-3.5 text-xs font-bold text-white bg-transparent border-2 border-white hover:bg-white hover:text-primary rounded-full transition-all duration-300 ease-in-out uppercase tracking-wider">
                    Explore Solutions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
          <button onClick={prevSlide} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextSlide} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Elements: Review Badge & Scroll to explore */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-32 flex items-end pb-8">
            
            {/* Center Arch / Reviews */}
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-64 h-32 overflow-hidden flex flex-col items-center justify-end pb-6 pointer-events-auto">
              <div className="absolute bottom-0 w-64 h-64 rounded-full border border-white/20"></div>
              <div className="absolute top-2 w-2 h-2 bg-white rounded-full"></div>
              <div className="relative z-10 text-center">
                <span className="block text-4xl font-bold text-white mb-2 leading-none">4.5+</span>
                <span className="block text-[9px] font-bold tracking-widest text-white/80 uppercase">Based on 1,200 Reviews</span>
              </div>
            </div>

            {/* Bottom Right: Scroll to explore */}
            <div className="absolute right-4 sm:right-8 bottom-0 bg-white/10 backdrop-blur-md border-t border-l border-white/20 p-6 rounded-tl-xl flex items-center gap-4 pointer-events-auto cursor-pointer hover:bg-white/20 transition-colors" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth'})}>
              <ArrowDown className="w-5 h-5 text-white animate-bounce" />
              <span className="text-[10px] font-bold tracking-widest text-white uppercase leading-tight">Scroll to<br/>Explore</span>
            </div>
          </div>
        </div>

      </section>

      {/* Stats Section with Counters */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
            <div className="scroll-animate opacity-0" style={{ animationDelay: '0ms' }}>
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center">
                <AnimatedCounter end={15} />+
              </div>
              <div className="text-sm font-bold tracking-widest text-slate-500 uppercase">Years Experience</div>
            </div>
            <div className="scroll-animate opacity-0" style={{ animationDelay: '100ms' }}>
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center">
                <AnimatedCounter end={98} />%
              </div>
              <div className="text-sm font-bold tracking-widest text-slate-500 uppercase">Success Rate</div>
            </div>
            <div className="scroll-animate opacity-0" style={{ animationDelay: '200ms' }}>
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center">
                $<AnimatedCounter end={2.5} />B
              </div>
              <div className="text-sm font-bold tracking-widest text-slate-500 uppercase">Assets Managed</div>
            </div>
            <div className="scroll-animate opacity-0" style={{ animationDelay: '300ms' }}>
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center">
                <AnimatedCounter end={250} />+
              </div>
              <div className="text-sm font-bold tracking-widest text-slate-500 uppercase">Global Experts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 scroll-animate opacity-0" style={{ animationDelay: '0ms' }}>
            <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Core Capabilities</h2>
            <p className="text-3xl md:text-5xl font-bold text-text-heading mb-6">Everything you need to manage your finances</p>
            <p className="text-lg text-text-muted leading-relaxed">Powerful tools designed to simplify complex financial workflows and provide actionable insights in real-time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BarChart3, title: "Advanced Analytics", desc: "Gain deep insights into your financial health with customizable dashboards, real-time reporting, and predictive modeling." },
              { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption, multi-factor authentication, and comprehensive audit trails keep your sensitive financial data protected." },
              { icon: Zap, title: "Automated Workflows", desc: "Streamline repetitive tasks like invoicing, reconciliation, and payroll with smart, rule-based automation engines." },
              { icon: Globe, title: "Global Operations", desc: "Manage multiple entities, currencies, and regulatory requirements across different regions from a single platform." },
              { icon: Clock, title: "Real-time Processing", desc: "Experience instant transaction processing and settlement, eliminating delays in your financial supply chain." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-background-white rounded-2xl p-8 border border-border-subtle hover:border-primary-light hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out group scroll-animate opacity-0" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="w-14 h-14 bg-background-light rounded-xl flex items-center justify-center shadow-sm border border-border-subtle mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary overflow-hidden relative">
                  <feature.icon className="h-7 w-7 transform group-hover:scale-110 transition-transform duration-300 relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-text-heading mb-3">{feature.title}</h3>
                <p className="text-text-body leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills / Progress Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="scroll-animate opacity-0">
             <h2 className="text-primary-light font-bold tracking-widest uppercase text-sm mb-4">Our Expertise</h2>
             <p className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">We build financial structures that last</p>
             <p className="text-lg text-slate-600 leading-relaxed mb-8">Our proprietary platform handles billions in transactions securely, ensuring your financial ecosystem is resilient and fast.</p>
             <Link to="/about" className="group inline-flex items-center justify-center px-8 py-3.5 text-xs font-bold text-primary bg-slate-100 hover:bg-primary hover:text-white rounded-full transition-all duration-300 ease-in-out uppercase tracking-wider">
                Discover our methodology
                <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
          </div>
          <div className="flex flex-col gap-8 scroll-animate opacity-0" style={{ animationDelay: '200ms' }}>
             {[
               { label: 'Financial Modeling', pct: 95 },
               { label: 'Risk Assessment', pct: 88 },
               { label: 'Global Compliance', pct: 92 }
             ].map((skill, idx) => (
               <div key={idx}>
                 <div className="flex justify-between mb-2">
                   <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">{skill.label}</span>
                   <span className="text-sm font-bold text-primary"><AnimatedCounter end={skill.pct} />%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-primary-light h-full rounded-full transition-all duration-[2000ms] ease-out w-0 scroll-animate-width" data-width={`${skill.pct}%`}></div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-secondary-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 scroll-animate opacity-0">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">Ready to transform your financial operations?</h2>
          <p className="text-xl text-text-muted mb-10 max-w-2xl mx-auto">Join forward-thinking companies that rely on Kalpanaa Finance to power their global growth.</p>
          <Link to="/admin" className="group inline-flex items-center justify-center px-10 py-4 text-sm font-bold tracking-widest uppercase text-white bg-primary hover:bg-primary-hover rounded-full transition-all duration-300 shadow-xl">
            Get started today
            <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
