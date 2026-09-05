package com.streakforge.modules.practice.repository;

import com.streakforge.modules.practice.domain.PracticeSession;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PracticeSessionRepository extends JpaRepository<PracticeSession, UUID> {
    List<PracticeSession> findByOrganizationIdAndAthleteIdAndDeletedAtIsNullOrderByPracticeDateDesc(UUID organizationId, UUID athleteId);

    List<PracticeSession> findByOrganizationIdAndDeletedAtIsNullOrderByPracticeDateDesc(UUID organizationId);

    long countByOrganizationIdAndDeletedAtIsNullAndPracticeDateBetween(UUID organizationId, LocalDate startsAt, LocalDate endsAt);

    @Query("""
            select coalesce(avg(p.disciplineScore), 0)
            from PracticeSession p
            where p.organizationId = :organizationId
              and p.deletedAt is null
              and p.practiceDate between :startsAt and :endsAt
            """)
    double averageDisciplineScore(
            @Param("organizationId") UUID organizationId,
            @Param("startsAt") LocalDate startsAt,
            @Param("endsAt") LocalDate endsAt
    );

    @Query("""
            select count(p)
            from PracticeSession p
            where p.organizationId = :organizationId
              and p.deletedAt is null
              and p.coachFeedback is not null
              and length(trim(p.coachFeedback)) > 0
            """)
    long countCoachFeedback(@Param("organizationId") UUID organizationId);

    @Query("""
            select distinct p.practiceDate
            from PracticeSession p
            where p.organizationId = :organizationId
              and p.deletedAt is null
              and p.practiceDate between :startsAt and :endsAt
            order by p.practiceDate desc
            """)
    List<LocalDate> findPracticeDates(
            @Param("organizationId") UUID organizationId,
            @Param("startsAt") LocalDate startsAt,
            @Param("endsAt") LocalDate endsAt
    );

    @Query("""
            select p.focusArea, count(p)
            from PracticeSession p
            where p.organizationId = :organizationId
              and p.deletedAt is null
              and p.focusArea is not null
              and length(trim(p.focusArea)) > 0
              and p.practiceDate between :startsAt and :endsAt
            group by p.focusArea
            order by count(p) desc
            """)
    List<Object[]> topFocusAreas(
            @Param("organizationId") UUID organizationId,
            @Param("startsAt") LocalDate startsAt,
            @Param("endsAt") LocalDate endsAt
    );
}
