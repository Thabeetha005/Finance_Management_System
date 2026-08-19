package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.ConsultantAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ConsultantAvailabilityRepository extends JpaRepository<ConsultantAvailability, Long> {
    List<ConsultantAvailability> findByConsultantIdAndDateBetween(Long consultantId, LocalDate startDate, LocalDate endDate);
    List<ConsultantAvailability> findByDate(LocalDate date);
}
