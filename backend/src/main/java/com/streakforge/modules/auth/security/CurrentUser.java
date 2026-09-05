package com.streakforge.modules.auth.security;

import com.streakforge.common.security.Role;
import java.util.UUID;

public record CurrentUser(
        UUID id,
        UUID organizationId,
        String email,
        String displayName,
        Role role
) {
}
