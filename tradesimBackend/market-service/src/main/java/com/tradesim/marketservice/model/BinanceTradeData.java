package com.tradesim.marketservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)

public class BinanceTradeData {
    private String e; // Event type
    private long E;   // Event time
    private String s; // Symbol
    private long t;   // Trade ID
    private String p; // Price
    private String q; // Quantity
    private long T;   // Trade time
    private boolean m; // Buyer is the market maker
    private boolean M; // Ignore
}
