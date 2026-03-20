package com.devtrails.backend.controller;

import com.devtrails.backend.dto.UserDashboardResponse;
import com.devtrails.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/user/{userId}")
    public UserDashboardResponse getUserDashboard(@PathVariable Long userId) {
        return dashboardService.getUserDashboard(userId);
    }
}
