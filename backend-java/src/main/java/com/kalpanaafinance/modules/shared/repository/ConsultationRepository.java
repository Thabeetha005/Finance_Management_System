package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    List<Consultation> findByUserId(Long userId);

    // Eagerly load user to avoid lazy-loading serialization failures
    @Query("SELECT c FROM Consultation c JOIN FETCH c.user ORDER BY c.createdAt DESC")
    List<Consultation> findAllWithUser();

    @Query("SELECT c FROM Consultation c JOIN FETCH c.user WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<Consultation> findByUserIdWithUser(Long userId);
}
