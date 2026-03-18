FROM maven:3.9.6-eclipse-temurin-17-alpine AS build

WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY src/ src/

RUN chmod +x mvnw
RUN ./mvnw -DskipTests clean package

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/shizuka-backend-0.1.0.jar app.jar

ENTRYPOINT ["java","-jar","/app/app.jar"]
