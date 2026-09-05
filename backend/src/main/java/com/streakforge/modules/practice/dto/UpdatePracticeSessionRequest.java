package com.streakforge.modules.practice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdatePracticeSessionRequest(
        @NotNull LocalDate practiceDate,
        @NotNull @Min(5) @Max(480) Integer durationMinutes,
        @NotNull @Min(1) @Max(100) Integer disciplineScore,
        @Size(max = 120) String focusArea,
        @Size(max = 1000) String coachFeedback,
        @Size(max = 1000) String athleteReflection
) {
}
