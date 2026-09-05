package com.streakforge.modules.auth.service;

import com.streakforge.common.security.Role;
import com.streakforge.modules.auth.domain.RefreshToken;
import com.streakforge.modules.auth.domain.UserAccount;
import com.streakforge.modules.auth.dto.AuthDtos.AuthResponse;
import com.streakforge.modules.auth.dto.AuthDtos.AuthenticatedUserDto;
import com.streakforge.modules.auth.dto.AuthDtos.LoginRequest;
import com.streakforge.modules.auth.dto.AuthDtos.RegisterAcademyRequest;
import com.streakforge.modules.auth.dto.AuthDtos.RegisterUserRequest;
import com.streakforge.modules.auth.repository.UserAccountRepository;
import com.streakforge.modules.auth.security.CurrentUser;
import com.streakforge.modules.auth.security.JwtService;
import com.streakforge.modules.auth.security.JwtService.TokenIssue;
import com.streakforge.modules.organization.domain.Organization;
import com.streakforge.modules.organization.repository.OrganizationRepository;
import java.util.Locale;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserAccountRepository userAccountRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserAccountRepository userAccountRepository,
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService
    ) {
        this.userAccountRepository = userAccountRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthResponse registerUser(RegisterUserRequest request) {
        String email = normalizeEmail(request.email());

        if (userAccountRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Auto-create a personal organization for each self-registered user
        String slug = "personal-" + email.replace("@", "-at-").replaceAll("[^a-z0-9-]+", "-");
        Organization organization = new Organization();
        organization.setName(request.displayName().trim() + "'s Space");
        organization.setSlug(slug);
        Organization savedOrg = organizationRepository.saveAndFlush(organization);
        savedOrg.setOrganizationId(savedOrg.getId());

        UserAccount user = new UserAccount();
        user.setOrganizationId(savedOrg.getId());
        user.setDisplayName(request.displayName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.ACADEMY_ADMIN);
        user.setEnabled(true);
        UserAccount savedUser = userAccountRepository.save(user);

        return issueAuthResponse(savedUser);
    }

    @Transactional
    public AuthResponse registerAcademy(RegisterAcademyRequest request) {
        String email = normalizeEmail(request.email());
        String slug = normalizeSlug(request.organizationSlug());

        if (userAccountRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }
        organizationRepository.findBySlug(slug).ifPresent(existing -> {
            throw new IllegalArgumentException("Organization slug already exists");
        });

        Organization organization = new Organization();
        organization.setName(request.organizationName().trim());
        organization.setSlug(slug);
        Organization savedOrganization = organizationRepository.saveAndFlush(organization);
        savedOrganization.setOrganizationId(savedOrganization.getId());

        UserAccount user = new UserAccount();
        user.setOrganizationId(savedOrganization.getId());
        user.setDisplayName(request.displayName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.ACADEMY_ADMIN);
        user.setEnabled(true);
        UserAccount savedUser = userAccountRepository.save(user);

        return issueAuthResponse(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .filter(UserAccount::isEnabled)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return issueAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken consumedToken = refreshTokenService.consume(rawRefreshToken);
        UserAccount user = userAccountRepository.findById(consumedToken.getUserId())
                .filter(UserAccount::isEnabled)
                .orElseThrow(() -> new BadCredentialsException("Refresh token user is no longer active"));
        return issueAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthenticatedUserDto me(CurrentUser currentUser) {
        return userAccountRepository.findById(currentUser.id())
                .filter(UserAccount::isEnabled)
                .map(this::toUserDto)
                .orElseThrow(() -> new BadCredentialsException("Authenticated user was not found"));
    }

    private AuthResponse issueAuthResponse(UserAccount user) {
        TokenIssue tokenIssue = jwtService.issueAccessToken(user);
        RefreshTokenService.IssuedRefreshToken refreshToken = refreshTokenService.issue(user);
        return new AuthResponse(
                tokenIssue.token(),
                refreshToken.rawToken(),
                tokenIssue.expiresAt(),
                toUserDto(user)
        );
    }

    private AuthenticatedUserDto toUserDto(UserAccount user) {
        return new AuthenticatedUserDto(
                user.getId(),
                user.getOrganizationId(),
                user.getDisplayName(),
                user.getEmail(),
                user.getRole()
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeSlug(String slug) {
        return slug.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]+", "-");
    }
}
