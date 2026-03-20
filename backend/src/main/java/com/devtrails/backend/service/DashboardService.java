package com.devtrails.backend.service;

import com.devtrails.backend.dto.AdminDashboardResponse;
import com.devtrails.backend.dto.UserDashboardResponse;
import com.devtrails.backend.entity.Claim;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PolicyService policyService;
    private final ClaimService claimService;

    public UserDashboardResponse getUserDashboard(Long userId) {
        var policy = policyService.getActivePolicy(userId);
        var claims = claimService.getClaimsForUser(userId);
        return UserDashboardResponse.builder()
            .activePolicy(policy)
            .weeklyPremium(policy != null ? policy.getWeeklyPremium() : BigDecimal.ZERO)
            .earningsProtected(policy != null ? policy.getWeeklyCoverageAmount() : BigDecimal.ZERO)
            .claims(claims)
            .build();
    }

    public AdminDashboardResponse getAdminDashboard() {
        List<Claim> claims = claimService.allClaims();
        BigDecimal totalPayouts = claims.stream()
            .filter(claim -> claim.getStatus().name().equals("PAID"))
            .map(Claim::getPayoutAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AdminDashboardResponse.builder()
            .totalClaims(claims.size())
            .fraudAlerts(claims.stream().filter(Claim::isFlagged).count())
            .totalPayouts(totalPayouts)
            .activePolicies(policyService.getActivePolicies().size())
            .weeklyTrends(List.of(
                "Heavy rain claims increasing in Mumbai zones",
                "AQI risk is elevated in Delhi belts",
                "Platform downtime creates short, high-frequency payouts"
            ))
            .build();
    }
}
