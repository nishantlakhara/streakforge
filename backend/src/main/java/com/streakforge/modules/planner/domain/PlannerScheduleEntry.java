package com.streakforge.modules.planner.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "planner_schedule")
@IdClass(PlannerScheduleEntry.PlannerScheduleId.class)
public class PlannerScheduleEntry {

    @Id
    @Column(nullable = false)
    private UUID profileId;

    @Id
    @Column(nullable = false)
    private LocalDate date;

    @Column
    private UUID templateId;

    public UUID getProfileId() { return profileId; }
    public void setProfileId(UUID profileId) { this.profileId = profileId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public UUID getTemplateId() { return templateId; }
    public void setTemplateId(UUID templateId) { this.templateId = templateId; }

    public static class PlannerScheduleId implements Serializable {
        private UUID profileId;
        private LocalDate date;

        public PlannerScheduleId() {}
        public PlannerScheduleId(UUID profileId, LocalDate date) {
            this.profileId = profileId;
            this.date = date;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof PlannerScheduleId that)) return false;
            return Objects.equals(profileId, that.profileId) && Objects.equals(date, that.date);
        }

        @Override
        public int hashCode() {
            return Objects.hash(profileId, date);
        }
    }
}
