package com.tradesim.marketservice.exception;

public class MarketDataFetchException extends RuntimeException{
    public MarketDataFetchException(String message){
        super(message);
    }

    public MarketDataFetchException(String message, Throwable cause){
        super(message, cause);
    }
}
