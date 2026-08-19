# Stage 1: Build Spring Boot backend from backend-java folder
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy entire backend-java directory into container
COPY backend-java .

# Grant execution rights on mvnw
RUN chmod +x mvnw

# Build production jar skipping tests
RUN ./mvnw clean package -DskipTests

# Stage 2: Lightweight JRE runtime container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy compiled jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Launch application (Spring Boot reads PORT environment variable directly via application.properties)
ENTRYPOINT ["java", "-jar", "app.jar"]
