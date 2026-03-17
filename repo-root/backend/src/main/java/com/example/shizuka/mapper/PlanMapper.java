package com.example.shizuka.mapper;

import com.example.shizuka.entity.Plan;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface PlanMapper {
    Optional<Plan> findById(@Param("id") Long id);

    List<Plan> findAllActive();

    void insert(Plan plan);

    void update(Plan plan);

    void softDelete(@Param("id") Long id);
}
