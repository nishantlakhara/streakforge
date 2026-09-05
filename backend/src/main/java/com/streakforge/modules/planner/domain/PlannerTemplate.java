package com.streakforge.modules.planner.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "planner_templates")
@EntityListeners(AuditingEntityListener.class)
public class PlannerTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID profileId;

    @Column(nullable = false, length = 140)
    private String name;

    @Column(nullable = false, length = 40)
    private String type = "training";

    @Column(nullable = false)
    private int hydrationTarget = 8;

    @Column(nullable = false, columnDefinition = "text")
    private String tasks = "[]";

    @Column(nullable = false, columnDefinition = "text")
    private String nutrition = "[]";

    @Column(nullable = false, columnDefinition = "text")
    private String drills = "[]";

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
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public int getHydrationTarget() { return hydrationTarget; }
    public void setHydrationTarget(int hydrationTarget) { this.hydrationTarget = hydrationTarget; }
    public String getTasks() { return tasks; }
    public void setTasks(String tasks) { this.tasks = tasks; }
    public String getNutrition() { return nutrition; }
    public void setNutrition(String nutrition) { this.nutrition = nutrition; }
    public String getDrills() { return drills; }
    public void setDrills(String drills) { this.drills = drills; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
