package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    java.util.List<ActivityLog> findByUserId(Long userId);
}


