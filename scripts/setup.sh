#!/bin/bash

# ============================================================
# Company Architecture - Full Directory & File Structure
# Run: chmod +x setup.sh && ./setup.sh
# ============================================================

ROOT="berhot"

echo "🚀 Creating company architecture structure in ./$ROOT ..."

# ────────────────────────────────────────────────────────────
# PLATFORM CORE (Shared Services)
# ────────────────────────────────────────────────────────────

# platform-auth
mkdir -p $ROOT/platform-core/platform-auth/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/platform-core/platform-auth/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/platform-core/platform-auth/.github/CODEOWNERS
touch $ROOT/platform-core/platform-auth/src/config/{index.ts,constants.ts}
touch $ROOT/platform-core/platform-auth/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/platform-core/platform-auth/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/platform-core/platform-auth/{.env.example,package.json,tsconfig.json,README.md}

# platform-billing
mkdir -p $ROOT/platform-core/platform-billing/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/platform-core/platform-billing/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/platform-core/platform-billing/.github/CODEOWNERS
touch $ROOT/platform-core/platform-billing/src/config/{index.ts,constants.ts}
touch $ROOT/platform-core/platform-billing/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/platform-core/platform-billing/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/platform-core/platform-billing/{.env.example,package.json,tsconfig.json,README.md}

# platform-tenant-mgmt
mkdir -p $ROOT/platform-core/platform-tenant-mgmt/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/platform-core/platform-tenant-mgmt/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/platform-core/platform-tenant-mgmt/.github/CODEOWNERS
touch $ROOT/platform-core/platform-tenant-mgmt/src/config/{index.ts,constants.ts}
touch $ROOT/platform-core/platform-tenant-mgmt/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/platform-core/platform-tenant-mgmt/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/platform-core/platform-tenant-mgmt/{.env.example,package.json,tsconfig.json,README.md}

# platform-api-gateway
mkdir -p $ROOT/platform-core/platform-api-gateway/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/platform-core/platform-api-gateway/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/platform-core/platform-api-gateway/.github/CODEOWNERS
touch $ROOT/platform-core/platform-api-gateway/src/config/{index.ts,constants.ts}
touch $ROOT/platform-core/platform-api-gateway/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/platform-core/platform-api-gateway/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/platform-core/platform-api-gateway/{.env.example,package.json,tsconfig.json,README.md}

# platform-notification
mkdir -p $ROOT/platform-core/platform-notification/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/platform-core/platform-notification/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/platform-core/platform-notification/.github/CODEOWNERS
touch $ROOT/platform-core/platform-notification/src/config/{index.ts,constants.ts}
touch $ROOT/platform-core/platform-notification/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/platform-core/platform-notification/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/platform-core/platform-notification/{.env.example,package.json,tsconfig.json,README.md}

# platform-file-storage
mkdir -p $ROOT/platform-core/platform-file-storage/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/platform-core/platform-file-storage/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/platform-core/platform-file-storage/.github/CODEOWNERS
touch $ROOT/platform-core/platform-file-storage/src/config/{index.ts,constants.ts}
touch $ROOT/platform-core/platform-file-storage/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/platform-core/platform-file-storage/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/platform-core/platform-file-storage/{.env.example,package.json,tsconfig.json,README.md}

# platform-analytics
mkdir -p $ROOT/platform-core/platform-analytics/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/platform-core/platform-analytics/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/platform-core/platform-analytics/.github/CODEOWNERS
touch $ROOT/platform-core/platform-analytics/src/config/{index.ts,constants.ts}
touch $ROOT/platform-core/platform-analytics/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/platform-core/platform-analytics/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/platform-core/platform-analytics/{.env.example,package.json,tsconfig.json,README.md}

# platform-audit-log
mkdir -p $ROOT/platform-core/platform-audit-log/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/platform-core/platform-audit-log/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/platform-core/platform-audit-log/.github/CODEOWNERS
touch $ROOT/platform-core/platform-audit-log/src/config/{index.ts,constants.ts}
touch $ROOT/platform-core/platform-audit-log/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/platform-core/platform-audit-log/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/platform-core/platform-audit-log/{.env.example,package.json,tsconfig.json,README.md}

