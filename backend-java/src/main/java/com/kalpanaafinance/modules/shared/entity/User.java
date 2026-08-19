package com.kalpanaafinance.modules.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", unique = true)
    private String customerId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column
    private String phone;

    @Column(name = "account_status")
    private String accountStatus = "Active";

    @Column(name = "termination_reason", columnDefinition = "TEXT")
    private String terminationReason;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(unique = true)
    private String username;

    public String getUsernameHandle() {
        return username;
    }

    @Column(name = "last_username_changed_at")
    private LocalDateTime lastUsernameChangedAt;

    @Column(name = "token_version", nullable = false)
    @Builder.Default
    private Integer tokenVersion = 1;

    @Column(nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal balance = new BigDecimal("100000.00");

    @Column(name = "bonus_balance", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal bonusBalance = new BigDecimal("100000.00");

    @Column(name = "deposit_balance", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal depositBalance = BigDecimal.ZERO;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Loan> loans = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Investment> investments = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Document> documents = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SupportTicket> supportTickets = new ArrayList<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public Long getId() { return this.id; }
    public String getCustomerId() { return this.customerId; }
    public String getName() { return this.name; }
    public String getEmail() { return this.email; }
    public Role getRole() { return this.role; }
    public String getPhone() { return this.phone; }
    public String getAccountStatus() { return this.accountStatus; }
    public String getTerminationReason() { return this.terminationReason; }
    public Boolean getIsVerified() { return this.isVerified; }
    public BigDecimal getBalance() { return this.balance; }
    public BigDecimal getBonusBalance() { return this.bonusBalance; }
    public BigDecimal getDepositBalance() { return this.depositBalance; }
    public String getPasswordHash() { return this.passwordHash; }
    public LocalDateTime getLastUsernameChangedAt() { return this.lastUsernameChangedAt; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
    public LocalDateTime getUpdatedAt() { return this.updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setRole(Role role) { this.role = role; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
    public void setTerminationReason(String terminationReason) { this.terminationReason = terminationReason; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public void setUsername(String username) { this.username = username; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setLastUsernameChangedAt(LocalDateTime lastUsernameChangedAt) { this.lastUsernameChangedAt = lastUsernameChangedAt; }
    public Integer getTokenVersion() { return this.tokenVersion; }
    public void setTokenVersion(Integer tokenVersion) { this.tokenVersion = tokenVersion; }
}
