package com.streakforge.modules.planner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class PlannerDtos {
    private PlannerDtos() {}

    // ── Profiles ──────────────────────────────────────────────────
    public record CreateProfileRequest(
            @NotBlank @Size(max = 140) String name
    ) {}

    public record ProfileDto(
            UUID id,
            String name,
            String createdAt
    ) {}

    // ── Templates ─────────────────────────────────────────────────
    public record SaveTemplateRequest(
            UUID id,  // null = create, non-null = update
            @NotBlank @Size(max = 140) String name,
            @NotBlank String type,
            int hydrationTarget,
            @NotNull List<Map<String, Object>> tasks,
            @NotNull List<Map<String, Object>> nutrition,
            @NotNull List<String> drills
    ) {}

    public record TemplateDto(
            UUID id,
            String name,
            String type,
            int hydrationTarget,
            List<Map<String, Object>> tasks,
            List<Map<String, Object>> nutrition,
            List<String> drills,
            String createdAt,
            String updatedAt
    ) {}

    // ── Schedule ──────────────────────────────────────────────────
    public record AssignScheduleRequest(
            @NotNull List<String> dates,         // YYYY-MM-DD strings
            String templateId                    // null or "" = clear
    ) {}

    // schedule map is returned as Map<String, String> (date → templateId)

    // ── Daily Records ─────────────────────────────────────────────
    public record SaveRecordRequest(
            @NotBlank String type,
            String templateId,
            @NotNull List<Map<String, Object>> tasks,
            @NotNull List<Map<String, Object>> nutrition,
            @NotNull List<Map<String, Object>> drills,
            int hydrationGlasses,
            String sleepBedTime,
            String sleepWakeTime,
            BigDecimal sleepHours,
            String sleepScore,
            String notes
    ) {}

    public record RecordDto(
            String date,
            String type,
            String templateId,
            List<Map<String, Object>> tasks,
            List<Map<String, Object>> nutrition,
            List<Map<String, Object>> drills,
            Map<String, Object> hydration,
            Map<String, Object> sleep,
            String notes
    ) {}

    // ── Library Snippets ──────────────────────────────────────────
    public record SaveSnippetRequest(
            UUID id,  // null = create, non-null = update
            @NotBlank @Size(max = 140) String name,
            @NotBlank String type,
            @NotNull Map<String, Object> data
    ) {}

    public record SnippetDto(
            UUID id,
            String name,
            String type,
            Map<String, Object> data,
            String createdAt
    ) {}
}
