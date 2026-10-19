package com.tradesim.tradeservice.kafka;

import com.tradesim.tradeservice.dto.TradeExecutedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private static final Logger logger = Logger.getLogger(KafkaProducerService.class.getName());
    private final KafkaTemplate<String, TradeExecutedEvent> kafkaTemplate;
    private static final String TOPIC = "trade-executed";

    public void sendTradeExecuted(TradeExecutedEvent event) {
        logger.info("Sending trade to Kafka: " + event);
        // Keyed by email so one user's trades stay ordered on a single partition
        CompletableFuture<SendResult<String, TradeExecutedEvent>> future =
                kafkaTemplate.send(TOPIC, event.getEmail(), event);
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                logger.info("Successfully sent to Kafka topic: " + TOPIC + ", Offset: " +
                        result.getRecordMetadata().offset());
            } else {
                logger.severe("Failed to send to Kafka topic: " + TOPIC + ", Error: " + ex.getMessage());
            }
        });
    }
}
