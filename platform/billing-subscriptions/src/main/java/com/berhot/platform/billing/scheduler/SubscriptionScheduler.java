package com.berhot.platform.billing.scheduler;

import com.berhot.platform.billing.service.SubscriptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled task that periodically checks for expired subscriptions
 * and auto-downgrades them to the default plan (starter).
 */
@Component
public class SubscriptionScheduler {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionScheduler.class);

    private final SubscriptionService subscriptionService;

    public SubscriptionScheduler(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    /**
     * Run every 30 seconds to catch expiring subscriptions quickly.
     * For the 5-minute trial timer, this ensures subscriptions are expired
     * within at most 30 seconds of their expiry time.
     */
    @Scheduled(fixedRate = 30_000)
    public void processExpiredSubscriptions() {
        try {
            int count = subscriptionService.processExpiredSubscriptions();
            if (count > 0) {
                log.info("Processed {} expired subscription(s)", count);
            }
        } catch (Exception e) {
            log.error("Error processing expired subscriptions", e);
        }
    }
}
