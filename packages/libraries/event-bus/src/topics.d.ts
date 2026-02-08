/**
 * Kafka topic naming convention: {domain}.{entity}.{action}
 * All topics are tenant-aware via event.tenantId field.
 */
export declare const Topics: {
    readonly AUTH_USER_CREATED: "identity.user.created";
    readonly AUTH_USER_UPDATED: "identity.user.updated";
    readonly AUTH_USER_DELETED: "identity.user.deleted";
    readonly AUTH_LOGIN_SUCCESS: "identity.session.created";
    readonly AUTH_LOGIN_FAILED: "identity.session.failed";
    readonly TENANT_CREATED: "tenant.tenant.created";
    readonly TENANT_UPDATED: "tenant.tenant.updated";
    readonly TENANT_SUSPENDED: "tenant.tenant.suspended";
    readonly TENANT_PRODUCT_ACTIVATED: "tenant.product.activated";
    readonly TENANT_PRODUCT_DEACTIVATED: "tenant.product.deactivated";
    readonly ORDER_CREATED: "commerce.order.created";
    readonly ORDER_COMPLETED: "commerce.order.completed";
    readonly ORDER_CANCELLED: "commerce.order.cancelled";
    readonly ORDER_REFUNDED: "commerce.order.refunded";
    readonly PAYMENT_PROCESSED: "commerce.payment.processed";
    readonly PAYMENT_FAILED: "commerce.payment.failed";
    readonly INVENTORY_UPDATED: "commerce.inventory.updated";
    readonly INVENTORY_LOW_STOCK: "commerce.inventory.low_stock";
    readonly LOYALTY_POINTS_EARNED: "loyalty.points.earned";
    readonly LOYALTY_POINTS_REDEEMED: "loyalty.points.redeemed";
    readonly LOYALTY_TIER_CHANGED: "loyalty.tier.changed";
    readonly LOYALTY_REWARD_CLAIMED: "loyalty.reward.claimed";
    readonly QUEUE_CUSTOMER_JOINED: "queue.customer.joined";
    readonly QUEUE_CUSTOMER_SERVED: "queue.customer.served";
    readonly QUEUE_CUSTOMER_CANCELLED: "queue.customer.cancelled";
    readonly SHIFT_STARTED: "workforce.shift.started";
    readonly SHIFT_ENDED: "workforce.shift.ended";
    readonly ATTENDANCE_CLOCK_IN: "workforce.attendance.clock_in";
    readonly ATTENDANCE_CLOCK_OUT: "workforce.attendance.clock_out";
    readonly NOTIFICATION_REQUESTED: "notification.message.requested";
    readonly NOTIFICATION_SENT: "notification.message.sent";
    readonly NOTIFICATION_FAILED: "notification.message.failed";
    readonly SUBSCRIPTION_CREATED: "billing.subscription.created";
    readonly SUBSCRIPTION_RENEWED: "billing.subscription.renewed";
    readonly SUBSCRIPTION_CANCELLED: "billing.subscription.cancelled";
    readonly INVOICE_GENERATED: "billing.invoice.generated";
    readonly PAYMENT_RECEIVED: "billing.payment.received";
};
export type TopicName = (typeof Topics)[keyof typeof Topics];
//# sourceMappingURL=topics.d.ts.map