# platform-integration-hub
mkdir -p $ROOT/platform-core/platform-integration-hub/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config,connectors/{square,clover,shopify,toast,stripe}},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/platform-core/platform-integration-hub/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/platform-core/platform-integration-hub/.github/CODEOWNERS
touch $ROOT/platform-core/platform-integration-hub/src/config/{index.ts,constants.ts}
touch $ROOT/platform-core/platform-integration-hub/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/platform-core/platform-integration-hub/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/platform-core/platform-integration-hub/{.env.example,package.json,tsconfig.json,README.md}

# ────────────────────────────────────────────────────────────
# POS PRODUCTS
# ────────────────────────────────────────────────────────────

# pos-core
mkdir -p $ROOT/pos-products/pos-core/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/pos-products/pos-core/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/pos-products/pos-core/.github/CODEOWNERS
touch $ROOT/pos-products/pos-core/src/config/{index.ts,constants.ts}
touch $ROOT/pos-products/pos-core/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/pos-products/pos-core/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/pos-products/pos-core/{.env.example,package.json,tsconfig.json,README.md}

# pos-restaurant
mkdir -p $ROOT/pos-products/pos-restaurant/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config,modules/{table-management,kitchen-display,order-management,menu-builder}},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/pos-products/pos-restaurant/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/pos-products/pos-restaurant/.github/CODEOWNERS
touch $ROOT/pos-products/pos-restaurant/src/config/{index.ts,constants.ts}
touch $ROOT/pos-products/pos-restaurant/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/pos-products/pos-restaurant/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/pos-products/pos-restaurant/{.env.example,package.json,tsconfig.json,README.md}

# pos-cafe
mkdir -p $ROOT/pos-products/pos-cafe/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config,modules/{quick-order,drink-customization,pickup-management}},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/pos-products/pos-cafe/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/pos-products/pos-cafe/.github/CODEOWNERS
touch $ROOT/pos-products/pos-cafe/src/config/{index.ts,constants.ts}
touch $ROOT/pos-products/pos-cafe/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/pos-products/pos-cafe/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/pos-products/pos-cafe/{.env.example,package.json,tsconfig.json,README.md}

# pos-retail
mkdir -p $ROOT/pos-products/pos-retail/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config,modules/{inventory,barcode-scanner,returns-exchange,stock-management}},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/pos-products/pos-retail/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/pos-products/pos-retail/.github/CODEOWNERS
touch $ROOT/pos-products/pos-retail/src/config/{index.ts,constants.ts}
touch $ROOT/pos-products/pos-retail/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/pos-products/pos-retail/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/pos-products/pos-retail/{.env.example,package.json,tsconfig.json,README.md}

# pos-appointment
mkdir -p $ROOT/pos-products/pos-appointment/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config,modules/{booking-calendar,service-catalog,staff-assignment,reminders}},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/pos-products/pos-appointment/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/pos-products/pos-appointment/.github/CODEOWNERS
touch $ROOT/pos-products/pos-appointment/src/config/{index.ts,constants.ts}
touch $ROOT/pos-products/pos-appointment/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/pos-products/pos-appointment/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/pos-products/pos-appointment/{.env.example,package.json,tsconfig.json,README.md}

# ────────────────────────────────────────────────────────────
# BUSINESS OPERATIONS PRODUCTS
# ────────────────────────────────────────────────────────────

# service-queue-waitlist
mkdir -p $ROOT/business-ops/service-queue-waitlist/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config,modules/{queue-engine,sms-notifications,display-board,estimated-wait}},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/business-ops/service-queue-waitlist/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/business-ops/service-queue-waitlist/.github/CODEOWNERS
touch $ROOT/business-ops/service-queue-waitlist/src/config/{index.ts,constants.ts}
touch $ROOT/business-ops/service-queue-waitlist/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/business-ops/service-queue-waitlist/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/business-ops/service-queue-waitlist/{.env.example,package.json,tsconfig.json,README.md}

# service-loyalty
mkdir -p $ROOT/business-ops/service-loyalty/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config,modules/{points-engine,rewards-catalog,tiers,referrals,digital-cards}},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/business-ops/service-loyalty/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/business-ops/service-loyalty/.github/CODEOWNERS
touch $ROOT/business-ops/service-loyalty/src/config/{index.ts,constants.ts}
touch $ROOT/business-ops/service-loyalty/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/business-ops/service-loyalty/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/business-ops/service-loyalty/{.env.example,package.json,tsconfig.json,README.md}

