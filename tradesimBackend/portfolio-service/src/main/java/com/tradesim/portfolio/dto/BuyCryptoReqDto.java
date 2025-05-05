package com.tradesim.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class BuyCryptoReqDto {
    private String symbol;
    private double price;
    private double quantityToBuy;
}
