package com.kalpanaaafinance.modules.shared.dto;

import com.kalpanaaafinance.modules.shared.entity.BlogType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class BlogRequest {
    @NotBlank
    private String title;
    private String excerpt;
    private String content;
    private String imageUrl;
    private LocalDate date;
    
    @NotNull
    private Long categoryId;
    
    @NotNull
    private BlogType type;

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public BlogType getType() { return type; }
    public void setType(BlogType type) { this.type = type; }
}
