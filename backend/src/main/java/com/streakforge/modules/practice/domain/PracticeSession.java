package com.streakforge.modules.practice.domain;

import com.streakforge.common.audit.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "practice_sessions")
public class PracticeSession extends BaseEntity {
    @Column(nullable = false)
    private UUID athleteId;

    @Column(nullable = false)
    private LocalDate practiceDate;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private Integer disciplineScore;

    @Column(length = 1000)
    private String coachFeedback;

    @Column(length = 120)
    private String focusArea;

    @Column(length = 1000)
    private String athleteReflection;

    public UUID getAthleteId() {
        return athleteId;
    }

    public void setAthleteId(UUID athleteId) {
        this.athleteId = athleteId;
    }

    public LocalDate getPracticeDate() {
        return practiceDate;
    }

    public void setPracticeDate(LocalDate practiceDate) {
        this.practiceDate = practiceDate;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Integer getDisciplineScore() {
        return disciplineScore;
    }

    public void setDisciplineScore(Integer disciplineScore) {
        this.disciplineScore = disciplineScore;
    }

    public String getCoachFeedback() {
        return coachFeedback;
    }

    public void setCoachFeedback(String coachFeedback) {
        this.coachFeedback = coachFeedback;
    }

    public String getFocusArea() {
        return focusArea;
    }

    public void setFocusArea(String focusArea) {
        this.focusArea = focusArea;
    }

    public String getAthleteReflection() {
        return athleteReflection;
    }

    public void setAthleteReflection(String athleteReflection) {
        this.athleteReflection = athleteReflection;
    }
}
