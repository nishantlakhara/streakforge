package com.streakforge.modules.auth.dto;

import com.streakforge.common.security.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record RegisterUserRequest(
            @NotBlank @Size(max = 140) String displayName,
            @NotBlank @Email @Size(max = 180) String email,
            @NotBlank @Size(min = 8, max = 120) String password
    ) {
    }

    public record RegisterAcademyRequest(
            @NotBlank @Size(max = 160) String organizationName,
            @NotBlank @Size(max = 80) String organizationSlug,
            @NotBlank @Size(max = 140) String displayName,
            @NotBlank @Email @Size(max = 180) String email,
            @NotBlank @Size(min = 8, max = 120) String password
    ) {
    }

    public record LoginRequest(
            @NotBlank @Email @Size(max = 180) String email,
            @NotBlank @Size(max = 120) String password
    ) {
    }

    public record RefreshRequest(
            @NotBlank String refreshToken
    ) {
    }

    public record AuthenticatedUserDto(
            UUID id,
            UUID organizationId,
            String displayName,
            String email,
            Role role
    ) {
    }

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            Instant accessTokenExpiresAt,
            AuthenticatedUserDto user
    ) {
    }
}
