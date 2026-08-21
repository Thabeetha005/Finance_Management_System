package com.kalpanaaafinance.modules.shared.controller;

import com.kalpanaaafinance.modules.shared.entity.Announcement;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.AnnouncementRepository;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    // PUBLIC/CUSTOMER ENDPOINT
    @GetMapping("/announcements/active")
    public ResponseEntity<List<Announcement>> getActiveAnnouncements() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        List<Announcement> announcements = announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        if (user != null && user.getCreatedAt() != null) {
            announcements = announcements.stream()
                .filter(a -> a.getCreatedAt() == null || a.getCreatedAt().isAfter(user.getCreatedAt()))
                .toList();
        }
        return ResponseEntity.ok(announcements);
    }

    // ADMIN ENDPOINTS
    @GetMapping("/admin/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/admin/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createAnnouncement(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String content = payload.get("content");

        if (title == null || title.trim().isEmpty() || content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Title and content are required");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Admin not found"));

        Announcement announcement = Announcement.builder()
                .title(title)
                .content(content)
                .isActive(true)
                .createdByAdmin(admin)
                .build();

        return ResponseEntity.ok(announcementRepository.save(announcement));
    }

    @DeleteMapping("/admin/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateAnnouncement(@PathVariable Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        
        announcement.setIsActive(false);
        announcementRepository.save(announcement);
        return ResponseEntity.ok(Map.of("message", "Announcement deactivated successfully"));
    }
}
