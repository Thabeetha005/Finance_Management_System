package com.kalpanaafinance.modules.admin.controller;

import com.kalpanaafinance.modules.shared.dto.BlogCategoryRequest;
import com.kalpanaafinance.modules.shared.dto.BlogRequest;
import com.kalpanaafinance.modules.shared.entity.Blog;
import com.kalpanaafinance.modules.shared.entity.BlogCategory;
import com.kalpanaafinance.modules.shared.entity.BlogType;
import com.kalpanaafinance.modules.shared.service.BlogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/blogs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminBlogController {

    @Autowired
    private BlogService blogService;

    // --- BLOGS ---
    @GetMapping
    public ResponseEntity<List<Blog>> getAllBlogs() {
        return ResponseEntity.ok(blogService.getAllBlogs());
    }

    @PostMapping
    public ResponseEntity<Blog> createBlog(@Valid @RequestBody BlogRequest request) {
        return ResponseEntity.ok(blogService.createBlog(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Blog> updateBlog(@PathVariable Long id, @Valid @RequestBody BlogRequest request) {
        return ResponseEntity.ok(blogService.updateBlog(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlog(@PathVariable Long id) {
        blogService.deleteBlog(id);
        return ResponseEntity.ok().build();
    }

    // --- CATEGORIES ---
    @GetMapping("/categories")
    public ResponseEntity<List<BlogCategory>> getAllCategories() {
        return ResponseEntity.ok(blogService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<BlogCategory> createCategory(@Valid @RequestBody BlogCategoryRequest request) {
        return ResponseEntity.ok(blogService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<BlogCategory> updateCategory(@PathVariable Long id, @Valid @RequestBody BlogCategoryRequest request) {
        return ResponseEntity.ok(blogService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        blogService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
