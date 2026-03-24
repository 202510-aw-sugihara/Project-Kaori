package com.example.shizuka.controller.admin;

import com.example.shizuka.dto.request.AdminLoginRequest;
import com.example.shizuka.dto.response.AdminAuthResponse;
import com.example.shizuka.entity.User;
import com.example.shizuka.mapper.UserMapper;
import com.example.shizuka.security.ShizukaUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    public AdminAuthController(AuthenticationManager authenticationManager, UserMapper userMapper) {
        this.authenticationManager = authenticationManager;
        this.userMapper = userMapper;
    }

    @PostMapping("/login")
    public AdminAuthResponse login(@Valid @RequestBody AdminLoginRequest request, HttpServletRequest httpRequest) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        httpRequest.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context);

        ShizukaUserDetails details = (ShizukaUserDetails) authentication.getPrincipal();
        User user = details.getUser();

        return toResponse(user);
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof ShizukaUserDetails details) {
            return ResponseEntity.ok(toResponse(details.getUser()));
        }

        if (principal instanceof UserDetails user) {
            String email = user.getUsername();
            User found = userMapper.findByEmail(email).orElse(null);
            if (found != null) {
                return ResponseEntity.ok(toResponse(found));
            }
            AdminAuthResponse fallback = new AdminAuthResponse();
            fallback.setEmail(email);
            fallback.setName(buildFallbackName(email));
            return ResponseEntity.ok(fallback);
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session");
    }

    private String buildFallbackName(String email) {
        if (email == null || email.isBlank()) {
            return "Admin";
        }
        int at = email.indexOf("@");
        if (at <= 0) {
            return email;
        }
        return email.substring(0, at);
    }

    private AdminAuthResponse toResponse(User user) {
        AdminAuthResponse resp = new AdminAuthResponse();
        resp.setId(user.getId());
        resp.setName(user.getName());
        resp.setEmail(user.getEmail());
        resp.setRole(user.getRole());
        return resp;
    }
}
