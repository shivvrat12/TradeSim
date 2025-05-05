package com.tradesim.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioResponse {
    private String email;
    private double balance;
    private Map<String, Double> holdings;
}