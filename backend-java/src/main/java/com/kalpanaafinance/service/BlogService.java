package com.kalpanaafinance.service;

import com.kalpanaafinance.dto.BlogCategoryRequest;
import com.kalpanaafinance.dto.BlogRequest;
import com.kalpanaafinance.entity.Blog;
import com.kalpanaafinance.entity.BlogCategory;
import com.kalpanaafinance.entity.BlogType;
import com.kalpanaafinance.repository.BlogCategoryRepository;
import com.kalpanaafinance.repository.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BlogService {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private BlogCategoryRepository blogCategoryRepository;

    // Blog Category Methods
    public List<BlogCategory> getAllCategories() {
        return blogCategoryRepository.findAll();
    }
    
    public List<BlogCategory> getCategoriesByType(BlogType type) {
        return blogCategoryRepository.findByType(type);
    }

    public BlogCategory createCategory(BlogCategoryRequest request) {
        BlogCategory category = new BlogCategory();
        category.setName(request.getName());
        category.setType(request.getType());
        return blogCategoryRepository.save(category);
    }

    public BlogCategory updateCategory(Long id, BlogCategoryRequest request) {
        BlogCategory category = blogCategoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(request.getName());
        category.setType(request.getType());
        return blogCategoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        blogCategoryRepository.deleteById(id);
    }

    // Blog Methods
    public List<Blog> getAllBlogs() {
        return blogRepository.findAll();
    }

    public List<Blog> getBlogsByType(BlogType type) {
        return blogRepository.findByTypeOrderByDateDesc(type);
    }

    public Blog getBlogById(Long id) {
        return blogRepository.findById(id).orElseThrow(() -> new RuntimeException("Blog not found"));
    }

    public Blog createBlog(BlogRequest request) {
        Blog blog = new Blog();
        return saveBlogFromRequest(blog, request);
    }

    public Blog updateBlog(Long id, BlogRequest request) {
        Blog blog = getBlogById(id);
        return saveBlogFromRequest(blog, request);
    }

    public void deleteBlog(Long id) {
        blogRepository.deleteById(id);
    }

    private Blog saveBlogFromRequest(Blog blog, BlogRequest request) {
        BlogCategory category = blogCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        blog.setTitle(request.getTitle());
        blog.setExcerpt(request.getExcerpt());
        blog.setContent(request.getContent());
        blog.setImageUrl(request.getImageUrl());
        if (request.getDate() != null) {
            blog.setDate(request.getDate());
        }
        blog.setCategory(category);
        blog.setType(request.getType());
        
        return blogRepository.save(blog);
    }
}
