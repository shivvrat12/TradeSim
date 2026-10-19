package com.tradesim.portfolio.controller;

import com.tradesim.portfolio.dto.PortfolioResponse;
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

    // Portfolio of the logged-in user, identified by their access token
    @GetMapping("/me")
    public PortfolioResponse getMyPortfolio(@RequestHeader(value = "Authorization", required = false) String token) {
        return getPortfolio(emailFromToken(token)).getBody();
    }

    @GetMapping("/getBalance")
    public String fetchBalance(@RequestHeader(value = "Authorization", required = false) String token) {
        String email = emailFromToken(token);
        try {
            return Double.toString(portfolioService.getBalance(email));
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found");
        }
    }

    // Used internally by trade-service
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

    private String emailFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing token");
        }
        String jwtToken = authHeader.substring(7);
        if (!jwtUtils.isValidToken(jwtToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
        return jwtUtils.extractEmail(jwtToken);
    }
}
