FROM --platform=linux/amd64 amazoncorretto:20-alpine-jdk
VOLUME /tmp
COPY target/StaticWebsite-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]