package com.kalpanaaafinance.modules.shared.repository;

import com.kalpanaaafinance.modules.shared.entity.ConsultationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationSessionRepository extends JpaRepository<ConsultationSession, Long> {
    List<ConsultationSession> findByAssignmentConsultantId(Long consultantId);
    java.util.Optional<ConsultationSession> findByAssignmentId(Long assignmentId);
}
