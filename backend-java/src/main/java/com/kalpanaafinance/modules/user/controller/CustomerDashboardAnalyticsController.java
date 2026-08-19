package com.kalpanaafinance.modules.user.controller;

import com.kalpanaafinance.modules.shared.dto.analytics.CustomerDashboardAnalyticsDTO;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.modules.user.service.CustomerDashboardAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/dashboard")
@RequiredArgsConstructor
public class CustomerDashboardAnalyticsController {

    private final CustomerDashboardAnalyticsService analyticsService;
    private final UserRepository userRepository;

    @GetMapping("/analytics")
    public ResponseEntity<CustomerDashboardAnalyticsDTO> getDashboardAnalytics(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found: " + authentication.getName()));

        CustomerDashboardAnalyticsDTO analytics = analyticsService.getCustomerDashboardAnalytics(user.getId());
        return ResponseEntity.ok(analytics);
    }
}
