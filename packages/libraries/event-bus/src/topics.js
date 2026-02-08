"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topics = void 0;
/**
 * Kafka topic naming convention: {domain}.{entity}.{action}
 * All topics are tenant-aware via event.tenantId field.
 */
exports.Topics = {
    // Identity & Auth
    AUTH_USER_CREATED: 'identity.user.created',
    AUTH_USER_UPDATED: 'identity.user.updated',
    AUTH_USER_DELETED: 'identity.user.deleted',
    AUTH_LOGIN_SUCCESS: 'identity.session.created',
    AUTH_LOGIN_FAILED: 'identity.session.failed',
    // Tenant
    TENANT_CREATED: 'tenant.tenant.created',
    TENANT_UPDATED: 'tenant.tenant.updated',
    TENANT_SUSPENDED: 'tenant.tenant.suspended',
    TENANT_PRODUCT_ACTIVATED: 'tenant.product.activated',
    TENANT_PRODUCT_DEACTIVATED: 'tenant.product.deactivated',
    // Commerce / POS
    ORDER_CREATED: 'commerce.order.created',
    ORDER_COMPLETED: 'commerce.order.completed',
    ORDER_CANCELLED: 'commerce.order.cancelled',
    ORDER_REFUNDED: 'commerce.order.refunded',
    PAYMENT_PROCESSED: 'commerce.payment.processed',
    PAYMENT_FAILED: 'commerce.payment.failed',
    INVENTORY_UPDATED: 'commerce.inventory.updated',
    INVENTORY_LOW_STOCK: 'commerce.inventory.low_stock',
    // Loyalty
    LOYALTY_POINTS_EARNED: 'loyalty.points.earned',
    LOYALTY_POINTS_REDEEMED: 'loyalty.points.redeemed',
    LOYALTY_TIER_CHANGED: 'loyalty.tier.changed',
    LOYALTY_REWARD_CLAIMED: 'loyalty.reward.claimed',
    // Queue & Waitlist
    QUEUE_CUSTOMER_JOINED: 'queue.customer.joined',
    QUEUE_CUSTOMER_SERVED: 'queue.customer.served',
    QUEUE_CUSTOMER_CANCELLED: 'queue.customer.cancelled',
    // Workforce
    SHIFT_STARTED: 'workforce.shift.started',
    SHIFT_ENDED: 'workforce.shift.ended',
    ATTENDANCE_CLOCK_IN: 'workforce.attendance.clock_in',
    ATTENDANCE_CLOCK_OUT: 'workforce.attendance.clock_out',
    // Notifications
    NOTIFICATION_REQUESTED: 'notification.message.requested',
    NOTIFICATION_SENT: 'notification.message.sent',
    NOTIFICATION_FAILED: 'notification.message.failed',
    // Billing
    SUBSCRIPTION_CREATED: 'billing.subscription.created',
    SUBSCRIPTION_RENEWED: 'billing.subscription.renewed',
    SUBSCRIPTION_CANCELLED: 'billing.subscription.cancelled',
    INVOICE_GENERATED: 'billing.invoice.generated',
    PAYMENT_RECEIVED: 'billing.payment.received',
};
//# sourceMappingURL=topics.js.map