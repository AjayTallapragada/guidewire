package com.devtrails.backend.dto;

import com.devtrails.backend.entity.DeliveryType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    @NotBlank
    private String city;

    @NotBlank
    private String zone;

    @NotNull
    private DeliveryType deliveryType;

    @NotNull
    @DecimalMin("1.0")
    private BigDecimal averageDailyEarnings;

    @NotBlank
    private String password;
}
