package com.kaori.reservation.mapper;

import com.kaori.reservation.model.Course;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CourseMapper {

    @Select("SELECT * FROM courses WHERE is_active = true")
    List<Course> findAllActive();

    @Select("SELECT * FROM courses WHERE id = #{id}")
    Course findById(Long id);
}