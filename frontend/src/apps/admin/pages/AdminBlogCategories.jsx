import React, { useEffect, useState } from 'react';
import { blogService } from '../../../services/blogService';
import { Tags, Plus, Edit, Trash2 } from 'lucide-react';

const AdminBlogCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'LATEST_NEWS'
  });

  const fetchCategories = async () => {
    try {
      const data = await blogService.getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', type: 'LATEST_NEWS' });
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name || '', type: category.type || 'LATEST_NEWS' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await blogService.updateCategory(editingId, formData);
      } else {
        await blogService.createCategory(formData);
      }
      setShowForm(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(editingId ? "Failed to update category" : "Failed to create category");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await blogService.deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete category");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Categories</h1>
          <p className="text-gray-500 mt-1">Manage categories for different blog types.</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-[#4E8B83] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3d6f69] transition-colors"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Category</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold mb-2">{editingId ? 'Edit Category' : 'Create New Category'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required type="text" className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select required className="w-full p-2 border rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="LATEST_NEWS">Latest News</option>
                <option value="FINANCIAL_INSIGHTS">Financial Insights</option>
                <option value="COMPANY_UPDATES">Company Updates</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#4E8B83] text-white px-4 py-2 rounded-lg font-medium">
              {editingId ? 'Update Category' : 'Save Category'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { resetForm(); setShowForm(false); }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Blog Type</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-10"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : categories.length > 0 ? (
                categories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{category.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {category.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(category)} className="text-gray-400 hover:text-blue-600 transition-colors p-1" title="Edit Category">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(category.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1" title="Delete Category">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Tags className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">No categories found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogCategories;
