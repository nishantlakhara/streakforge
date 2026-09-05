package com.streakforge.modules.practice.controller;

import com.streakforge.common.api.ApiResponse;
import com.streakforge.modules.auth.security.CurrentUser;
import com.streakforge.modules.practice.dto.CreatePracticeSessionRequest;
import com.streakforge.modules.practice.dto.PracticeSessionDto;
import com.streakforge.modules.practice.dto.UpdatePracticeSessionRequest;
import com.streakforge.modules.practice.service.PracticeSessionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/athletes/{athleteId}/practice-sessions")
public class PracticeSessionController {
    private final PracticeSessionService practiceSessionService;

    public PracticeSessionController(PracticeSessionService practiceSessionService) {
        this.practiceSessionService = practiceSessionService;
    }

    @GetMapping
    public ApiResponse<List<PracticeSessionDto>> listSessions(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID athleteId
    ) {
        return ApiResponse.ok(practiceSessionService.listAthleteSessions(currentUser.organizationId(), athleteId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<PracticeSessionDto> createSession(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID athleteId,
            @Valid @RequestBody CreatePracticeSessionRequest request
    ) {
        return ApiResponse.ok(
                practiceSessionService.createSession(currentUser.organizationId(), athleteId, request),
                "Practice session logged"
        );
    }

    @PutMapping("/{sessionId}")
    @PreAuthorize("hasAnyRole('COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<PracticeSessionDto> updateSession(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID athleteId,
            @PathVariable UUID sessionId,
            @Valid @RequestBody UpdatePracticeSessionRequest request
    ) {
        return ApiResponse.ok(
                practiceSessionService.updateSession(currentUser.organizationId(), athleteId, sessionId, request),
                "Practice session updated"
        );
    }

    @DeleteMapping("/{sessionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN')")
    public void deleteSession(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID athleteId,
            @PathVariable UUID sessionId
    ) {
        practiceSessionService.deleteSession(currentUser.organizationId(), athleteId, sessionId);
    }
}
