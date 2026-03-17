package com.example.shizuka.service;

import com.example.shizuka.entity.User;
import com.example.shizuka.exception.ResourceNotFoundException;
import com.example.shizuka.mapper.UserMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserMapper userMapper, BCryptPasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    public User findById(Long id) {
        return userMapper.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public List<User> findAllCustomers() {
        return userMapper.findByRole("customer");
    }

    @Transactional
    public User createCustomerIfMissing(String name, String email, String phone) {
        return userMapper.findByEmail(email)
                .orElseGet(() -> {
                    User user = new User();
                    user.setName(name);
                    user.setEmail(email);
                    user.setPhone(phone);
                    user.setRole("customer");
                    user.setPasswordHash(passwordEncoder.encode("password"));
                    userMapper.insert(user);
                    return user;
                });
    }
}
