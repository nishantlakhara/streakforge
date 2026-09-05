package com.streakforge.modules.planner.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.streakforge.modules.planner.domain.PlannerDailyRecord;
import com.streakforge.modules.planner.domain.PlannerProfile;
import com.streakforge.modules.planner.domain.PlannerTemplate;
import com.streakforge.modules.planner.dto.PlannerDtos.AssignScheduleRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.CreateProfileRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.ProfileDto;
import com.streakforge.modules.planner.dto.PlannerDtos.RecordDto;
import com.streakforge.modules.planner.dto.PlannerDtos.SaveRecordRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.SaveTemplateRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.TemplateDto;
import com.streakforge.modules.planner.repository.PlannerDailyRecordRepository;
import com.streakforge.modules.planner.repository.PlannerLibrarySnippetRepository;
import com.streakforge.modules.planner.repository.PlannerProfileRepository;
import com.streakforge.modules.planner.repository.PlannerScheduleRepository;
import com.streakforge.modules.planner.repository.PlannerTemplateRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlannerServiceTest {

    @Mock
    private PlannerProfileRepository profileRepo;
    @Mock
    private PlannerTemplateRepository templateRepo;
    @Mock
    private PlannerDailyRecordRepository recordRepo;
    @Mock
    private PlannerScheduleRepository scheduleRepo;
    @Mock
    private PlannerLibrarySnippetRepository libraryRepo;

    private PlannerService plannerService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        plannerService = new PlannerService(
                profileRepo,
                templateRepo,
                recordRepo,
                scheduleRepo,
                libraryRepo,
                objectMapper
        );
    }

    @Test
    @DisplayName("createProfile should persist new profile for user")
    void createProfile_Success() {
        UUID userId = UUID.randomUUID();
        CreateProfileRequest request = new CreateProfileRequest("Parth Elite");

        PlannerProfile savedProfile = new PlannerProfile();
        UUID profileId = UUID.randomUUID();
        savedProfile.setId(profileId);
        savedProfile.setUserId(userId);
        savedProfile.setName("Parth Elite");

        when(profileRepo.save(any(PlannerProfile.class))).thenReturn(savedProfile);

        ProfileDto dto = plannerService.createProfile(userId, request);
        assertThat(dto).isNotNull();
        assertThat(dto.id()).isEqualTo(profileId);
        assertThat(dto.name()).isEqualTo("Parth Elite");
    }

    @Test
    @DisplayName("saveTemplate should serialize tasks, nutrition, drills into JSON")
    void saveTemplate_Success() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        when(profileRepo.existsByIdAndUserId(profileId, userId)).thenReturn(true);

        SaveTemplateRequest request = new SaveTemplateRequest(
                null,
                "Heavy Training",
                "training",
                10,
                List.of(Map.of("label", "Morning Run", "category", "morning")),
                List.of(Map.of("label", "Oatmeal", "category", "breakfast")),
                List.of("10 Crossover Laps")
        );

        PlannerTemplate savedTemplate = new PlannerTemplate();
        UUID templateId = UUID.randomUUID();
        savedTemplate.setId(templateId);
        savedTemplate.setProfileId(profileId);
        savedTemplate.setName("Heavy Training");
        savedTemplate.setType("training");
        savedTemplate.setHydrationTarget(10);
        savedTemplate.setTasks("[{\"label\":\"Morning Run\",\"category\":\"morning\"}]");
        savedTemplate.setNutrition("[{\"label\":\"Oatmeal\",\"category\":\"breakfast\"}]");
        savedTemplate.setDrills("[\"10 Crossover Laps\"]");

        when(templateRepo.save(any(PlannerTemplate.class))).thenReturn(savedTemplate);

        TemplateDto templateDto = plannerService.saveTemplate(userId, profileId, request);
        assertThat(templateDto).isNotNull();
        assertThat(templateDto.name()).isEqualTo("Heavy Training");
        assertThat(templateDto.type()).isEqualTo("training");
        assertThat(templateDto.hydrationTarget()).isEqualTo(10);
        assertThat(templateDto.tasks()).hasSize(1);
    }

    @Test
    @DisplayName("verifyProfileOwnership should throw AccessDeniedException on unauthorized user")
    void unauthorizedAccess_ThrowsException() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();

        when(profileRepo.existsByIdAndUserId(profileId, userId)).thenReturn(false);

        assertThatThrownBy(() -> plannerService.listTemplates(userId, profileId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Profile not found or access denied");
    }

    @Test
    @DisplayName("saveRecord should persist daily record correctly")
    void saveRecord_Success() {
        UUID userId = UUID.randomUUID();
        UUID profileId = UUID.randomUUID();
        LocalDate date = LocalDate.of(2026, 9, 5);

        when(profileRepo.existsByIdAndUserId(profileId, userId)).thenReturn(true);

        SaveRecordRequest request = new SaveRecordRequest(
                "training",
                null,
                List.of(Map.of("label", "Core Routine", "completed", true)),
                List.of(Map.of("label", "Lunch Bowl", "completed", true)),
                List.of(Map.of("label", "Sprint Drill", "completed", true)),
                8,
                "22:00",
                "06:30",
                BigDecimal.valueOf(8.5),
                "excellent",
                "Strong training day"
        );

        when(recordRepo.findByProfileIdAndDate(profileId, date)).thenReturn(Optional.empty());

        PlannerDailyRecord savedRecord = new PlannerDailyRecord();
        savedRecord.setId(UUID.randomUUID());
        savedRecord.setProfileId(profileId);
        savedRecord.setDate(date);
        savedRecord.setType("training");
        savedRecord.setTasks("[{\"label\":\"Core Routine\",\"completed\":true}]");
        savedRecord.setNutrition("[{\"label\":\"Lunch Bowl\",\"completed\":true}]");
        savedRecord.setDrills("[{\"label\":\"Sprint Drill\",\"completed\":true}]");
        savedRecord.setHydrationGlasses(8);
        savedRecord.setSleepHours(BigDecimal.valueOf(8.5));
        savedRecord.setSleepScore("excellent");
        savedRecord.setNotes("Strong training day");

        when(recordRepo.save(any(PlannerDailyRecord.class))).thenReturn(savedRecord);

        RecordDto recordDto = plannerService.saveRecord(userId, profileId, "2026-09-05", request);
        assertThat(recordDto).isNotNull();
        assertThat(recordDto.date()).isEqualTo("2026-09-05");
        assertThat(recordDto.hydration().get("glasses")).isEqualTo(8);
        assertThat(recordDto.sleep().get("score")).isEqualTo("excellent");
    }
}
