package com.streakforge.modules.planner.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "planner_daily_records")
@EntityListeners(AuditingEntityListener.class)
public class PlannerDailyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID profileId;

    @Column(nullable = false)
    private java.time.LocalDate date;

    @Column(nullable = false, length = 40)
    private String type = "training";

    @Column
    private UUID templateId;

    @Column(nullable = false, columnDefinition = "text")
    private String tasks = "[]";

    @Column(nullable = false, columnDefinition = "text")
    private String nutrition = "[]";

    @Column(nullable = false, columnDefinition = "text")
    private String drills = "[]";

    @Column(nullable = false)
    private int hydrationGlasses = 0;

    @Column(length = 20)
    private String sleepBedTime;

    @Column(length = 20)
    private String sleepWakeTime;

    @Column(precision = 4, scale = 2)
    private BigDecimal sleepHours;

    @Column(length = 40)
    private String sleepScore;

    @Column(columnDefinition = "text")
    private String notes;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getProfileId() { return profileId; }
    public void setProfileId(UUID profileId) { this.profileId = profileId; }
    public java.time.LocalDate getDate() { return date; }
    public void setDate(java.time.LocalDate date) { this.date = date; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public UUID getTemplateId() { return templateId; }
    public void setTemplateId(UUID templateId) { this.templateId = templateId; }
    public String getTasks() { return tasks; }
    public void setTasks(String tasks) { this.tasks = tasks; }
    public String getNutrition() { return nutrition; }
    public void setNutrition(String nutrition) { this.nutrition = nutrition; }
    public String getDrills() { return drills; }
    public void setDrills(String drills) { this.drills = drills; }
    public int getHydrationGlasses() { return hydrationGlasses; }
    public void setHydrationGlasses(int hydrationGlasses) { this.hydrationGlasses = hydrationGlasses; }
    public String getSleepBedTime() { return sleepBedTime; }
    public void setSleepBedTime(String sleepBedTime) { this.sleepBedTime = sleepBedTime; }
    public String getSleepWakeTime() { return sleepWakeTime; }
    public void setSleepWakeTime(String sleepWakeTime) { this.sleepWakeTime = sleepWakeTime; }
    public BigDecimal getSleepHours() { return sleepHours; }
    public void setSleepHours(BigDecimal sleepHours) { this.sleepHours = sleepHours; }
    public String getSleepScore() { return sleepScore; }
    public void setSleepScore(String sleepScore) { this.sleepScore = sleepScore; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
