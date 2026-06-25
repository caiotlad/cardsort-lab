FROM node:22-alpine AS frontend
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci
COPY app ./app
COPY styles ./styles
COPY index.html tsconfig*.json vite.config.ts ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /workspace
COPY backend/pom.xml ./pom.xml
RUN mvn -q -DskipTests dependency:go-offline
COPY backend/src ./src
COPY --from=frontend /workspace/dist ./src/main/resources/static
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend /workspace/target/cardsort-api-0.1.0.jar app.jar
EXPOSE 8080
ENV COOKIE_SECURE=true
ENTRYPOINT ["java", "-jar", "app.jar"]
