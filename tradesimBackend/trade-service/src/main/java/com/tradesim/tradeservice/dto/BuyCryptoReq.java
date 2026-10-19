package com.tradesim.tradeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Price is not accepted from the client; trade-service uses the latest market price.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BuyCryptoReq {
    private String symbol;
    private double quantity;
}
