package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.ConsultationAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationAssignmentRepository extends JpaRepository<ConsultationAssignment, Long> {
    List<ConsultationAssignment> findByConsultantId(Long consultantId);
    Optional<ConsultationAssignment> findByConsultationId(Long consultationId);
    List<ConsultationAssignment> findByConsultantIdAndStatus(Long consultantId, String status);
}
