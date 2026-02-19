package com.berhot.platform.billing.service;

import com.berhot.platform.billing.dto.SubscriptionResponse;
import com.berhot.platform.billing.entity.Subscription;
import com.berhot.platform.billing.entity.Subscription.BillingCycle;
import com.berhot.platform.billing.entity.Subscription.SubscriptionStatus;
import com.berhot.platform.billing.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

@Service
public class SubscriptionService {

    private static final Set<String> ALLOWED_PLANS = Set.of("free", "starter", "professional", "enterprise");

    private final SubscriptionRepository subscriptionRepo;
    private final TenantPlanSyncService tenantSync;

    @Value("${subscription.trial-duration-minutes:5}")
    private int trialDurationMinutes;

    @Value("${subscription.default-plan:starter}")
    private String defaultPlan;

    public SubscriptionService(SubscriptionRepository subscriptionRepo, TenantPlanSyncService tenantSync) {
        this.subscriptionRepo = subscriptionRepo;
        this.tenantSync = tenantSync;
    }

    /**
     * Get the current active subscription for a tenant.
     * Auto-expires if past expiry time and creates a downgrade.
     */
    @Transactional
    public SubscriptionResponse getCurrentSubscription(String tenantId) {
        var sub = subscriptionRepo.findActiveByTenantId(tenantId).orElse(null);

        if (sub == null) {
            sub = createSubscription(tenantId, defaultPlan, BillingCycle.MONTHLY, null);
            tenantSync.syncPlanToTenant(tenantId, defaultPlan, null);
        }

        // Auto-expire if past expiry
        if (sub.isExpired()) {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            sub.setUpdatedAt(Instant.now());
            subscriptionRepo.save(sub);

            // Auto-downgrade to starter
            sub = createSubscription(tenantId, defaultPlan, sub.getBillingCycle(), sub.getPlanKey());
            tenantSync.syncPlanToTenant(tenantId, defaultPlan, null);
        }

        return SubscriptionResponse.from(sub);
    }

    /**
     * Change the plan for a tenant.
     */
    @Transactional
    public SubscriptionResponse changePlan(String tenantId, String newPlan, String billingCycle) {
        if (!ALLOWED_PLANS.contains(newPlan)) {
            throw new IllegalArgumentException("Invalid plan. Allowed: " + ALLOWED_PLANS);
        }

        BillingCycle cycle = "yearly".equalsIgnoreCase(billingCycle)
            ? BillingCycle.YEARLY : BillingCycle.MONTHLY;

        // Cancel current subscription
        var current = subscriptionRepo.findActiveByTenantId(tenantId).orElse(null);
        String previousPlan = null;
        if (current != null) {
            previousPlan = current.getPlanKey();
            current.setStatus(SubscriptionStatus.CANCELLED);
            current.setCancelledAt(Instant.now());
            current.setUpdatedAt(Instant.now());
            subscriptionRepo.save(current);
        }

        // Determine expiry: professional/enterprise get trial expiry
        Instant expiresAt = null;
        SubscriptionStatus status = SubscriptionStatus.ACTIVE;
        if ("professional".equals(newPlan) || "enterprise".equals(newPlan)) {
            expiresAt = Instant.now().plus(trialDurationMinutes, ChronoUnit.MINUTES);
            status = SubscriptionStatus.TRIAL;
        }

        // Create new subscription
        var sub = new Subscription();
        sub.setTenantId(tenantId);
        sub.setPlanKey(newPlan);
        sub.setStatus(status);
        sub.setBillingCycle(cycle);
        sub.setStartedAt(Instant.now());
        sub.setExpiresAt(expiresAt);
        sub.setPreviousPlanKey(previousPlan);
        subscriptionRepo.save(sub);

        // Sync plan to tenants table
        tenantSync.syncPlanToTenant(tenantId, newPlan, expiresAt);

        return SubscriptionResponse.from(sub);
    }

    /**
     * Get subscription history for a tenant.
     */
    public List<SubscriptionResponse> getHistory(String tenantId) {
        return subscriptionRepo.findByTenantIdOrderByCreatedAtDesc(tenantId)
            .stream().map(SubscriptionResponse::from).toList();
    }

    /**
     * Process all expired subscriptions (called by scheduler).
     */
    @Transactional
    public int processExpiredSubscriptions() {
        var expired = subscriptionRepo.findExpiredSubscriptions(Instant.now());
        int count = 0;
        for (var sub : expired) {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            sub.setUpdatedAt(Instant.now());
            subscriptionRepo.save(sub);

            createSubscription(sub.getTenantId(), defaultPlan, sub.getBillingCycle(), sub.getPlanKey());
            tenantSync.syncPlanToTenant(sub.getTenantId(), defaultPlan, null);
            count++;
        }
        return count;
    }

    // ── Helpers ──

    private Subscription createSubscription(String tenantId, String planKey,
                                             BillingCycle cycle, String previousPlan) {
        var sub = new Subscription();
        sub.setTenantId(tenantId);
        sub.setPlanKey(planKey);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setBillingCycle(cycle);
        sub.setStartedAt(Instant.now());
        sub.setPreviousPlanKey(previousPlan);
        return subscriptionRepo.save(sub);
    }
}
