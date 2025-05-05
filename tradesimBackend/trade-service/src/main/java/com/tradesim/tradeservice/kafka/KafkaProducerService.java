package com.tradesim.tradeservice.kafka;

import com.tradesim.tradeservice.dto.PortfolioUpdateReq;
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
    private final KafkaTemplate<String, PortfolioUpdateReq> kafkaTemplate;
    private static final String TOPIC = "portfolio-update";

    public void sendPortfolioUpdate(PortfolioUpdateReq updateRequest) {
        logger.info("Sending portfolio update to Kafka: Email=" + updateRequest.getEmail() +
                ", Balance=" + updateRequest.getUpdatedBalance() +
                ", Holdings=" + updateRequest.getUpdatedHoldings());
        CompletableFuture<SendResult<String, PortfolioUpdateReq>> future =
                kafkaTemplate.send(TOPIC, updateRequest.getEmail(), updateRequest);
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                logger.info("Successfully sent to Kafka topic: " + TOPIC + ", Offset: " +
                        result.getRecordMetadata().offset());
            } else {
                logger.severe("Failed to send to Kafka topic: " + TOPIC + ", Error: " + ex.getMessage());
            }
        });
        logger.info("Portfolio update sent to topic: " + TOPIC);
    }
}