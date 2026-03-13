package com.kaori.reservation.controller;

import com.kaori.reservation.mapper.CourseMapper;
import com.kaori.reservation.model.Course;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private CourseMapper courseMapper;

    @GetMapping("/courses")
    public List<Course> getCourses() {
        return courseMapper.findAllActive();
    }
}