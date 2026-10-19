package com.tradesim.marketservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Binance uses case-sensitive single-letter keys (e/E, t/T), so the Java fields get
// distinct names and @JsonProperty keeps the wire format the frontend reads.
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)

public class BinanceTradeData {
    @JsonProperty("e") private String eventType;
    @JsonProperty("E") private long eventTime;
    @JsonProperty("s") private String symbol;
    @JsonProperty("t") private long tradeId;
    @JsonProperty("p") private String price;
    @JsonProperty("q") private String quantity;
    @JsonProperty("T") private long tradeTime;
    @JsonProperty("m") private boolean buyerMarketMaker;
}
