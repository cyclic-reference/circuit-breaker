package io.acari;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;

@EnableCircuitBreaker
@SpringBootApplication
public class HystrixSampleApplication {

    public static void main(String[] args) {
        SpringApplication.run(HystrixSampleApplication.class, args);
    }
}
