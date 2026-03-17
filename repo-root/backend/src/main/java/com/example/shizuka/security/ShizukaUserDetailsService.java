package com.example.shizuka.security;

import com.example.shizuka.mapper.UserMapper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ShizukaUserDetailsService implements UserDetailsService {

    private final UserMapper userMapper;

    public ShizukaUserDetailsService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userMapper.findByEmail(email)
                .filter(user -> user.getDeletedAt() == null)
                .map(ShizukaUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
