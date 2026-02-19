package com.berhot.platform.billing.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Syncs subscription plan changes to the tenants table in the shared database.
 * In a true microservices architecture, this would publish a Kafka event instead.
 */
@Service
public class TenantPlanSyncService {

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public void syncPlanToTenant(String tenantId, String plan, Instant expiresAt) {
        em.createNativeQuery(
            "UPDATE tenants SET plan = :plan, plan_expires_at = :expiresAt, updated_at = NOW() WHERE id = CAST(:id AS uuid)"
        )
        .setParameter("plan", plan)
        .setParameter("expiresAt", expiresAt != null ? java.sql.Timestamp.from(expiresAt) : null)
        .setParameter("id", tenantId)
        .executeUpdate();
    }
}
