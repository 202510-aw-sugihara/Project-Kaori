package com.example.shizuka.config;

import com.example.shizuka.entity.User;
import com.example.shizuka.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    public AdminUserInitializer(UserMapper userMapper, BCryptPasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        var existing = userMapper.findByEmail("admin@example.com");
        if (existing.isPresent()) {
            return;
        }
        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin@example.com");
        admin.setPhone("09000000000");
        admin.setRole("admin");
        admin.setPasswordHash(passwordEncoder.encode("password"));
        userMapper.insert(admin);
        log.info("Seeded admin user: admin@example.com");
    }
}
