package com.example.shizuka.mapper;

import com.example.shizuka.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {
    Optional<User> findByEmail(@Param("email") String email);

    Optional<User> findById(@Param("id") Long id);

    List<User> findByRole(@Param("role") String role);

    void insert(User user);

    void update(User user);

    void softDelete(@Param("id") Long id);
}
