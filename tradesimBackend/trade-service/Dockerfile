FROM openjdk:21-jdk-slim
WORKDIR /app

# Built JAR file ka naam change kar do yahan
COPY build/libs/trade-service-1.0-SNAPSHOT.jar app.jar

EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
