package com.devtrails.backend.dto;

import com.devtrails.backend.entity.DeliveryType;
import com.devtrails.backend.entity.UserRole;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private Long id;
    private String name;
    private String phone;
    private String city;
    private String zone;
    private DeliveryType deliveryType;
    private BigDecimal averageDailyEarnings;
    private UserRole role;
}
