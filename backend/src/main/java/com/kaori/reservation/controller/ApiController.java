package com.kaori.reservation.controller;

import com.kaori.reservation.dto.ReservationRequest;
import com.kaori.reservation.dto.ReservationResponse;
import com.kaori.reservation.mapper.CourseMapper;
import com.kaori.reservation.mapper.SlotMapper;
import com.kaori.reservation.model.Course;
import com.kaori.reservation.model.Slot;
import com.kaori.reservation.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private SlotMapper slotMapper;

    @Autowired
    private ReservationService reservationService;

    @GetMapping("/courses")
    public List<Course> getCourses() {
        return courseMapper.findAllActive();
    }

    @PostMapping("/reservations")
    public ResponseEntity<?> createReservation(@RequestBody ReservationRequest request) {
        try {
            if (request.getCourseId() == null || request.getSlotId() == null || request.getName() == null ||
                    request.getEmail() == null || request.getPeople() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "invalid request"));
            }

            Long reservationId = reservationService.createReservation(
                    request.getCourseId(), request.getSlotId(), request.getName(),
                    request.getEmail(), request.getPhone(), request.getPeople(), request.getNote());

            ReservationResponse response = new ReservationResponse(reservationId, "success", "Reservation created");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String error = e.getMessage();
            HttpStatus status = switch (error) {
                case "slot not found" -> HttpStatus.NOT_FOUND;
                case "no capacity" -> HttpStatus.BAD_REQUEST;
                default -> HttpStatus.INTERNAL_SERVER_ERROR;
            };
            return ResponseEntity.status(status).body(Map.of("error", error));
        }
    }

    @GetMapping("/slots")
    public List<Slot> getSlots(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return slotMapper.findSlotsByDate(localDate);
    }

    @PutMapping("/reservations/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        try {
            reservationService.cancelReservation(id);
            return ResponseEntity.ok(Map.of("status", "cancelled"));
        } catch (RuntimeException e) {
            String error = e.getMessage();
            HttpStatus status = switch (error) {
                case "reservation not found" -> HttpStatus.NOT_FOUND;
                case "reservation already cancelled" -> HttpStatus.BAD_REQUEST;
                default -> HttpStatus.INTERNAL_SERVER_ERROR;
            };
            return ResponseEntity.status(status).body(Map.of("error", error));
        }
    }
}