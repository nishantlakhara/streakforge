package com.streakforge.modules.athlete.dto;

import java.time.LocalDate;
import java.util.UUID;

public record AthleteProfileDto(
        UUID id,
        UUID userId,
        String displayName,
        LocalDate dateOfBirth,
        String primaryDiscipline,
        UUID coachId,
        String guardianEmail,
        String skillLevel,
        String seasonGoal,
        boolean active
) {
}
