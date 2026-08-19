package com.kalpanaafinance.modules.user.controller;

import com.kalpanaafinance.dto.SupportTicketRequest;
import com.kalpanaafinance.modules.shared.entity.SupportTicket;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support/tickets")
@RequiredArgsConstructor
public class CustomerSupportTicketController {
    private final SupportTicketService supportTicketService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<SupportTicket>> getMyTickets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(supportTicketService.getTicketsForCustomer(user.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<SupportTicket> createTicket(@AuthenticationPrincipal User user, @RequestBody SupportTicketRequest request) {
        return ResponseEntity.ok(supportTicketService.createTicket(user.getId(), request));
    }
}
