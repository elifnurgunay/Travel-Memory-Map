package com.travelmemory.travelmap.controller;

import com.travelmemory.travelmap.model.Photo;
import com.travelmemory.travelmap.service.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    @PostMapping("/trips/{tripId}/photos")
    public ResponseEntity<Photo> addPhoto(
            @PathVariable Long tripId,
            @RequestParam("file") MultipartFile file,
            Principal principal
    ) throws IOException {

        String username = principal.getName();

        Photo photo = photoService.addPhoto(
                tripId,
                file,
                username
        );

        return ResponseEntity.ok(photo);
    }

    @DeleteMapping("/photos/{id}")
    public ResponseEntity<String> deletePhoto(
            @PathVariable Long id,
            Principal principal
    ) {

        photoService.deletePhoto(
                id,
                principal.getName()
        );

        return ResponseEntity.ok("Fotoğraf başarıyla silindi.");
    }

}