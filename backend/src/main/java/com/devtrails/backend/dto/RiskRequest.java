package com.devtrails.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RiskRequest {
    private double rainProbability;
    private int aqi;
    private double areaRisk;
    private double disruptionFrequency;
}
