package com.co2digitaltwin.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        // The Vite dev server normally proxies /api, but when the browser
                        // talks to this service directly it may be on localhost or
                        // 127.0.0.1 and on any port (Vite falls back to the next free
                        // port when 5173 is taken). Whitelisting a single port caused
                        // every API call to fail CORS, so allow both local hostnames on
                        // any port while deliberately excluding non-local origins.
                        .allowedOriginPatterns(
                                "http://localhost:[*]",
                                "http://127.0.0.1:[*]",
                                "http://[::1]:[*]"
                        )
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
