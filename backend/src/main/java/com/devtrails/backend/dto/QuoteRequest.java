package com.devtrails.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuoteRequest {
    @NotNull
    private Long userId;
}
