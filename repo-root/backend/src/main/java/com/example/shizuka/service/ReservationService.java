package com.example.shizuka.service;

import com.example.shizuka.dto.request.AdminReservationRequest;
import com.example.shizuka.dto.request.ReservationCreateRequest;
import com.example.shizuka.dto.response.ReservationResponse;
import com.example.shizuka.dto.response.ParticipantResponse;
import com.example.shizuka.entity.Plan;
import com.example.shizuka.entity.PlanTimeSlot;
import com.example.shizuka.entity.Reservation;
import com.example.shizuka.entity.ReservationParticipant;
import com.example.shizuka.entity.User;
import com.example.shizuka.exception.BusinessRuleViolationException;
import com.example.shizuka.exception.ResourceNotFoundException;
import com.example.shizuka.mapper.PlanMapper;
import com.example.shizuka.mapper.PlanTimeSlotMapper;
import com.example.shizuka.mapper.ReservationMapper;
import com.example.shizuka.mapper.ReservationParticipantMapper;
import com.example.shizuka.mapper.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_CONFIRMED = "confirmed";
    private static final String STATUS_CANCELLED = "cancelled";

    private final ReservationMapper reservationMapper;
    private final ReservationParticipantMapper participantMapper;
    private final PlanMapper planMapper;
    private final PlanTimeSlotMapper planTimeSlotMapper;
    private final UserMapper userMapper;

    public ReservationService(ReservationMapper reservationMapper,
            ReservationParticipantMapper participantMapper,
            PlanMapper planMapper,
            PlanTimeSlotMapper planTimeSlotMapper,
            UserMapper userMapper) {
        this.reservationMapper = reservationMapper;
        this.participantMapper = participantMapper;
        this.planMapper = planMapper;
        this.planTimeSlotMapper = planTimeSlotMapper;
        this.userMapper = userMapper;
    }

    public ReservationResponse getReservationDetail(Long id) {
        Reservation res = reservationMapper.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        User user = userMapper.findById(res.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Plan plan = planMapper.findById(res.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        List<ReservationParticipant> participants = participantMapper.findByReservationId(id);
        return mapToResponse(res, user, plan, participants);
    }

    public List<ReservationResponse> searchReservations(String status, java.time.LocalDate reservationDate,
            String customerName, Integer limit, Integer offset) {
        if (status != null) {
            status = status.toLowerCase();
        }
        String normalizedStatus = normalizeQueryParam(status);
        String normalizedCustomerName = normalizeQueryParam(customerName);
        List<Reservation> reservations = reservationMapper.search(
                normalizedStatus, reservationDate, normalizedCustomerName, limit, offset);
        return reservations.stream().map(res -> {
            User user = userMapper.findById(res.getUserId()).orElse(null);
            Plan plan = planMapper.findById(res.getPlanId()).orElse(null);
            List<ReservationParticipant> participants = participantMapper.findByReservationId(res.getId());
            return mapToResponse(res, user, plan, participants);
        }).collect(Collectors.toList());
    }

    @Transactional
    public ReservationResponse createPublicReservation(ReservationCreateRequest request) {
        validateParticipantCount(request.getParticipantCount(), request.getParticipants());

        Plan plan = planMapper.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        PlanTimeSlot slot = planTimeSlotMapper.findById(request.getPlanTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan time slot not found"));

        if (!Objects.equals(slot.getPlanId(), plan.getId())) {
            throw new BusinessRuleViolationException("Slot does not belong to selected plan");
        }

        if (Boolean.FALSE.equals(slot.getIsOpen())) {
            throw new BusinessRuleViolationException("Slot is closed");
        }

        checkSlotDateTime(slot);

        if (slot.getReservedCount() + request.getParticipantCount() > slot.getCapacity()) {
            throw new BusinessRuleViolationException("Slot capacity exceeded");
        }

        User user = userMapper.findByEmail(request.getEmail()).orElse(null);
        if (user != null && "admin".equalsIgnoreCase(user.getRole())) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot book with admin email");
        }

        if (user == null) {
            user = new User();
            user.setName(request.getCustomerName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setRole("customer");
            // default password
            user.setPasswordHash("$2a$10$AJmLE8MK1Swf53hcADbYg.RTIqFvq9AvW6BGo2Bxr34fnzNHsczpW");
            userMapper.insert(user);
        }

        return createReservationInternal(user, plan, slot, request.getParticipantCount(), request.getParticipants());
    }

    @Transactional
    public ReservationResponse createAdminReservation(AdminReservationRequest request) {
        validateParticipantCount(request.getParticipantCount(), request.getParticipants());

        Plan plan = planMapper.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        PlanTimeSlot slot = planTimeSlotMapper.findById(request.getPlanTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan time slot not found"));

        if (!Objects.equals(slot.getPlanId(), plan.getId())) {
            throw new BusinessRuleViolationException("Slot does not belong to selected plan");
        }

        if (Boolean.FALSE.equals(slot.getIsOpen())) {
            throw new BusinessRuleViolationException("Slot is closed");
        }

        checkSlotDateTime(slot);

        if (slot.getReservedCount() + request.getParticipantCount() > slot.getCapacity()) {
            throw new BusinessRuleViolationException("Slot capacity exceeded");
        }

        User user = null;
        if (request.getUserId() != null) {
            user = userMapper.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } else if (request.getEmail() != null) {
            user = userMapper.findByEmail(request.getEmail()).orElse(null);
        }

        if (user == null) {
            if (request.getEmail() == null) {
                throw new BusinessRuleViolationException("Email is required when userId is not provided");
            }
            user = new User();
            user.setName(request.getCustomerName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setRole("customer");
            user.setPasswordHash("$2a$10$AJmLE8MK1Swf53hcADbYg.RTIqFvq9AvW6BGo2Bxr34fnzNHsczpW");
            userMapper.insert(user);
        }

        return createReservationInternal(user, plan, slot, request.getParticipantCount(), request.getParticipants());
    }

    private ReservationResponse createReservationInternal(User user,
            Plan plan,
            PlanTimeSlot slot,
            Integer participantCount,
            List<com.example.shizuka.dto.request.ParticipantRequest> participants) {
        Reservation reservation = new Reservation();
        reservation.setUserId(user.getId());
        reservation.setPlanId(plan.getId());
        reservation.setPlanTimeSlotId(slot.getId());
        reservation.setReservationDate(slot.getSlotDate());
        reservation.setStartTime(slot.getStartTime());
        reservation.setStatus(STATUS_PENDING);
        reservation.setParticipantCount(participantCount);
        reservation.setTotalPrice(plan.getPrice() * participantCount);
        reservationMapper.insert(reservation);

        insertParticipants(reservation.getId(), participants);
        planTimeSlotMapper.incrementReservedCount(slot.getId(), participantCount);

        List<ReservationParticipant> savedParticipants = participantMapper.findByReservationId(reservation.getId());
        return mapToResponse(reservation, user, plan, savedParticipants);
    }

    @Transactional
    public ReservationResponse updateReservation(Long id, AdminReservationRequest request) {
        Reservation existing = reservationMapper.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        Plan plan = planMapper.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        PlanTimeSlot newSlot = planTimeSlotMapper.findById(request.getPlanTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan time slot not found"));

        if (!Objects.equals(newSlot.getPlanId(), plan.getId())) {
            throw new BusinessRuleViolationException("Slot does not belong to selected plan");
        }

        if (Boolean.FALSE.equals(newSlot.getIsOpen())) {
            throw new BusinessRuleViolationException("Slot is closed");
        }

        checkSlotDateTime(newSlot);
        validateParticipantCount(request.getParticipantCount(), request.getParticipants());

        // When updating, account for the current reservation's participant count if the
        // slot remains the same.
        int reservedAfterUpdate;
        if (Objects.equals(existing.getPlanTimeSlotId(), newSlot.getId())) {
            reservedAfterUpdate = newSlot.getReservedCount() - existing.getParticipantCount()
                    + request.getParticipantCount();
        } else {
            reservedAfterUpdate = newSlot.getReservedCount() + request.getParticipantCount();
        }
        if (reservedAfterUpdate > newSlot.getCapacity()) {
            throw new BusinessRuleViolationException("Slot capacity exceeded");
        }

        User user;
        if (request.getUserId() != null) {
            user = userMapper.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } else if (request.getEmail() != null) {
            user = userMapper.findByEmail(request.getEmail()).orElse(null);
            if (user == null) {
                user = new User();
                user.setName(request.getCustomerName());
                user.setEmail(request.getEmail());
                user.setPhone(request.getPhone());
                user.setRole("customer");
                user.setPasswordHash("$2a$10$AJmLE8MK1Swf53hcADbYg.RTIqFvq9AvW6BGo2Bxr34fnzNHsczpW");
                userMapper.insert(user);
            }
        } else {
            user = userMapper.findById(existing.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }

        // adjust reserved count if slot changed
        if (!Objects.equals(existing.getPlanTimeSlotId(), newSlot.getId())) {
            planTimeSlotMapper.incrementReservedCount(existing.getPlanTimeSlotId(), -existing.getParticipantCount());
            planTimeSlotMapper.incrementReservedCount(newSlot.getId(), request.getParticipantCount());
        } else {
            int delta = request.getParticipantCount() - existing.getParticipantCount();
            if (delta != 0) {
                planTimeSlotMapper.incrementReservedCount(newSlot.getId(), delta);
            }
        }

        existing.setUserId(user.getId());
        existing.setPlanId(plan.getId());
        existing.setPlanTimeSlotId(newSlot.getId());
        existing.setReservationDate(newSlot.getSlotDate());
        existing.setStartTime(newSlot.getStartTime());
        existing.setParticipantCount(request.getParticipantCount());
        existing.setTotalPrice(plan.getPrice() * request.getParticipantCount());
        reservationMapper.update(existing);

        participantMapper.deleteByReservationId(existing.getId());
        insertParticipants(existing.getId(), request.getParticipants());

        List<ReservationParticipant> participants = participantMapper.findByReservationId(existing.getId());
        return mapToResponse(existing, user, plan, participants);
    }

    @Transactional
    public ReservationResponse cancelReservation(Long id) {
        Reservation reservation = reservationMapper.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (STATUS_CANCELLED.equalsIgnoreCase(reservation.getStatus())) {
            return mapToResponse(reservation, userMapper.findById(reservation.getUserId()).orElse(null),
                    planMapper.findById(reservation.getPlanId()).orElse(null),
                    participantMapper.findByReservationId(reservation.getId()));
        }

        reservation.setStatus(STATUS_CANCELLED);
        reservationMapper.update(reservation);

        planTimeSlotMapper.incrementReservedCount(reservation.getPlanTimeSlotId(), -reservation.getParticipantCount());

        User user = userMapper.findById(reservation.getUserId()).orElse(null);
        Plan plan = planMapper.findById(reservation.getPlanId()).orElse(null);
        List<ReservationParticipant> participants = participantMapper.findByReservationId(reservation.getId());
        return mapToResponse(reservation, user, plan, participants);
    }

    @Transactional
    public ReservationResponse updateReservationStatus(Long id, String status) {
        String normalized = normalizeStatus(status);
        if (normalized == null) {
            throw new BusinessRuleViolationException("Status is required");
        }
        if (STATUS_CANCELLED.equals(normalized)) {
            return cancelReservation(id);
        }
        if (!STATUS_CONFIRMED.equalsIgnoreCase(normalized) && !STATUS_PENDING.equalsIgnoreCase(normalized)) {
            throw new BusinessRuleViolationException("Invalid status");
        }

        Reservation reservation = reservationMapper.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        String oldStatus = reservation.getStatus();

        reservation.setStatus(normalized);
        reservationMapper.update(reservation);

        // ★追加：pending → confirmed
        if (STATUS_PENDING.equalsIgnoreCase(oldStatus)) {
            planTimeSlotMapper.incrementReservedCount(
                    reservation.getPlanTimeSlotId(),
                    reservation.getParticipantCount());
        }
    }

    User user = userMapper.findById(reservation.getUserId()).orElse(null);
    Plan plan = planMapper.findById(reservation.getPlanId()).orElse(null);
    List<ReservationParticipant> participants = participantMapper.findByReservationId(reservation.getId());return

    mapToResponse(reservation, user, plan, participants);
    }

    private void insertParticipants(Long reservationId,
            List<com.example.shizuka.dto.request.ParticipantRequest> participants) {
        List<ReservationParticipant> entities = participants.stream().map(p -> {
            ReservationParticipant rp = new ReservationParticipant();
            rp.setReservationId(reservationId);
            rp.setParticipantName(p.getParticipantName());
            rp.setParticipantNameKana(p.getParticipantNameKana());
            rp.setAgeGroup(p.getAgeGroup());
            rp.setAllergyNote(p.getAllergyNote());
            return rp;
        }).collect(Collectors.toList());
        participantMapper.insertBatch(entities);
    }

    private void validateParticipantCount(Integer participantCount, List<?> participants) {
        if (participantCount == null || participants == null) {
            throw new IllegalArgumentException("Participant count and participants must be provided");
        }
        if (participantCount != participants.size()) {
            throw new IllegalArgumentException("participantCount must match participants size");
        }
    }

    private void checkSlotDateTime(PlanTimeSlot slot) {
        if (slot.getSlotDate() == null || slot.getStartTime() == null) {
            return;
        }
        LocalDateTime slotDateTime = LocalDateTime.of(slot.getSlotDate(), slot.getStartTime());
        if (slotDateTime.isBefore(LocalDateTime.now())) {
            throw new BusinessRuleViolationException("Slot is in the past");
        }
    }

    private ReservationResponse mapToResponse(Reservation reservation, User user, Plan plan,
            List<ReservationParticipant> participants) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setUserId(reservation.getUserId());
        if (user != null) {
            response.setCustomerName(user.getName());
            response.setCustomerEmail(user.getEmail());
            response.setCustomerPhone(user.getPhone());
        } else {
            response.setCustomerName("");
            response.setCustomerEmail("");
            response.setCustomerPhone("");
        }
        response.setPlanId(reservation.getPlanId());
        if (plan != null) {
            response.setPlanName(plan.getName());
        }
        response.setPlanTimeSlotId(reservation.getPlanTimeSlotId());
        response.setReservationDate(reservation.getReservationDate());
        response.setStartTime(reservation.getStartTime());
        response.setStatus(reservation.getStatus());
        response.setParticipantCount(reservation.getParticipantCount());
        response.setTotalPrice(reservation.getTotalPrice());
        List<ReservationParticipant> safeParticipants = participants == null ? Collections.emptyList() : participants;
        response.setParticipants(safeParticipants.stream().map(this::mapParticipant).collect(Collectors.toList()));
        return response;
    }

    private ParticipantResponse mapParticipant(ReservationParticipant participant) {
        ParticipantResponse response = new ParticipantResponse();
        response.setId(participant.getId());
        response.setParticipantName(participant.getParticipantName());
        response.setParticipantNameKana(participant.getParticipantNameKana());
        response.setAgeGroup(participant.getAgeGroup());
        response.setAllergyNote(participant.getAllergyNote());
        return response;
    }

    private String normalizeQueryParam(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeStatus(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed.toLowerCase();
    }
}
