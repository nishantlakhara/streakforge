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
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "planner_library_snippets")
@EntityListeners(AuditingEntityListener.class)
public class PlannerLibrarySnippet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID profileId;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false, length = 140)
    private String name;

    @Column(nullable = false, columnDefinition = "text")
    private String data = "{}";

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public UUID getId() { return id; }
    public UUID getProfileId() { return profileId; }
    public void setProfileId(UUID profileId) { this.profileId = profileId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
    public Instant getCreatedAt() { return createdAt; }
}
