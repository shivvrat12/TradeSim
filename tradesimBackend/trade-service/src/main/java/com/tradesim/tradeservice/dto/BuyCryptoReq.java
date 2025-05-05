package com.tradesim.tradeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BuyCryptoReq {
    private String symbol;
    private double price;
    private double quantity;
}
