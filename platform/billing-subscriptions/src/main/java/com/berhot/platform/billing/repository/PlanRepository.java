package com.berhot.platform.billing.repository;

import com.berhot.platform.billing.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlanRepository extends JpaRepository<Plan, String> {
    Optional<Plan> findByKey(String key);
    List<Plan> findByActiveTrueOrderBySortOrderAsc();
}
