package com.co2digitaltwin.backend.config;

import com.co2digitaltwin.backend.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.time.Instant;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(HttpMessageNotReadableException e) {
        log.error("Bad request: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ErrorResponse.builder()
                        .status(400)
                        .message("Invalid request body: " + e.getMessage())
                        .timestamp(Instant.now().toString())
                        .build());
    }

    @ExceptionHandler(org.springframework.web.bind.MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParams(org.springframework.web.bind.MissingServletRequestParameterException e) {
        log.error("Missing parameter: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ErrorResponse.builder()
                        .status(400)
                        .message("Missing required parameter: " + e.getParameterName())
                        .timestamp(Instant.now().toString())
                        .build());
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        log.error("Invalid argument: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ErrorResponse.builder()
                        .status(400)
                        .message(e.getMessage())
                        .timestamp(Instant.now().toString())
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception e) {
        log.error("Unexpected error: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.builder()
                        .status(500)
                        .message("Internal server error")
                        .timestamp(Instant.now().toString())
                        .build());
    }
}
