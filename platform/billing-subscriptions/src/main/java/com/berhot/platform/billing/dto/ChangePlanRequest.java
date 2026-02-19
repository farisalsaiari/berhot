package com.berhot.platform.billing.dto;

public record ChangePlanRequest(
    String plan,
    String billingCycle // monthly or yearly
) {}
