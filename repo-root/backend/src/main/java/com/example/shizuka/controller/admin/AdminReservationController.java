package com.example.shizuka.controller.admin;

import com.example.shizuka.dto.request.AdminReservationRequest;
import com.example.shizuka.dto.response.ReservationResponse;
import com.example.shizuka.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reservations")
public class AdminReservationController {

    private final ReservationService reservationService;

    public AdminReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public List<ReservationResponse> search(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate reservationDate,
            @RequestParam(required = false) String customerName,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        int offset = page * size;
        return reservationService.searchReservations(status, reservationDate, customerName, size, offset);
    }

    @GetMapping("/{id}")
    public ReservationResponse get(@PathVariable Long id) {
        return reservationService.getReservationDetail(id);
    }

    @PostMapping
    public ReservationResponse create(@Valid @RequestBody AdminReservationRequest request) {
        return reservationService.createAdminReservation(request);
    }

    @PutMapping("/{id}")
    public ReservationResponse update(@PathVariable Long id, @Valid @RequestBody AdminReservationRequest request) {
        return reservationService.updateReservation(id, request);
    }

    @PatchMapping("/{id}/cancel")
    public ReservationResponse cancel(@PathVariable Long id) {
        return reservationService.cancelReservation(id);
    }
}
