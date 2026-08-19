package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.BlogCategory;
import com.kalpanaafinance.modules.shared.entity.BlogType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogCategoryRepository extends JpaRepository<BlogCategory, Long> {
    List<BlogCategory> findByType(BlogType type);
}
