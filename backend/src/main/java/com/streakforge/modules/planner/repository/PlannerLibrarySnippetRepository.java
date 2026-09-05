package com.streakforge.modules.planner.repository;

import com.streakforge.modules.planner.domain.PlannerLibrarySnippet;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlannerLibrarySnippetRepository extends JpaRepository<PlannerLibrarySnippet, UUID> {
    List<PlannerLibrarySnippet> findAllByProfileIdAndType(UUID profileId, String type);
    void deleteByIdAndProfileId(UUID id, UUID profileId);
}
