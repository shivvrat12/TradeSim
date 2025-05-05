package com.tradesim.tradeservice.service;

import com.tradesim.tradeservice.dto.TradeRes;
import com.tradesim.tradeservice.dto.PortfolioUpdateReq;
import com.tradesim.tradeservice.kafka.KafkaProducerService;
import com.tradesim.tradeservice.models.PortfolioRes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class TradeService {

    private static final Logger logger = Logger.getLogger(TradeService.class.getName());

    @Autowired
    private KafkaProducerService kafkaProducerService;

    private final WebClient webClient = WebClient.builder()
            .baseUrl("http://portfolio-service:8082")
            .build();

    public PortfolioRes fetchUserPortfolio(String email) {
        logger.info("Fetching portfolio for email: " + email);
        PortfolioRes portfolio = webClient.get()
                .uri("/api/portfolio/{email}", email)
                .retrieve()
                .bodyToMono(PortfolioRes.class)
                .block();
        if (portfolio != null) {
            logger.info("Portfolio response - Email: " + portfolio.getEmail() +
                    ", Balance: " + portfolio.getBalance() +
                    ", Holdings: " + portfolio.getHoldings());
        } else {
            logger.warning("Portfolio response is null for email: " + email);
        }
        return portfolio;
    }

    public ResponseEntity<TradeRes> sellCrypto(String email, String symbol, double price, double quantity) {
        try {
            logger.info("Processing sell request: email=" + email + ", symbol=" + symbol +
                    ", price=" + price + ", quantity=" + quantity);
            Optional<PortfolioRes> responseOptional = Optional.ofNullable(fetchUserPortfolio(email));
            PortfolioRes portfolioResponse = responseOptional.orElseThrow(() ->
                    new RuntimeException("Unable to fetch portfolio"));

            double availableBalance = portfolioResponse.getBalance();
            Map<String, Double> availableHolding = portfolioResponse.getHoldings();
            double totalSale = price * quantity;

            logger.info("Sell - Available balance: " + availableBalance + ", Total sale value: " + totalSale);

            if (availableBalance == 0.0 && availableHolding.isEmpty()) {
                logger.warning("Portfolio is empty for email: " + email);
            }

            if (!availableHolding.containsKey(symbol)) {
                throw new RuntimeException("Don't have any crypto in portfolio with name: " + symbol);
            }
            double availableQuantity = availableHolding.get(symbol);
            if (availableQuantity < quantity) {
                throw new RuntimeException("You don't have enough quantity of " + symbol);
            }

            portfolioResponse.setBalance(availableBalance + totalSale);
            if (availableQuantity == quantity) {
                availableHolding.remove(symbol);
            } else {
                availableHolding.put(symbol, availableQuantity - quantity);
            }

            PortfolioUpdateReq updateReq = PortfolioUpdateReq.builder()
                    .email(email)
                    .updatedBalance(portfolioResponse.getBalance())
                    .updatedHoldings(availableHolding)
                    .build();

            kafkaProducerService.sendPortfolioUpdate(updateReq);

            logger.info("Sell successful: Updated balance: " + portfolioResponse.getBalance() +
                    ", Updated holdings: " + availableHolding);

            return ResponseEntity.ok(
                    TradeRes.builder()
                            .message("Successfully sold " + quantity + " of " + symbol)
                            .balance(portfolioResponse.getBalance())
                            .updatedHoldings(availableHolding)
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

    public ResponseEntity<TradeRes> buyCrypto(String email, String symbol, double price, double quantity) {
        try {
            logger.info("Processing buy request: email=" + email + ", symbol=" + symbol +
                    ", price=" + price + ", quantity=" + quantity);
            Optional<PortfolioRes> responseOptional = Optional.ofNullable(fetchUserPortfolio(email));
            PortfolioRes response = responseOptional.orElseThrow(() ->
                    new RuntimeException("Unable to fetch portfolio"));

            double availableBalance = response.getBalance();
            Map<String, Double> availableHolding = response.getHoldings();
            double totalCost = price * quantity;

            logger.info("Buy - Available balance: " + availableBalance + ", Total cost: " + totalCost);

            if (availableBalance == 0.0 && availableHolding.isEmpty()) {
                logger.warning("Portfolio is empty for email: " + email);
            }

            if (availableBalance < totalCost) {
                throw new RuntimeException("Insufficient balance to buy " + symbol +
                        ". Required: " + totalCost + ", Available: " + availableBalance);
            }

            response.setBalance(availableBalance - totalCost);
            availableHolding.merge(symbol, quantity, Double::sum);

            PortfolioUpdateReq updateReq = PortfolioUpdateReq.builder()
                    .email(email)
                    .updatedBalance(response.getBalance())
                    .updatedHoldings(availableHolding)
                    .build();

            kafkaProducerService.sendPortfolioUpdate(updateReq);

            logger.info("Buy successful: Updated balance: " + response.getBalance() +
                    ", Updated holdings: " + availableHolding);

            return ResponseEntity.ok(
                    TradeRes.builder()
                            .message("Successfully bought " + quantity + " of " + symbol)
                            .balance(response.getBalance())
                            .updatedHoldings(availableHolding)
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
}