import React, { useState, useEffect } from 'react';
import BlogCategoryPage from './BlogCategoryPage';
import { companyUpdatesData } from '../../../data/blogData';
import { blogService } from '../../../services/blogService';

const CompanyUpdatesPage = () => {
  const [data, setData] = useState(companyUpdatesData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await blogService.getBlogsByType('COMPANY_UPDATES');
        
        // Merge static data with dynamic data
        const dynamicData = {
          ...companyUpdatesData,
          categories: response.categories.map(c => {
            const count = response.blogs.filter(b => b.category?.name === c.name).length;
            return { name: c.name, count: count, active: false };
          }),
          mainArticles: response.blogs.map(b => ({
            id: b.id,
            image: b.imageUrl,
            date: new Date(b.date || b.createdAt).toLocaleDateString(),
            category: b.category?.name,
            title: b.title,
            excerpt: b.excerpt
          })),
          sidebarArticles: response.blogs.slice(0,3).map(b => ({
             id: b.id,
             image: b.imageUrl,
             title: b.title,
             date: new Date(b.date || b.createdAt).toLocaleDateString()
          }))
        };
        // Add "All" to categories
        dynamicData.categories.unshift({ name: 'All Updates', count: response.blogs.length, active: true });
        
        setData(dynamicData);
      } catch (err) {
        console.error("Failed to fetch blogs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return <BlogCategoryPage data={data} />;
};

export default CompanyUpdatesPage;
