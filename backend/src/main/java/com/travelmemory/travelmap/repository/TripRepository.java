package com.travelmemory.travelmap.repository;

import com.travelmemory.travelmap.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    // Tum public seyahatler
    List<Trip> findByIsPublicTrue();

    // Belirli bir kullanicinin tum seyahatleri (public + private)
    List<Trip> findByUserUsername(String username);

    @Query("SELECT t FROM Trip t WHERE t.isPublic = true OR t.user.username = :username")
    List<Trip> findAllPublicOrUserPrivate(@Param("username") String username);
}