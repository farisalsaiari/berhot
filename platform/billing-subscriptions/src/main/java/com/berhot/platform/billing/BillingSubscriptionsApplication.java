package com.berhot.platform.billing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BillingSubscriptionsApplication {
    public static void main(String[] args) {
        SpringApplication.run(BillingSubscriptionsApplication.class, args);
    }
}
