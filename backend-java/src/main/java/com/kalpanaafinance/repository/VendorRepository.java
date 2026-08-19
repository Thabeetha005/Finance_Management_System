package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByUserEmail(String email);
}
