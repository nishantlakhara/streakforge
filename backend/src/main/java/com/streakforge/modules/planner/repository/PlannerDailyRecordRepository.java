package com.streakforge.modules.planner.repository;

import com.streakforge.modules.planner.domain.PlannerDailyRecord;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlannerDailyRecordRepository extends JpaRepository<PlannerDailyRecord, UUID> {
    List<PlannerDailyRecord> findAllByProfileId(UUID profileId);
    Optional<PlannerDailyRecord> findByProfileIdAndDate(UUID profileId, LocalDate date);
}
