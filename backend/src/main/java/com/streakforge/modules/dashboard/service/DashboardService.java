package com.streakforge.modules.dashboard.service;

import com.streakforge.modules.athlete.repository.AthleteProfileRepository;
import com.streakforge.modules.dashboard.dto.DashboardSummaryDto;
import com.streakforge.modules.dashboard.dto.DashboardSummaryDto.FocusAreaDto;
import com.streakforge.modules.dashboard.dto.DashboardSummaryDto.WeeklyLoadDto;
import com.streakforge.modules.practice.repository.PracticeSessionRepository;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {
    private final AthleteProfileRepository athleteProfileRepository;
    private final PracticeSessionRepository practiceSessionRepository;
    private final Clock clock;

    public DashboardService(
            AthleteProfileRepository athleteProfileRepository,
            PracticeSessionRepository practiceSessionRepository
    ) {
        this.athleteProfileRepository = athleteProfileRepository;
        this.practiceSessionRepository = practiceSessionRepository;
        this.clock = Clock.systemDefaultZone();
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto summary(UUID organizationId) {
        LocalDate today = LocalDate.now(clock);
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate last28Days = today.minusDays(27);

        long activeAthletes = athleteProfileRepository.countByOrganizationIdAndDeletedAtIsNullAndActiveTrue(organizationId);
        long practicesThisMonth = practiceSessionRepository.countByOrganizationIdAndDeletedAtIsNullAndPracticeDateBetween(
                organizationId,
                monthStart,
                today
        );
        int averageDiscipline = (int) Math.round(practiceSessionRepository.averageDisciplineScore(
                organizationId,
                last28Days,
                today
        ));
        long feedbackCount = practiceSessionRepository.countCoachFeedback(organizationId);
        int teamStreakDays = calculateTeamStreak(organizationId, today);
        List<FocusAreaDto> focusAreas = topFocusAreas(organizationId, last28Days, today);

        return new DashboardSummaryDto(
                activeAthletes,
                practicesThisMonth,
                averageDiscipline,
                feedbackCount,
                teamStreakDays,
                focusAreas,
                achievements(activeAthletes, practicesThisMonth, averageDiscipline, feedbackCount),
                weeklyLoad(organizationId, today)
        );
    }

    private int calculateTeamStreak(UUID organizationId, LocalDate today) {
        Set<LocalDate> practiceDates = new HashSet<>(practiceSessionRepository.findPracticeDates(
                organizationId,
                today.minusDays(90),
                today
        ));

        int streak = 0;
        LocalDate cursor = today;
        while (practiceDates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private List<FocusAreaDto> topFocusAreas(UUID organizationId, LocalDate startsAt, LocalDate endsAt) {
        List<Object[]> rows = practiceSessionRepository.topFocusAreas(organizationId, startsAt, endsAt);
        long maxSessions = rows.stream()
                .mapToLong(row -> (Long) row[1])
                .max()
                .orElse(1);

        return rows.stream()
                .limit(4)
                .map(row -> {
                    long sessions = (Long) row[1];
                    int progress = (int) Math.max(8, Math.round((sessions * 100.0) / maxSessions));
                    return new FocusAreaDto((String) row[0], (int) sessions, progress);
                })
                .toList();
    }

    private List<String> achievements(long activeAthletes, long practicesThisMonth, int averageDiscipline, long feedbackCount) {
        List<String> achievements = new ArrayList<>();
        if (practicesThisMonth > 0) {
            achievements.add(practicesThisMonth + " practices logged this month");
        }
        if (averageDiscipline >= 80) {
            achievements.add("Team discipline is holding above 80%");
        }
        if (feedbackCount > 0) {
            achievements.add(feedbackCount + " coach feedback notes shared");
        }
        if (activeAthletes > 0) {
            achievements.add(activeAthletes + " active athletes supported");
        }
        if (achievements.isEmpty()) {
            achievements.add("Create an athlete profile to start tracking momentum");
        }
        return achievements;
    }

    private List<WeeklyLoadDto> weeklyLoad(UUID organizationId, LocalDate today) {
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<WeeklyLoadDto> load = new ArrayList<>();
        for (int offset = 0; offset < 7; offset++) {
            LocalDate day = weekStart.plusDays(offset);
            long sessions = practiceSessionRepository.countByOrganizationIdAndDeletedAtIsNullAndPracticeDateBetween(
                    organizationId,
                    day,
                    day
            );
            String label = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            load.add(new WeeklyLoadDto(label, sessions));
        }
        return load;
    }
}
