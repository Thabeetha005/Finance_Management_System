package com.kalpanaaafinance.modules.shared.repository;

import com.kalpanaaafinance.modules.shared.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
}
