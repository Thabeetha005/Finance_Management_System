import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { 
  Search, Calendar, Clock, ChevronRight, ArrowRight, 
  Tag, TrendingUp, Newspaper, Building2, BookOpen, Share2, Eye
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const tabTypes = [
  { id: 'LATEST_NEWS', label: 'Latest News', icon: Newspaper, path: '/blog/latest-news' },
  { id: 'FINANCIAL_INSIGHTS', label: 'Financial Insights', icon: TrendingUp, path: '/blog/financial-insights' },
  { id: 'COMPANY_UPDATES', label: 'Company Updates', icon: Building2, path: '/blog/company-updates' }
];

const BlogLandingPage = ({ initialType = 'LATEST_NEWS' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active type from location or prop
  const getActiveTab = () => {
    if (location.pathname.includes('financial-insights')) return 'FINANCIAL_INSIGHTS';
    if (location.pathname.includes('company-updates')) return 'COMPANY_UPDATES';
    if (location.pathname.includes('latest-news')) return 'LATEST_NEWS';
    return initialType;
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setActiveTab(getActiveTab());
    setSelectedCategory('ALL');
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Fetch blogs from API with fallback mock data
  const { data, isLoading } = useQuery({
    queryKey: ['publicBlogs', activeTab],
    queryFn: async () => {
      const res = await api.get(`/public/blogs/${activeTab}`);
      return res.data;
    }
  });

  const blogs = data?.blogs || [];
  const categories = data?.categories || [];

  // Filter blogs by category and search term
  const filteredBlogs = blogs.filter(blog => {
    const matchesCat = selectedCategory === 'ALL' || blog.category?.name === selectedCategory;
    const matchesSearch = !searchQuery || 
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const heroPost = filteredBlogs[0];
  const gridPosts = filteredBlogs.slice(1);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col w-full overflow-clip bg-white min-h-screen">
      
      {/* ══════════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════════ */}
      <section 
        className="relative pt-44 pb-28 w-full bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/hero-bg-2.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#12241F]/90 z-[1]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#12241F] to-transparent z-[1] opacity-70"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-3xl flex flex-col items-start">
            
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3">
              KALPANAAA INSIGHTS & JOURNAL
            </span>

            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
              Financial News & Intelligence
            </h1>
            
            <p className="text-gray-300 text-base md:text-lg mb-8 max-w-2xl font-light">
              Stay ahead with market trends, wealth management strategies, regulatory updates, and corporate milestones.
            </p>

            {/* Breadcrumb */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-xs font-medium text-white/80 tracking-wide">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-white/50" />
              <span className="text-white font-semibold">
                {activeTab === 'LATEST_NEWS' ? 'Latest News' : activeTab === 'FINANCIAL_INSIGHTS' ? 'Financial Insights' : 'Company Updates'}
              </span>
            </div>
            
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TAB NAVIGATION & SEARCH BAR
      ══════════════════════════════════════════════ */}
      <section className="border-b border-gray-100 bg-gray-50/50 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {tabTypes.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(tab.path);
                  }}
                  className={`
                    px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap
                    ${isActive 
                      ? 'bg-[#106354] text-white shadow-md shadow-[#106354]/20' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#106354] transition-all"
            />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CATEGORY FILTERS & MAIN CONTENT
      ══════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-6 mb-8 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Filter:</span>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#12241F] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-[#12241F] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Loading Spinner */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin w-10 h-10 border-4 border-[#106354] border-t-transparent rounded-full"></div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No articles found</h3>
              <p className="text-xs text-gray-500 mt-1">Try selecting a different category or clearing your search.</p>
            </div>
          ) : (
            <div className="space-y-16">
              
              {/* ── SPOTLIGHT HERO ARTICLE ── */}
              {heroPost && (
                <motion.div 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeInUp}
                  onClick={() => navigate(`/blog/post/${heroPost.id}`)}
                  className="group cursor-pointer bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 grid grid-cols-1 lg:grid-cols-12"
                >
                  <div className="lg:col-span-7 h-80 lg:h-[420px] overflow-hidden relative">
                    <img 
                      src={heroPost.imageUrl || '/service-digital-finance.jpg'} 
                      alt={heroPost.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-[#106354] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Featured
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 mb-3">
                        <span className="bg-[#106354]/10 text-[#106354] px-2.5 py-0.5 rounded-full font-bold">
                          {heroPost.category?.name || activeTab.replace('_', ' ')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(heroPost.date || heroPost.createdAt)}
                        </span>
                      </div>

                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-4 group-hover:text-[#106354] transition-colors">
                        {heroPost.title}
                      </h2>

                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6 font-normal">
                        {heroPost.excerpt || heroPost.content?.replace(/<[^>]*>?/gm, '').substring(0, 160)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-[#106354] group-hover:translate-x-1 transition-transform">
                      <span>Read Full Article</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── ARTICLES GRID ── */}
              {gridPosts.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-3">
                    Recent Articles
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gridPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        onClick={() => navigate(`/blog/post/${post.id}`)}
                        className="group cursor-pointer bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
                      >
                        <div>
                          <div className="h-48 w-full overflow-hidden relative">
                            <img 
                              src={post.imageUrl || '/service-digital-finance.jpg'} 
                              alt={post.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {post.category && (
                              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-gray-200">
                                {post.category.name}
                              </div>
                            )}
                          </div>

                          <div className="p-6">
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formatDate(post.date || post.createdAt)}</span>
                            </div>

                            <h4 className="text-lg font-bold text-gray-900 leading-snug mb-3 group-hover:text-[#106354] transition-colors line-clamp-2">
                              {post.title}
                            </h4>

                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                              {post.excerpt || post.content?.replace(/<[^>]*>?/gm, '').substring(0, 120)}
                            </p>
                          </div>
                        </div>

                        <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-gray-50 text-xs font-bold text-[#106354]">
                          <span>Read Article</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </section>
    </div>
  );
};

export default BlogLandingPage;
