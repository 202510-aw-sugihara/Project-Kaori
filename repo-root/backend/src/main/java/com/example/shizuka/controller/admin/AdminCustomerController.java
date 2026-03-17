package com.example.shizuka.controller.admin;

import com.example.shizuka.dto.response.CustomerResponse;
import com.example.shizuka.entity.User;
import com.example.shizuka.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/customers")
public class AdminCustomerController {

    private final UserService userService;

    public AdminCustomerController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<CustomerResponse> list() {
        return userService.findAllCustomers().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public CustomerResponse get(@PathVariable Long id) {
        return toResponse(userService.findById(id));
    }

    private CustomerResponse toResponse(User user) {
        CustomerResponse response = new CustomerResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        return response;
    }
}
