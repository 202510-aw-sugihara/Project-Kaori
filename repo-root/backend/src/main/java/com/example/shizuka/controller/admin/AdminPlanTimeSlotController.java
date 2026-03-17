package com.example.shizuka.controller.admin;

import com.example.shizuka.dto.request.AdminPlanTimeSlotRequest;
import com.example.shizuka.dto.response.PlanTimeSlotResponse;
import com.example.shizuka.entity.PlanTimeSlot;
import com.example.shizuka.service.PlanTimeSlotService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/plan-time-slots")
public class AdminPlanTimeSlotController {

    private final PlanTimeSlotService planTimeSlotService;

    public AdminPlanTimeSlotController(PlanTimeSlotService planTimeSlotService) {
        this.planTimeSlotService = planTimeSlotService;
    }

    @GetMapping
    public List<PlanTimeSlotResponse> search(
            @RequestParam(required = false) Long planId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate slotDate,
            @RequestParam(required = false) Boolean isOpen,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        int offset = page * size;
        return planTimeSlotService.search(planId, slotDate, isOpen, size, offset).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public PlanTimeSlotResponse get(@PathVariable Long id) {
        return toResponse(planTimeSlotService.findById(id));
    }

    @PostMapping
    public PlanTimeSlotResponse create(@Valid @RequestBody AdminPlanTimeSlotRequest request) {
        PlanTimeSlot slot = new PlanTimeSlot();
        slot.setPlanId(request.getPlanId());
        slot.setSlotDate(request.getSlotDate());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setCapacity(request.getCapacity());
        slot.setIsOpen(request.getIsOpen());
        slot.setReservedCount(0);
        planTimeSlotService.create(slot);
        return toResponse(slot);
    }

    @PutMapping("/{id}")
    public PlanTimeSlotResponse update(@PathVariable Long id, @Valid @RequestBody AdminPlanTimeSlotRequest request) {
        PlanTimeSlot updated = new PlanTimeSlot();
        updated.setId(id);
        updated.setPlanId(request.getPlanId());
        updated.setSlotDate(request.getSlotDate());
        updated.setStartTime(request.getStartTime());
        updated.setEndTime(request.getEndTime());
        updated.setCapacity(request.getCapacity());
        updated.setIsOpen(request.getIsOpen());
        // reservedCount remains unchanged during updates unless explicit adjustments
        // are supported
        planTimeSlotService.update(id, updated);
        return toResponse(planTimeSlotService.findById(id));
    }

    private PlanTimeSlotResponse toResponse(PlanTimeSlot slot) {
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
