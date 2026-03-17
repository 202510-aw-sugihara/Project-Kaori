package com.example.shizuka.mapper;

import com.example.shizuka.entity.ReservationParticipant;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReservationParticipantMapper {
    List<ReservationParticipant> findByReservationId(@Param("reservationId") Long reservationId);

    void insert(ReservationParticipant participant);

    void insertBatch(List<ReservationParticipant> participants);

    void deleteByReservationId(@Param("reservationId") Long reservationId);
}
