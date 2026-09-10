# Multi-stage Dockerfile for HoneyChain Backend (Spring Boot 3.3.3 / Java 21)

# Stage 1: Build JAR using Maven
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper and POM first for efficient layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and package application
COPY src/ ./src/
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Runtime environment using minimal JRE 21
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Create non-root user and group for security hardening
RUN addgroup -S honeychain && adduser -S honeychain -G honeychain

# Copy compiled JAR from builder stage
COPY --from=builder /app/target/honey-chain-backend-*.jar app.jar

# Set container permissions
RUN chown -R honeychain:honeychain /app
USER honeychain

# Expose Spring Boot port
EXPOSE 8080

# Health check using HTTP GET /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Launch application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
