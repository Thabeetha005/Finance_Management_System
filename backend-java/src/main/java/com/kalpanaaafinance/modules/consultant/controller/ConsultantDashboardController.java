package com.kalpanaaafinance.modules.consultant.controller;

import com.kalpanaaafinance.modules.consultant.service.ConsultantService;

import com.kalpanaaafinance.modules.shared.entity.ConsultantProfile;
import com.kalpanaaafinance.modules.shared.entity.ConsultationSession;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.ConsultantProfileRepository;
import com.kalpanaaafinance.modules.shared.repository.ConsultationSessionRepository;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/consultant/dashboard")
@PreAuthorize("hasRole('CONSULTANT')")
@RequiredArgsConstructor
public class ConsultantDashboardController {

    private final UserRepository userRepository;
    private final ConsultantProfileRepository profileRepository;
    private final ConsultationSessionRepository sessionRepository;
    private final com.kalpanaaafinance.modules.consultant.service.ConsultantService consultantService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        ConsultantProfile profile = profileRepository.findByUserId(user.getId()).orElseThrow();
        
        List<ConsultationSession> allSessions = sessionRepository.findByAssignmentConsultantId(profile.getId());
        
        long totalSessions = allSessions.size();
        long completedSessions = allSessions.stream().filter(s -> "COMPLETED".equals(s.getStatus())).count();
        long upcomingSessions = allSessions.stream().filter(s -> "SCHEDULED".equals(s.getStatus()) || "ACCEPTED".equals(s.getStatus())).count();
        long pendingReports = allSessions.stream().filter(s -> !"COMPLETED".equals(s.getStatus())).count();
        long todaysSessions = upcomingSessions;
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSessions", totalSessions);
        stats.put("completedSessions", completedSessions);
        stats.put("upcomingSessions", upcomingSessions);
        stats.put("pendingReports", pendingReports);
        stats.put("todaysSessions", todaysSessions);
        
        Map<String, Object> response = new HashMap<>();
        response.put("stats", stats);
        response.put("profile", profile);
        response.put("upcoming", allSessions.stream().filter(s -> s.getStatus().equals("SCHEDULED")).collect(Collectors.toList()));
        response.put("recent", allSessions.stream().filter(s -> s.getStatus().equals("COMPLETED")).collect(Collectors.toList()));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<ConsultantProfile> getProfileDetails(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        ConsultantProfile profile = profileRepository.findByUserId(user.getId()).orElseThrow();
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<ConsultantProfile> updateProfile(Authentication authentication, @RequestBody Map<String, Object> updates) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        ConsultantProfile profile = profileRepository.findByUserId(user.getId()).orElseThrow();
        
        if (updates.containsKey("status")) {
            profile.setStatus((String) updates.get("status"));
        }
        if (updates.containsKey("workingDays")) {
            profile.setWorkingDays((String) updates.get("workingDays"));
        }
        if (updates.containsKey("workingHoursStart")) {
            profile.setWorkingHoursStart((String) updates.get("workingHoursStart"));
        }
        if (updates.containsKey("workingHoursEnd")) {
            profile.setWorkingHoursEnd((String) updates.get("workingHoursEnd"));
        }
        
        return ResponseEntity.ok(profileRepository.save(profile));
    }

    @GetMapping("/termination-status")
    public ResponseEntity<Map<String, Object>> getTerminationStatus(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        ConsultantProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);

        boolean isPending = "PENDING_TERMINATION".equalsIgnoreCase(user.getAccountStatus()) || 
                            (profile != null && "PENDING_TERMINATION".equalsIgnoreCase(profile.getStatus()));

        Map<String, Object> map = new HashMap<>();
        map.put("isPendingTermination", isPending);
        map.put("reason", profile != null ? profile.getTerminationReason() : "Account scheduled for termination by Admin");
        map.put("consultantName", user.getName());
        return ResponseEntity.ok(map);
    }

    @PostMapping("/confirm-termination")
    public ResponseEntity<Map<String, Object>> confirmTermination(
            Authentication authentication,
            jakarta.servlet.http.HttpServletRequest httpRequest) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        String clientIp = httpRequest != null ? httpRequest.getRemoteAddr() : "127.0.0.1";

        consultantService.confirmTerminationAndPurge(user.getId(), clientIp);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Account deactivation acknowledged and permanently terminated.");
        return ResponseEntity.ok(res);
    }
}
