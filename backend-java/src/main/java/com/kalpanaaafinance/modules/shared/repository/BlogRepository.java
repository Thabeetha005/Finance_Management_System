package com.kalpanaaafinance.modules.shared.repository;

import com.kalpanaaafinance.modules.shared.entity.Blog;
import com.kalpanaaafinance.modules.shared.entity.BlogType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findByTypeOrderByDateDesc(BlogType type);
    List<Blog> findByCategoryIdOrderByDateDesc(Long categoryId);
}
