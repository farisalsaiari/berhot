package com.berhot.platform.billing.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "subscription_plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String key; // free, starter, professional, enterprise

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "monthly_price")
    private Double monthlyPrice;

    @Column(name = "yearly_price")
    private Double yearlyPrice;

    private String currency = "USD";

    @Column(name = "sort_order")
    private int sortOrder;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "trial_duration_minutes")
    private int trialDurationMinutes = 0;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    // ── Getters & Setters ──
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getMonthlyPrice() { return monthlyPrice; }
    public void setMonthlyPrice(Double monthlyPrice) { this.monthlyPrice = monthlyPrice; }
    public Double getYearlyPrice() { return yearlyPrice; }
    public void setYearlyPrice(Double yearlyPrice) { this.yearlyPrice = yearlyPrice; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public int getTrialDurationMinutes() { return trialDurationMinutes; }
    public void setTrialDurationMinutes(int trialDurationMinutes) { this.trialDurationMinutes = trialDurationMinutes; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
