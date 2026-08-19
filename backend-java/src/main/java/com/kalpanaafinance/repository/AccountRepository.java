package com.kalpanaafinance.repository;

import com.kalpanaafinance.entity.Account;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserEmail(String email);
    Optional<Account> findByUserIdAndType(Long userId, String type);

    @Query("SELECT a FROM Account a WHERE a.user.id = :userId AND a.type = :type")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Account> findByUserIdAndTypeForUpdate(@Param("userId") Long userId, @Param("type") String type);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Account a SET a.balance = a.balance - :amount WHERE a.user.id = :userId AND a.type = 'WALLET' AND a.balance >= :amount")
    int atomicDebitBalanceChecked(@Param("userId") Long userId, @Param("amount") BigDecimal amount);

    @Modifying
    @Query("UPDATE Account a SET a.balance = a.balance - :amount WHERE a.user.id = :userId AND a.type = 'WALLET'")
    int atomicDebitBalance(@Param("userId") Long userId, @Param("amount") BigDecimal amount);

    @Modifying
    @Query("UPDATE Account a SET a.balance = a.balance + :amount WHERE a.user.id = :userId AND a.type = 'WALLET'")
    int atomicCreditBalance(@Param("userId") Long userId, @Param("amount") BigDecimal amount);

    @Modifying
    @Query("UPDATE Account a SET a.balance = a.balance - :amount WHERE a.user.id = :userId AND a.type = :type")
    int decrementAccountBalance(@Param("userId") Long userId, @Param("type") String type, @Param("amount") BigDecimal amount);

    @Modifying
    @Query("UPDATE Account a SET a.balance = a.balance + :amount WHERE a.user.id = :userId AND a.type = :type")
    int incrementAccountBalance(@Param("userId") Long userId, @Param("type") String type, @Param("amount") BigDecimal amount);
}
