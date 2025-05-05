package com.tradesim.portfolio.service;

import com.tradesim.portfolio.dto.PortfolioResponse;
import com.tradesim.portfolio.entity.Portfolio;
import com.tradesim.portfolio.repository.PortfolioRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import javax.sound.sampled.Port;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@AllArgsConstructor
public class PortfolioService {

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
}