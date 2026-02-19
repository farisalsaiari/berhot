package com.berhot.platform.billing.dto;

import com.berhot.platform.billing.entity.Plan;

public record PlanResponse(
    String id,
    String key,
    String name,
    String description,
    Double monthlyPrice,
    Double yearlyPrice,
    String currency,
    int sortOrder,
    int trialDurationMinutes
) {
    public static PlanResponse from(Plan p) {
        return new PlanResponse(
            p.getId(), p.getKey(), p.getName(), p.getDescription(),
            p.getMonthlyPrice(), p.getYearlyPrice(), p.getCurrency(),
            p.getSortOrder(), p.getTrialDurationMinutes()
        );
    }
}
