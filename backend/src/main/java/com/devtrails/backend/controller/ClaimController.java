package com.devtrails.backend.controller;

import com.devtrails.backend.dto.ClaimResponse;
import com.devtrails.backend.service.ClaimService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @GetMapping("/user/{userId}")
    public List<ClaimResponse> getClaims(@PathVariable Long userId) {
        return claimService.getClaimsForUser(userId);
    }

    @PostMapping("/{claimId}/payout")
    public ClaimResponse payout(@PathVariable Long claimId) {
        return claimService.payout(claimId);
    }
}
