package com.travelmemory.travelmap.repository;

import com.travelmemory.travelmap.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA'nın sihirli gücü: Sadece metodun adını yazarak
    // "Bana kullanıcı adıyla kişiyi bul" demiş oluyoruz.
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}