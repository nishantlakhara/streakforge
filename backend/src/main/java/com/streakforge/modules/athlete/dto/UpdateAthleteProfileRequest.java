package com.streakforge.modules.athlete.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateAthleteProfileRequest(
        UUID userId,
        @NotBlank @Size(max = 140) String displayName,
        LocalDate dateOfBirth,
        @Size(max = 80) String primaryDiscipline,
        UUID coachId,
        @Email @Size(max = 180) String guardianEmail,
        @Size(max = 80) String skillLevel,
        @Size(max = 500) String seasonGoal,
        boolean active
) {
}
