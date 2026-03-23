package com.example.ecommerce.controller;

import com.example.ecommerce.model.Order;
import com.example.ecommerce.model.User;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.example.ecommerce.service.EmailService emailService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody java.util.Map<String, String> request) {
        User user = getCurrentUser();
        String paymentMethod = request.getOrDefault("paymentMethod", "RAZORPAY");
        Order order = orderService.createOrder(user, paymentMethod);
        
        // Send email
        try {
            emailService.sendOrderConfirmation(user.getEmail(), order);
        } catch (Exception e) {
            System.err.println("Could not send email: " + e.getMessage());
        }
        
        return ResponseEntity.ok(order);
    }


    @GetMapping
    public ResponseEntity<List<Order>> getUserOrders() {
        return ResponseEntity.ok(orderService.getUserOrders(getCurrentUser()));
    }
}
