FROM maven:3.9.6-eclipse-temurin-17-alpine AS build

WORKDIR /app

COPY backend/.mvn/ backend/.mvn/
COPY backend/mvnw backend/pom.xml ./backend/
COPY backend/src/ backend/src/

WORKDIR /app/backend

RUN chmod +x mvnw
RUN ./mvnw -DskipTests clean package

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/backend/target/shizuka-backend-0.1.0.jar app.jar

ENTRYPOINT ["java","-jar","/app/app.jar"]
