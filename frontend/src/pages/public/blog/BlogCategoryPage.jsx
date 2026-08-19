import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ChevronRight } from 'lucide-react';

const BlogCategoryPage = ({ data }) => {
  const { title, category, description, heroImage, categories, mainArticles, sidebarTitle, sidebarArticles, viewAllLink, viewAllText } = data;

  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || 'All');

  // Ensure 'All' category is selected by default if data changes
  useEffect(() => {
    if (categories && categories.length > 0) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories]);

  const filteredArticles = mainArticles.filter(article => {
    if (selectedCategory.startsWith('All')) return true;
    return article.category === selectedCategory;
  });

  return (
    <div className="font-sans bg-[#FDFDFD] min-h-screen pb-20">
      
      {/* Breadcrumbs */}
      <div className="pt-28 pb-8 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Link to="/" className="hover:text-gray-800 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Blog</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-[#12241F] font-bold">{title}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/3 w-full shrink-0">
            <p className="text-[#4E8B83] font-bold tracking-wider text-xs uppercase mb-4">BLOG</p>
            <h1 className="text-5xl lg:text-[56px] font-extrabold text-[#12241F] leading-[1.1] mb-6">
              {title}
            </h1>
            <p className="text-gray-600 text-[15px] leading-relaxed max-w-sm">
              {description}
            </p>
          </div>
          
          <div className="lg:w-2/3 w-full">
            <div className="rounded-2xl overflow-hidden shadow-lg h-[240px] md:h-[320px] w-full">
              <img 
                src={heroImage} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-10">
        <div className="w-full md:max-w-[400px]">
          <div className="relative flex items-center w-full h-12 rounded-full bg-white border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid place-items-center h-full w-12 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              className="peer h-full w-full outline-none text-sm text-gray-700 bg-transparent pr-4"
              type="text"
              id="search"
              placeholder={`Search ${title.toLowerCase()}...`}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar: Categories */}
          <div className="w-full lg:w-[240px] shrink-0 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[#12241F] mb-6">Categories</h3>
            <ul className="space-y-2">
              {categories.map((cat, idx) => {
                const isActive = cat.name === selectedCategory;
                return (
                  <li key={idx}>
                    <button 
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-[#4E8B83]/10 text-[#4E8B83] font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}
                    >
                      <span>{cat.name}</span>
                      <span className={isActive ? 'text-[#4E8B83]' : 'text-gray-400'}>{cat.count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Middle: Article Cards */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredArticles.length > 0 ? (
              filteredArticles.map(article => (
              <div key={article.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                <div className="h-48 overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span>{article.date}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{article.category}</span>
                  </div>
                  <h3 className="text-[17px] font-bold text-[#12241F] mb-3 leading-snug group-hover:text-[#4E8B83] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                    {article.excerpt}
                  </p>

                </div>
              </div>
            ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500">
                No articles found in this category.
              </div>
            )}
          </div>

          {/* Right Sidebar: Popular/Recent */}
          <div className="w-full lg:w-[280px] shrink-0 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[#12241F] mb-6">{sidebarTitle}</h3>
            <div className="space-y-5 mb-8">
              {sidebarArticles.map(item => (
                <Link key={item.id} to={`/blog/article/${item.id}`} className="flex gap-4 group">
                  <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-[13px] font-bold text-[#12241F] leading-tight mb-1 group-hover:text-[#4E8B83] transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-gray-500">{item.date}</span>
                  </div>
                </Link>
              ))}
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

export default BlogCategoryPage;
