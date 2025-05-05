package com.tradesim.portfolio.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SellCryptoReqDto {
    private String symbol;
    private double price;
    private double quantityToSell;
}
