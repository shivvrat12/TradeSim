package com.tradesim.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class TradeCryptoRes {
    private String message;
    private double updatedBalance;
}
