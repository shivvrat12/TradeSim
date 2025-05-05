package com.tradesim.marketservice.controller;

import com.tradesim.marketservice.service.MarketServiceImpl;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class MarketController {

    private final RedisTemplate<String, Object> redisTemplate;
    private final MarketServiceImpl marketServiceImpl;

    public MarketController(RedisTemplate<String, Object> redisTemplate, MarketServiceImpl marketServiceImpl) {
        this.redisTemplate = redisTemplate;
        this.marketServiceImpl = marketServiceImpl;
    }

    @CrossOrigin(origins = "http://localhost:5173",allowCredentials = "true")
    @GetMapping("/latest")
    public Map<String, Object> getLatestTrades() {
        List<String> symbols = List.of(
                "BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "SOLUSDT",
                "ADAUSDT", "DOGEUSDT", "MATICUSDT", "LTCUSDT", "DOTUSDT",
                "LINKUSDT", "SHIBUSDT", "TRXUSDT", "AVAXUSDT", "ATOMUSDT",
                "XLMUSDT", "NEARUSDT", "APEUSDT", "FTMUSDT", "SANDUSDT"
        );
        Map<String, Object> response = new HashMap<>();
        for (String symbol : symbols) {
            Object trade = redisTemplate.opsForValue().get(symbol);
            response.put(symbol, trade != null ? trade : new HashMap<>());
        }
        return response;
    }
}