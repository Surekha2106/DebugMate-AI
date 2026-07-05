# Stage 1: Build the Maven application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Run the Spring Boot application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/debugmate-api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://trolley.proxy.rlwy.net:49425/railway
ENV SPRING_DATASOURCE_USERNAME=postgres
ENV SPRING_DATASOURCE_PASSWORD=yHFzQilzZRIEafREPHCRssSpSqqKUFjQ
ENTRYPOINT ["java", "-Duser.timezone=UTC", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
