package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Blog;
import com.kalpanaafinance.entity.BlogType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findByTypeOrderByDateDesc(BlogType type);
    List<Blog> findByCategoryIdOrderByDateDesc(Long categoryId);
}
