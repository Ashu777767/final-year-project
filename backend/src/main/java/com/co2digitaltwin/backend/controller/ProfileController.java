package com.co2digitaltwin.backend.controller;

import com.co2digitaltwin.backend.dto.ProfileDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    private final List<ProfileDto> profiles = new ArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    @GetMapping
    public ResponseEntity<List<ProfileDto>> getAll() {
        return ResponseEntity.ok(profiles);
    }

    @PostMapping
    public ResponseEntity<ProfileDto> create(@RequestBody ProfileDto profile) {
        profile.setId(idGenerator.getAndIncrement());
        profiles.add(profile);
        return new ResponseEntity<>(profile, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfileDto> update(@PathVariable Long id, @RequestBody ProfileDto updated) {
        Optional<ProfileDto> existingOpt = profiles.stream().filter(p -> p.getId().equals(id)).findFirst();
        if (existingOpt.isPresent()) {
            ProfileDto existing = existingOpt.get();
            existing.setCity(updated.getCity());
            existing.setState(updated.getState());
            existing.setLat(updated.getLat());
            existing.setLng(updated.getLng());
            existing.setFeaturesJson(updated.getFeaturesJson());
            existing.setTimestamp(updated.getTimestamp());
            return ResponseEntity.ok(existing);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean removed = profiles.removeIf(p -> p.getId().equals(id));
        return removed ? ResponseEntity.noContent().build() : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
