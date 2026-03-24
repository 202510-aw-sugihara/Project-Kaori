package com.kaori.reservation.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private static final Logger logger = LoggerFactory.getLogger(AdminAuthController.class);

    private final SecurityContextRepository securityContextRepository;

    public AdminAuthController(SecurityContextRepository securityContextRepository) {
        this.securityContextRepository = securityContextRepository;
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest request) {
        SecurityContext context = securityContextRepository.loadDeferredContext(request).get();
        Authentication authentication = context.getAuthentication();

        boolean anonymous = authentication == null || authentication instanceof AnonymousAuthenticationToken;

        logger.info("Auth debug: class={}, principal={}, anonymous={}",
                authentication == null ? "null" : authentication.getClass().getName(),
                authentication == null ? "null" : String.valueOf(authentication.getPrincipal()),
                anonymous);

        Map<String, Object> response = new HashMap<>();
        response.put("authenticationClass", authentication == null ? null : authentication.getClass().getName());
        response.put("principal", authentication == null ? null : String.valueOf(authentication.getPrincipal()));
        response.put("anonymous", anonymous);
        response.put("authenticated", authentication != null && authentication.isAuthenticated() && !anonymous);
        return response;
    }
}
