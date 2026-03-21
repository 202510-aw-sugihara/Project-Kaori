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
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
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
    public AdminAuthResponse me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof ShizukaUserDetails)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User user = ((ShizukaUserDetails) authentication.getPrincipal()).getUser();
        return toResponse(user);
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
