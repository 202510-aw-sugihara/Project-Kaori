package com.example.shizuka.mapper;

import com.example.shizuka.entity.Reservation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Mapper
public interface ReservationMapper {
    Optional<Reservation> findById(@Param("id") Long id);

    List<Reservation> search(@Param("status") String status,
                             @Param("reservationDate") LocalDate reservationDate,
                             @Param("customerName") String customerName,
                             @Param("limit") Integer limit,
                             @Param("offset") Integer offset);

    void insert(Reservation reservation);

    void update(Reservation reservation);

    void softDelete(@Param("id") Long id);
}
