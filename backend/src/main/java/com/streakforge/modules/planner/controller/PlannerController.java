package com.streakforge.modules.planner.controller;

import com.streakforge.common.api.ApiResponse;
import com.streakforge.modules.auth.security.CurrentUser;
import com.streakforge.modules.planner.dto.PlannerDtos.AssignScheduleRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.CreateProfileRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.ProfileDto;
import com.streakforge.modules.planner.dto.PlannerDtos.RecordDto;
import com.streakforge.modules.planner.dto.PlannerDtos.SaveRecordRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.SaveSnippetRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.SaveTemplateRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.SnippetDto;
import com.streakforge.modules.planner.dto.PlannerDtos.TemplateDto;
import com.streakforge.modules.planner.service.PlannerService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/planner")
public class PlannerController {

    private final PlannerService plannerService;

    public PlannerController(PlannerService plannerService) {
        this.plannerService = plannerService;
    }

    // ── Profiles ──────────────────────────────────────────────────────────────

    @GetMapping("/profiles")
    public ApiResponse<List<ProfileDto>> listProfiles(@AuthenticationPrincipal CurrentUser user) {
        return ApiResponse.ok(plannerService.listProfiles(user.id()));
    }

    @PostMapping("/profiles")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProfileDto> createProfile(
            @AuthenticationPrincipal CurrentUser user,
            @Valid @RequestBody CreateProfileRequest request) {
        return ApiResponse.ok(plannerService.createProfile(user.id(), request), "Profile created");
    }

    @DeleteMapping("/profiles/{profileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProfile(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable UUID profileId) {
        plannerService.deleteProfile(user.id(), profileId);
    }

    // ── Templates ─────────────────────────────────────────────────────────────

    @GetMapping("/profiles/{profileId}/templates")
    public ApiResponse<List<TemplateDto>> listTemplates(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable UUID profileId) {
        return ApiResponse.ok(plannerService.listTemplates(user.id(), profileId));
    }

    @PostMapping("/profiles/{profileId}/templates")
    public ApiResponse<TemplateDto> saveTemplate(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable UUID profileId,
            @Valid @RequestBody SaveTemplateRequest request) {
        return ApiResponse.ok(plannerService.saveTemplate(user.id(), profileId, request), "Template saved");
    }

    @DeleteMapping("/profiles/{profileId}/templates/{templateId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTemplate(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable UUID profileId,
            @PathVariable UUID templateId) {
        plannerService.deleteTemplate(user.id(), profileId, templateId);
    }

    // ── Schedule ──────────────────────────────────────────────────────────────

    @GetMapping("/profiles/{profileId}/schedule")
    public ApiResponse<Map<String, String>> getSchedule(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable UUID profileId) {
        return ApiResponse.ok(plannerService.getSchedule(user.id(), profileId));
    }

    @PutMapping("/profiles/{profileId}/schedule")
    public ApiResponse<Void> assignSchedule(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable UUID profileId,
            @Valid @RequestBody AssignScheduleRequest request) {
        plannerService.assignSchedule(user.id(), profileId, request);
        return ApiResponse.ok(null, "Schedule updated");
    }

    // ── Daily Records ─────────────────────────────────────────────────────────

    @GetMapping("/profiles/{profileId}/records")
    public ApiResponse<Map<String, RecordDto>> getAllRecords(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable UUID profileId) {
        return ApiResponse.ok(plannerService.getAllRecords(user.id(), profileId));
    }

    @PutMapping("/profiles/{profileId}/records/{date}")
    public ApiResponse<RecordDto> saveRecord(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable UUID profileId,
            @PathVariable String date,
            @Valid @RequestBody SaveRecordRequest request) {
        return ApiResponse.ok(plannerService.saveRecord(user.id(), profileId, date, request), "Record saved");
    }

    // ── Library ───────────────────────────────────────────────────────────────

    @GetMapping("/profiles/{profileId}/library/{type}")
    public ApiResponse<List<SnippetDto>> listSnippets(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable UUID profileId,
            @PathVariable String type) {
        return ApiResponse.ok(plannerService.listSnippets(user.id(), profileId, type));
    }

    @PostMapping("/profiles/{profileId}/library")
    public ApiResponse<SnippetDto> saveSnippet(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable UUID profileId,
            @Valid @RequestBody SaveSnippetRequest request) {
        return ApiResponse.ok(plannerService.saveSnippet(user.id(), profileId, request), "Snippet saved");
    }

    @DeleteMapping("/profiles/{profileId}/library/{type}/{snippetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSnippet(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable UUID profileId,
            @PathVariable String type,
            @PathVariable UUID snippetId) {
        plannerService.deleteSnippet(user.id(), profileId, snippetId);
    }
}
