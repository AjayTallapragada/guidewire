package com.devtrails.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RiskDataRequest {
    private String city;
    private String zone;
    private Double rainProbability;
    private Double rainfallMm;
    private Integer aqi;
    private Double areaRisk;
    private Double disruptionFrequency;
    private boolean curfewActive;
    private boolean platformDowntime;
}
