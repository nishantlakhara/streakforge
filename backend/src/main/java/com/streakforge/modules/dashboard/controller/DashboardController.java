package com.streakforge.modules.dashboard.controller;

import com.streakforge.common.api.ApiResponse;
import com.streakforge.modules.auth.security.CurrentUser;
import com.streakforge.modules.dashboard.dto.DashboardSummaryDto;
import com.streakforge.modules.dashboard.service.DashboardService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryDto> summary(@AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(dashboardService.summary(currentUser.organizationId()));
    }
}
