package com.example.ecommerce.controller;

import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);


    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody Map<String, String> updateRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (updateRequest.containsKey("email")) {
                String newEmail = updateRequest.get("email");
                // Check if email is already taken by another user
                if (userRepository.existsByEmail(newEmail) && !user.getEmail().equals(newEmail)) {
                    return ResponseEntity.badRequest().body("Email is already in use by another account.");
                }
                user.setEmail(newEmail);
            }
            
            userRepository.save(user);
            return ResponseEntity.ok("Profile updated successfully");
        } catch (Exception e) {
            logger.error("Error updating profile: ", e);
            return ResponseEntity.internalServerError().body("Error updating profile: " + e.getMessage());
        }
    }


    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody Map<String, String> passwordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldPassword = passwordRequest.get("oldPassword");
        String newPassword = passwordRequest.get("newPassword");

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Old password matches incorrectly");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        return ResponseEntity.ok("Password changed successfully");
    }

    @DeleteMapping("/me")
    @Transactional
    public ResponseEntity<?> deleteUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 1. Delete associated orders
            orderRepository.deleteByUser(user);

            // 2. Delete associated cart
            cartRepository.deleteByUser(user);

            // 3. Delete the user
            userRepository.delete(user);

            logger.info("User {} deleted successfully", username);
            return ResponseEntity.ok("User account and associated data deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting user: ", e);
            return ResponseEntity.internalServerError().body("Error deleting user: " + e.getMessage());
        }
    }
}
