package com.example.shizuka.controller.admin;

import com.example.shizuka.dto.request.AdminLoginRequest;
import com.example.shizuka.dto.response.AdminAuthResponse;
import com.example.shizuka.entity.User;
import com.example.shizuka.mapper.UserMapper;
import com.example.shizuka.security.ShizukaUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.context.SecurityContextRepository;
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

    private static final Logger logger = LoggerFactory.getLogger(AdminAuthController.class);

    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final SecurityContextRepository securityContextRepository;

    public AdminAuthController(
            AuthenticationManager authenticationManager,
            UserMapper userMapper,
            SecurityContextRepository securityContextRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.userMapper = userMapper;
        this.securityContextRepository = securityContextRepository;
    }

    @PostMapping("/login")
    public AdminAuthResponse login(@Valid @RequestBody AdminLoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
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
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

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
        boolean anonymous = authentication == null
                || authentication instanceof AnonymousAuthenticationToken
                || "anonymousUser".equals(authentication.getPrincipal());
        logger.info("Auth debug: class={}, principal={}, anonymous={}",
                authentication == null ? "null" : authentication.getClass().getName(),
                authentication == null ? "null" : String.valueOf(authentication.getPrincipal()),
                anonymous);
        if (authentication == null
                || !authentication.isAuthenticated()
                || anonymous) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof ShizukaUserDetails details) {
            return ResponseEntity.ok(toResponse(details.getUser()));
        }

        if (principal instanceof UserDetails user) {
            String email = user.getUsername();
            var maybeUser = userMapper.findByEmail(email);
            User found = (maybeUser != null) ? maybeUser.orElse(null) : null;
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
