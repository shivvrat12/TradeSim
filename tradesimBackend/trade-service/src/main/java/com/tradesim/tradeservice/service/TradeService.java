package com.tradesim.tradeservice.service;

import com.tradesim.tradeservice.dto.TradeRes;
import com.tradesim.tradeservice.dto.TradeExecutedEvent;
import com.tradesim.tradeservice.kafka.KafkaProducerService;
import com.tradesim.tradeservice.models.PortfolioRes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class TradeService {

    private static final Logger logger = Logger.getLogger(TradeService.class.getName());
    // Tolerance for floating-point dust when selling an entire holding
    private static final double EPSILON = 1e-9;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @Autowired
    private PriceService priceService;

    private final WebClient webClient;

    public TradeService(@Value("${portfolio.base-url}") String portfolioBaseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(portfolioBaseUrl)
                .build();
    }

    public PortfolioRes fetchUserPortfolio(String email) {
        logger.info("Fetching portfolio for email: " + email);
        PortfolioRes portfolio;
        try {
            portfolio = webClient.get()
                    .uri("/api/portfolio/{email}", email)
                    .retrieve()
                    .bodyToMono(PortfolioRes.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new RuntimeException("No portfolio found for your account");
        } catch (Exception e) {
            throw new RuntimeException("Portfolio service is unavailable");
        }
        if (portfolio != null) {
            logger.info("Portfolio response - Email: " + portfolio.getEmail() +
                    ", Balance: " + portfolio.getBalance() +
                    ", Holdings: " + portfolio.getHoldings());
        } else {
            logger.warning("Portfolio response is null for email: " + email);
        }
        return portfolio;
    }

    public ResponseEntity<TradeRes> sellCrypto(String email, String symbol, double quantity) {
        try {
            logger.info("Processing sell request: email=" + email + ", symbol=" + symbol + ", quantity=" + quantity);
            validateQuantity(quantity);
            double price = priceService.getLatestPrice(symbol);
            PortfolioRes portfolio = Optional.ofNullable(fetchUserPortfolio(email))
                    .orElseThrow(() -> new RuntimeException("Unable to fetch portfolio"));

            Map<String, Double> holdings = portfolio.getHoldings();
            double availableQuantity = holdings.getOrDefault(symbol, 0.0);
            if (availableQuantity <= 0) {
                throw new RuntimeException("You don't hold any " + symbol);
            }
            if (availableQuantity + EPSILON < quantity) {
                throw new RuntimeException("You only hold " + availableQuantity + " " + symbol);
            }

            double totalSale = price * quantity;
            double newBalance = portfolio.getBalance() + totalSale;
            double remaining = availableQuantity - quantity;
            if (remaining <= EPSILON) {
                holdings.remove(symbol);
            } else {
                holdings.put(symbol, remaining);
            }

            kafkaProducerService.sendTradeExecuted(TradeExecutedEvent.builder()
                    .email(email)
                    .symbol(symbol)
                    .side(TradeExecutedEvent.Side.SELL)
                    .quantity(quantity)
                    .price(price)
                    .build());

            logger.info("Sell accepted: " + quantity + " " + symbol + " @ " + price);
            return ResponseEntity.ok(
                    TradeRes.builder()
                            .message("Sold " + quantity + " " + symbol + " at $" + price)
                            .balance(newBalance)
                            .updatedHoldings(holdings)
                            .build()
            );
        } catch (RuntimeException e) {
            logger.warning("Sell failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(
                    TradeRes.builder()
                            .message("Sell failed: " + e.getMessage())
                            .build()
            );
        }
    }

    public ResponseEntity<TradeRes> buyCrypto(String email, String symbol, double quantity) {
        try {
            logger.info("Processing buy request: email=" + email + ", symbol=" + symbol + ", quantity=" + quantity);
            validateQuantity(quantity);
            double price = priceService.getLatestPrice(symbol);
            PortfolioRes portfolio = Optional.ofNullable(fetchUserPortfolio(email))
                    .orElseThrow(() -> new RuntimeException("Unable to fetch portfolio"));

            double totalCost = price * quantity;
            double availableBalance = portfolio.getBalance();
            if (availableBalance < totalCost) {
                throw new RuntimeException(String.format(
                        "Insufficient balance. Required: $%.2f, available: $%.2f", totalCost, availableBalance));
            }

            Map<String, Double> holdings = portfolio.getHoldings();
            holdings.merge(symbol, quantity, Double::sum);

            kafkaProducerService.sendTradeExecuted(TradeExecutedEvent.builder()
                    .email(email)
                    .symbol(symbol)
                    .side(TradeExecutedEvent.Side.BUY)
                    .quantity(quantity)
                    .price(price)
                    .build());

            logger.info("Buy accepted: " + quantity + " " + symbol + " @ " + price);
            return ResponseEntity.ok(
                    TradeRes.builder()
                            .message("Bought " + quantity + " " + symbol + " at $" + price)
                            .balance(availableBalance - totalCost)
                            .updatedHoldings(holdings)
                            .build()
            );
        } catch (RuntimeException e) {
            logger.warning("Buy failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(
                    TradeRes.builder()
                            .message("Buy failed: " + e.getMessage())
                            .build()
            );
        }
    }

    private static void validateQuantity(double quantity) {
        if (!Double.isFinite(quantity) || quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }
    }
}
