package com.example.shizuka.security;

import com.example.shizuka.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class ShizukaUserDetails implements UserDetails {
    private final User user;

    public ShizukaUserDetails(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        var authority = "ROLE_" + user.getRole().toUpperCase();
        return List.of((GrantedAuthority) () -> authority);
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return user.getDeletedAt() == null;
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.getDeletedAt() == null;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return user.getDeletedAt() == null;
    }

    @Override
    public boolean isEnabled() {
        return user.getDeletedAt() == null;
    }
}
