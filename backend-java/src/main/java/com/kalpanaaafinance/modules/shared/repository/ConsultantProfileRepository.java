package com.kalpanaaafinance.modules.shared.repository;

import com.kalpanaaafinance.modules.shared.entity.ConsultantProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsultantProfileRepository extends JpaRepository<ConsultantProfile, Long> {
    Optional<ConsultantProfile> findByUserId(Long userId);
    Optional<ConsultantProfile> findByUser_NameIgnoreCase(String name);
}
