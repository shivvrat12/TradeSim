package com.tradesim.tradeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
@Builder
public class TradeRes {
    private String message;
    private double balance;
    private Map<String,Double> updatedHoldings;
}
