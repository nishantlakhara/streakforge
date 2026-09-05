package com.streakforge.modules.dashboard.dto;

import java.util.List;

public record DashboardSummaryDto(
        long activeAthletes,
        long practicesThisMonth,
        int averageDisciplineScore,
        long coachFeedbackCount,
        int teamStreakDays,
        List<FocusAreaDto> focusAreas,
        List<String> achievements,
        List<WeeklyLoadDto> weeklyLoad
) {
    public record FocusAreaDto(
            String label,
            int sessions,
            int progress
    ) {
    }

    public record WeeklyLoadDto(
            String label,
            long sessions
    ) {
    }
}
