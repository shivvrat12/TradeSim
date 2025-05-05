FROM openjdk:21-jdk-slim
WORKDIR /app
COPY build/libs/auth-service-1.0-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
