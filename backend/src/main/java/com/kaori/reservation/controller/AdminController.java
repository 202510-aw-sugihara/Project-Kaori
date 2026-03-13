package com.kaori.reservation.controller;

import com.kaori.reservation.mapper.CourseMapper;
import com.kaori.reservation.mapper.ReservationMapper;
import com.kaori.reservation.model.Course;
import com.kaori.reservation.model.Reservation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private ReservationMapper reservationMapper;

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        // ダッシュボードのロジックを後で追加
        model.addAttribute("title", "管理ダッシュボード");
        return "admin/dashboard";
    }

    @GetMapping("/courses")
    public String courses(Model model) {
        List<Course> courses = courseMapper.findAllActive();
        model.addAttribute("courses", courses);
        return "admin/courses";
    }

    @GetMapping("/reservations")
    public String reservations(Model model) {
        List<Map<String, Object>> reservations = reservationMapper.findAllReservationsWithDetails();
        model.addAttribute("reservations", reservations);
        return "admin/reservations";
    }

    @GetMapping("/reservations/{id}")
    public String reservationDetail(@PathVariable Long id, Model model) {
        Map<String, Object> reservation = reservationMapper.findReservationByIdWithDetails(id);
        model.addAttribute("reservation", reservation);
        return "admin/reservation-detail";
    }

    @GetMapping("/cancel-success")
    public String cancelSuccess(Model model) {
        model.addAttribute("message", "Reservation cancelled successfully");
        return "redirect:/admin/reservations";
    }
}