package com.devtrails.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FraudRequest {
    private String city;
    private String zone;
    private String triggerType;
    private int duplicateClaims;
    private int claimsInLastWeek;
}
