import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { 
  Calendar, ArrowLeft, Share2, Tag, ChevronRight, User, BookOpen
} from 'lucide-react';

const BlogPostDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['publicBlogDetail', id],
    queryFn: async () => {
      const res = await api.get(`/public/blogs/post/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-24">
        <div className="animate-spin w-10 h-10 border-4 border-[#106354] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-24 px-6 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">The article you are looking for may have been moved or removed.</p>
        <button 
          onClick={() => navigate('/blog/latest-news')}
          className="px-6 py-3 bg-[#106354] text-white rounded-xl font-bold text-xs shadow-md"
        >
          Back to Journal
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-white min-h-screen">
      
      {/* Header Banner */}
      <section className="relative pt-44 pb-20 w-full bg-[#12241F] text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </button>

          <div className="flex items-center gap-3 text-xs font-semibold mb-4">
            <span className="bg-[#106354] text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {blog.category?.name || blog.type?.replace('_', ' ')}
            </span>
            <span className="text-white/40">•</span>
            <span className="flex items-center gap-1.5 text-white/70">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.date || blog.createdAt)}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight mb-6">
            {blog.title}
          </h1>

          <div className="flex items-center gap-3 pt-4 border-t border-white/10 text-xs text-white/70">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Kalpanaaa Editorial Team</p>
              <p className="text-[11px] text-white/50">Financial Market Intelligence</p>
            </div>
          </div>

        </div>
      </section>

      {/* Main Post Image & Article Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          
          {blog.imageUrl && (
            <div className="rounded-3xl overflow-hidden shadow-2xl mb-12 border border-gray-100 -mt-24 relative z-20">
              <img 
                src={blog.imageUrl} 
                alt={blog.title} 
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-lg md:text-xl font-medium text-gray-800 leading-relaxed mb-8 italic border-l-4 border-[#106354] pl-6 py-2 bg-gray-50 rounded-r-xl">
              "{blog.excerpt}"
            </p>
          )}

          {/* Article Body Content */}
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-normal space-y-6"
            dangerouslySetInnerHTML={{ __html: blog.content || `<p>${blog.excerpt || 'Article details.'}</p>` }}
          />

          {/* Footer Back & Share */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => navigate('/blog/latest-news')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Articles</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};

export default BlogPostDetailsPage;
