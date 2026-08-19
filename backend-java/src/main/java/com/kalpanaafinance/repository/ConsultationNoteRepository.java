package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.ConsultationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationNoteRepository extends JpaRepository<ConsultationNote, Long> {
    List<ConsultationNote> findBySessionId(Long sessionId);
}
