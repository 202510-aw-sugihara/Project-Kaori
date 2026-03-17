package com.example.shizuka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ApiIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    private MockHttpSession adminSession;
    private MockHttpSession userSession;

    @BeforeEach
    void setup() throws Exception {
        adminSession = loginAndGetSession("admin@example.com", "password");
        userSession = loginAndGetSession("user1@example.com", "password");
    }

    private MockHttpSession loginAndGetSession(String email, String password) throws Exception {
        CsrfContext csrf = fetchCsrf();
        String payload = objectMapper.writeValueAsString(Map.of("email", email, "password", password));

        MvcResult result = mockMvc.perform(post("/api/admin/auth/login")
                        .session(csrf.session())
                        .cookie(csrf.cookie())
                        .header(csrf.headerName(), csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andReturn();

        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private CsrfContext fetchCsrf() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headerName").value("X-XSRF-TOKEN"))
                .andExpect(jsonPath("$.parameterName").value("_csrf"))
                .andExpect(jsonPath("$.token").isString())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String token = json.get("token").asText();
        String headerName = json.get("headerName").asText();
        Cookie cookie = result.getResponse().getCookie("XSRF-TOKEN");
        if (cookie == null) {
            cookie = new Cookie("XSRF-TOKEN", token);
        }

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
        if (session == null) {
            session = new MockHttpSession();
        }

        return new CsrfContext(session, cookie, token, headerName);
    }

    private String reservationPayload(int participantCount, int actualParticipants, String email) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "planId", 1,
                "planTimeSlotId", 1,
                "participantCount", participantCount,
                "customerName", "Test User",
                "email", email,
                "phone", "09011111111",
                "participants", participants(actualParticipants)));
    }

    private Object[] participants(int count) {
        List<Map<String, String>> participants = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            participants.add(Map.of(
                    "participantName", "Participant " + i,
                    "participantNameKana", "PARTICIPANT" + i,
                    "ageGroup", "20s",
                    "allergyNote", "none"));
        }
        return participants.toArray();
    }

    private record CsrfContext(MockHttpSession session, Cookie cookie, String token, String headerName) {
    }

    @Test
    void adminLoginSuccess() throws Exception {
        CsrfContext csrf = fetchCsrf();

        mockMvc.perform(post("/api/admin/auth/login")
                        .session(csrf.session())
                        .cookie(csrf.cookie())
                        .header(csrf.headerName(), csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "admin@example.com",
                                "password", "password"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@example.com"))
                .andExpect(jsonPath("$.role").value("admin"));
    }

    @Test
    void adminLoginFailure() throws Exception {
        CsrfContext csrf = fetchCsrf();

        mockMvc.perform(post("/api/admin/auth/login")
                        .session(csrf.session())
                        .cookie(csrf.cookie())
                        .header(csrf.headerName(), csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "admin@example.com",
                                "password", "wrongpass"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void csrfEndpointReturnsToken() throws Exception {
        mockMvc.perform(get("/api/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headerName").value("X-XSRF-TOKEN"))
                .andExpect(jsonPath("$.parameterName").value("_csrf"))
                .andExpect(jsonPath("$.token").isString());
    }

    @Test
    void adminLoginWithoutCsrfShouldReturn403() throws Exception {
        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "admin@example.com",
                                "password", "password"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthorizedAccess_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/admin/reservations"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void customerAccessAdminShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/admin/reservations").session(userSession))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminGetCustomersList() throws Exception {
        mockMvc.perform(get("/api/admin/customers").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("user1@example.com"));
    }

    @Test
    void adminGetCustomerById() throws Exception {
        mockMvc.perform(get("/api/admin/customers/2").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user1@example.com"));
    }

    @Test
    void adminReservationsPaging() throws Exception {
        mockMvc.perform(get("/api/admin/reservations")
                        .param("page", "0")
                        .param("size", "1")
                        .session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(get("/api/admin/reservations")
                        .param("page", "1")
                        .param("size", "1")
                        .session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void adminPlanTimeSlotPaging() throws Exception {
        mockMvc.perform(get("/api/admin/plan-time-slots")
                        .param("page", "0")
                        .param("size", "1")
                        .session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void reservationCreateSuccess() throws Exception {
        CsrfContext csrf = fetchCsrf();

        mockMvc.perform(post("/api/reservations")
                        .session(csrf.session())
                        .cookie(csrf.cookie())
                        .header(csrf.headerName(), csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reservationPayload(1, 1, "user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planTimeSlotId").value(1))
                .andExpect(jsonPath("$.participantCount").value(1));
    }

    @Test
    void reservationCreateWithoutCsrfShouldReturn403() throws Exception {
        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reservationPayload(1, 1, "user1@example.com")))
                .andExpect(status().isForbidden());
    }

    @Test
    void reservationValidationFailure() throws Exception {
        CsrfContext csrf = fetchCsrf();

        mockMvc.perform(post("/api/reservations")
                        .session(csrf.session())
                        .cookie(csrf.cookie())
                        .header(csrf.headerName(), csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reservationPayload(2, 1, "user1@example.com")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reservationOverCapacityShouldReturn409() throws Exception {
        CsrfContext csrf = fetchCsrf();

        mockMvc.perform(post("/api/reservations")
                        .session(csrf.session())
                        .cookie(csrf.cookie())
                        .header(csrf.headerName(), csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reservationPayload(5, 5, "user1@example.com")))
                .andExpect(status().isConflict());
    }

    @Test
    void cancelReservationSuccess_andDoubleCancelFails() throws Exception {
        CsrfContext csrf = fetchCsrf();

        mockMvc.perform(patch("/api/admin/reservations/2/cancel")
                        .session(adminSession)
                        .cookie(csrf.cookie())
                        .header(csrf.headerName(), csrf.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("cancelled"));

        mockMvc.perform(patch("/api/admin/reservations/2/cancel")
                        .session(adminSession)
                        .cookie(csrf.cookie())
                        .header(csrf.headerName(), csrf.token()))
                .andExpect(status().isConflict());
    }

    @Test
    void publicReservationWithAdminEmailShouldReturn403() throws Exception {
        CsrfContext csrf = fetchCsrf();

        mockMvc.perform(post("/api/reservations")
                        .session(csrf.session())
                        .cookie(csrf.cookie())
                        .header(csrf.headerName(), csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reservationPayload(1, 1, "admin@example.com")))
                .andExpect(status().isForbidden());
    }
}
