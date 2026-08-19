package com.kalpanaafinance.controller;

import com.kalpanaafinance.entity.Message;
import com.kalpanaafinance.entity.User;
import com.kalpanaafinance.repository.MessageRepository;
import com.kalpanaafinance.repository.UserRepository;
import com.kalpanaafinance.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminMessageController {

    private final MessageRepository messageRepository;
    private final MessageService messageService;
    private final UserRepository userRepository;

    @GetMapping("/{userId}/messages")
    public ResponseEntity<List<Message>> getUserMessages(@PathVariable Long userId) {
        return ResponseEntity.ok(messageRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping("/{userId}/messages")
    public ResponseEntity<Message> sendMessageToUser(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin == null) return ResponseEntity.status(401).build();

        String subject = payload.get("subject");
        String content = payload.get("message");

        Message message = messageService.sendAdminMessage(userId, admin.getId(), subject, content);
        return ResponseEntity.ok(message);
    }
}
