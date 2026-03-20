package com.devtrails.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserDashboardResponse {
    private PolicyResponse activePolicy;
    private BigDecimal weeklyPremium;
    private BigDecimal earningsProtected;
    private List<ClaimResponse> claims;
}
