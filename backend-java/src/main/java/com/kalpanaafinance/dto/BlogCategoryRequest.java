package com.kalpanaafinance.dto;

import com.kalpanaafinance.entity.BlogType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BlogCategoryRequest {
    @NotBlank
    private String name;
    
    @NotNull
    private BlogType type;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BlogType getType() { return type; }
    public void setType(BlogType type) { this.type = type; }
}
