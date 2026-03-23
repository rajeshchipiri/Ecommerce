package com.example.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<OrderItem> items = new ArrayList<>();


    private Double totalAmount;

    private String status; // e.g., PENDING, COMPLETED, CANCELLED
    
    private String paymentMethod; // e.g., RAZORPAY, COD

    private LocalDateTime createdAt;

    public Order(User user, Double totalAmount, String status, String paymentMethod) {
        this.user = user;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.createdAt = LocalDateTime.now();
    }
}
