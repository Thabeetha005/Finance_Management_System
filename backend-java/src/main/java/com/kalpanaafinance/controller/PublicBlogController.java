package com.kalpanaafinance.controller;

import com.kalpanaafinance.modules.shared.entity.Blog;
import com.kalpanaafinance.modules.shared.entity.BlogCategory;
import com.kalpanaafinance.modules.shared.entity.BlogType;
import com.kalpanaafinance.modules.shared.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/blogs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PublicBlogController {

    @Autowired
    private BlogService blogService;

    @GetMapping("/{type}")
    public ResponseEntity<Map<String, Object>> getBlogsByType(@PathVariable BlogType type) {
        List<BlogCategory> categories = blogService.getCategoriesByType(type);
        List<Blog> blogs = blogService.getBlogsByType(type);
        
        Map<String, Object> response = new HashMap<>();
        response.put("categories", categories);
        response.put("blogs", blogs);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/post/{id}")
    public ResponseEntity<Blog> getBlogById(@PathVariable Long id) {
        return ResponseEntity.ok(blogService.getBlogById(id));
    }
}
