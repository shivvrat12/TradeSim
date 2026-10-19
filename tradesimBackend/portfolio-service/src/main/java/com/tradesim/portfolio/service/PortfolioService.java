package com.tradesim.portfolio.service;

import com.tradesim.portfolio.dto.PortfolioResponse;
import com.tradesim.portfolio.dto.TradeExecutedEvent;
import com.tradesim.portfolio.entity.Portfolio;
import com.tradesim.portfolio.repository.PortfolioRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@AllArgsConstructor
@Slf4j
public class PortfolioService {

    // Tolerance for floating-point dust when selling an entire holding
    private static final double EPSILON = 1e-9;

    private PortfolioRepository portfolioRepository;

    public double getBalance(String email) {
        Optional<Portfolio> res = portfolioRepository.findByEmail(email);
        Portfolio response = res.orElseThrow(() -> new NoSuchElementException("Not found"));
        return response.getBalance();
    }

    public PortfolioResponse getPortfolioByEmail(String email) {
        Optional<Portfolio> res = portfolioRepository.findByEmail(email);
        Portfolio response = res.orElseThrow(() -> new NoSuchElementException("Not found"));
        return PortfolioResponse.builder()
                .email(response.getEmail())
                .balance(response.getBalance())
                .holdings(response.getHoldings())
                .build();
    }

    // Re-checks funds/holdings against the current row, since trade-service validated
    // against a snapshot that an earlier trade may have changed.
    @Transactional
    public void applyTrade(TradeExecutedEvent event) {
        Portfolio portfolio = portfolioRepository.findByEmail(event.getEmail())
                .orElseThrow(() -> new NoSuchElementException("No portfolio for " + event.getEmail()));
        Map<String, Double> holdings = new HashMap<>(portfolio.getHoldings());
        String symbol = event.getSymbol();
        double quantity = event.getQuantity();
        double total = quantity * event.getPrice();

        if (quantity <= 0 || event.getPrice() <= 0) {
            log.warn("Rejected trade with invalid quantity/price: {}", event);
            return;
        }

        if (event.getSide() == TradeExecutedEvent.Side.BUY) {
            if (portfolio.getBalance() < total) {
                log.warn("Rejected buy, insufficient balance: {}", event);
                return;
            }
            portfolio.setBalance(portfolio.getBalance() - total);
            holdings.merge(symbol, quantity, Double::sum);
        } else {
            double held = holdings.getOrDefault(symbol, 0.0);
            if (held + EPSILON < quantity) {
                log.warn("Rejected sell, insufficient holdings: {}", event);
                return;
            }
            portfolio.setBalance(portfolio.getBalance() + total);
            double remaining = held - quantity;
            if (remaining <= EPSILON) {
                holdings.remove(symbol);
            } else {
                holdings.put(symbol, remaining);
            }
        }

        portfolio.setHoldings(holdings);
        portfolioRepository.save(portfolio);
        log.info("Applied {} {} {} @ {} for {}", event.getSide(), quantity, symbol, event.getPrice(), event.getEmail());
    }
}
