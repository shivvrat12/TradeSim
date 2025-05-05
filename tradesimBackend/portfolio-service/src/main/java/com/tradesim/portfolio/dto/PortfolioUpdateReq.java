package com.tradesim.portfolio.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class PortfolioUpdateReq {
    private String email;
    private double updatedBalance;
    private Map<String, Double> updatedHoldings;
}
