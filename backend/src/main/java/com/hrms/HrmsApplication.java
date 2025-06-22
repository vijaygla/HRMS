package com.hrms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class HrmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(HrmsApplication.class, args);
    }
}

// This is the main entry point for the HRMS application.
// It uses Spring Boot to bootstrap the application and enables MongoDB auditing.
// The @SpringBootApplication annotation indicates that this is a Spring Boot application.
// The @EnableMongoAuditing annotation enables auditing features for MongoDB, allowing for automatic tracking
// of entity creation and modification timestamps.
// The main method runs the application using SpringApplication.run, which starts the embedded server and initializes
// the application context. This is where the application begins execution.
