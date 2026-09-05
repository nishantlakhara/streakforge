package com.streakforge.modules.auth.service;

import com.streakforge.common.security.Role;
import com.streakforge.modules.auth.domain.RefreshToken;
import com.streakforge.modules.auth.domain.UserAccount;
import com.streakforge.modules.auth.dto.AuthDtos.AuthResponse;
import com.streakforge.modules.auth.dto.AuthDtos.LoginRequest;
import com.streakforge.modules.auth.dto.AuthDtos.RegisterUserRequest;
import com.streakforge.modules.auth.repository.UserAccountRepository;
import com.streakforge.modules.auth.security.JwtService;
import com.streakforge.modules.auth.security.JwtService.TokenIssue;
import com.streakforge.modules.organization.domain.Organization;
import com.streakforge.modules.organization.repository.OrganizationRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userAccountRepository,
                organizationRepository,
                passwordEncoder,
                jwtService,
                refreshTokenService
        );
    }

    @Test
    @DisplayName("registerUser should save organization and user, then issue tokens")
    void registerUser_Success() {
        RegisterUserRequest request = new RegisterUserRequest("Champion User", "champion@test.com", "password123");
        when(userAccountRepository.existsByEmailIgnoreCase("champion@test.com")).thenReturn(false);

        Organization org = new Organization();
        UUID orgId = UUID.randomUUID();
        org.setId(orgId);
        org.setName("Champion User's Space");
        when(organizationRepository.saveAndFlush(any(Organization.class))).thenReturn(org);

        when(passwordEncoder.encode("password123")).thenReturn("encodedPasswordHash");

        UserAccount savedUser = new UserAccount();
        UUID userId = UUID.randomUUID();
        savedUser.setId(userId);
        savedUser.setOrganizationId(orgId);
        savedUser.setDisplayName("Champion User");
        savedUser.setEmail("champion@test.com");
        savedUser.setRole(Role.ACADEMY_ADMIN);
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(savedUser);

        RefreshToken mockRefreshToken = new RefreshToken();
        mockRefreshToken.setTokenHash("hash");
        when(jwtService.issueAccessToken(savedUser)).thenReturn(new TokenIssue("jwt.access.token", Instant.now().plusSeconds(900)));
        when(refreshTokenService.issue(savedUser)).thenReturn(new RefreshTokenService.IssuedRefreshToken("raw.refresh.token", mockRefreshToken));

        AuthResponse response = authService.registerUser(request);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("jwt.access.token");
        assertThat(response.refreshToken()).isEqualTo("raw.refresh.token");
        assertThat(response.user().displayName()).isEqualTo("Champion User");
        assertThat(response.user().email()).isEqualTo("champion@test.com");
    }

    @Test
    @DisplayName("registerUser should throw IllegalArgumentException when email already exists")
    void registerUser_DuplicateEmail() {
        RegisterUserRequest request = new RegisterUserRequest("User", "existing@test.com", "pass");
        when(userAccountRepository.existsByEmailIgnoreCase("existing@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.registerUser(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email is already registered");
    }

    @Test
    @DisplayName("login should return AuthResponse on matching password")
    void login_Success() {
        LoginRequest request = new LoginRequest("user@test.com", "validPassword");

        UserAccount user = new UserAccount();
        user.setId(UUID.randomUUID());
        user.setOrganizationId(UUID.randomUUID());
        user.setEmail("user@test.com");
        user.setDisplayName("Test User");
        user.setPasswordHash("hashedPassword");
        user.setEnabled(true);
        user.setRole(Role.ATHLETE);

        when(userAccountRepository.findByEmailIgnoreCase("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("validPassword", "hashedPassword")).thenReturn(true);

        RefreshToken mockRefreshToken = new RefreshToken();
        when(jwtService.issueAccessToken(user)).thenReturn(new TokenIssue("jwt.token", Instant.now().plusSeconds(900)));
        when(refreshTokenService.issue(user)).thenReturn(new RefreshTokenService.IssuedRefreshToken("ref.token", mockRefreshToken));

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("jwt.token");
        assertThat(response.user().email()).isEqualTo("user@test.com");
    }

    @Test
    @DisplayName("login should throw BadCredentialsException on invalid password")
    void login_InvalidPassword() {
        LoginRequest request = new LoginRequest("user@test.com", "wrongPassword");

        UserAccount user = new UserAccount();
        user.setEmail("user@test.com");
        user.setPasswordHash("hashedPassword");
        user.setEnabled(true);

        when(userAccountRepository.findByEmailIgnoreCase("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid email or password");
    }
}
