package com.example.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;

    private Double priceAtOrder; // Snapshot of price when ordered

    @ManyToOne
    @JoinColumn(name = "order_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Order order;


    public OrderItem(Product product, Integer quantity, Double priceAtOrder, Order order) {
        this.product = product;
        this.quantity = quantity;
        this.priceAtOrder = priceAtOrder;
        this.order = order;
    }
}
