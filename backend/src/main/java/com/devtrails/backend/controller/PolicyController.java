package com.devtrails.backend.controller;

import com.devtrails.backend.dto.PolicyQuoteResponse;
import com.devtrails.backend.dto.PolicyResponse;
import com.devtrails.backend.dto.QuoteRequest;
import com.devtrails.backend.service.PolicyService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @PostMapping("/quote")
    public PolicyQuoteResponse quote(@Valid @RequestBody QuoteRequest request) {
        return policyService.quote(request.getUserId());
    }

    @PostMapping("/activate")
    public PolicyResponse activate(@Valid @RequestBody QuoteRequest request) {
        return policyService.activate(request.getUserId());
    }

    @GetMapping("/user/{userId}")
    public List<PolicyResponse> getPolicies(@PathVariable Long userId) {
        return policyService.getPolicies(userId);
    }
}
