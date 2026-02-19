package com.berhot.platform.billing.config;

import com.berhot.platform.billing.entity.Plan;
import com.berhot.platform.billing.repository.PlanRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds the subscription_plans table with default plans on startup
 * if they don't already exist.
 */
@Component
public class PlanDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PlanDataSeeder.class);

    private final PlanRepository planRepository;

    public PlanDataSeeder(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Override
    public void run(String... args) {
        if (planRepository.count() > 0) {
            log.info("Plans already seeded ({} plans found), skipping.", planRepository.count());
            return;
        }

        log.info("Seeding subscription plans...");

        // Free plan
        var free = new Plan();
        free.setKey("free");
        free.setName("Free");
        free.setDescription("Basic access with limited features");
        free.setMonthlyPrice(0.0);
        free.setYearlyPrice(0.0);
        free.setCurrency("SAR");
        free.setSortOrder(0);
        free.setTrialDurationMinutes(0);
        planRepository.save(free);

        // Starter plan
        var starter = new Plan();
        starter.setKey("starter");
        starter.setName("Starter");
        starter.setDescription("Everything you need to get started");
        starter.setMonthlyPrice(0.0);
        starter.setYearlyPrice(0.0);
        starter.setCurrency("SAR");
        starter.setSortOrder(1);
        starter.setTrialDurationMinutes(0);
        planRepository.save(starter);

        // Professional plan
        var professional = new Plan();
        professional.setKey("professional");
        professional.setName("Professional");
        professional.setDescription("Advanced tools for growing businesses");
        professional.setMonthlyPrice(99.0);
        professional.setYearlyPrice(990.0);
        professional.setCurrency("SAR");
        professional.setSortOrder(2);
        professional.setTrialDurationMinutes(5);
        planRepository.save(professional);

        // Enterprise plan
        var enterprise = new Plan();
        enterprise.setKey("enterprise");
        enterprise.setName("Enterprise");
        enterprise.setDescription("Full platform access with premium support");
        enterprise.setMonthlyPrice(299.0);
        enterprise.setYearlyPrice(2990.0);
        enterprise.setCurrency("SAR");
        enterprise.setSortOrder(3);
        enterprise.setTrialDurationMinutes(5);
        planRepository.save(enterprise);

        log.info("Seeded 4 subscription plans successfully.");
    }
}
