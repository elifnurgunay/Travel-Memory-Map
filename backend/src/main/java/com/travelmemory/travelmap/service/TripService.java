package com.travelmemory.travelmap.service;

import com.travelmemory.travelmap.model.Trip;
import com.travelmemory.travelmap.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;

    @Transactional(readOnly = true)
    public List<Trip> getAllPublicTrips() {
        return tripRepository.findByIsPublicTrue();
    }

    @Transactional
    public Trip createTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    @Transactional(readOnly = true)
    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seyahat bulunamadi: " + id));
    }

    @Transactional
    public void deleteTrip(Long id, String username) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seyahat bulunamadi: " + id));
        if (!trip.getUser().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu seyahati silme yetkiniz yok!");
        }
        tripRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Trip> getTripsForUser(String username) {
        return tripRepository.findByUserUsername(username);
    }

    @Transactional
    public Trip updateTrip(Long id, Trip updatedTrip, String username) {
        Trip existing = tripRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seyahat bulunamadi: " + id));
        if (!existing.getUser().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bu seyahati güncelleme yetkiniz yok!");
        }
        existing.setCity(updatedTrip.getCity());
        existing.setPlaceName(updatedTrip.getPlaceName());
        existing.setCountry(updatedTrip.getCountry());
        existing.setLatitude(updatedTrip.getLatitude());
        existing.setLongitude(updatedTrip.getLongitude());
        existing.setVisitDate(updatedTrip.getVisitDate());
        existing.setNote(updatedTrip.getNote());
        existing.setRating(updatedTrip.getRating());
        if (updatedTrip.getIsPublic() != null) {
            existing.setIsPublic(updatedTrip.getIsPublic());
        }
        return tripRepository.save(existing);
    }
}