package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.ContactRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequest, Long> {
}

