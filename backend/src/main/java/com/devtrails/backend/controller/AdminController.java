package com.devtrails.backend.controller;

import com.devtrails.backend.dto.AdminDashboardResponse;
import com.devtrails.backend.dto.ClaimResponse;
import com.devtrails.backend.dto.RiskDataRequest;
import com.devtrails.backend.entity.RiskData;
import com.devtrails.backend.service.ClaimService;
import com.devtrails.backend.service.DashboardService;
import com.devtrails.backend.service.RiskDataService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RiskDataService riskDataService;
    private final ClaimService claimService;
    private final DashboardService dashboardService;

    @PostMapping("/risk-data")
    public RiskData upsertRiskData(@RequestBody RiskDataRequest request) {
        return riskDataService.upsert(request);
    }

    @GetMapping("/risk-data")
    public List<RiskData> getRiskData() {
        return riskDataService.findAll();
    }

    @PostMapping("/triggers/run")
    public List<ClaimResponse> runTriggers() {
        return claimService.runTriggerEngine();
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard() {
        return dashboardService.getAdminDashboard();
    }
}
