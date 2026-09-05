package com.streakforge.modules.practice.service;

import com.streakforge.common.exception.ResourceNotFoundException;
import com.streakforge.modules.athlete.repository.AthleteProfileRepository;
import com.streakforge.modules.practice.domain.PracticeSession;
import com.streakforge.modules.practice.dto.CreatePracticeSessionRequest;
import com.streakforge.modules.practice.dto.PracticeSessionDto;
import com.streakforge.modules.practice.dto.UpdatePracticeSessionRequest;
import com.streakforge.modules.practice.repository.PracticeSessionRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PracticeSessionService {
    private final PracticeSessionRepository practiceSessionRepository;
    private final AthleteProfileRepository athleteProfileRepository;

    public PracticeSessionService(
            PracticeSessionRepository practiceSessionRepository,
            AthleteProfileRepository athleteProfileRepository
    ) {
        this.practiceSessionRepository = practiceSessionRepository;
        this.athleteProfileRepository = athleteProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<PracticeSessionDto> listAthleteSessions(UUID organizationId, UUID athleteId) {
        ensureAthleteExists(organizationId, athleteId);
        return practiceSessionRepository
                .findByOrganizationIdAndAthleteIdAndDeletedAtIsNullOrderByPracticeDateDesc(organizationId, athleteId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PracticeSessionDto> listOrganizationSessions(UUID organizationId) {
        return practiceSessionRepository.findByOrganizationIdAndDeletedAtIsNullOrderByPracticeDateDesc(organizationId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public PracticeSessionDto createSession(UUID organizationId, UUID athleteId, CreatePracticeSessionRequest request) {
        ensureAthleteExists(organizationId, athleteId);
        PracticeSession session = new PracticeSession();
        session.setOrganizationId(organizationId);
        session.setAthleteId(athleteId);
        apply(session, request);
        return toDto(practiceSessionRepository.save(session));
    }

    @Transactional
    public PracticeSessionDto updateSession(
            UUID organizationId,
            UUID athleteId,
            UUID sessionId,
            UpdatePracticeSessionRequest request
    ) {
        ensureAthleteExists(organizationId, athleteId);
        PracticeSession session = findSession(organizationId, athleteId, sessionId);
        session.setPracticeDate(request.practiceDate());
        session.setDurationMinutes(request.durationMinutes());
        session.setDisciplineScore(request.disciplineScore());
        session.setFocusArea(trimToNull(request.focusArea()));
        session.setCoachFeedback(trimToNull(request.coachFeedback()));
        session.setAthleteReflection(trimToNull(request.athleteReflection()));
        return toDto(session);
    }

    @Transactional
    public void deleteSession(UUID organizationId, UUID athleteId, UUID sessionId) {
        PracticeSession session = findSession(organizationId, athleteId, sessionId);
        session.markDeleted();
    }

    private void ensureAthleteExists(UUID organizationId, UUID athleteId) {
        athleteProfileRepository.findById(athleteId)
                .filter(athlete -> organizationId.equals(athlete.getOrganizationId()))
                .filter(athlete -> athlete.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete profile was not found"));
    }

    private PracticeSession findSession(UUID organizationId, UUID athleteId, UUID sessionId) {
        return practiceSessionRepository.findById(sessionId)
                .filter(session -> organizationId.equals(session.getOrganizationId()))
                .filter(session -> athleteId.equals(session.getAthleteId()))
                .filter(session -> session.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Practice session was not found"));
    }

    private void apply(PracticeSession session, CreatePracticeSessionRequest request) {
        session.setPracticeDate(request.practiceDate());
        session.setDurationMinutes(request.durationMinutes());
        session.setDisciplineScore(request.disciplineScore());
        session.setFocusArea(trimToNull(request.focusArea()));
        session.setCoachFeedback(trimToNull(request.coachFeedback()));
        session.setAthleteReflection(trimToNull(request.athleteReflection()));
    }

    private PracticeSessionDto toDto(PracticeSession session) {
        return new PracticeSessionDto(
                session.getId(),
                session.getAthleteId(),
                session.getPracticeDate(),
                session.getDurationMinutes(),
                session.getDisciplineScore(),
                session.getFocusArea(),
                session.getCoachFeedback(),
                session.getAthleteReflection()
        );
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
