package com.tradesim.portfolio.controller;

import com.tradesim.portfolio.dto.BuyCryptoReqDto;
import com.tradesim.portfolio.dto.PortfolioResponse;
import com.tradesim.portfolio.dto.TradeCryptoRes;
import com.tradesim.portfolio.service.PortfolioService;
import com.tradesim.portfolio.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final JwtUtils jwtUtils;


    @GetMapping("/{email}")
    public ResponseEntity<PortfolioResponse> getPortfolio(@PathVariable String email) {
        try {
            PortfolioResponse portfolioResponse = portfolioService.getPortfolioByEmail(email);
            return ResponseEntity.ok(portfolioResponse);
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found for email: " + email);
        } catch (Exception e) {
            System.err.println("Error fetching portfolio for email: " + email + " - " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching portfolio");
        }
    }

    @GetMapping("/getBalance")
    public String fetchBalance(@RequestHeader("Authorization") String token){
        String jwtToken = token.substring(7);
        if (jwtUtils.isValidToken(jwtToken)){
        String email = jwtUtils.extractEmail(jwtToken);
            double balance = portfolioService.getBalance(email);
            return Double.toString(balance);
        }
        throw new RuntimeException("Something went wrong!");
    }
}