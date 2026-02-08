# ──────────────────────────────────────────────────────────────
# Berhot – Java Base Image (multi-stage)
# Used by: payroll, billing-subscriptions
# ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder
RUN apk add --no-cache maven curl
WORKDIR /build

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build
COPY src ./src
ARG VERSION=0.0.1-SNAPSHOT
RUN mvn clean package -DskipTests -Drevision=${VERSION} && \
    mv target/*.jar /app.jar

# ── Production stage ──────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS production
RUN apk add --no-cache curl && \
    addgroup -S berhot && adduser -S berhot -G berhot

WORKDIR /app
COPY --from=builder /app.jar ./app.jar

RUN chown -R berhot:berhot /app
USER berhot

ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:+UseContainerSupport"
ENV SPRING_PROFILES_ACTIVE=production
EXPOSE 8080
EXPOSE 9090

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]
