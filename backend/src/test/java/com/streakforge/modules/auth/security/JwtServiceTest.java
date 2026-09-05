package com.streakforge.modules.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.streakforge.common.security.Role;
import com.streakforge.modules.auth.domain.UserAccount;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService;
    private final String secret = "test-secret-key-at-least-32-chars-long-for-hmac";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(new ObjectMapper(), secret, 15);
    }

    @Test
    @DisplayName("issueAccessToken should return signed token and parse correctly")
    void issueAndParseAccessToken_Success() {
        UserAccount user = new UserAccount();
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        user.setId(userId);
        user.setOrganizationId(orgId);
        user.setEmail("athlete@streakforge.com");
        user.setDisplayName("Streak Athlete");
        user.setRole(Role.ATHLETE);

        JwtService.TokenIssue issue = jwtService.issueAccessToken(user);
        assertThat(issue.token()).isNotBlank();
        assertThat(issue.expiresAt()).isNotNull();

        CurrentUser parsedUser = jwtService.parseAccessToken(issue.token());
        assertThat(parsedUser.id()).isEqualTo(userId);
        assertThat(parsedUser.organizationId()).isEqualTo(orgId);
        assertThat(parsedUser.email()).isEqualTo("athlete@streakforge.com");
        assertThat(parsedUser.displayName()).isEqualTo("Streak Athlete");
        assertThat(parsedUser.role()).isEqualTo(Role.ATHLETE);
    }

    @Test
    @DisplayName("parseAccessToken should reject tampered token signature")
    void parseAccessToken_TamperedSignature() {
        UserAccount user = new UserAccount();
        user.setId(UUID.randomUUID());
        user.setOrganizationId(UUID.randomUUID());
        user.setEmail("user@test.com");
        user.setDisplayName("User");
        user.setRole(Role.ATHLETE);

        JwtService.TokenIssue issue = jwtService.issueAccessToken(user);
        String tamperedToken = issue.token().substring(0, issue.token().length() - 5) + "ABCDE";

        assertThatThrownBy(() -> jwtService.parseAccessToken(tamperedToken))
                .isInstanceOf(BadCredentialsException.class);
    }
}
