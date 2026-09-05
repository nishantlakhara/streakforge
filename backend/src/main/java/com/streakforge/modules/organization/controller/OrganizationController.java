package com.streakforge.modules.organization.controller;

import com.streakforge.common.api.ApiResponse;
import com.streakforge.modules.organization.dto.CreateOrganizationRequest;
import com.streakforge.modules.organization.dto.OrganizationDto;
import com.streakforge.modules.organization.service.OrganizationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/organizations")
public class OrganizationController {
    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<OrganizationDto>> listOrganizations() {
        return ApiResponse.ok(organizationService.listOrganizations());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<OrganizationDto> createOrganization(@Valid @RequestBody CreateOrganizationRequest request) {
        return ApiResponse.ok(organizationService.createOrganization(request), "Organization created");
    }
}
