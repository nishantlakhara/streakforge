package com.streakforge.modules.auth.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.streakforge.common.security.Role;
import com.streakforge.modules.auth.domain.UserAccount;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private static final TypeReference<Map<String, Object>> CLAIMS_TYPE = new TypeReference<>() {
    };

    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final byte[] secret;
    private final long accessTokenMinutes;

    public JwtService(
            ObjectMapper objectMapper,
            @Value("${app.security.jwt-secret}") String jwtSecret,
            @Value("${app.security.access-token-minutes}") long accessTokenMinutes
    ) {
        this.objectMapper = objectMapper;
        this.clock = Clock.systemUTC();
        this.secret = jwtSecret.getBytes(StandardCharsets.UTF_8);
        this.accessTokenMinutes = accessTokenMinutes;
    }

    public TokenIssue issueAccessToken(UserAccount user) {
        Instant now = Instant.now(clock);
        Instant expiresAt = now.plus(accessTokenMinutes, ChronoUnit.MINUTES);
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("sub", user.getId().toString());
        claims.put("org", user.getOrganizationId().toString());
        claims.put("email", user.getEmail());
        claims.put("name", user.getDisplayName());
        claims.put("role", user.getRole().name());
        claims.put("iat", now.getEpochSecond());
        claims.put("exp", expiresAt.getEpochSecond());
        claims.put("typ", "access");
        return new TokenIssue(sign(claims), expiresAt);
    }

    public CurrentUser parseAccessToken(String token) {
        Map<String, Object> claims = verifyAndReadClaims(token);
        if (!"access".equals(claims.get("typ"))) {
            throw new BadCredentialsException("Unsupported token type");
        }
        long expiresAt = asLong(claims.get("exp"));
        if (Instant.now(clock).getEpochSecond() >= expiresAt) {
            throw new BadCredentialsException("Access token expired");
        }
        return new CurrentUser(
                UUID.fromString(requiredClaim(claims, "sub")),
                UUID.fromString(requiredClaim(claims, "org")),
                requiredClaim(claims, "email"),
                requiredClaim(claims, "name"),
                Role.valueOf(requiredClaim(claims, "role"))
        );
    }

    private String sign(Map<String, Object> claims) {
        try {
            String header = encodeJson(Map.of("alg", "HS256", "typ", "JWT"));
            String payload = encodeJson(claims);
            String unsignedToken = header + "." + payload;
            return unsignedToken + "." + base64Url(hmac(unsignedToken));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to issue access token", ex);
        }
    }

    private Map<String, Object> verifyAndReadClaims(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new BadCredentialsException("Malformed access token");
            }
            String unsignedToken = parts[0] + "." + parts[1];
            byte[] expectedSignature = hmac(unsignedToken);
            byte[] actualSignature = Base64.getUrlDecoder().decode(parts[2]);
            if (!MessageDigest.isEqual(expectedSignature, actualSignature)) {
                throw new BadCredentialsException("Invalid access token signature");
            }
            byte[] payload = Base64.getUrlDecoder().decode(parts[1]);
            return objectMapper.readValue(payload, CLAIMS_TYPE);
        } catch (BadCredentialsException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid access token", ex);
        }
    }

    private String encodeJson(Object value) throws Exception {
        return base64Url(objectMapper.writeValueAsBytes(value));
    }

    private byte[] hmac(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
    }

    private String base64Url(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private String requiredClaim(Map<String, Object> claims, String key) {
        Object value = claims.get(key);
        if (value == null) {
            throw new BadCredentialsException("Access token missing " + key);
        }
        return value.toString();
    }

    private long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(value.toString());
    }

    public record TokenIssue(String token, Instant expiresAt) {
    }
}
