package com.example.shizuka.controller.publicapi;

import com.example.shizuka.dto.request.ReservationCreateRequest;
import com.example.shizuka.dto.response.ReservationResponse;
import com.example.shizuka.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
public class PublicReservationController {

    private final ReservationService reservationService;

    public PublicReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ReservationResponse create(@Valid @RequestBody ReservationCreateRequest request) {
        return reservationService.createPublicReservation(request);
    }

    @GetMapping("/{id}")
    public ReservationResponse get(@PathVariable Long id) {
        return reservationService.getReservationDetail(id);
    }
}
