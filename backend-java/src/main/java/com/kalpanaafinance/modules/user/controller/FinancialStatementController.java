package com.kalpanaafinance.modules.user.controller;

import com.kalpanaafinance.modules.shared.dto.StatementSummaryDTO;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import com.kalpanaafinance.modules.user.service.FinancialStatementService;
import com.kalpanaafinance.modules.user.service.StatementAuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/statement")
@RequiredArgsConstructor
public class FinancialStatementController {

    private final FinancialStatementService statementService;
    private final StatementAuditService statementAuditService;
    private final UserRepository userRepository;

    @GetMapping("/preview")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> checkStatement(
            Principal principal,
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false, defaultValue = "ALL") String transactionType
    ) {
        User user = getUserFromPrincipal(principal);
        StatementSummaryDTO summary = statementService.buildStatementSummary(user.getId(), period, fromDate, toDate, transactionType);

        Map<String, Object> response = new HashMap<>();
        response.put("statementReference", summary.getStatementReference());
        response.put("count", summary.getTransactions().size());
        response.put("openingBalance", summary.getOpeningBalance());
        response.put("closingBalance", summary.getClosingBalance());
        response.put("hasTransactions", !summary.getTransactions().isEmpty());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadPdfStatement(
            Principal principal,
            HttpServletRequest request,
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false, defaultValue = "ALL") String transactionType
    ) {
        User user = getUserFromPrincipal(principal);
        String clientIp = getClientIp(request);
        StatementSummaryDTO summary = null;

        try {
            summary = statementService.buildStatementSummary(user.getId(), period, fromDate, toDate, transactionType);
            
            if (summary.getTransactions().isEmpty()) {
                statementAuditService.logStatementGeneration(user.getId(), user.getEmail(), user.getName(), 
                        "NONE", period, transactionType, "PDF", false, clientIp);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No transactions found for the selected period.");
            }

            byte[] pdfBytes = statementService.generatePdfStatement(summary);

            statementAuditService.logStatementGeneration(user.getId(), user.getEmail(), user.getName(), 
                    summary.getStatementReference(), period, transactionType, "PDF", true, clientIp);

            String filename = "Finance-Statement-" + summary.getToDate().toString() + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);

        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            statementAuditService.logStatementGeneration(user.getId(), user.getEmail(), user.getName(), 
                    summary != null ? summary.getStatementReference() : "ERR", period, transactionType, "PDF", false, clientIp);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Statement could not be generated at this time. Please try again later.");
        }
    }

    @GetMapping("/csv")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> downloadCsvStatement(
            Principal principal,
            HttpServletRequest request,
            @RequestParam(required = false, defaultValue = "LAST_30_DAYS") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false, defaultValue = "ALL") String transactionType
    ) {
        User user = getUserFromPrincipal(principal);
        String clientIp = getClientIp(request);
        StatementSummaryDTO summary = null;

        try {
            summary = statementService.buildStatementSummary(user.getId(), period, fromDate, toDate, transactionType);
            
            if (summary.getTransactions().isEmpty()) {
                statementAuditService.logStatementGeneration(user.getId(), user.getEmail(), user.getName(), 
                        "NONE", period, transactionType, "CSV", false, clientIp);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No transactions found for the selected period.");
            }

            String csvContent = statementService.generateCsvStatement(summary);

            statementAuditService.logStatementGeneration(user.getId(), user.getEmail(), user.getName(), 
                    summary.getStatementReference(), period, transactionType, "CSV", true, clientIp);

            String filename = "Finance-Statement-" + summary.getToDate().toString() + ".csv";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvContent);

        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            statementAuditService.logStatementGeneration(user.getId(), user.getEmail(), user.getName(), 
                    summary != null ? summary.getStatementReference() : "ERR", period, transactionType, "CSV", false, clientIp);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Statement could not be generated at this time. Please try again later.");
        }
    }

    private User getUserFromPrincipal(Principal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated request.");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user account not found."));
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
