package com.tradesim.tradeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Published by trade-service, applied by portfolio-service. It carries the trade itself
// rather than the resulting portfolio, so back-to-back trades can't overwrite each other.
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradeExecutedEvent {
    public enum Side { BUY, SELL }

    private String email;
    private String symbol;
    private Side side;
    private double quantity;
    private double price;
}
