package com.devtrails.backend.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PolicyQuoteResponse {
    private Double riskScore;
    private BigDecimal weeklyPremium;
    private BigDecimal weeklyCoverageAmount;
    private String rationale;
}
