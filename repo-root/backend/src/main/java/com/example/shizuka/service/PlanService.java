package com.example.shizuka.service;

import com.example.shizuka.entity.Plan;
import com.example.shizuka.exception.ResourceNotFoundException;
import com.example.shizuka.mapper.PlanMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlanService {

    private final PlanMapper planMapper;

    public PlanService(PlanMapper planMapper) {
        this.planMapper = planMapper;
    }

    public List<Plan> findAllActive() {
        return planMapper.findAllActive();
    }

    public Plan findById(Long id) {
        return planMapper.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
    }

    public Plan save(Plan plan) {
        if (plan.getId() == null) {
            plan.setIsActive(true);
            planMapper.insert(plan);
        } else {
            planMapper.update(plan);
        }
        return plan;
    }
}
