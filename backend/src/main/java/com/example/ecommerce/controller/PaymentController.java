package com.example.ecommerce.controller;

import com.example.ecommerce.service.PaymentService;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Step 1: Create Razorpay order before showing payment popup
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        try {
            Double amount = Double.valueOf(request.get("amount").toString());
            Map<String, Object> order = paymentService.createOrder(amount);
            return ResponseEntity.ok(order);
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create payment order: " + e.getMessage()));
        }
    }

    // Step 2: Verify payment after Razorpay popup completes
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> request) {
        String razorpayOrderId = request.get("razorpayOrderId");
        String razorpayPaymentId = request.get("razorpayPaymentId");
        String razorpaySignature = request.get("razorpaySignature");

        boolean isValid = paymentService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (isValid) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Payment verified successfully!"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Payment signature verification failed!"));
        }
    }
}
