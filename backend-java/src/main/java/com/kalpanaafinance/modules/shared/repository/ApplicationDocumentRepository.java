package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.ApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationDocumentRepository extends JpaRepository<ApplicationDocument, Long> {
    List<ApplicationDocument> findByApplicationIdAndApplicationType(Long applicationId, String applicationType);
    Optional<ApplicationDocument> findByApplicationIdAndApplicationTypeAndDocumentType(Long applicationId, String applicationType, String documentType);
}
