package com.tradesim.tradeservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

// Reads the latest trade price that market-service caches in Redis under the symbol key.
@Service
public class PriceService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public PriceService(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public double getLatestPrice(String symbol) {
        String json = redisTemplate.opsForValue().get(symbol);
        if (json == null) {
            throw new RuntimeException("No market price available for " + symbol);
        }
        try {
            JsonNode price = objectMapper.readTree(json).get("p");
            if (price == null) {
                throw new RuntimeException("No market price available for " + symbol);
            }
            return Double.parseDouble(price.asText());
        } catch (Exception e) {
            throw new RuntimeException("Could not read market price for " + symbol);
        }
    }
}
