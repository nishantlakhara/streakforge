package com.streakforge.modules.athlete.service;

import com.streakforge.common.exception.ResourceNotFoundException;
import com.streakforge.modules.athlete.domain.AthleteProfile;
import com.streakforge.modules.athlete.dto.AthleteProfileDto;
import com.streakforge.modules.athlete.dto.CreateAthleteProfileRequest;
import com.streakforge.modules.athlete.dto.UpdateAthleteProfileRequest;
import com.streakforge.modules.athlete.repository.AthleteProfileRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AthleteProfileService {
    private final AthleteProfileRepository athleteProfileRepository;

    public AthleteProfileService(AthleteProfileRepository athleteProfileRepository) {
        this.athleteProfileRepository = athleteProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<AthleteProfileDto> listAthletes(UUID organizationId) {
        return athleteProfileRepository.findByOrganizationIdAndDeletedAtIsNullOrderByDisplayNameAsc(organizationId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AthleteProfileDto getAthlete(UUID organizationId, UUID athleteId) {
        return toDto(findActiveAthlete(organizationId, athleteId));
    }

    @Transactional
    public AthleteProfileDto createAthlete(UUID organizationId, CreateAthleteProfileRequest request) {
        AthleteProfile athlete = new AthleteProfile();
        athlete.setOrganizationId(organizationId);
        athlete.setActive(true);
        apply(athlete, request);
        return toDto(athleteProfileRepository.save(athlete));
    }

    @Transactional
    public AthleteProfileDto updateAthlete(UUID organizationId, UUID athleteId, UpdateAthleteProfileRequest request) {
        AthleteProfile athlete = findActiveAthlete(organizationId, athleteId);
        athlete.setUserId(request.userId());
        athlete.setDisplayName(request.displayName().trim());
        athlete.setDateOfBirth(request.dateOfBirth());
        athlete.setPrimaryDiscipline(trimToNull(request.primaryDiscipline()));
        athlete.setCoachId(request.coachId());
        athlete.setGuardianEmail(trimToNull(request.guardianEmail()));
        athlete.setSkillLevel(trimToNull(request.skillLevel()));
        athlete.setSeasonGoal(trimToNull(request.seasonGoal()));
        athlete.setActive(request.active());
        return toDto(athlete);
    }

    @Transactional
    public void deleteAthlete(UUID organizationId, UUID athleteId) {
        AthleteProfile athlete = findActiveAthlete(organizationId, athleteId);
        athlete.markDeleted();
    }

    private AthleteProfile findActiveAthlete(UUID organizationId, UUID athleteId) {
        return athleteProfileRepository.findById(athleteId)
                .filter(athlete -> organizationId.equals(athlete.getOrganizationId()))
                .filter(athlete -> athlete.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete profile was not found"));
    }

    private void apply(AthleteProfile athlete, CreateAthleteProfileRequest request) {
        athlete.setUserId(request.userId());
        athlete.setDisplayName(request.displayName().trim());
        athlete.setDateOfBirth(request.dateOfBirth());
        athlete.setPrimaryDiscipline(trimToNull(request.primaryDiscipline()));
        athlete.setCoachId(request.coachId());
        athlete.setGuardianEmail(trimToNull(request.guardianEmail()));
        athlete.setSkillLevel(trimToNull(request.skillLevel()));
        athlete.setSeasonGoal(trimToNull(request.seasonGoal()));
    }

    private AthleteProfileDto toDto(AthleteProfile athlete) {
        return new AthleteProfileDto(
                athlete.getId(),
                athlete.getUserId(),
                athlete.getDisplayName(),
                athlete.getDateOfBirth(),
                athlete.getPrimaryDiscipline(),
                athlete.getCoachId(),
                athlete.getGuardianEmail(),
                athlete.getSkillLevel(),
                athlete.getSeasonGoal(),
                athlete.isActive()
        );
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
