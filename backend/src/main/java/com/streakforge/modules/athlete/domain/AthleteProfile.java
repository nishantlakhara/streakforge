package com.streakforge.modules.athlete.domain;

import com.streakforge.common.audit.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "athlete_profiles")
public class AthleteProfile extends BaseEntity {
    private UUID userId;

    @Column(nullable = false, length = 140)
    private String displayName;

    private LocalDate dateOfBirth;

    @Column(length = 80)
    private String primaryDiscipline;

    private UUID coachId;

    @Column(length = 180)
    private String guardianEmail;

    @Column(length = 80)
    private String skillLevel;

    @Column(length = 500)
    private String seasonGoal;

    @Column(nullable = false)
    private boolean active = true;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getPrimaryDiscipline() {
        return primaryDiscipline;
    }

    public void setPrimaryDiscipline(String primaryDiscipline) {
        this.primaryDiscipline = primaryDiscipline;
    }

    public UUID getCoachId() {
        return coachId;
    }

    public void setCoachId(UUID coachId) {
        this.coachId = coachId;
    }

    public String getGuardianEmail() {
        return guardianEmail;
    }

    public void setGuardianEmail(String guardianEmail) {
        this.guardianEmail = guardianEmail;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    public String getSeasonGoal() {
        return seasonGoal;
    }

    public void setSeasonGoal(String seasonGoal) {
        this.seasonGoal = seasonGoal;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
