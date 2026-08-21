package com.kalpanaaafinance.modules.user.service;

import com.kalpanaaafinance.modules.shared.dto.StatementSummaryDTO;
import com.kalpanaaafinance.modules.shared.entity.Transaction;
import com.kalpanaaafinance.modules.shared.entity.User;
import com.kalpanaaafinance.modules.shared.repository.TransactionRepository;
import com.kalpanaaafinance.modules.shared.repository.UserRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinancialStatementService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
    private static final DateTimeFormatter REF_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Transactional(readOnly = true)
    public StatementSummaryDTO buildStatementSummary(Long userId, String periodStr, LocalDate fromDate, LocalDate toDate, String typeFilter) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 1. Resolve date range
        LocalDate now = LocalDate.now();
        LocalDate start = fromDate;
        LocalDate end = toDate;

        if (periodStr != null && !periodStr.isBlank()) {
            switch (periodStr.toUpperCase()) {
                case "LAST_30_DAYS":
                    end = now;
                    start = now.minusDays(30);
                    break;
                case "LAST_3_MONTHS":
                    end = now;
                    start = now.minusMonths(3);
                    break;
                case "LAST_6_MONTHS":
                    end = now;
                    start = now.minusMonths(6);
                    break;
                case "CURRENT_FY":
                    int year = now.getMonthValue() >= 4 ? now.getYear() : now.getYear() - 1;
                    start = LocalDate.of(year, 4, 1);
                    end = now;
                    break;
                case "PREVIOUS_FY":
                    int prevYear = now.getMonthValue() >= 4 ? now.getYear() - 1 : now.getYear() - 2;
                    start = LocalDate.of(prevYear, 4, 1);
                    end = LocalDate.of(prevYear + 1, 3, 31);
                    break;
                case "CUSTOM":
                    break;
                default:
                    end = now;
                    start = now.minusDays(30);
                    break;
            }
        }

        if (start == null) start = now.minusDays(30);
        if (end == null) end = now;

        // 2. Validate date range
        if (start.isAfter(end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "From date cannot be after To date.");
        }
        if (start.isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "From date cannot be in the future.");
        }

        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(23, 59, 59);

        // 3. Query user transactions in date range
        List<Transaction> allUserTx = transactionRepository.findByUserIdOrderByDateDesc(userId);
        List<Transaction> rangeTx = allUserTx.stream()
                .filter(t -> t.getDate() != null && !t.getDate().isBefore(startDateTime) && !t.getDate().isAfter(endDateTime))
                .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()))
                .sorted(Comparator.comparing(Transaction::getDate))
                .collect(Collectors.toList());

        // 4. Apply transaction type filter
        List<Transaction> filteredTx = filterByTransactionType(rangeTx, typeFilter);

        // 5. Calculate Account Summary
        BigDecimal openingBalance = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;
        BigDecimal totalDebits = BigDecimal.ZERO;

        if (!rangeTx.isEmpty()) {
            Transaction firstTx = rangeTx.get(0);
            openingBalance = firstTx.getBalanceBefore() != null ? firstTx.getBalanceBefore() : BigDecimal.ZERO;
        } else {
            // Find last transaction prior to start date for opening balance
            Optional<Transaction> lastPriorTx = allUserTx.stream()
                    .filter(t -> t.getDate() != null && t.getDate().isBefore(startDateTime))
                    .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()))
                    .max(Comparator.comparing(Transaction::getDate));
            
            if (lastPriorTx.isPresent()) {
                openingBalance = lastPriorTx.get().getBalanceAfter() != null ? lastPriorTx.get().getBalanceAfter() : BigDecimal.ZERO;
            } else {
                openingBalance = BigDecimal.ZERO;
            }
        }

        for (Transaction tx : filteredTx) {
            BigDecimal amt = tx.getAmount() != null ? tx.getAmount().abs() : BigDecimal.ZERO;
            boolean isCredit = isCreditTransaction(tx);
            if (isCredit) {
                totalCredits = totalCredits.add(amt);
            } else {
                totalDebits = totalDebits.add(amt);
            }
        }

        BigDecimal closingBalance = openingBalance.add(totalCredits).subtract(totalDebits);

        // 6. Perform Financial Reconciliation check
        boolean reconciled = true;
        if (!filteredTx.isEmpty()) {
            Transaction lastTx = filteredTx.get(filteredTx.size() - 1);
            if (typeFilter == null || typeFilter.isBlank() || "ALL".equalsIgnoreCase(typeFilter)) {
                if (lastTx.getBalanceAfter() != null) {
                    BigDecimal expectedClosing = lastTx.getBalanceAfter();
                    if (closingBalance.setScale(2, RoundingMode.HALF_UP).compareTo(expectedClosing.setScale(2, RoundingMode.HALF_UP)) != 0) {
                        log.warn("Reconciliation mismatch for user {}: calc={}, expected={}", userId, closingBalance, expectedClosing);
                        reconciled = false;
                    }
                }
            }
        }

        // 7. Generate Backend Unique Statement Reference: STMT-YYYYMMDD-8F42C1
        String datePart = LocalDate.now().format(REF_DATE_FORMATTER);
        String hexPart = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        String statementRef = "STMT-" + datePart + "-" + hexPart;

        String customerIdStr = user.getCustomerId() != null ? user.getCustomerId() : "CUS-" + String.format("%06d", user.getId());
        String maskedEmail = maskEmail(user.getEmail());

        return StatementSummaryDTO.builder()
                .statementReference(statementRef)
                .userId(userId)
                .customerName(user.getName())
                .customerId(customerIdStr)
                .maskedEmail(maskedEmail)
                .fromDate(start)
                .toDate(end)
                .generatedAt(LocalDateTime.now())
                .openingBalance(openingBalance)
                .totalCredits(totalCredits)
                .totalDebits(totalDebits)
                .closingBalance(closingBalance)
                .transactions(filteredTx)
                .reconciled(reconciled)
                .build();
    }

    // PDF Compilation using OpenPDF
    public byte[] generatePdfStatement(StatementSummaryDTO dto) {
        if (!dto.isReconciled()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Statement could not be generated at this time. Please try again later.");
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 50);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new PdfFooterEvent(dto.getStatementReference()));

            document.open();

            // Colors
            Color emeraldDark = new Color(5, 35, 30);      // #05231e
            Color emeraldPrimary = new Color(16, 99, 84);   // #106354
            Color copperGold = new Color(136, 115, 51);     // #887333
            Color bgGray = new Color(248, 250, 252);        // #f8fafc
            Color textDark = new Color(18, 36, 31);

            // Fonts
            Font headerTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, emeraldDark);
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, copperGold);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.GRAY);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, textDark);
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
            Font tableCellFont = FontFactory.getFont(FontFactory.HELVETICA, 8, textDark);
            Font creditFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(16, 185, 129));
            Font debitFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(180, 83, 9));

            // Header Section
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(PdfPCell.NO_BORDER);
            Paragraph brandPara = new Paragraph("KALPANAAA FINANCE", headerTitleFont);
            Paragraph subBrandPara = new Paragraph("FINANCIAL TRANSACTION STATEMENT", subTitleFont);
            logoCell.addElement(brandPara);
            logoCell.addElement(subBrandPara);
            headerTable.addCell(logoCell);

            PdfPCell refCell = new PdfPCell();
            refCell.setBorder(PdfPCell.NO_BORDER);
            refCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph refPara = new Paragraph("Statement Ref: " + dto.getStatementReference(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, emeraldPrimary));
            Paragraph datePara = new Paragraph("Generated: " + dto.getGeneratedAt().format(DATETIME_FORMATTER), FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY));
            refPara.setAlignment(Element.ALIGN_RIGHT);
            datePara.setAlignment(Element.ALIGN_RIGHT);
            refCell.addElement(refPara);
            refCell.addElement(datePara);
            headerTable.addCell(refCell);

            document.add(headerTable);
            document.add(new Paragraph(" "));

            // Customer Details Box
            PdfPTable infoTable = new PdfPTable(4);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{25, 25, 25, 25});

            addInfoCell(infoTable, "CUSTOMER NAME", dto.getCustomerName(), labelFont, valueFont, bgGray);
            addInfoCell(infoTable, "CUSTOMER ID", dto.getCustomerId(), labelFont, valueFont, bgGray);
            addInfoCell(infoTable, "EMAIL ADDRESS", dto.getMaskedEmail(), labelFont, valueFont, bgGray);
            addInfoCell(infoTable, "PERIOD", dto.getFromDate().format(DATE_FORMATTER) + " - " + dto.getToDate().format(DATE_FORMATTER), labelFont, valueFont, bgGray);

            document.add(infoTable);
            document.add(new Paragraph(" "));

            // Account Summary Section
            Paragraph summaryHeading = new Paragraph("ACCOUNT SUMMARY", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, emeraldDark));
            summaryHeading.setSpacingAfter(6);
            document.add(summaryHeading);

            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{25, 25, 25, 25});

            addSummaryBox(summaryTable, "OPENING BALANCE", formatINR(dto.getOpeningBalance()), emeraldDark, labelFont);
            addSummaryBox(summaryTable, "TOTAL CREDITS", "+" + formatINR(dto.getTotalCredits()), new Color(16, 185, 129), labelFont);
            addSummaryBox(summaryTable, "TOTAL DEBITS", "-" + formatINR(dto.getTotalDebits()), new Color(180, 83, 9), labelFont);
            addSummaryBox(summaryTable, "CLOSING BALANCE", formatINR(dto.getClosingBalance()), emeraldPrimary, labelFont);

            document.add(summaryTable);
            document.add(new Paragraph(" "));

            // Transaction History Section
            Paragraph txHeading = new Paragraph("TRANSACTION HISTORY", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, emeraldDark));
            txHeading.setSpacingAfter(6);
            document.add(txHeading);

            PdfPTable txTable = new PdfPTable(8);
            txTable.setWidthPercentage(100);
            txTable.setWidths(new float[]{15, 12, 23, 14, 12, 12, 12, 10});

            addHeaderCell(txTable, "Date & Time", emeraldDark, tableHeaderFont);
            addHeaderCell(txTable, "Ref ID", emeraldDark, tableHeaderFont);
            addHeaderCell(txTable, "Description", emeraldDark, tableHeaderFont);
            addHeaderCell(txTable, "Type", emeraldDark, tableHeaderFont);
            addHeaderCell(txTable, "Credit", emeraldDark, tableHeaderFont);
            addHeaderCell(txTable, "Debit", emeraldDark, tableHeaderFont);
            addHeaderCell(txTable, "Balance", emeraldDark, tableHeaderFont);
            addHeaderCell(txTable, "Status", emeraldDark, tableHeaderFont);

            boolean alt = false;
            for (Transaction tx : dto.getTransactions()) {
                Color rowBg = alt ? new Color(248, 250, 252) : Color.WHITE;
                alt = !alt;

                boolean isCredit = isCreditTransaction(tx);
                BigDecimal amt = tx.getAmount() != null ? tx.getAmount().abs() : BigDecimal.ZERO;

                addBodyCell(txTable, tx.getDate() != null ? tx.getDate().format(DATE_FORMATTER) : "-", tableCellFont, rowBg);
                addBodyCell(txTable, "#" + tx.getId(), tableCellFont, rowBg);
                addBodyCell(txTable, tx.getDescription() != null ? tx.getDescription() : "-", tableCellFont, rowBg);
                addBodyCell(txTable, tx.getType() != null ? tx.getType() : "-", tableCellFont, rowBg);
                addBodyCell(txTable, isCredit ? "+" + formatINR(amt) : "-", creditFont, rowBg);
                addBodyCell(txTable, !isCredit ? "-" + formatINR(amt) : "-", debitFont, rowBg);
                addBodyCell(txTable, tx.getBalanceAfter() != null ? formatINR(tx.getBalanceAfter()) : "-", tableCellFont, rowBg);
                addBodyCell(txTable, tx.getStatus() != null ? tx.getStatus() : "COMPLETED", tableCellFont, rowBg);
            }

            document.add(txTable);

            document.close();
        } catch (Exception e) {
            log.error("Failed to generate PDF statement for user {}", dto.getUserId(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Statement could not be generated at this time. Please try again later.");
        }

        return out.toByteArray();
    }

    // CSV Compilation
    public String generateCsvStatement(StatementSummaryDTO dto) {
        if (!dto.isReconciled()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Statement could not be generated at this time. Please try again later.");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("FINANCE - FINANCIAL TRANSACTION STATEMENT\n");
        sb.append("Statement Reference,").append(escapeCsv(dto.getStatementReference())).append("\n");
        sb.append("Customer Name,").append(escapeCsv(dto.getCustomerName())).append("\n");
        sb.append("Customer ID,").append(escapeCsv(dto.getCustomerId())).append("\n");
        sb.append("Statement Period,").append(dto.getFromDate()).append(" to ").append(dto.getToDate()).append("\n");
        sb.append("Generated Date,").append(dto.getGeneratedAt().format(DATETIME_FORMATTER)).append("\n\n");

        sb.append("ACCOUNT SUMMARY\n");
        sb.append("Opening Balance,").append(dto.getOpeningBalance()).append("\n");
        sb.append("Total Credits,").append(dto.getTotalCredits()).append("\n");
        sb.append("Total Debits,").append(dto.getTotalDebits()).append("\n");
        sb.append("Closing Balance,").append(dto.getClosingBalance()).append("\n\n");

        sb.append("Date & Time,Transaction Reference,Description,Transaction Type,Credit,Debit,Balance,Status\n");

        for (Transaction tx : dto.getTransactions()) {
            boolean isCredit = isCreditTransaction(tx);
            BigDecimal amt = tx.getAmount() != null ? tx.getAmount().abs() : BigDecimal.ZERO;

            sb.append(tx.getDate() != null ? tx.getDate().format(DATETIME_FORMATTER) : "").append(",");
            sb.append("#").append(tx.getId()).append(",");
            sb.append(escapeCsv(tx.getDescription() != null ? tx.getDescription() : "")).append(",");
            sb.append(escapeCsv(tx.getType() != null ? tx.getType() : "")).append(",");
            sb.append(isCredit ? amt : "").append(",");
            sb.append(!isCredit ? amt : "").append(",");
            sb.append(tx.getBalanceAfter() != null ? tx.getBalanceAfter() : "").append(",");
            sb.append(escapeCsv(tx.getStatus() != null ? tx.getStatus() : "COMPLETED")).append("\n");
        }

        return sb.toString();
    }

    private List<Transaction> filterByTransactionType(List<Transaction> list, String typeFilter) {
        if (typeFilter == null || typeFilter.isBlank() || "ALL".equalsIgnoreCase(typeFilter)) {
            return list;
        }

        String filter = typeFilter.toUpperCase();
        return list.stream().filter(t -> {
            String type = t.getType() != null ? t.getType().toUpperCase() : "";
            switch (filter) {
                case "DEPOSIT":
                case "WALLET_DEPOSITS":
                    return type.contains("DEPOSIT") || type.contains("BONUS") || type.contains("OTHER_CREDIT");
                case "WITHDRAWAL":
                case "WALLET_WITHDRAWALS":
                    return type.contains("WITHDRAWAL") || type.contains("OTHER_DEBIT");
                case "INVESTMENT":
                case "INVESTMENTS":
                    return type.contains("INVESTMENT");
                case "LOAN_DISBURSEMENT":
                case "LOAN_DISBURSEMENTS":
                    return type.contains("DISBURSEMENT");
                case "EMI_PAYMENT":
                case "EMI_PAYMENTS":
                    return type.contains("EMI") || type.contains("PAYOFF");
                case "WALLET_TRANSFER":
                case "WALLET_TRANSFERS":
                    return type.contains("DEPOSIT") || type.contains("WITHDRAWAL");
                default:
                    return type.equalsIgnoreCase(filter);
            }
        }).collect(Collectors.toList());
    }

    private boolean isCreditTransaction(Transaction tx) {
        if (tx.getAmount() != null && tx.getAmount().compareTo(BigDecimal.ZERO) > 0) return true;
        String type = tx.getType() != null ? tx.getType().toUpperCase() : "";
        return type.contains("CREDIT") || type.contains("DEPOSIT") || type.contains("DISBURSEMENT") || type.contains("BONUS");
    }

    private String formatINR(BigDecimal amount) {
        if (amount == null) return "₹0.00";
        return "₹" + String.format("%,.2f", amount);
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "*****@domain.com";
        String[] parts = email.split("@");
        String name = parts[0];
        if (name.length() <= 2) return name.charAt(0) + "*@" + parts[1];
        return name.substring(0, 2) + "***@" + parts[1];
    }

    private String escapeCsv(String input) {
        if (input == null) return "\"\"";
        if (input.contains(",") || input.contains("\"") || input.contains("\n")) {
            return "\"" + input.replace("\"", "\"\"") + "\"";
        }
        return input;
    }

    private void addInfoCell(PdfPTable table, String label, String val, Font labelFont, Font valueFont, Color bg) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.addElement(new Paragraph(label, labelFont));
        cell.addElement(new Paragraph(val != null ? val : "-", valueFont));
        table.addCell(cell);
    }

    private void addSummaryBox(PdfPTable table, String label, String val, Color valColor, Font labelFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(248, 250, 252));
        cell.setPadding(8);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.addElement(new Paragraph(label, labelFont));
        Font vFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, valColor);
        cell.addElement(new Paragraph(val, vFont));
        table.addCell(cell);
    }

    private void addHeaderCell(PdfPTable table, String text, Color bg, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(5);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBorderColor(new Color(226, 232, 240));
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(5);
        cell.setBorderColor(new Color(241, 245, 249));
        table.addCell(cell);
    }

    // OpenPDF Page Event Footer Helper
    private static class PdfFooterEvent extends PdfPageEventHelper {
        private final String statementRef;

        public PdfFooterEvent(String statementRef) {
            this.statementRef = statementRef;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfPTable footer = new PdfPTable(2);
            footer.setTotalWidth(document.right() - document.left());
            footer.setWidthPercentage(100);

            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 7, Color.GRAY);

            PdfPCell leftCell = new PdfPCell(new Phrase("Electronically generated statement | Ref: " + statementRef, footerFont));
            leftCell.setBorder(PdfPCell.NO_BORDER);

            PdfPCell rightCell = new PdfPCell(new Phrase("Page " + writer.getPageNumber(), footerFont));
            rightCell.setBorder(PdfPCell.NO_BORDER);
            rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            footer.addCell(leftCell);
            footer.addCell(rightCell);

            footer.writeSelectedRows(0, -1, document.left(), document.bottom() - 10, writer.getDirectContent());
        }
    }
}
