package com.example.shizuka.service;

import com.example.shizuka.entity.PlanTimeSlot;
import com.example.shizuka.exception.BusinessRuleViolationException;
import com.example.shizuka.exception.ResourceNotFoundException;
import com.example.shizuka.mapper.PlanMapper;
import com.example.shizuka.mapper.PlanTimeSlotMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PlanTimeSlotService {

    private final PlanTimeSlotMapper planTimeSlotMapper;
    private final PlanMapper planMapper;

    public PlanTimeSlotService(PlanTimeSlotMapper planTimeSlotMapper, PlanMapper planMapper) {
        this.planTimeSlotMapper = planTimeSlotMapper;
        this.planMapper = planMapper;
    }

    public PlanTimeSlot findById(Long id) {
        return planTimeSlotMapper.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan time slot not found"));
    }

    public List<PlanTimeSlot> search(Long planId, LocalDate slotDate, Boolean isOpen, Integer limit, Integer offset) {
        return planTimeSlotMapper.search(planId, slotDate, isOpen, limit, offset);
    }

    @Transactional
    public PlanTimeSlot create(PlanTimeSlot slot) {
        // ensure plan exists
        planMapper.findById(slot.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        if (slot.getCapacity() == null || slot.getCapacity() < 0) {
            throw new BusinessRuleViolationException("Capacity must be non-negative");
        }

        if (slot.getReservedCount() != null && slot.getReservedCount() > slot.getCapacity()) {
            throw new BusinessRuleViolationException("Reserved count cannot exceed capacity");
        }

        slot.setReservedCount(slot.getReservedCount() == null ? 0 : slot.getReservedCount());
        planTimeSlotMapper.insert(slot);
        return slot;
    }

    @Transactional
    public PlanTimeSlot update(Long id, PlanTimeSlot updated) {
        PlanTimeSlot existing = findById(id);
        if (updated.getCapacity() != null && existing.getReservedCount() != null
                && updated.getCapacity() < existing.getReservedCount()) {
            throw new BusinessRuleViolationException("Capacity cannot be less than reserved count");
        }
        // permit change plan etc.
        planTimeSlotMapper.update(updated);
        return findById(id);
    }
}
