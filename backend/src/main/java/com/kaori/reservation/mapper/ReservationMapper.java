package com.kaori.reservation.mapper;

import com.kaori.reservation.model.Reservation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ReservationMapper {

    void insertReservation(Reservation reservation);

    Reservation findReservationById(Long id);

    Map<String, Object> findReservationByIdWithDetails(Long id);

    List<Reservation> findAllReservations();

    List<Map<String, Object>> findAllReservationsWithDetails();

    void updateReservationStatus(@Param("id") Long id, @Param("status") String status);
}