# service-shift-payroll
mkdir -p $ROOT/business-ops/service-shift-payroll/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config,modules/{scheduling,timesheets,payroll-engine,leave-management,overtime-rules}},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/business-ops/service-shift-payroll/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/business-ops/service-shift-payroll/.github/CODEOWNERS
touch $ROOT/business-ops/service-shift-payroll/src/config/{index.ts,constants.ts}
touch $ROOT/business-ops/service-shift-payroll/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/business-ops/service-shift-payroll/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/business-ops/service-shift-payroll/{.env.example,package.json,tsconfig.json,README.md}

# service-subscription
mkdir -p $ROOT/business-ops/service-subscription/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config,modules/{membership-plans,recurring-billing,access-control,freeze-cancel}},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/business-ops/service-subscription/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/business-ops/service-subscription/.github/CODEOWNERS
touch $ROOT/business-ops/service-subscription/src/config/{index.ts,constants.ts}
touch $ROOT/business-ops/service-subscription/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/business-ops/service-subscription/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/business-ops/service-subscription/{.env.example,package.json,tsconfig.json,README.md}

# ────────────────────────────────────────────────────────────
# GROWTH & ENGAGEMENT PRODUCTS
# ────────────────────────────────────────────────────────────

# service-marketing
mkdir -p $ROOT/growth/service-marketing/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config,modules/{campaigns,email-marketing,social-media,seo-tools,analytics-dashboard}},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/growth/service-marketing/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/growth/service-marketing/.github/CODEOWNERS
touch $ROOT/growth/service-marketing/src/config/{index.ts,constants.ts}
touch $ROOT/growth/service-marketing/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/growth/service-marketing/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/growth/service-marketing/{.env.example,package.json,tsconfig.json,README.md}

# service-attendance
mkdir -p $ROOT/growth/service-attendance/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config,modules/{fingerprint-engine,device-management,reports,check-in-out}},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/growth/service-attendance/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/growth/service-attendance/.github/CODEOWNERS
touch $ROOT/growth/service-attendance/src/config/{index.ts,constants.ts}
touch $ROOT/growth/service-attendance/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/growth/service-attendance/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/growth/service-attendance/{.env.example,package.json,tsconfig.json,README.md}

# service-events
mkdir -p $ROOT/growth/service-events/{.github/workflows,src/{api/{routes,controllers,middleware,validators},core/{services,models,events},infrastructure/{database/{migrations,repositories,seeds},messaging,cache,external},config,modules/{event-creation,ticketing,check-in,venue-management,speaker-management,schedule-builder}},tests/{unit,integration,e2e},docs,deploy/helm}
touch $ROOT/growth/service-events/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/growth/service-events/.github/CODEOWNERS
touch $ROOT/growth/service-events/src/config/{index.ts,constants.ts}
touch $ROOT/growth/service-events/docs/{api.md,architecture.md,runbook.md}
touch $ROOT/growth/service-events/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/growth/service-events/{.env.example,package.json,tsconfig.json,README.md}

# ────────────────────────────────────────────────────────────
# CLIENT APPLICATIONS
# ────────────────────────────────────────────────────────────

# app-merchant-dashboard
mkdir -p $ROOT/clients/app-merchant-dashboard/{.github/workflows,src/{app/{auth,dashboard,pos,loyalty,queue,payroll,marketing,subscription,events,attendance,settings},components/{common,features/{pos,loyalty,queue,payroll,marketing,subscription,events,attendance}},hooks,services,stores,types,utils},public,tests,deploy}
touch $ROOT/clients/app-merchant-dashboard/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/clients/app-merchant-dashboard/.github/CODEOWNERS
touch $ROOT/clients/app-merchant-dashboard/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/clients/app-merchant-dashboard/{.env.example,package.json,tsconfig.json,next.config.js,tailwind.config.js,README.md}

# app-merchant-mobile
mkdir -p $ROOT/clients/app-merchant-mobile/{.github/workflows,src/{screens/{auth,dashboard,pos,loyalty,queue,payroll,settings},components/{common,features},hooks,services,stores,types,utils,navigation},tests,deploy}
touch $ROOT/clients/app-merchant-mobile/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/clients/app-merchant-mobile/.github/CODEOWNERS
touch $ROOT/clients/app-merchant-mobile/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/clients/app-merchant-mobile/{.env.example,package.json,tsconfig.json,app.json,README.md}

