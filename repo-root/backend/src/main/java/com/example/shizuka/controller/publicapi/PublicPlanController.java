package com.example.shizuka.controller.publicapi;

import com.example.shizuka.dto.response.PlanResponse;
import com.example.shizuka.dto.response.PlanTimeSlotResponse;
import com.example.shizuka.entity.Plan;
import com.example.shizuka.entity.PlanTimeSlot;
import com.example.shizuka.service.PlanService;
import com.example.shizuka.service.PlanTimeSlotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/plans")
public class PublicPlanController {

    private final PlanService planService;
    private final PlanTimeSlotService planTimeSlotService;

    public PublicPlanController(PlanService planService, PlanTimeSlotService planTimeSlotService) {
        this.planService = planService;
        this.planTimeSlotService = planTimeSlotService;
    }

    @GetMapping
    public List<PlanResponse> list() {
        return planService.findAllActive().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public PlanResponse get(@PathVariable Long id) {
        return toResponse(planService.findById(id));
    }

    @GetMapping("/{id}/time-slots")
    public List<PlanTimeSlotResponse> listSlots(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate slotDate) {
        return planTimeSlotService.search(id, slotDate, true, 100, 0).stream()
                .map(this::toSlotResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}/time-slots/{slotId}")
    public PlanTimeSlotResponse getSlot(@PathVariable Long id, @PathVariable Long slotId) {
        PlanTimeSlot slot = planTimeSlotService.findById(slotId);
        if (!slot.getPlanId().equals(id)) {
            throw new IllegalArgumentException("Slot does not belong to the specified plan");
        }
        return toSlotResponse(slot);
    }

    private PlanResponse toResponse(Plan plan) {
        PlanResponse response = new PlanResponse();
        response.setId(plan.getId());
        response.setName(plan.getName());
        response.setDescription(plan.getDescription());
        response.setDurationMinutes(plan.getDurationMinutes());
        response.setPrice(plan.getPrice());
        response.setCapacity(plan.getCapacity());
        return response;
    }

    private PlanTimeSlotResponse toSlotResponse(PlanTimeSlot slot) {
        PlanTimeSlotResponse response = new PlanTimeSlotResponse();
        response.setId(slot.getId());
        response.setPlanId(slot.getPlanId());
        response.setSlotDate(slot.getSlotDate());
        response.setStartTime(slot.getStartTime());
        response.setEndTime(slot.getEndTime());
        response.setCapacity(slot.getCapacity());
        response.setReservedCount(slot.getReservedCount());
        response.setIsOpen(slot.getIsOpen());
        return response;
    }
}
