package com.kalpanaafinance.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDTO {
    private Long id;
    private String customerId;
    private String name;
    private String username;
    private String email;
    private String phone;
    private String accountStatus;
    private Boolean isVerified;
    private BigDecimal balance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastUsernameChangedAt;
    private Integer tokenVersion;
    private List<String> lockReasons;
    private String role;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getLastUsernameChangedAt() { return lastUsernameChangedAt; }
    public void setLastUsernameChangedAt(LocalDateTime lastUsernameChangedAt) { this.lastUsernameChangedAt = lastUsernameChangedAt; }

    public Integer getTokenVersion() { return tokenVersion; }
    public void setTokenVersion(Integer tokenVersion) { this.tokenVersion = tokenVersion; }

    public List<String> getLockReasons() { return lockReasons; }
    public void setLockReasons(List<String> lockReasons) { this.lockReasons = lockReasons; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
