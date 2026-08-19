import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/api/axios';
import { FileText, Plus, Edit, Trash2, X } from 'lucide-react';

const BlogManagement = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    title: '', type: 'LATEST_NEWS', categoryId: '', excerpt: '', content: '', imageUrl: ''
  });

  const { data: blogs = [], isLoading: blogsLoading } = useQuery({
    queryKey: ['adminBlogs'],
    queryFn: async () => {
      const res = await api.get('/admin/blogs');
      return res.data;
    }
  });

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['adminBlogCategories'],
    queryFn: async () => {
      const res = await api.get('/admin/blogs/categories');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newBlog) => await api.post('/admin/blogs', newBlog),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBlogs']);
      setShowForm(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => await api.put(`/admin/blogs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBlogs']);
      setShowForm(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/admin/blogs/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['adminBlogs'])
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', type: 'LATEST_NEWS', categoryId: '', excerpt: '', content: '', imageUrl: '' });
  };

  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title,
      type: blog.type || 'LATEST_NEWS',
      categoryId: blog.category?.id || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      imageUrl: blog.imageUrl || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredBlogs = (Array.isArray(blogs) ? blogs : []).filter(blog => {
    if (selectedCategory && blog.category?.id !== Number(selectedCategory)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
          <p className="text-gray-500 mt-1">Manage and publish blog posts</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-[#1E4A40] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#153a31] transition-colors"
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Blog</>}
        </button>
      </div>

      {!showForm && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search blog title..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1E4A40]/20 focus:border-[#1E4A40] text-gray-800 placeholder-gray-400 transition-shadow shadow-sm"
            />
          </div>
          <select 
            className="px-4 py-2.5 bg-[#1E4A40] text-white text-[13px] font-medium rounded-lg transition-colors shadow-sm outline-none cursor-pointer"
            value={selectedCategory}
            onChange={e => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {Array.isArray(categories) && categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Blog' : 'Create New Blog'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input required type="text" className="w-full p-2 border rounded-xl" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="url" className="w-full p-2 border rounded-xl" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select required className="w-full p-2 border rounded-xl" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="LATEST_NEWS">Latest News</option>
                <option value="FINANCIAL_INSIGHTS">Financial Insights</option>
                <option value="COMPANY_UPDATES">Company Updates</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select required className="w-full p-2 border rounded-xl" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                <option value="">Select Category</option>
                {Array.isArray(categories) && categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea required className="w-full p-2 border rounded-xl" rows={2} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea required className="w-full p-2 border rounded-xl" rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
          </div>
          <button 
            type="submit" 
            disabled={createMutation.isLoading || updateMutation.isLoading}
            className="bg-[#4E8B83] text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50"
          >
            {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save Blog'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-900 text-xs font-bold capitalize tracking-wider">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Published On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-[13px] divide-y divide-gray-100">
              {blogsLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : (Array.isArray(paginatedBlogs) && paginatedBlogs.length > 0) ? (
                paginatedBlogs.map(blog => (
                  <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {blog.imageUrl ? (
                        <img src={blog.imageUrl} alt={blog.title} className="w-12 h-8 object-cover rounded shadow-sm" />
                      ) : (
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800 line-clamp-1 max-w-[250px] mt-2">{blog.title}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">Admin</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{blog.category?.name || blog.type || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {new Date(blog.createdAt || blog.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#4E8B83]">
                        {blog.status || 'Published'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button className="text-gray-500 hover:text-gray-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button onClick={() => handleEdit(blog)} className="text-gray-500 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(blog.id)} 
                        disabled={deleteMutation.isLoading && deleteMutation.variables === blog.id}
                        className="text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">No blogs found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {totalPages > 0 && (
            <div className="p-4 border-t border-gray-100 flex justify-center">
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-gray-400 hover:bg-gray-50 rounded disabled:opacity-50"
                >&lt;</button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-[#1E4A40] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-50 rounded disabled:opacity-50"
                >&gt;</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogManagement;
