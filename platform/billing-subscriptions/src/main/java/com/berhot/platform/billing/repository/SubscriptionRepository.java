package com.berhot.platform.billing.repository;

import com.berhot.platform.billing.entity.Subscription;
import com.berhot.platform.billing.entity.Subscription.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, String> {

    Optional<Subscription> findFirstByTenantIdAndStatusInOrderByCreatedAtDesc(
        String tenantId, List<SubscriptionStatus> statuses);

    default Optional<Subscription> findActiveByTenantId(String tenantId) {
        return findFirstByTenantIdAndStatusInOrderByCreatedAtDesc(
            tenantId, List.of(SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL));
    }

    List<Subscription> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    @Query("SELECT s FROM Subscription s WHERE s.status IN ('ACTIVE','TRIAL') AND s.expiresAt IS NOT NULL AND s.expiresAt < :now")
    List<Subscription> findExpiredSubscriptions(Instant now);

    @Modifying
    @Query("UPDATE Subscription s SET s.status = 'EXPIRED', s.updatedAt = :now WHERE s.id = :id")
    void expireSubscription(String id, Instant now);
}
