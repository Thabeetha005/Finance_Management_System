# Stage 1: Build Java application with official Maven image
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and source code from backend-java
COPY backend-java/pom.xml ./
COPY backend-java/src ./src

# Build production jar skipping tests
RUN mvn clean package -DskipTests

# Stage 2: Minimal JRE runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy compiled jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Launch application
ENTRYPOINT ["java", "-jar", "app.jar"]
