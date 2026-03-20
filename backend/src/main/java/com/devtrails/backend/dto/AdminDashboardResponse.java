package com.devtrails.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminDashboardResponse {
    private long totalClaims;
    private long fraudAlerts;
    private BigDecimal totalPayouts;
    private long activePolicies;
    private List<String> weeklyTrends;
}
