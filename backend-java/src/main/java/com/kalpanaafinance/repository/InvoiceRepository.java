package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    java.util.List<Invoice> findByUserEmail(String email);
}
