package com.streakforge.modules.auth.controller;

import com.streakforge.common.api.ApiResponse;
import com.streakforge.modules.auth.dto.AuthDtos.AuthResponse;
import com.streakforge.modules.auth.dto.AuthDtos.AuthenticatedUserDto;
import com.streakforge.modules.auth.dto.AuthDtos.LoginRequest;
import com.streakforge.modules.auth.dto.AuthDtos.RefreshRequest;
import com.streakforge.modules.auth.dto.AuthDtos.RegisterAcademyRequest;
import com.streakforge.modules.auth.dto.AuthDtos.RegisterUserRequest;
import com.streakforge.modules.auth.security.CurrentUser;
import com.streakforge.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> registerUser(@Valid @RequestBody RegisterUserRequest request) {
        return ApiResponse.ok(authService.registerUser(request), "Account created");
    }

    @PostMapping("/register-academy")
    public ApiResponse<AuthResponse> registerAcademy(@Valid @RequestBody RegisterAcademyRequest request) {
        return ApiResponse.ok(authService.registerAcademy(request), "Academy workspace created");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request), "Signed in");
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ApiResponse.ok(authService.refresh(request.refreshToken()), "Session refreshed");
    }

    @GetMapping("/me")
    public ApiResponse<AuthenticatedUserDto> me(@AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(authService.me(currentUser));
    }
}
