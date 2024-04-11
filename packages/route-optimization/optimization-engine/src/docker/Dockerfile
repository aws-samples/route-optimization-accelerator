FROM --platform=linux/arm64 public.ecr.aws/amazoncorretto/amazoncorretto:17 as prod

ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en'

RUN mkdir -p app
COPY "maven-metadata.xml" /app
ARG VER=1.0.0

COPY "${VER}/*.jar" /app
COPY "${VER}/*.pom" /app
RUN chown -R 1001 /app
WORKDIR /app

RUN mv "OptimizationEngine-${VER}.pom" OptimizationEngine.pom
RUN mv "OptimizationEngine-${VER}-jar-with-dependencies.jar" OptimizationEngine.jar

USER 1001

ENTRYPOINT [ "java", "-jar", "/app/OptimizationEngine.jar" ]
