package com.tradesim.tradeservice.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioRes {
    private String email;
    private double balance;
    private Map<String, Double> holdings;
}