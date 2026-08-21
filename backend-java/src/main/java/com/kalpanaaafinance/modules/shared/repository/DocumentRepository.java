package com.kalpanaaafinance.modules.shared.repository;

import com.kalpanaaafinance.modules.shared.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    java.util.List<Document> findByUserId(Long userId);
}


