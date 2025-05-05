package com.tradesim.marketservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradesim.marketservice.model.BinanceTradeWrapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.client.ReactorNettyWebSocketClient;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
public class BinanceWebSocketService {

    private static final Logger logger = LoggerFactory.getLogger(BinanceWebSocketService.class);
    private final MarketServiceImpl marketService;
    private static final List<String> CRYPTOS = List.of(
            "btcusdt", "ethusdt", "bnbusdt", "xrpusdt", "solusdt",
            "adausdt", "dogeusdt", "maticusdt", "ltcusdt", "dotusdt",
            "linkusdt", "shibusdt", "trxusdt", "avaxusdt", "atomusdt",
            "xlmusdt", "nearusdt", "apeusdt", "ftmusdt", "sandusdt"
    );
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final AtomicBoolean isConnected = new AtomicBoolean(false);

    @PostConstruct
    public void connect() {
        connectWithRetry();
    }

    private void connectWithRetry() {
        String streams = String.join("/", CRYPTOS.stream().map(c -> c + "@trade").toList());
        String url = "wss://stream.binance.com:443/stream?streams=" + streams;
        logger.info("Connecting to Binance WebSocket: {}", url);

        ReactorNettyWebSocketClient client = new ReactorNettyWebSocketClient();
        client.setMaxFramePayloadLength(65536); // Increase payload size for large messages

        client.execute(
                URI.create(url),
                session -> {
                    isConnected.set(true);
                    logger.info("Binance WebSocket connection established for streams: {}", streams);
                    // Send periodic pings to keep connection alive
                    Mono<Void> ping = session.send(
                            Mono.just(session.textMessage("ping"))
                    ).then(Mono.delay(Duration.ofSeconds(30)).then()).repeat().then();
                    // Receive messages
                    Mono<Void> receive = session.receive()
                            .map(WebSocketMessage::getPayloadAsText)
                            .doOnNext(this::handleMessage)
                            .doOnError(e -> logger.error("WebSocket receive error: {}", e.getMessage()))
                            .doOnComplete(() -> {
                                isConnected.set(false);
                                logger.warn("Binance WebSocket connection closed");
                            })
                            .then();
                    return Mono.when(ping, receive);
                }
        ).subscribe(
                null,
                error -> {
                    isConnected.set(false);
                    logger.error("Failed to connect to Binance WebSocket: {}", error.getMessage(), error);
                    logger.info("Retrying in 5 seconds...");
                    Mono.delay(Duration.ofSeconds(5))
                            .doOnNext(t -> logger.info("Attempting to reconnect..."))
                            .subscribe(t -> connectWithRetry());
                },
                () -> {
                    isConnected.set(false);
                    logger.info("Binance WebSocket connection completed");
                    logger.info("Retrying in 5 seconds...");
                    Mono.delay(Duration.ofSeconds(5))
                            .doOnNext(t -> logger.info("Attempting to reconnect..."))
                            .subscribe(t -> connectWithRetry());
                }
        );
    }

    private void handleMessage(String message) {
        try {
            logger.debug("Received Binance message: {}", message);
            BinanceTradeWrapper trade = new ObjectMapper().readValue(message, BinanceTradeWrapper.class);
            String symbol = trade.getData().getS().toUpperCase(); // Normalize to uppercase
            logger.info("Publishing trade for symbol: {}", symbol);
            redisTemplate.opsForValue().set(symbol, trade.getData());
            messagingTemplate.convertAndSend("/topic/crypto/" + symbol.toLowerCase(), trade.getData());
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse Binance message: {}", message, e);
        } catch (Exception e) {
            logger.error("Unexpected error processing Binance message: {}", message, e);
        }
    }

    public boolean isWebSocketConnected() {
        return isConnected.get();
    }
}