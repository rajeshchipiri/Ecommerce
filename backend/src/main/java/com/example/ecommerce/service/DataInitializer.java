package com.example.ecommerce.service;

import com.example.ecommerce.model.Product;
import com.example.ecommerce.model.Role;
import com.example.ecommerce.model.RoleName;
import com.example.ecommerce.model.User;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.RoleRepository;
import com.example.ecommerce.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;


@Service
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProductRepository productRepository;


    @Override
    public void run(String... args) throws Exception {
        // Initialize Roles
        if (roleRepository.findByName(RoleName.ROLE_USER).isEmpty()) {
            roleRepository.save(new Role(RoleName.ROLE_USER));
        }
        if (roleRepository.findByName(RoleName.ROLE_ADMIN).isEmpty()) {
            roleRepository.save(new Role(RoleName.ROLE_ADMIN));
        }

        // Initialize Predefined Users
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@example.com", passwordEncoder.encode("password"));
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN).get();
            admin.setRoles(Collections.singleton(adminRole));
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("user")) {
            User user = new User("user", "user@example.com", passwordEncoder.encode("password"));
            Role userRole = roleRepository.findByName(RoleName.ROLE_USER).get();
            user.setRoles(Collections.singleton(userRole));
            userRepository.save(user);
        }

        // Initialize Products
        if (productRepository.count() == 0) {
            productRepository.save(new Product("Modern Laptop", "High-performance laptop for professionals.", 1200.00, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800", "Electronics"));
            productRepository.save(new Product("Wireless Headphones", "Noise-canceling over-ear headphones.", 250.00, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800", "Electronics"));
            productRepository.save(new Product("Smart Watch", "Fitness tracker and smartwatch.", 199.99, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800", "Electronics"));
            productRepository.save(new Product("Canvas Backpack", "Durable and stylish backpack.", 59.99, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800", "Accessories"));
            productRepository.save(new Product("Coffee Maker", "Automatic drip coffee maker.", 89.00, "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&q=80&w=800", "Home"));
            productRepository.save(new Product("Designer Sunglasses", "Polarized sunglasses with UV protection.", 145.00, "https://images.unsplash.com/photo-1511499767390-a7335958048d?auto=format&fit=crop&q=80&w=800", "Fashion"));
        }
    }

}
