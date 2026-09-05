package com.streakforge.modules.planner.repository;

import com.streakforge.modules.planner.domain.PlannerScheduleEntry;
import com.streakforge.modules.planner.domain.PlannerScheduleEntry.PlannerScheduleId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface PlannerScheduleRepository extends JpaRepository<PlannerScheduleEntry, PlannerScheduleId> {
    List<PlannerScheduleEntry> findAllByProfileId(UUID profileId);

    @Modifying
    @Query("DELETE FROM PlannerScheduleEntry s WHERE s.profileId = :profileId AND s.date IN :dates")
    void deleteByProfileIdAndDates(UUID profileId, java.util.List<java.time.LocalDate> dates);
}