# app-customer-mobile
mkdir -p $ROOT/clients/app-customer-mobile/{.github/workflows,src/{screens/{auth,home,loyalty,queue,booking,events,profile},components/{common,features},hooks,services,stores,types,utils,navigation},tests,deploy}
touch $ROOT/clients/app-customer-mobile/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/clients/app-customer-mobile/.github/CODEOWNERS
touch $ROOT/clients/app-customer-mobile/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/clients/app-customer-mobile/{.env.example,package.json,tsconfig.json,app.json,README.md}

# app-pos-terminal
mkdir -p $ROOT/clients/app-pos-terminal/{.github/workflows,src/{screens/{login,checkout,orders,products,customers,settings},components/{common,features},hooks,services,stores,types,utils,offline},tests,deploy}
touch $ROOT/clients/app-pos-terminal/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/clients/app-pos-terminal/.github/CODEOWNERS
touch $ROOT/clients/app-pos-terminal/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/clients/app-pos-terminal/{.env.example,package.json,tsconfig.json,README.md}

# app-kitchen-display
mkdir -p $ROOT/clients/app-kitchen-display/{.github/workflows,src/{screens,components,hooks,services,stores,types,utils},tests,deploy}
touch $ROOT/clients/app-kitchen-display/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/clients/app-kitchen-display/.github/CODEOWNERS
touch $ROOT/clients/app-kitchen-display/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/clients/app-kitchen-display/{.env.example,package.json,tsconfig.json,README.md}

# app-queue-display
mkdir -p $ROOT/clients/app-queue-display/{.github/workflows,src/{screens,components,hooks,services,stores,types,utils},tests,deploy}
touch $ROOT/clients/app-queue-display/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/clients/app-queue-display/.github/CODEOWNERS
touch $ROOT/clients/app-queue-display/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/clients/app-queue-display/{.env.example,package.json,tsconfig.json,README.md}

# app-admin-panel
mkdir -p $ROOT/clients/app-admin-panel/{.github/workflows,src/{app/{tenants,billing,analytics,users,system,support},components/{common,features},hooks,services,stores,types,utils},tests,deploy}
touch $ROOT/clients/app-admin-panel/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/clients/app-admin-panel/.github/CODEOWNERS
touch $ROOT/clients/app-admin-panel/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/clients/app-admin-panel/{.env.example,package.json,tsconfig.json,next.config.js,README.md}

# app-marketing-website
mkdir -p $ROOT/clients/app-marketing-website/{.github/workflows,src/{app/{home,pricing,products,blog,docs,contact,about},components/{common,sections},hooks,types,utils},public/{images,icons},tests,deploy}
touch $ROOT/clients/app-marketing-website/.github/workflows/{ci.yml,cd-staging.yml,cd-production.yml}
touch $ROOT/clients/app-marketing-website/.github/CODEOWNERS
touch $ROOT/clients/app-marketing-website/deploy/{Dockerfile,docker-compose.yml}
touch $ROOT/clients/app-marketing-website/{.env.example,package.json,tsconfig.json,next.config.js,tailwind.config.js,README.md}

# ────────────────────────────────────────────────────────────
# INFRASTRUCTURE & DEVOPS
# ────────────────────────────────────────────────────────────

# infra-terraform
mkdir -p $ROOT/infrastructure/infra-terraform/{environments/{dev,staging,production},modules/{vpc,eks,rds,redis,kafka,s3,cloudfront,iam,monitoring,secrets}}
touch $ROOT/infrastructure/infra-terraform/{main.tf,variables.tf,outputs.tf,providers.tf,backend.tf,README.md}
touch $ROOT/infrastructure/infra-terraform/environments/dev/{main.tf,variables.tf,terraform.tfvars}
touch $ROOT/infrastructure/infra-terraform/environments/staging/{main.tf,variables.tf,terraform.tfvars}
touch $ROOT/infrastructure/infra-terraform/environments/production/{main.tf,variables.tf,terraform.tfvars}

# infra-kubernetes
mkdir -p $ROOT/infrastructure/infra-kubernetes/{namespaces,helm-charts/{platform-auth,platform-billing,platform-tenant-mgmt,platform-api-gateway,platform-notification,pos-core,pos-restaurant,pos-cafe,pos-retail,pos-appointment,service-loyalty,service-queue-waitlist,service-shift-payroll,service-subscription,service-marketing,service-attendance,service-events},base/{ingress,cert-manager,service-mesh,monitoring}}
touch $ROOT/infrastructure/infra-kubernetes/{README.md,values-dev.yaml,values-staging.yaml,values-production.yaml}

