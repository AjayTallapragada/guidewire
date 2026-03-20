package com.devtrails.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PolicyResponse {
    private Long id;
    private String planName;
    private BigDecimal weeklyPremium;
    private BigDecimal weeklyCoverageAmount;
    private Double riskScore;
    private boolean active;
    private LocalDate activeFrom;
    private LocalDate activeUntil;
}
