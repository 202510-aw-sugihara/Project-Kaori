package com.kaori.reservation.mapper;

import com.kaori.reservation.model.Slot;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface SlotMapper {

    Slot findSlotById(Long id);

    List<Slot> findSlotsByDate(LocalDate date);

    void updateReservedCount(@Param("slotId") Long slotId, @Param("count") int count);
}