package com.tradesim.portfolio.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradesim.portfolio.dto.PortfolioUpdateReq;
import com.tradesim.portfolio.entity.Portfolio;
import com.tradesim.portfolio.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PortfolioUpdateListener {

    private final PortfolioRepository portfolioRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "portfolio-update", groupId = "portfolio-service")
    public void handlePortfolioUpdate(String message) {
        try {
            log.info("Received Kafka message: {}", message);
            PortfolioUpdateReq updateRequest = objectMapper.readValue(message, PortfolioUpdateReq.class);
            log.info("Deserialized update request: Email={}, Balance={}, Holdings={}",
                    updateRequest.getEmail(), updateRequest.getUpdatedBalance(), updateRequest.getUpdatedHoldings());

            Portfolio portfolio = portfolioRepository.findByEmail(updateRequest.getEmail())
                    .orElseGet(() -> {
                        log.info("Portfolio not found for email: {}. Creating new portfolio.", updateRequest.getEmail());
                        Portfolio newPortfolio = new Portfolio();
                        newPortfolio.setEmail(updateRequest.getEmail());
                        newPortfolio.setBalance(0.0);
                        newPortfolio.setHoldings(new java.util.HashMap<>());
                        return newPortfolio;
                    });

            portfolio.setBalance(updateRequest.getUpdatedBalance());
            portfolio.setHoldings(updateRequest.getUpdatedHoldings());
            portfolioRepository.save(portfolio);
            log.info("Updated portfolio for email: {}", updateRequest.getEmail());
        } catch (Exception e) {
            log.error("Failed to process portfolio update message: {}. Error: {}", message, e.getMessage(), e);
        }
    }
}