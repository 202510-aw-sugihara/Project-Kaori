package com.kaori.reservation.service;

import com.kaori.reservation.mapper.CustomerMapper;
import com.kaori.reservation.mapper.ReservationMapper;
import com.kaori.reservation.mapper.SlotMapper;
import com.kaori.reservation.model.Customer;
import com.kaori.reservation.model.Reservation;
import com.kaori.reservation.model.Slot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservationService {

    private static final Logger logger = LoggerFactory.getLogger(ReservationService.class);

    @Autowired
    private ReservationMapper reservationMapper;

    @Autowired
    private SlotMapper slotMapper;

    @Autowired
    private CustomerMapper customerMapper;

    @Transactional
    public Long createReservation(Long courseId, Long slotId, String name, String email, String phone, Integer people,
            String note) {
        try {
            // 1. slot取得
            Slot slot = slotMapper.findSlotById(slotId);
            if (slot == null) {
                logger.error("Slot not found: {}", slotId);
                throw new RuntimeException("slot not found");
            }

            // 2. 残席確認
            if (slot.getCapacity() - slot.getReservedCount() < people) {
                logger.warn("No capacity for slot {}: capacity={}, reserved={}, people={}", slotId, slot.getCapacity(),
                        slot.getReservedCount(), people);
                throw new RuntimeException("no capacity");
            }

            // 3. customer取得
            Customer customer = customerMapper.findCustomerByEmail(email);
            if (customer == null) {
                // 4. customer未存在なら作成
                customer = new Customer();
                customer.setName(name);
                customer.setEmail(email);
                customer.setPhone(phone);
                customerMapper.insertCustomer(customer);
            }

            // 5. reservation登録
            Reservation reservation = new Reservation();
            reservation.setCourseId(courseId);
            reservation.setSlotId(slotId);
            reservation.setCustomerId(customer.getId());
            reservation.setPeople(people);
            reservation.setStatus(Reservation.Status.CONFIRMED);
            reservation.setNote(note);
            reservationMapper.insertReservation(reservation);

            // 6. slot.reservedCount更新
            slot.setReservedCount(slot.getReservedCount() + people);
            slotMapper.updateReservedCount(slot.getId(), slot.getReservedCount());

            logger.info("Reservation created: id={}, slot={}, people={}", reservation.getId(), slotId, people);
            return reservation.getId();
        } catch (Exception e) {
            logger.error("Failed to create reservation: {}", e.getMessage());
            throw e;
        }
    }

    @Transactional
    public void cancelReservation(Long reservationId) {
        try {
            Reservation reservation = reservationMapper.findReservationById(reservationId);
            if (reservation == null) {
                logger.error("Reservation not found: {}", reservationId);
                throw new RuntimeException("reservation not found");
            }

            if (reservation.getStatus() == Reservation.Status.CANCELLED) {
                logger.warn("Reservation already cancelled: {}", reservationId);
                throw new RuntimeException("reservation already cancelled");
            }

            // status = CANCELLED
            reservationMapper.updateReservationStatus(reservationId, Reservation.Status.CANCELLED.name());

            // slot.reservedCount -= people
            Slot slot = slotMapper.findSlotById(reservation.getSlotId());
            slot.setReservedCount(slot.getReservedCount() - reservation.getPeople());
            slotMapper.updateReservedCount(slot.getId(), slot.getReservedCount());

            logger.info("Reservation cancelled: id={}", reservationId);
        } catch (Exception e) {
            logger.error("Failed to cancel reservation: {}", e.getMessage());
            throw e;
        }
    }
}