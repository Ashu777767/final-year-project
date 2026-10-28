package com.co2digitaltwin.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

@Configuration
public class RestClientConfig {

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    @Value("${ml.service.connect-timeout-ms:5000}")
    private int connectTimeoutMs;

    @Value("${ml.service.read-timeout-ms:20000}")
    private int readTimeoutMs;

    @Bean
    public RestClient mlRestClient() {
        // Explicit timeouts so a hung ML service surfaces as a handled failure
        // instead of blocking area selection behind the prediction call.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeoutMs);
        factory.setReadTimeout(readTimeoutMs);

        return RestClient.builder()
                .baseUrl(mlServiceUrl)
                .requestFactory(factory)
                .build();
    }
}
