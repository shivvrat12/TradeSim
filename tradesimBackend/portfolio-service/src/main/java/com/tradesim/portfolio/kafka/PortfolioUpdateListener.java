package com.tradesim.portfolio.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradesim.portfolio.dto.TradeExecutedEvent;
import com.tradesim.portfolio.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PortfolioUpdateListener {

    private final PortfolioService portfolioService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "trade-executed", groupId = "portfolio-service")
    public void handleTradeExecuted(String message) {
        try {
            log.info("Received Kafka message: {}", message);
            TradeExecutedEvent event = objectMapper.readValue(message, TradeExecutedEvent.class);
            portfolioService.applyTrade(event);
        } catch (Exception e) {
            log.error("Failed to apply trade: {}. Error: {}", message, e.getMessage(), e);
        }
    }
}
