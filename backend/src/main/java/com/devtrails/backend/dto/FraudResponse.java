package com.devtrails.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FraudResponse {
    private double fraudScore;
    private boolean flagged;
    private String reason;
}
