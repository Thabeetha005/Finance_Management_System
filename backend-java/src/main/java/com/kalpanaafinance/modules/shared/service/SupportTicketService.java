package com.kalpanaafinance.modules.shared.service;

import com.kalpanaafinance.modules.shared.service.AuditService;
import com.kalpanaafinance.modules.shared.service.MessageService;

import com.kalpanaafinance.dto.SupportTicketRequest;
import com.kalpanaafinance.dto.SupportTicketResolutionRequest;
import com.kalpanaafinance.modules.shared.entity.Message;
import com.kalpanaafinance.modules.shared.entity.SupportTicket;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.SupportTicketRepository;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupportTicketService {
    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;
    private final AuditService auditService;

    @Transactional
    public SupportTicket createTicket(Long userId, SupportTicketRequest request) {
        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SupportTicket ticket = SupportTicket.builder()
                .ticketNumber("SUP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customer(customer)
                .category(request.getCategory())
                .subject(request.getSubject())
                .description(request.getDescription())
                .status(SupportTicket.TicketStatus.OPEN)
                .priority(SupportTicket.TicketPriority.valueOf(request.getPriority()))
                .transactionId(request.getTransactionId())
                .loanId(request.getLoanId())
                .investmentId(request.getInvestmentId())
                .paymentId(request.getPaymentId())
                .build();

        return supportTicketRepository.save(ticket);
    }

    public List<SupportTicket> getTicketsForCustomer(Long userId) {
        return supportTicketRepository.findByCustomerId(userId);
    }

    public List<SupportTicket> getAllTicketsForAdmin() {
        List<User> activeUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == com.kalpanaafinance.modules.shared.entity.Role.CUSTOMER)
                .limit(15)
                .collect(java.util.stream.Collectors.toList());

        java.util.Set<Long> activeUserIds = activeUsers.stream()
                .map(User::getId)
                .collect(java.util.stream.Collectors.toSet());

        return supportTicketRepository.findAll().stream()
                .filter(t -> t.getCustomer() != null && activeUserIds.contains(t.getCustomer().getId()))
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public SupportTicket resolveTicket(String adminUsername, Long ticketId, SupportTicketResolutionRequest resolutionData, String ipAddress) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(SupportTicket.TicketStatus.RESOLVED);
        ticket.setAdminResponse(resolutionData.getAdminResponse());
        ticket.setResolutionNotes(resolutionData.getResolutionNotes());
        ticket.setResolvedAt(LocalDateTime.now());

        SupportTicket savedTicket = supportTicketRepository.save(ticket);

        messageService.sendSystemMessage(
                ticket.getCustomer().getId(),
                "Support Ticket Resolved: " + ticket.getTicketNumber(),
                "Your support ticket has been resolved. Admin response: " + resolutionData.getAdminResponse(),
                Message.EntityType.SUPPORT_TICKET,
                ticket.getId()
        );

        auditService.logAction(
                adminUsername,
                "RESOLVE_TICKET",
                "SUPPORT_TICKET",
                ticket.getId(),
                "Resolved ticket " + ticket.getTicketNumber(),
                ipAddress
        );

        return savedTicket;
    }

    @Transactional
    public SupportTicket updateTicketStatus(String adminUsername, Long ticketId, String statusString, String ipAddress) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        SupportTicket.TicketStatus status = SupportTicket.TicketStatus.valueOf(statusString);
        ticket.setStatus(status);

        if (status == SupportTicket.TicketStatus.RESOLVED || status == SupportTicket.TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        SupportTicket savedTicket = supportTicketRepository.save(ticket);

        messageService.sendSystemMessage(
                ticket.getCustomer().getId(),
                "Support Ticket Status Update",
                "Your support ticket (" + ticket.getTicketNumber() + ") status has been updated to: " + status.name(),
                Message.EntityType.SUPPORT_TICKET,
                ticket.getId()
        );

        auditService.logAction(
                adminUsername,
                "UPDATE_TICKET_STATUS",
                "SUPPORT_TICKET",
                ticket.getId(),
                "Updated ticket " + ticket.getTicketNumber() + " to " + status.name(),
                ipAddress
        );

        return savedTicket;
    }
}
