package com.example.ecommerce.service;

import com.example.ecommerce.model.Order;
import com.example.ecommerce.model.OrderItem;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOrderConfirmation(String toEmail, Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✅ Order Confirmed - Order #" + order.getId());

            StringBuilder html = new StringBuilder();
            html.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>");
            html.append("<div style='background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px; text-align: center;'>");
            html.append("<h1 style='color: white; margin: 0;'>🛒 Order Confirmed!</h1>");
            html.append("</div>");
            html.append("<div style='padding: 32px;'>");
            html.append("<p style='color: #64748b;'>Thank you for your purchase. Here's your order summary:</p>");
            html.append("<table style='width:100%; border-collapse: collapse; margin: 20px 0;'>");
            html.append("<thead><tr style='background: #f8fafc;'>");
            html.append("<th style='padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;'>Product</th>");
            html.append("<th style='padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;'>Qty</th>");
            html.append("<th style='padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;'>Price</th>");
            html.append("</tr></thead><tbody>");

            double total = 0;
            for (OrderItem item : order.getItems()) {
                double itemTotal = item.getProduct().getPrice() * item.getQuantity();
                total += itemTotal;
                html.append("<tr>");
                html.append("<td style='padding: 12px; border-bottom: 1px solid #e2e8f0;'>").append(item.getProduct().getName()).append("</td>");
                html.append("<td style='padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;'>").append(item.getQuantity()).append("</td>");
                html.append("<td style='padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0;'>₹").append(String.format("%.2f", itemTotal)).append("</td>");
                html.append("</tr>");
            }

            html.append("</tbody></table>");
            html.append("<div style='margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px;'>");
            html.append("<p style='margin: 0; color: #64748b;'><strong>Payment Method:</strong> ").append(order.getPaymentMethod()).append("</p>");
            html.append("</div>");
            html.append("<div style='text-align: right; padding: 16px 0; border-top: 2px solid #4f46e5;'>");
            html.append("<strong style='font-size: 1.2rem; color: #4f46e5;'>Total: ₹").append(String.format("%.2f", total)).append("</strong>");
            html.append("</div>");
            html.append("<p style='color: #64748b; font-size: 0.9rem;'>Your order will be delivered within 3-5 business days.</p>");
            html.append("</div>");
            html.append("<div style='background: #f8fafc; padding: 16px; text-align: center; color: #94a3b8; font-size: 0.8rem;'>");
            html.append("© 2024 Ecommerce Store | Thank you for shopping with us!");
            html.append("</div></div>");

            helper.setText(html.toString(), true);
            mailSender.send(message);
            System.out.println("Order confirmation email sent to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public void sendWelcomeEmail(String toEmail, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to Ecommerce, " + username + "! 🎉");

            String html = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto;'>"
                + "<div style='background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;'>"
                + "<h1 style='color: white; margin: 0;'>Welcome, " + username + "! 🎉</h1>"
                + "</div>"
                + "<div style='padding: 32px; background: white; border: 1px solid #e2e8f0;'>"
                + "<p>Your account has been created successfully. Start exploring our products and enjoy seamless shopping!</p>"
                + "<a href='http://localhost:3000/dashboard' style='display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;'>Start Shopping →</a>"
                + "</div></div>";

            helper.setText(html, true);
            mailSender.send(message);
            System.out.println("Welcome email sent to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }
}
