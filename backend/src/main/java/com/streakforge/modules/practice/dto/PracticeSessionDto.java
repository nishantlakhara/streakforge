package com.streakforge.modules.practice.dto;

import java.time.LocalDate;
import java.util.UUID;

public record PracticeSessionDto(
        UUID id,
        UUID athleteId,
        LocalDate practiceDate,
        Integer durationMinutes,
        Integer disciplineScore,
        String focusArea,
        String coachFeedback,
        String athleteReflection
) {
}
