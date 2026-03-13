package com.kaori.reservation.controller;

import com.kaori.reservation.mapper.CourseMapper;
import com.kaori.reservation.model.Course;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private CourseMapper courseMapper;

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
}