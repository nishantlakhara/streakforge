package com.streakforge.modules.auth.service;

import com.streakforge.modules.auth.domain.RefreshToken;
import com.streakforge.modules.auth.domain.UserAccount;
import com.streakforge.modules.auth.repository.RefreshTokenRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final long refreshTokenDays;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${app.security.refresh-token-days}") long refreshTokenDays
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenDays = refreshTokenDays;
    }

    public IssuedRefreshToken issue(UserAccount user) {
        String rawToken = randomToken();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(user.getId());
        refreshToken.setOrganizationId(user.getOrganizationId());
        refreshToken.setTokenHash(hash(rawToken));
        refreshToken.setExpiresAt(Instant.now().plus(refreshTokenDays, ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshToken);
        return new IssuedRefreshToken(rawToken, refreshToken);
    }

    public RefreshToken consume(String rawToken) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash(rawToken))
                .orElseThrow(() -> new BadCredentialsException("Refresh token is invalid"));
        if (!refreshToken.isActive(Instant.now())) {
            throw new BadCredentialsException("Refresh token has expired");
        }
        refreshToken.revoke();
        return refreshToken;
    }

    private String randomToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash refresh token", ex);
        }
    }

    public record IssuedRefreshToken(String rawToken, RefreshToken entity) {
    }
}
