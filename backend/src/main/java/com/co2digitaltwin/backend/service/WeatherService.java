package com.co2digitaltwin.backend.service;

import com.co2digitaltwin.backend.dto.WeatherData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.List;

@Service
@Slf4j
public class WeatherService {

    private static final int CONNECT_TIMEOUT_MS = 4000;
    private static final int READ_TIMEOUT_MS = 6000;

    private final RestTemplate restTemplate;

    public WeatherService() {
        // Weather is an enrichment step on the location-details path, so a slow
        // Open-Meteo response must time out instead of blocking the user flow.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        factory.setReadTimeout(READ_TIMEOUT_MS);
        this.restTemplate = new RestTemplate(factory);
    }

    public WeatherData getWeather(Double lat, Double lng) {
        try {
            String url = String.format("https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&current=temperature_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto", lat, lng);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("current") && response.containsKey("daily")) {
                Map<String, Object> current = (Map<String, Object>) response.get("current");
                Map<String, Object> daily = (Map<String, Object>) response.get("daily");

                Double tempMean = ((Number) current.get("temperature_2m")).doubleValue();
                Double precip = ((Number) current.get("precipitation")).doubleValue();
                Double windSpeed = ((Number) current.get("wind_speed_10m")).doubleValue();
                
                List<Number> maxTemps = (List<Number>) daily.get("temperature_2m_max");
                List<Number> minTemps = (List<Number>) daily.get("temperature_2m_min");
                
                Double tempMax = maxTemps != null && !maxTemps.isEmpty() ? maxTemps.get(0).doubleValue() : tempMean + 2;
                Double tempMin = minTemps != null && !minTemps.isEmpty() ? minTemps.get(0).doubleValue() : tempMean - 2;

                return WeatherData.builder()
                        .temperatureMean(tempMean)
                        .temperatureMax(tempMax)
                        .temperatureMin(tempMin)
                        .precipitationMm(precip)
                        .windSpeedMaxKmh(windSpeed)
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to fetch weather from Open-Meteo for lat={}, lng={}", lat, lng, e);
        }
        return null;
    }
}
