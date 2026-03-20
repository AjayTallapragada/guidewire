package com.devtrails.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PremiumRequest {
    private double riskScore;
    private double averageDailyEarnings;
}
