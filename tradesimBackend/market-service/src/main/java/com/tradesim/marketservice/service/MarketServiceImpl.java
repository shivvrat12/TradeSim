package com.tradesim.marketservice.service;

import com.tradesim.marketservice.repository.MarketService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class MarketServiceImpl implements MarketService {

    @Override
    @Cacheable(value = "market-data")
    public String getMarketData() {
        try {
            Thread.sleep(5000);
            return "We hit it";
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
