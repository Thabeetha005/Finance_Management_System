package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    java.util.List<Document> findByUserId(Long userId);
}


