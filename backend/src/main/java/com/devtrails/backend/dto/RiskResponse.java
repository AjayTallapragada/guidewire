package com.devtrails.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RiskResponse {
    private double riskScore;
    private String rationale;
}
