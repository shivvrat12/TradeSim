FROM openjdk:21-jdk-slim
WORKDIR /app
# Copy the built JAR file
COPY build/libs/portfolio-service-1.0-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]