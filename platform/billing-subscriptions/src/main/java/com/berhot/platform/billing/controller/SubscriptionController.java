package com.berhot.platform.billing.controller;

import com.berhot.platform.billing.dto.ChangePlanRequest;
import com.berhot.platform.billing.dto.PlanResponse;
import com.berhot.platform.billing.dto.SubscriptionResponse;
import com.berhot.platform.billing.repository.PlanRepository;
import com.berhot.platform.billing.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final PlanRepository planRepository;

    public SubscriptionController(SubscriptionService subscriptionService, PlanRepository planRepository) {
        this.subscriptionService = subscriptionService;
        this.planRepository = planRepository;
    }

    /**
     * GET /api/v1/subscriptions/current?tenantId=xxx
     * Get the current active subscription for a tenant.
     */
    @GetMapping("/current")
    public ResponseEntity<SubscriptionResponse> getCurrentSubscription(
            @RequestParam String tenantId) {
        var sub = subscriptionService.getCurrentSubscription(tenantId);
        return ResponseEntity.ok(sub);
    }

    /**
     * PUT /api/v1/subscriptions/change-plan?tenantId=xxx
     * Change the plan for a tenant.
     */
    @PutMapping("/change-plan")
    public ResponseEntity<SubscriptionResponse> changePlan(
            @RequestParam String tenantId,
            @RequestBody ChangePlanRequest request) {
        var sub = subscriptionService.changePlan(tenantId, request.plan(), request.billingCycle());
        return ResponseEntity.ok(sub);
    }

    /**
     * GET /api/v1/subscriptions/history?tenantId=xxx
     * Get subscription history for a tenant.
     */
    @GetMapping("/history")
    public ResponseEntity<List<SubscriptionResponse>> getHistory(
            @RequestParam String tenantId) {
        var history = subscriptionService.getHistory(tenantId);
        return ResponseEntity.ok(history);
    }

    /**
     * GET /api/v1/subscriptions/plans
     * Get all available subscription plans.
     */
    @GetMapping("/plans")
    public ResponseEntity<List<PlanResponse>> getPlans() {
        var plans = planRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream().map(PlanResponse::from).toList();
        return ResponseEntity.ok(plans);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "billing-subscriptions"));
    }
}
