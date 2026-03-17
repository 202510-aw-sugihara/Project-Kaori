package com.example.shizuka;

import com.example.shizuka.dto.request.ParticipantRequest;
import com.example.shizuka.dto.request.ReservationCreateRequest;
import com.example.shizuka.dto.response.ReservationResponse;
import com.example.shizuka.entity.PlanTimeSlot;
import com.example.shizuka.service.PlanTimeSlotService;
import com.example.shizuka.service.ReservationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class ReservationServiceTest {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private PlanTimeSlotService planTimeSlotService;

    @Test
    void createPublicReservation_incrementsReservedCount() {
        // use existing plan-time-slot seeded in data.sql
        Long slotId = 1L;
        PlanTimeSlot slotBefore = planTimeSlotService.findById(slotId);
        int initialReserved = slotBefore.getReservedCount() == null ? 0 : slotBefore.getReservedCount();

        ReservationCreateRequest request = new ReservationCreateRequest();
        request.setPlanId(slotBefore.getPlanId());
        request.setPlanTimeSlotId(slotId);
        request.setParticipantCount(1);
        request.setCustomerName("テストユーザー1");
        request.setEmail("user1@example.com");
        request.setPhone("09011111111");

        ParticipantRequest participant = new ParticipantRequest();
        participant.setParticipantName("テスト 太郎");
        participant.setParticipantNameKana("テスト タロウ");
        participant.setAgeGroup("20代");
        participant.setAllergyNote("なし");
        request.setParticipants(List.of(participant));

        ReservationResponse resp = reservationService.createPublicReservation(request);

        assertThat(resp).isNotNull();
        assertThat(resp.getPlanTimeSlotId()).isEqualTo(slotId);
        assertThat(resp.getParticipantCount()).isEqualTo(1);

        PlanTimeSlot slotAfter = planTimeSlotService.findById(slotId);
        assertThat(slotAfter.getReservedCount()).isEqualTo(initialReserved + 1);
    }
}
