package com.travelmemory.travelmap.controller;

import com.travelmemory.travelmap.model.Trip;
import com.travelmemory.travelmap.model.User;
import com.travelmemory.travelmap.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TripController {

    private final TripService tripService;

    // Herkese acik tum seyahatler
    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllPublicTrips());
    }

    // Sadece giris yapan kullanicinin seyahatleri
    @GetMapping("/my")
    public ResponseEntity<List<Trip>> getMyTrips(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(tripService.getTripsForUser(user.getUsername()));
    }

    // Yeni seyahat olustur
    @PostMapping
    public ResponseEntity<Trip> createTrip(@Valid @RequestBody Trip trip, Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            trip.setUser(user);
        }
        // isPublic null geldiyse varsayilan olarak true yap
        if (trip.getIsPublic() == null) {
            trip.setIsPublic(true);
        }
        return new ResponseEntity<>(tripService.createTrip(trip), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    // Seyahat guncelle
    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(@PathVariable Long id, @Valid @RequestBody Trip trip, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(tripService.updateTrip(id, trip, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        tripService.deleteTrip(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}