package com.tradesim.tradeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SellCryptoReq {
    private String symbol;
    private double price;
    private double quantity;
}
