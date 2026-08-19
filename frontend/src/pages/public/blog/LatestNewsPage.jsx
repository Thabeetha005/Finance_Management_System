import React, { useState, useEffect } from 'react';
import BlogCategoryPage from './BlogCategoryPage';
import { latestNewsData } from '../../../data/blogData';
import { blogService } from '../../../services/blogService';

const LatestNewsPage = () => {
  const [data, setData] = useState(latestNewsData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await blogService.getBlogsByType('LATEST_NEWS');
        
        // Merge static data with dynamic data
        const dynamicData = {
          ...latestNewsData,
          categories: response.categories.map(c => {
            const count = response.blogs.filter(b => b.category?.name === c.name).length;
            return { name: c.name, count: count, active: false };
          }),          mainArticles: response.blogs.map(b => ({
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
        
        // Use the first blog's image as the header hero image
        if (response.blogs.length > 0 && response.blogs[0].imageUrl) {
          dynamicData.heroImage = response.blogs[0].imageUrl;
        }
        // Add "All" to categories
        dynamicData.categories.unshift({ name: 'All News', count: response.blogs.length, active: true });
        
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

export default LatestNewsPage;
