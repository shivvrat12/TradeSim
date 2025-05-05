package com.tradesim.portfolio.kafka;

import com.tradesim.portfolio.entity.Portfolio;
import com.tradesim.portfolio.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Component
@RequiredArgsConstructor
public class UserCreatedListener {

    private final PortfolioRepository portfolioRepository;

    @KafkaListener(topics = "user-created-topic", groupId = "portfolio-service")
    public void handleUserCreated(String email) {
        System.out.println("Received new user email: " + email);

        if (portfolioRepository.findByEmail(email).isEmpty()) {
            Portfolio portfolio = Portfolio.builder()
                    .email(email)
                    .balance(1000000.0)
                    .holdings(new HashMap<>())
                    .build();

            try {
                portfolioRepository.save(portfolio);
                System.out.println("Created portfolio for email: " + email);
            } catch (Exception e) {
                System.err.println("Failed to create portfolio for email: " + email + ", error: " + e.getMessage());
            }
        } else {
            System.out.println("Portfolio already exists for email: " + email);
        }
    }
}