# infra-ci-cd
mkdir -p $ROOT/infrastructure/infra-ci-cd/{templates/{backend-service,frontend-app,mobile-app},scripts/{build,test,deploy,rollback}}
touch $ROOT/infrastructure/infra-ci-cd/templates/backend-service/{ci-template.yml,cd-staging-template.yml,cd-production-template.yml}
touch $ROOT/infrastructure/infra-ci-cd/templates/frontend-app/{ci-template.yml,cd-staging-template.yml,cd-production-template.yml}
touch $ROOT/infrastructure/infra-ci-cd/templates/mobile-app/{ci-template.yml,cd-staging-template.yml,cd-production-template.yml}
touch $ROOT/infrastructure/infra-ci-cd/scripts/build/{docker-build.sh,npm-build.sh}
touch $ROOT/infrastructure/infra-ci-cd/scripts/test/{run-unit.sh,run-integration.sh,run-e2e.sh}
touch $ROOT/infrastructure/infra-ci-cd/scripts/deploy/{canary-deploy.sh,blue-green-deploy.sh,rollback.sh}
touch $ROOT/infrastructure/infra-ci-cd/README.md

# infra-monitoring
mkdir -p $ROOT/infrastructure/infra-monitoring/{grafana/{dashboards,provisioning},prometheus/{rules,alerts},pagerduty}
touch $ROOT/infrastructure/infra-monitoring/grafana/dashboards/{platform-overview.json,pos-metrics.json,loyalty-metrics.json,queue-metrics.json}
touch $ROOT/infrastructure/infra-monitoring/prometheus/rules/{sla-rules.yml,error-rate-rules.yml,latency-rules.yml}
touch $ROOT/infrastructure/infra-monitoring/prometheus/alerts/{critical-alerts.yml,warning-alerts.yml}
touch $ROOT/infrastructure/infra-monitoring/README.md

# infra-secrets
mkdir -p $ROOT/infrastructure/infra-secrets/{policies,config}
touch $ROOT/infrastructure/infra-secrets/policies/{rotation-policy.hcl,access-policy.hcl}
touch $ROOT/infrastructure/infra-secrets/config/{vault-config.hcl,secret-paths.yml}
touch $ROOT/infrastructure/infra-secrets/README.md

# ────────────────────────────────────────────────────────────
# SHARED LIBRARIES & SDKs
# ────────────────────────────────────────────────────────────

# sdk-javascript
mkdir -p $ROOT/shared/sdk-javascript/{src/{clients/{auth,loyalty,queue,pos,marketing,events,subscription,attendance},utils},tests,docs,examples}
touch $ROOT/shared/sdk-javascript/src/clients/auth/{index.ts,types.ts}
touch $ROOT/shared/sdk-javascript/src/clients/loyalty/{index.ts,types.ts}
touch $ROOT/shared/sdk-javascript/src/clients/queue/{index.ts,types.ts}
touch $ROOT/shared/sdk-javascript/src/clients/pos/{index.ts,types.ts}
touch $ROOT/shared/sdk-javascript/src/clients/marketing/{index.ts,types.ts}
touch $ROOT/shared/sdk-javascript/src/clients/events/{index.ts,types.ts}
touch $ROOT/shared/sdk-javascript/src/clients/subscription/{index.ts,types.ts}
touch $ROOT/shared/sdk-javascript/src/clients/attendance/{index.ts,types.ts}
touch $ROOT/shared/sdk-javascript/src/{index.ts,config.ts}
touch $ROOT/shared/sdk-javascript/{package.json,tsconfig.json,README.md}

# sdk-python
mkdir -p $ROOT/shared/sdk-python/{src/{clients/{auth,loyalty,queue,pos,marketing,events,subscription,attendance},utils},tests,docs,examples}
touch $ROOT/shared/sdk-python/src/clients/auth/{__init__.py,types.py}
touch $ROOT/shared/sdk-python/src/clients/loyalty/{__init__.py,types.py}
touch $ROOT/shared/sdk-python/src/clients/queue/{__init__.py,types.py}
touch $ROOT/shared/sdk-python/src/clients/pos/{__init__.py,types.py}
touch $ROOT/shared/sdk-python/src/{__init__.py,config.py}
touch $ROOT/shared/sdk-python/{setup.py,requirements.txt,README.md}

