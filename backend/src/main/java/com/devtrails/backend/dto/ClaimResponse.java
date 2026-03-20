package com.devtrails.backend.dto;

import com.devtrails.backend.entity.ClaimStatus;
import com.devtrails.backend.entity.TriggerType;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ClaimResponse {
    private Long id;
    private TriggerType triggerType;
    private String triggerSource;
    private LocalDate eventDate;
    private Integer affectedHours;
    private BigDecimal payoutAmount;
    private ClaimStatus status;
    private Double fraudScore;
    private boolean flagged;
}
