package com.kalpanaafinance.dto.analytics;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDashboardAnalyticsDTO {

    private OverviewAnalyticsDTO overview;
    private PortfolioPerformanceAnalyticsDTO portfolioPerformance;
    private List<AssetAllocationAnalyticsDTO> assetAllocation;
    private CashFlowAnalyticsDTO cashFlow;
    private LoanAnalyticsDTO loanAnalytics;
    private List<NetWorthHistoryDTO> netWorthHistory;
    private List<MonthlyTrendAnalyticsDTO> monthlyFinancialTrend;
    private FinancialHealthAnalyticsDTO financialHealth;
    private ProjectionAnalyticsDTO projection;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OverviewAnalyticsDTO {
        private BigDecimal netWorth;
        private BigDecimal totalInvested;
        private BigDecimal investmentReturns;
        private BigDecimal loanOutstanding;
        private BigDecimal walletBalance;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PortfolioPerformanceAnalyticsDTO {
        private BigDecimal investedAmount;
        private BigDecimal currentValue;
        private BigDecimal profitLoss;
        private BigDecimal returnPercentage;
        private int activeInvestmentCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssetAllocationAnalyticsDTO {
        private String category;
        private BigDecimal amount;
        private BigDecimal percentage;
        private String color;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CashFlowAnalyticsDTO {
        private BigDecimal totalInflow;
        private BigDecimal totalOutflow;
        private BigDecimal netCashFlow;
        private List<CashFlowMonthlyDTO> monthlyData;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CashFlowMonthlyDTO {
        private String month;
        private BigDecimal inflow;
        private BigDecimal outflow;
        private BigDecimal netFlow;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoanAnalyticsDTO {
        private BigDecimal totalBorrowed;
        private BigDecimal totalRepaid;
        private BigDecimal outstandingBalance;
        private int activeLoanCount;
        private BigDecimal repaymentPercentage;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NetWorthHistoryDTO {
        private String date;
        private BigDecimal netWorth;
        private BigDecimal portfolioValue;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyTrendAnalyticsDTO {
        private String month;
        private BigDecimal investments;
        private BigDecimal emis;
        private BigDecimal credits;
        private BigDecimal debits;
        private BigDecimal netFlow;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FinancialHealthAnalyticsDTO {
        private int score;
        private String diversification;
        private String loanUtilization;
        private String emiConsistency;
        private String cashFlowHealth;
        private String statusMessage;
        private boolean hasEnoughData;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectionAnalyticsDTO {
        private BigDecimal sixMonths;
        private BigDecimal oneYear;
        private BigDecimal fiveYears;
        private boolean hasProjections;
        private BigDecimal returnRate;
    }
}
