# Requirements: Custom Training & Nutrition Planning

## Core Objectives
Enable athletes (and parents) to design, manage, and assign custom training and nutrition templates to specific dates or periods.

## New Features
1.  **Template System:**
    *   Create "Daily Routine" templates (e.g., "Heavy Training Day", "Light Recovery Day", "Off-Season Day").
    *   Create "Nutrition" templates (e.g., "Pre-Competition", "High Protein", "Normal").
    *   Templates should include tasks, nutrition items, and hydration targets.

2.  **Flexible Scheduling:**
    *   Assign templates to a specific day.
    *   Assign templates to a range of dates (e.g., "Summer Camp Week").
    *   Recurring assignments (e.g., "Every Monday is Heavy Training").

3.  **Special Day Types:**
    *   **Rest Day:** Mark a day as a planned rest day. Reduces the "checklist" burden while maintaining the streak.
    *   **Sick Day:** Mark a day as sick. Pauses streak requirements or logs it as a non-training day without penalty to discipline score.
    *   **Travel Day:** Adjust routines for travel constraints.

4.  **Multi-Level Planning:**
    *   **Daily:** Specific checklist for the day.
    *   **Weekly:** Weekly focus areas and repeating patterns.
    *   **Monthly/Yearly:** High-level goals and macrocycles.

## Technical Considerations
*   **Data Model Migration:** Update `UserProfile` and `DailyRecord` to handle template references and special day types.
*   **Persistence:** Templates must be stored in `localStorage` per profile.
*   **UI/UX:** A new "Plan Builder" or "Template Manager" screen.
*   **Calendar Integration:** Visual indicators on the calendar for different day types and assigned templates.
