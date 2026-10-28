
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY . .
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
CMD ["java", "-Xms64m", "-Xmx256m", "-XX:MaxMetaspaceSize=128m", "-jar", "app.jar"]
