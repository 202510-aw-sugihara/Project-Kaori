package com.example.shizuka.mapper;

import com.example.shizuka.entity.PlanTimeSlot;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Mapper
public interface PlanTimeSlotMapper {
    Optional<PlanTimeSlot> findById(@Param("id") Long id);

    Optional<PlanTimeSlot> findByPlanAndSlot(@Param("planId") Long planId,
            @Param("slotDate") LocalDate slotDate,
            @Param("startTime") LocalTime startTime);

    List<PlanTimeSlot> search(@Param("planId") Long planId,
            @Param("slotDate") LocalDate slotDate,
            @Param("isOpen") Boolean isOpen,
            @Param("limit") Integer limit,
            @Param("offset") Integer offset);

    void insert(PlanTimeSlot planTimeSlot);

    void update(PlanTimeSlot planTimeSlot);

    void incrementReservedCount(@Param("id") Long id, @Param("delta") int delta);

    void softDelete(@Param("id") Long id);
}
