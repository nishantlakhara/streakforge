package com.streakforge.modules.planner.repository;

import com.streakforge.modules.planner.domain.PlannerProfile;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlannerProfileRepository extends JpaRepository<PlannerProfile, UUID> {
    List<PlannerProfile> findAllByUserId(UUID userId);
    boolean existsByIdAndUserId(UUID id, UUID userId);
}
