package com.streakforge.modules.planner.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.streakforge.modules.auth.dto.AuthDtos.RegisterUserRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.CreateProfileRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.SaveRecordRequest;
import com.streakforge.modules.planner.dto.PlannerDtos.SaveTemplateRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@SpringBootTest
@Transactional
class PlannerControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        RegisterUserRequest register = new RegisterUserRequest(
                "Planner Tester",
                "planner" + System.nanoTime() + "@streakforge.com",
                "Password123"
        );
        MvcResult res = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(res.getResponse().getContentAsString());
        this.authToken = root.path("data").path("accessToken").asText();
    }

    @Test
    @DisplayName("End-to-End Planner Flow: Create Profile, Save Template, Save Daily Record")
    void fullPlannerWorkflow_E2E() throws Exception {
        // 1. Create Profile
        CreateProfileRequest profileReq = new CreateProfileRequest("Parth Champions");
        MvcResult profileRes = mockMvc.perform(post("/api/v1/planner/profiles")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Parth Champions"))
                .andReturn();

        String profileId = objectMapper.readTree(profileRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 2. Save Template
        SaveTemplateRequest templateReq = new SaveTemplateRequest(
                null,
                "Intense Active Template",
                "training",
                10,
                List.of(Map.of("label", "5km Run", "category", "morning")),
                List.of(Map.of("label", "High Protein Bowl", "category", "lunch")),
                List.of("10 Sprint Starts")
        );

        mockMvc.perform(post("/api/v1/planner/profiles/" + profileId + "/templates")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(templateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Intense Active Template"))
                .andExpect(jsonPath("$.data.hydrationTarget").value(10));

        // 3. Save Daily Record
        SaveRecordRequest recordReq = new SaveRecordRequest(
                "training",
                null,
                List.of(Map.of("id", "t1", "label", "5km Run", "category", "morning", "completed", true)),
                List.of(Map.of("id", "n1", "label", "High Protein Bowl", "category", "lunch", "completed", true)),
                List.of(Map.of("label", "10 Sprint Starts", "completed", true)),
                9,
                "22:30",
                "06:30",
                BigDecimal.valueOf(8.0),
                "excellent",
                "Felt great!"
        );

        mockMvc.perform(put("/api/v1/planner/profiles/" + profileId + "/records/2026-09-05")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(recordReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.date").value("2026-09-05"))
                .andExpect(jsonPath("$.data.hydration.glasses").value(9));

        // 4. Retrieve All Daily Records
        mockMvc.perform(get("/api/v1/planner/profiles/" + profileId + "/records")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.2026-09-05").exists())
                .andExpect(jsonPath("$.data.2026-09-05.hydration.glasses").value(9));
    }
}
