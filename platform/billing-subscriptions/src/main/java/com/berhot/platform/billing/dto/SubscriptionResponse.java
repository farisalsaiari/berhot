package com.berhot.platform.billing.dto;

import com.berhot.platform.billing.entity.Subscription;
import java.time.Instant;

public record SubscriptionResponse(
    String id,
    String tenantId,
    String planKey,
    String status,
    String billingCycle,
    Instant startedAt,
    Instant expiresAt,
    String previousPlanKey,
    Instant createdAt
) {
    public static SubscriptionResponse from(Subscription s) {
        return new SubscriptionResponse(
            s.getId(), s.getTenantId(), s.getPlanKey(),
            s.getStatus().name().toLowerCase(),
            s.getBillingCycle().name().toLowerCase(),
            s.getStartedAt(), s.getExpiresAt(),
            s.getPreviousPlanKey(), s.getCreatedAt()
        );
    }
}
