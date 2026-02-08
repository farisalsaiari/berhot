/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting, semicolons, etc.
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Performance improvement
        'test',     // Adding or updating tests
        'build',    // Build system or external dependencies
        'ci',       // CI/CD changes
        'chore',    // Other changes (tooling, configs)
        'revert',   // Reverts a previous commit
        'infra',    // Infrastructure changes (Terraform, K8s, Docker)
        'db',       // Database changes (migrations, schemas)
        'api',      // API contract changes
      ],
    ],
    'scope-enum': [
      1,
      'always',
      [
        // Platform services
        'identity', 'tenancy', 'billing', 'notifications', 'analytics',
        'audit', 'search', 'integration-hub', 'governance', 'files', 'webhooks',
        // Products – Commerce
        'pos-engine', 'restaurant', 'cafe', 'retail', 'appointment',
        // Products – Experience
        'loyalty', 'queue', 'marketing', 'reviews',
        // Products – Engagement
        'events', 'memberships',
        // Products – Workforce
        'shifts', 'payroll', 'attendance',
        // Products – Ecosystem
        'hardware', 'marketplace', 'integrations',
        // Shared
        'shared', 'contracts', 'sdk',
        // Clients
        'dashboard', 'mobile', 'admin', 'terminal', 'portal', 'website',
        // Infrastructure
        'terraform', 'k8s', 'helm', 'docker', 'ci',
        // Runtime
        'kong', 'kafka', 'redis', 'monitoring',
        // General
        'deps', 'config', 'release',
      ],
    ],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 200],
  },
};
