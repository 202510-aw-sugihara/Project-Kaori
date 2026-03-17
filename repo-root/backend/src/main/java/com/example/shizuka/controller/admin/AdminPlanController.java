package com.example.shizuka.controller.admin;

import com.example.shizuka.dto.request.AdminPlanRequest;
import com.example.shizuka.dto.response.PlanResponse;
import com.example.shizuka.entity.Plan;
import com.example.shizuka.service.PlanService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/plans")
public class AdminPlanController {

    private final PlanService planService;

    public AdminPlanController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public List<PlanResponse> list() {
        return planService.findAllActive().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public PlanResponse get(@PathVariable Long id) {
        return toResponse(planService.findById(id));
    }

    @PostMapping
    public PlanResponse create(@Valid @RequestBody AdminPlanRequest request) {
        Plan plan = new Plan();
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setDurationMinutes(request.getDurationMinutes());
        plan.setPrice(request.getPrice());
        plan.setCapacity(request.getCapacity());
        plan.setIsActive(true);
        planService.save(plan);
        return toResponse(plan);
    }

    @PutMapping("/{id}")
    public PlanResponse update(@PathVariable Long id, @Valid @RequestBody AdminPlanRequest request) {
        Plan plan = planService.findById(id);
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setDurationMinutes(request.getDurationMinutes());
        plan.setPrice(request.getPrice());
        plan.setCapacity(request.getCapacity());
        plan.setIsActive(true);
        planService.save(plan);
        return toResponse(plan);
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
}
