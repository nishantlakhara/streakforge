package com.streakforge.modules.planner.repository;

import com.streakforge.modules.planner.domain.PlannerTemplate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlannerTemplateRepository extends JpaRepository<PlannerTemplate, UUID> {
    List<PlannerTemplate> findAllByProfileId(UUID profileId);
    Optional<PlannerTemplate> findByIdAndProfileId(UUID id, UUID profileId);
    void deleteByIdAndProfileId(UUID id, UUID profileId);
}
