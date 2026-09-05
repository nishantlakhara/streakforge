package com.streakforge.modules.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateOrganizationRequest(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 80) String slug
) {
}

