package com.kalpanaafinance.controller;

import com.kalpanaafinance.dto.SupportTicketResolutionRequest;
import com.kalpanaafinance.modules.shared.entity.SupportTicket;
import com.kalpanaafinance.service.SupportTicketService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/support/tickets")
@RequiredArgsConstructor
public class AdminSupportTicketController {
    private final SupportTicketService supportTicketService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        return ResponseEntity.ok(supportTicketService.getAllTicketsForAdmin());
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupportTicket> resolveTicket(
            @PathVariable Long id,
            @RequestBody SupportTicketResolutionRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(supportTicketService.resolveTicket(
                authentication.getName(),
                id,
                request,
                httpRequest.getRemoteAddr()
        ));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupportTicket> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(supportTicketService.updateTicketStatus(
                authentication.getName(),
                id,
                payload.get("status"),
                httpRequest.getRemoteAddr()
        ));
    }
}
