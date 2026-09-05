package com.streakforge.modules.organization.dto;

import java.util.UUID;

public record OrganizationDto(
        UUID id,
        String name,
        String slug
) {
}