# lib-common
mkdir -p $ROOT/shared/lib-common/{src/{logging,errors,middleware,utils,types},tests}
touch $ROOT/shared/lib-common/src/logging/{logger.ts,formats.ts}
touch $ROOT/shared/lib-common/src/errors/{base-error.ts,http-errors.ts,error-handler.ts}
touch $ROOT/shared/lib-common/src/middleware/{tenant-context.ts,auth-middleware.ts,rate-limiter.ts,request-logger.ts}
touch $ROOT/shared/lib-common/src/utils/{date.ts,crypto.ts,pagination.ts,validation.ts}
touch $ROOT/shared/lib-common/src/types/{tenant.ts,user.ts,pagination.ts,api-response.ts}
touch $ROOT/shared/lib-common/{package.json,tsconfig.json,README.md}

# lib-ui-components
mkdir -p $ROOT/shared/lib-ui-components/{src/{components/{buttons,forms,tables,modals,navigation,cards,charts,layouts},hooks,themes,utils},stories,tests}
touch $ROOT/shared/lib-ui-components/src/themes/{colors.ts,typography.ts,spacing.ts,tokens.ts}
mkdir -p $ROOT/shared/lib-ui-components/.storybook
touch $ROOT/shared/lib-ui-components/.storybook/main.js
touch $ROOT/shared/lib-ui-components/{package.json,tsconfig.json,README.md}

# lib-api-contracts
mkdir -p $ROOT/shared/lib-api-contracts/{openapi/{platform-auth,platform-billing,pos-core,service-loyalty,service-queue,service-shift-payroll,service-subscription,service-marketing,service-attendance,service-events},protobuf/{events,shared},schemas/{json-schemas,event-schemas}}
touch $ROOT/shared/lib-api-contracts/openapi/platform-auth/openapi.yaml
touch $ROOT/shared/lib-api-contracts/openapi/platform-billing/openapi.yaml
touch $ROOT/shared/lib-api-contracts/openapi/pos-core/openapi.yaml
touch $ROOT/shared/lib-api-contracts/openapi/service-loyalty/openapi.yaml
touch $ROOT/shared/lib-api-contracts/openapi/service-queue/openapi.yaml
touch $ROOT/shared/lib-api-contracts/openapi/service-shift-payroll/openapi.yaml
touch $ROOT/shared/lib-api-contracts/openapi/service-subscription/openapi.yaml
touch $ROOT/shared/lib-api-contracts/openapi/service-marketing/openapi.yaml
touch $ROOT/shared/lib-api-contracts/openapi/service-attendance/openapi.yaml
touch $ROOT/shared/lib-api-contracts/openapi/service-events/openapi.yaml
touch $ROOT/shared/lib-api-contracts/schemas/event-schemas/{order-completed.json,customer-joined-queue.json,membership-renewed.json,employee-shift-started.json,event-ticket-sold.json}
touch $ROOT/shared/lib-api-contracts/README.md

# lib-testing
mkdir -p $ROOT/shared/lib-testing/{src/{fixtures,mocks,factories,helpers},config}
touch $ROOT/shared/lib-testing/src/fixtures/{tenant.ts,user.ts,product.ts,order.ts}
touch $ROOT/shared/lib-testing/src/mocks/{auth-mock.ts,billing-mock.ts,notification-mock.ts}
touch $ROOT/shared/lib-testing/src/factories/{tenant-factory.ts,user-factory.ts,order-factory.ts}
touch $ROOT/shared/lib-testing/src/helpers/{db-helper.ts,api-helper.ts,event-helper.ts}
touch $ROOT/shared/lib-testing/{package.json,tsconfig.json,README.md}

# ────────────────────────────────────────────────────────────
# ROOT FILES
# ────────────────────────────────────────────────────────────
touch $ROOT/{README.md,ARCHITECTURE.md,CONTRIBUTING.md,CODE_OF_CONDUCT.md,.gitignore,LICENSE}

# ────────────────────────────────────────────────────────────
# DONE
# ────────────────────────────────────────────────────────────

# Count what we created
DIR_COUNT=$(find $ROOT -type d | wc -l)
FILE_COUNT=$(find $ROOT -type f | wc -l)

echo ""
echo "✅ Done!"
echo "📁 Directories created: $DIR_COUNT"
echo "📄 Files created: $FILE_COUNT"
echo ""
echo "📂 Structure is in: ./$ROOT"