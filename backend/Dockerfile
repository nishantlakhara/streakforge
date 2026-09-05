# Stage 1: Build the Spring Boot Application
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built jar from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Expose standard port
EXPOSE 8080

# Configure JVM for 512MB RAM container environment
ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

# Start application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
