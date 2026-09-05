package com.streakforge.modules.athlete.controller;

import com.streakforge.common.api.ApiResponse;
import com.streakforge.modules.athlete.dto.AthleteProfileDto;
import com.streakforge.modules.athlete.dto.CreateAthleteProfileRequest;
import com.streakforge.modules.athlete.dto.UpdateAthleteProfileRequest;
import com.streakforge.modules.athlete.service.AthleteProfileService;
import com.streakforge.modules.auth.security.CurrentUser;
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
@RequestMapping("/api/v1/athletes")
public class AthleteProfileController {
    private final AthleteProfileService athleteProfileService;

    public AthleteProfileController(AthleteProfileService athleteProfileService) {
        this.athleteProfileService = athleteProfileService;
    }

    @GetMapping
    public ApiResponse<List<AthleteProfileDto>> listAthletes(@AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(athleteProfileService.listAthletes(currentUser.organizationId()));
    }

    @GetMapping("/{athleteId}")
    public ApiResponse<AthleteProfileDto> getAthlete(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID athleteId
    ) {
        return ApiResponse.ok(athleteProfileService.getAthlete(currentUser.organizationId(), athleteId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<AthleteProfileDto> createAthlete(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody CreateAthleteProfileRequest request
    ) {
        return ApiResponse.ok(athleteProfileService.createAthlete(currentUser.organizationId(), request), "Athlete profile created");
    }

    @PutMapping("/{athleteId}")
    @PreAuthorize("hasAnyRole('COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<AthleteProfileDto> updateAthlete(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID athleteId,
            @Valid @RequestBody UpdateAthleteProfileRequest request
    ) {
        return ApiResponse.ok(athleteProfileService.updateAthlete(currentUser.organizationId(), athleteId, request), "Athlete profile updated");
    }

    @DeleteMapping("/{athleteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('COACH', 'ACADEMY_ADMIN', 'SUPER_ADMIN')")
    public void deleteAthlete(@AuthenticationPrincipal CurrentUser currentUser, @PathVariable UUID athleteId) {
        athleteProfileService.deleteAthlete(currentUser.organizationId(), athleteId);
    }
}
