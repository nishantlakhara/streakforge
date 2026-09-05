package com.streakforge.modules.planner.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.streakforge.modules.planner.domain.PlannerDailyRecord;
import com.streakforge.modules.planner.domain.PlannerLibrarySnippet;
import com.streakforge.modules.planner.domain.PlannerProfile;
import com.streakforge.modules.planner.domain.PlannerScheduleEntry;
import com.streakforge.modules.planner.domain.PlannerTemplate;
import com.streakforge.modules.planner.dto.PlannerDtos.AssignScheduleRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.CreateProfileRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.ProfileDto;
import com.streakforge.modules.planner.dto.PlannerDtos.RecordDto;
import com.streakforge.modules.planner.dto.PlannerDtos.SaveRecordRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.SaveSnippetRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.SaveTemplateRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.SnippetDto;
import com.streakforge.modules.planner.dto.PlannerDtos.TemplateDto;
import com.streakforge.modules.planner.repository.PlannerDailyRecordRepository;
import com.streakforge.modules.planner.repository.PlannerLibrarySnippetRepository;
import com.streakforge.modules.planner.repository.PlannerProfileRepository;
import com.streakforge.modules.planner.repository.PlannerScheduleRepository;
import com.streakforge.modules.planner.repository.PlannerTemplateRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlannerService {

    private static final TypeReference<List<Map<String, Object>>> LIST_MAP = new TypeReference<>() {};
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final PlannerProfileRepository profileRepo;
    private final PlannerTemplateRepository templateRepo;
    private final PlannerDailyRecordRepository recordRepo;
    private final PlannerScheduleRepository scheduleRepo;
    private final PlannerLibrarySnippetRepository libraryRepo;
    private final ObjectMapper objectMapper;

    public PlannerService(
            PlannerProfileRepository profileRepo,
            PlannerTemplateRepository templateRepo,
            PlannerDailyRecordRepository recordRepo,
            PlannerScheduleRepository scheduleRepo,
            PlannerLibrarySnippetRepository libraryRepo,
            ObjectMapper objectMapper
    ) {
        this.profileRepo = profileRepo;
        this.templateRepo = templateRepo;
        this.recordRepo = recordRepo;
        this.scheduleRepo = scheduleRepo;
        this.libraryRepo = libraryRepo;
        this.objectMapper = objectMapper;
    }

    // ── Profiles ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ProfileDto> listProfiles(UUID userId) {
        return profileRepo.findAllByUserId(userId).stream()
                .map(this::toProfileDto)
                .toList();
    }

    @Transactional
    public ProfileDto createProfile(UUID userId, CreateProfileRequest request) {
        PlannerProfile profile = new PlannerProfile();
        profile.setUserId(userId);
        profile.setName(request.name().trim());
        return toProfileDto(profileRepo.save(profile));
    }

    @Transactional
    public void deleteProfile(UUID userId, UUID profileId) {
        verifyProfileOwnership(userId, profileId);
        profileRepo.deleteById(profileId);
    }

    // ── Templates ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TemplateDto> listTemplates(UUID userId, UUID profileId) {
        verifyProfileOwnership(userId, profileId);
        return templateRepo.findAllByProfileId(profileId).stream()
                .map(this::toTemplateDto)
                .toList();
    }

    @Transactional
    public TemplateDto saveTemplate(UUID userId, UUID profileId, SaveTemplateRequest request) {
        verifyProfileOwnership(userId, profileId);

        PlannerTemplate template;
        if (request.id() != null) {
            template = templateRepo.findByIdAndProfileId(request.id(), profileId)
                    .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        } else {
            template = new PlannerTemplate();
            template.setProfileId(profileId);
        }

        template.setName(request.name().trim());
        template.setType(request.type());
        template.setHydrationTarget(request.hydrationTarget());
        template.setTasks(toJson(request.tasks()));
        template.setNutrition(toJson(request.nutrition()));
        template.setDrills(toJson(request.drills()));

        return toTemplateDto(templateRepo.save(template));
    }

    @Transactional
    public void deleteTemplate(UUID userId, UUID profileId, UUID templateId) {
        verifyProfileOwnership(userId, profileId);
        templateRepo.deleteByIdAndProfileId(templateId, profileId);
    }

    // ── Schedule ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, String> getSchedule(UUID userId, UUID profileId) {
        verifyProfileOwnership(userId, profileId);
        return scheduleRepo.findAllByProfileId(profileId).stream()
                .filter(e -> e.getTemplateId() != null)
                .collect(Collectors.toMap(
                        e -> e.getDate().toString(),
                        e -> e.getTemplateId().toString()
                ));
    }

    @Transactional
    public void assignSchedule(UUID userId, UUID profileId, AssignScheduleRequest request) {
        verifyProfileOwnership(userId, profileId);

        List<LocalDate> dates = request.dates().stream()
                .map(LocalDate::parse)
                .toList();

        // Delete existing entries for those dates
        scheduleRepo.deleteByProfileIdAndDates(profileId, dates);

        // If templateId is provided and non-empty, insert new entries
        if (request.templateId() != null && !request.templateId().isBlank()) {
            UUID templateId = UUID.fromString(request.templateId());
            List<PlannerScheduleEntry> entries = dates.stream().map(date -> {
                PlannerScheduleEntry entry = new PlannerScheduleEntry();
                entry.setProfileId(profileId);
                entry.setDate(date);
                entry.setTemplateId(templateId);
                return entry;
            }).toList();
            scheduleRepo.saveAll(entries);
        }
    }

    // ── Daily Records ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, RecordDto> getAllRecords(UUID userId, UUID profileId) {
        verifyProfileOwnership(userId, profileId);
        Map<String, RecordDto> result = new LinkedHashMap<>();
        recordRepo.findAllByProfileId(profileId).forEach(r ->
                result.put(r.getDate().toString(), toRecordDto(r))
        );
        return result;
    }

    @Transactional
    public RecordDto saveRecord(UUID userId, UUID profileId, String date, SaveRecordRequest request) {
        verifyProfileOwnership(userId, profileId);
        LocalDate localDate = LocalDate.parse(date);

        PlannerDailyRecord record = recordRepo.findByProfileIdAndDate(profileId, localDate)
                .orElseGet(() -> {
                    PlannerDailyRecord r = new PlannerDailyRecord();
                    r.setProfileId(profileId);
                    r.setDate(localDate);
                    return r;
                });

        record.setType(request.type());
        record.setTemplateId(request.templateId() != null && !request.templateId().isBlank()
                ? UUID.fromString(request.templateId()) : null);
        record.setTasks(toJson(request.tasks()));
        record.setNutrition(toJson(request.nutrition()));
        record.setDrills(toJson(request.drills()));
        record.setHydrationGlasses(request.hydrationGlasses());
        record.setSleepBedTime(request.sleepBedTime());
        record.setSleepWakeTime(request.sleepWakeTime());
        record.setSleepHours(request.sleepHours());
        record.setSleepScore(request.sleepScore());
        record.setNotes(request.notes());

        return toRecordDto(recordRepo.save(record));
    }

    // ── Library ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SnippetDto> listSnippets(UUID userId, UUID profileId, String type) {
        verifyProfileOwnership(userId, profileId);
        return libraryRepo.findAllByProfileIdAndType(profileId, type).stream()
                .map(this::toSnippetDto)
                .toList();
    }

    @Transactional
    public SnippetDto saveSnippet(UUID userId, UUID profileId, SaveSnippetRequest request) {
        verifyProfileOwnership(userId, profileId);

        PlannerLibrarySnippet snippet;
        if (request.id() != null) {
            snippet = libraryRepo.findById(request.id())
                    .filter(s -> s.getProfileId().equals(profileId))
                    .orElseThrow(() -> new IllegalArgumentException("Snippet not found"));
        } else {
            snippet = new PlannerLibrarySnippet();
            snippet.setProfileId(profileId);
        }

        snippet.setType(request.type());
        snippet.setName(request.name().trim());
        snippet.setData(toJson(request.data()));

        return toSnippetDto(libraryRepo.save(snippet));
    }

    @Transactional
    public void deleteSnippet(UUID userId, UUID profileId, UUID snippetId) {
        verifyProfileOwnership(userId, profileId);
        libraryRepo.deleteByIdAndProfileId(snippetId, profileId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void verifyProfileOwnership(UUID userId, UUID profileId) {
        if (!profileRepo.existsByIdAndUserId(profileId, userId)) {
            throw new AccessDeniedException("Profile not found or access denied");
        }
    }

    private ProfileDto toProfileDto(PlannerProfile p) {
        return new ProfileDto(p.getId(), p.getName(), p.getCreatedAt() != null ? p.getCreatedAt().toString() : Instant.now().toString());
    }

    private TemplateDto toTemplateDto(PlannerTemplate t) {
        return new TemplateDto(
                t.getId(), t.getName(), t.getType(), t.getHydrationTarget(),
                fromJsonList(t.getTasks()), fromJsonList(t.getNutrition()),
                fromJsonStringList(t.getDrills()),
                t.getCreatedAt() != null ? t.getCreatedAt().toString() : Instant.now().toString(),
                t.getUpdatedAt() != null ? t.getUpdatedAt().toString() : Instant.now().toString()
        );
    }

    private RecordDto toRecordDto(PlannerDailyRecord r) {
        Map<String, Object> hydration = Map.of("glasses", r.getHydrationGlasses());
        Map<String, Object> sleep = new LinkedHashMap<>();
        sleep.put("bedTime", r.getSleepBedTime() != null ? r.getSleepBedTime() : "");
        sleep.put("wakeTime", r.getSleepWakeTime() != null ? r.getSleepWakeTime() : "");
        sleep.put("hours", r.getSleepHours() != null ? r.getSleepHours().doubleValue() : 0);
        sleep.put("score", r.getSleepScore() != null ? r.getSleepScore() : "needs-improvement");

        return new RecordDto(
                r.getDate().toString(),
                r.getType(),
                r.getTemplateId() != null ? r.getTemplateId().toString() : null,
                fromJsonList(r.getTasks()),
                fromJsonList(r.getNutrition()),
                fromJsonList(r.getDrills()),
                hydration,
                sleep,
                r.getNotes()
        );
    }

    private SnippetDto toSnippetDto(PlannerLibrarySnippet s) {
        return new SnippetDto(s.getId(), s.getName(), s.getType(),
                fromJsonMap(s.getData()), s.getCreatedAt() != null ? s.getCreatedAt().toString() : Instant.now().toString());
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<Map<String, Object>> fromJsonList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, LIST_MAP);
        } catch (Exception e) {
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> fromJsonStringList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private Map<String, Object> fromJsonMap(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return objectMapper.readValue(json, MAP_TYPE);
        } catch (Exception e) {
            return Map.of();
        }
    }
}
